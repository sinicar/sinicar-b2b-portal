import { PrismaClient, MessageEvent } from '@prisma/client';
import { getTemplateFromCache, renderTemplate } from '../messaging/messaging.service';

const prisma = new PrismaClient();

interface SettingsCache {
  data: Map<string, UserNotificationSettingsRecord[]>;
  lastUpdated: Map<string, number>;
}

interface UserNotificationSettingsRecord {
  id: string;
  userId: string;
  event: MessageEvent;
  enableInApp: boolean;
  enableEmail: boolean;
  enableWhatsApp: boolean;
  languagePreference: string;
}

const settingsCache: SettingsCache = {
  data: new Map(),
  lastUpdated: new Map(),
};

const SETTINGS_CACHE_TTL_MS = 10 * 60 * 1000;

export async function getUserNotificationSettings(userId: string): Promise<UserNotificationSettingsRecord[]> {
  const now = Date.now();
  const lastUpdated = settingsCache.lastUpdated.get(userId) || 0;

  if (now - lastUpdated < SETTINGS_CACHE_TTL_MS && settingsCache.data.has(userId)) {
    return settingsCache.data.get(userId) || [];
  }

  const settings = await prisma.userNotificationSettings.findMany({
    where: { userId },
  });

  settingsCache.data.set(userId, settings);
  settingsCache.lastUpdated.set(userId, now);

  return settings;
}

export async function getUserSettingsForEvent(
  userId: string,
  event: MessageEvent
): Promise<UserNotificationSettingsRecord | null> {
  const settings = await getUserNotificationSettings(userId);
  return settings.find((s) => s.event === event) || null;
}

export function invalidateUserSettingsCache(userId: string): void {
  settingsCache.data.delete(userId);
  settingsCache.lastUpdated.delete(userId);
}

export interface CreateNotificationInput {
  userId: string;
  event: MessageEvent;
  title: string;
  body: string;
  link?: string;
  imageUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      event: input.event,
      title: input.title,
      body: input.body,
      link: input.link,
      imageUrl: input.imageUrl,
      priority: input.priority || 'normal',
      category: input.category,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      expiresAt: input.expiresAt,
    },
  });
}

export interface CreateInAppNotificationContext {
  userId: string;
  event: MessageEvent;
  language?: string;
  variables: Record<string, any>;
  link?: string;
  imageUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  metadata?: Record<string, any>;
}

export async function createInAppNotification(
  context: CreateInAppNotificationContext
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  const language = context.language || 'ar';

  const userSettings = await getUserSettingsForEvent(context.userId, context.event);
  if (userSettings && !userSettings.enableInApp) {
    return { success: false, error: 'In-app notifications disabled by user' };
  }

  const template = await getTemplateFromCache(context.event, 'NOTIFICATION' as any, language);

  if (!template) {
    return {
      success: false,
      error: `No active notification template found for event ${context.event}`,
    };
  }

  const renderedTitle = template.subject
    ? renderTemplate(template.subject, context.variables)
    : template.name;
  const renderedBody = renderTemplate(template.body, context.variables);

  try {
    const notification = await createNotification({
      userId: context.userId,
      event: context.event,
      title: renderedTitle,
      body: renderedBody,
      link: context.link,
      imageUrl: context.imageUrl,
      priority: context.priority,
      category: context.category || getEventCategory(context.event),
      metadata: context.metadata,
    });

    return { success: true, notificationId: notification.id };
  } catch (error: any) {
    console.error('[Notification Service] Error creating notification:', error);
    return { success: false, error: error.message };
  }
}

function getEventCategory(event: MessageEvent): string {
  if (event.toString().startsWith('QUOTE_')) return 'QUOTES';
  if (event.toString().startsWith('ORDER_')) return 'ORDERS';
  if (event.toString().startsWith('PAYMENT_')) return 'PAYMENTS';
  if (event.toString().startsWith('SHIPMENT_')) return 'SHIPMENTS';
  if (event.toString().startsWith('ACCOUNT_') || event.toString().startsWith('PASSWORD_') || event === 'WELCOME_MESSAGE') return 'ACCOUNT';
  if (event.toString().startsWith('INSTALLMENT_')) return 'INSTALLMENTS';
  if (event.toString().startsWith('SUPPLIER_') || event.toString().startsWith('CATALOG_')) return 'SUPPLIERS';
  return 'GENERAL';
}

