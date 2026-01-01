/**
 * Notifications API Module
 * وحدة API للإشعارات
 */

import { ApiClient, post } from '../../apiClient';
import { normalizeListResponse } from '../../normalize';

// ============================================
// Notifications Functions - وظائف الإشعارات
// ============================================

/**
 * Get Notifications For User
 */
export async function getNotificationsForUser(_userId: string, options?: any) {
  const result = await ApiClient.notifications.getAll(options);
  const data = result as any;
  const rawData = data?.data || data;
  const normalized = normalizeListResponse(rawData?.notifications || rawData);
  return {
    ...normalized,
    unreadCount: rawData?.unreadCount ?? data?.unreadCount ?? 0
  };
}

/**
 * Get All Notifications
 */
export async function getAllNotifications() {
  const result = await ApiClient.notifications.getAll();
  const data = result as any;
  return data?.data?.notifications || data?.notifications || [];
}

/**
 * Mark Notification As Read
 */
export async function markNotificationAsRead(_userId: string, notificationId: string) {
  return ApiClient.notifications.markAsRead(notificationId);
}

/**
 * Mark All Notifications As Read
 */
export async function markAllNotificationsAsRead(_userId: string) {
  return ApiClient.notifications.markAllAsRead();
}

/**
 * Mark Notifications As Read (Legacy)
 */
export async function markNotificationsAsRead(userId: string) {
  return markAllNotificationsAsRead(userId);
}

/**
 * Clear Notifications For User
 */
export async function clearNotificationsForUser(_userId: string) {
  console.warn('[NotificationsModule] clearNotificationsForUser not implemented in Backend');
  return { success: true };
}

/**
 * Delete Notification
 */
export async function deleteNotification(_userId: string, notificationId: string) {
  return ApiClient.notifications.delete(notificationId);
}

/**
 * Create Notification
 */
export async function createNotification(notifData: any) {
  return ApiClient.notifications.create(notifData);
}

/**
 * Notify Admins
 */
export async function notifyAdmins(
  type: any, 
  title: string, 
  message: string, 
  relatedType?: string, 
  relatedId?: string
) {
  return post(`/notifications/notify-admins`, { type, title, message, relatedType, relatedId });
}

/**
 * Get Unread Notification Count
 */
export async function getUnreadNotificationCount(_userId: string) {
  const result = await ApiClient.notifications.getUnreadCount();
  const data = result as any;
  return data?.data?.unreadCount || data?.unreadCount || 0;
}
