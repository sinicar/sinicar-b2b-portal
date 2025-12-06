import { PrismaClient, MessageEvent } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationMessage {
  userId: string;
  title: string;
  body: string;
  event?: MessageEvent;
  type?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
  link?: string;
  imageUrl?: string;
  category?: string;
}

export interface SendResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

function getEventCategory(event?: MessageEvent): string {
  if (!event) return 'GENERAL';
  const eventStr = event.toString();
  if (eventStr.startsWith('QUOTE_')) return 'QUOTES';
  if (eventStr.startsWith('ORDER_')) return 'ORDERS';
  if (eventStr.startsWith('PAYMENT_')) return 'PAYMENTS';
  if (eventStr.startsWith('SHIPMENT_')) return 'SHIPMENTS';
  if (eventStr.startsWith('ACCOUNT_') || eventStr.startsWith('PASSWORD_') || event === 'WELCOME_MESSAGE') return 'ACCOUNT';
  if (eventStr.startsWith('INSTALLMENT_')) return 'INSTALLMENTS';
  if (eventStr.startsWith('SUPPLIER_') || eventStr.startsWith('CATALOG_')) return 'SUPPLIERS';
  return 'GENERAL';
}

class NotificationProvider {
  private isConfigured: boolean = true;

  configure(config?: { pushEnabled?: boolean }) {
    this.isConfigured = true;
  }

  async send(message: NotificationMessage): Promise<SendResult> {
    console.log('[Notification Provider] Creating notification:', {
      userId: message.userId,
      title: message.title,
      bodyLength: message.body.length,
      event: message.event,
      type: message.type,
      priority: message.priority,
      timestamp: new Date().toISOString(),
    });

    try {
      if (message.event) {
        const userSettings = await prisma.userNotificationSettings.findUnique({
          where: {
            userId_event: {
              userId: message.userId,
              event: message.event,
            },
          },
        });

        if (userSettings && !userSettings.enableInApp) {
          console.log('[Notification Provider] User has disabled in-app notifications for this event');
          return {
            success: true,
            externalId: 'skipped-user-disabled',
          };
        }
      }

      const notification = await prisma.notification.create({
        data: {
          userId: message.userId,
          event: message.event || MessageEvent.CUSTOM_NOTIFICATION,
          title: message.title,
          body: message.body,
          link: message.link,
          imageUrl: message.imageUrl,
          priority: message.priority || 'normal',
          category: message.category || getEventCategory(message.event),
          metadata: message.data ? JSON.stringify(message.data) : null,
        },
      });

      console.log('[Notification Provider] Notification created in DB:', {
        id: notification.id,
        userId: message.userId,
        title: message.title,
        body: message.body.substring(0, 100) + (message.body.length > 100 ? '...' : ''),
      });

      return {
        success: true,
        externalId: notification.id,
      };
    } catch (error: any) {
      console.error('[Notification Provider] Send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendToMultiple(userIds: string[], message: Omit<NotificationMessage, 'userId'>): Promise<SendResult[]> {
    console.log('[Notification Provider] Sending to multiple users:', {
      userCount: userIds.length,
      title: message.title,
      timestamp: new Date().toISOString(),
    });

    const results: SendResult[] = [];
    
    for (const userId of userIds) {
      const result = await this.send({ ...message, userId });
      results.push(result);
    }
    
    return results;
  }

  async sendBroadcast(message: Omit<NotificationMessage, 'userId'>, filters?: {
    roles?: string[];
    customerTypes?: string[];
  }): Promise<{ sent: number; failed: number }> {
    console.log('[Notification Provider] Broadcasting notification:', {
      title: message.title,
      filters,
      timestamp: new Date().toISOString(),
    });

    try {
      const where: any = { isActive: true };
      if (filters?.roles && filters.roles.length > 0) {
        where.role = { in: filters.roles };
      }

      const users = await prisma.user.findMany({
        where,
        select: { id: true },
        take: 1000,
      });

      let sent = 0;
      let failed = 0;

      for (const user of users) {
        const result = await this.send({ ...message, userId: user.id });
        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      }

      return { sent, failed };
    } catch (error: any) {
      console.error('[Notification Provider] Broadcast error:', error);
      return { sent: 0, failed: 0 };
    }
  }

  getStatus(): { isConfigured: boolean; provider: string } {
    return {
      isConfigured: this.isConfigured,
      provider: 'Internal DB Notifications',
    };
  }
}

export const notificationProvider = new NotificationProvider();