export interface GetNotificationsFilters {
  userId: string;
  isRead?: boolean;
  event?: MessageEvent;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationsResponse {
  notifications: any[];
  total: number;
  unreadCount: number;
}

export async function getNotifications(
  filters: GetNotificationsFilters
): Promise<NotificationsResponse> {
  const where: any = { userId: filters.userId };

  if (typeof filters.isRead === 'boolean') {
    where.isRead = filters.isRead;
  }
  if (filters.event) {
    where.event = filters.event;
  }
  if (filters.category) {
    where.category = filters.category;
  }

  const limit = Math.min(filters.limit || 20, 100);
  const offset = filters.offset || 0;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: filters.userId, isRead: false } }),
  ]);

  return { notifications, total, unreadCount };
}

export async function getNotificationById(id: string, userId: string) {
  return prisma.notification.findFirst({
    where: { id, userId },
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function deleteNotification(id: string, userId: string) {
  return prisma.notification.deleteMany({
    where: { id, userId },
  });
}

export async function deleteReadNotifications(userId: string, olderThanDays: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return prisma.notification.deleteMany({
    where: {
      userId,
      isRead: true,
      readAt: { lt: cutoffDate },
    },
  });
}

export async function updateUserNotificationSettings(
  userId: string,
  event: MessageEvent,
  settings: {
    enableInApp?: boolean;
    enableEmail?: boolean;
    enableWhatsApp?: boolean;
    languagePreference?: string;
  }
) {
  const updated = await prisma.userNotificationSettings.upsert({
    where: {
      userId_event: { userId, event },
    },
    update: settings,
    create: {
      userId,
      event,
      enableInApp: settings.enableInApp ?? true,
      enableEmail: settings.enableEmail ?? true,
      enableWhatsApp: settings.enableWhatsApp ?? false,
      languagePreference: settings.languagePreference ?? 'ar',
    },
  });

  invalidateUserSettingsCache(userId);
  return updated;
}

export async function bulkUpdateUserNotificationSettings(
  userId: string,
  settingsArray: Array<{
    event: MessageEvent;
    enableInApp?: boolean;
    enableEmail?: boolean;
    enableWhatsApp?: boolean;
    languagePreference?: string;
  }>
) {
  const results = await Promise.all(
    settingsArray.map((s) =>
      updateUserNotificationSettings(userId, s.event, {
        enableInApp: s.enableInApp,
        enableEmail: s.enableEmail,
        enableWhatsApp: s.enableWhatsApp,
        languagePreference: s.languagePreference,
      })
    )
  );

  return results;
}

export async function getAllUserNotificationSettings(userId: string) {
  const settings = await getUserNotificationSettings(userId);

  const allEvents = Object.values(MessageEvent);
  const settingsMap = new Map(settings.map((s) => [s.event, s]));

  return allEvents.map((event) => ({
    event,
    category: getEventCategory(event),
    enableInApp: settingsMap.get(event)?.enableInApp ?? true,
    enableEmail: settingsMap.get(event)?.enableEmail ?? true,
    enableWhatsApp: settingsMap.get(event)?.enableWhatsApp ?? false,
    languagePreference: settingsMap.get(event)?.languagePreference ?? 'ar',
    hasCustomSettings: settingsMap.has(event),
  }));
}

const DEFAULT_EVENTS = [
  MessageEvent.QUOTE_CREATED,
  MessageEvent.QUOTE_APPROVED,
  MessageEvent.ORDER_CREATED,
  MessageEvent.ORDER_CONFIRMED,
  MessageEvent.ORDER_SHIPPED,
  MessageEvent.ORDER_DELIVERED,
  MessageEvent.SHIPMENT_CREATED,
  MessageEvent.SHIPMENT_DISPATCHED,
  MessageEvent.SHIPMENT_DELIVERED,
  MessageEvent.PAYMENT_RECEIVED,
  MessageEvent.PAYMENT_REMINDER,
  MessageEvent.ACCOUNT_ACTIVATED,
  MessageEvent.PASSWORD_RESET,
  MessageEvent.WELCOME_MESSAGE,
];

export async function seedDefaultSettingsForUser(userId: string) {
  const existing = await prisma.userNotificationSettings.findMany({
    where: { userId },
    select: { event: true },
  });

  const existingEvents = new Set(existing.map((e) => e.event));
  const toCreate = DEFAULT_EVENTS.filter((e) => !existingEvents.has(e));

  if (toCreate.length === 0) return [];

  const created = await prisma.userNotificationSettings.createMany({
    data: toCreate.map((event) => ({
      userId,
      event,
      enableInApp: true,
      enableEmail: true,
      enableWhatsApp: false,
      languagePreference: 'ar',
    })),
    skipDuplicates: true,
  });

  invalidateUserSettingsCache(userId);
  return created;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function cleanupExpiredNotifications() {
  const now = new Date();
  return prisma.notification.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });
}
