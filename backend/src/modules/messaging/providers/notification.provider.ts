import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationMessage {
  userId: string;
  title: string;
  body: string;
  type?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
  link?: string;
  imageUrl?: string;
}

export interface SendResult {
  success: boolean;
  externalId?: string;
  error?: string;
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
      type: message.type,
      priority: message.priority,
      timestamp: new Date().toISOString(),
    });

    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('[Notification Provider] Notification created:', {
        id: notificationId,
        userId: message.userId,
        title: message.title,
        body: message.body.substring(0, 100) + (message.body.length > 100 ? '...' : ''),
      });

      return {
        success: true,
        externalId: notificationId,
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

    return { sent: 0, failed: 0 };
  }

  getStatus(): { isConfigured: boolean; provider: string } {
    return {
      isConfigured: this.isConfigured,
      provider: 'Internal Notifications',
    };
  }
}

export const notificationProvider = new NotificationProvider();
