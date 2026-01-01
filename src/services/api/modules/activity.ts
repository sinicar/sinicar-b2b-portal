/**
 * Activity API Module
 * وحدة API للنشاط والسجلات
 */

import { ApiClient, get, post, put } from '../../apiClient';
import { normalizeListResponse } from '../../normalize';

// ============================================
// Activity Functions
// ============================================

/**
 * Record Activity
 */
export async function recordActivity(entry: any) {
  // Activity logging now happens automatically on server side
  return entry;
}

/**
 * Get Activity Logs
 */
export async function getActivityLogs(filters?: any) {
  const result = await ApiClient.admin.getActivityLogs(filters);
  const data = result as any;
  return data?.data?.logs || data?.logs || data?.items || [];
}

/**
 * Get Activity Logs Filtered
 */
export async function getActivityLogsFiltered(filters: any) {
  const result = await ApiClient.admin.getActivityLogs(filters);
  const data = result as any;
  const rawData = data?.data || data;
  return normalizeListResponse(rawData?.logs || rawData?.items || rawData);
}

/**
 * Get Customer Activity Logs
 */
export async function getCustomerActivityLogs(customerId: string) {
  const result = await get(`/activity/customer/${customerId}`);
  const data = result as any;
  return data?.data?.logs || data?.logs || [];
}

/**
 * Get Online Users
 */
export async function getOnlineUsers(minutesThreshold: number = 5) {
  const result = await get(`/activity/online-users?minutes=${minutesThreshold}`);
  const data = result as any;
  return data?.data?.users || data?.users || [];
}

/**
 * Get Online Users Grouped
 */
export async function getOnlineUsersGrouped(onlineMinutes: number = 5) {
  const result = await get(`/activity/online-users/grouped?minutes=${onlineMinutes}`);
  const data = result as any;
  return data?.data || data || {};
}

/**
 * Record Heartbeat
 */
export async function recordHeartbeat(userId: string) {
  try {
    await post(`/activity/heartbeat`, { userId });
    return true;
  } catch {
    return true;
  }
}

/**
 * Update User Last Activity
 */
export async function updateUserLastActivity(userId: string) {
  await put(`/users/${userId}/last-activity`);
  return true;
}

/**
 * Get Activity Stats
 */
export async function getActivityStats() {
  return get(`/activity/stats`);
}

/**
 * Log Activity Extended
 */
export async function logActivityExtended(params: any) {
  return post(`/activity/log`, params);
}
