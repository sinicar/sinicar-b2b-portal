/**
 * User Management API Module
 * وحدة API لإدارة المستخدمين
 */

import { get, put } from '../../apiClient';

// ============================================
// User Management Functions
// ============================================

/**
 * Get Pending Users
 */
export async function getPendingUsers() {
  const result = await get('/users/pending');
  return (result as any)?.data?.users || (result as any)?.users || [];
}

/**
 * Approve User
 */
export async function approveUser(userId: string) {
  return put(`/users/${userId}/approve`);
}

/**
 * Reject User
 */
export async function rejectUser(userId: string, reason?: string) {
  return put(`/users/${userId}/reject`, { reason });
}

/**
 * Block User
 */
export async function blockUser(userId: string, reason?: string) {
  return put(`/users/${userId}/block`, { reason });
}

/**
 * Unblock User
 */
export async function unblockUser(userId: string) {
  return put(`/users/${userId}/unblock`);
}

/**
 * Suspend User
 */
export async function suspendUser(userId: string, until: string) {
  return put(`/users/${userId}/suspend`, { until });
}

/**
 * Update User Password
 */
export async function updateUserPassword(userId: string, newPassword: string) {
  return put(`/users/${userId}/password`, { password: newPassword });
}
