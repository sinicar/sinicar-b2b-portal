/**
 * Admin Users API Module
 * وحدة API لمستخدمي الإدارة والأدوار والصلاحيات
 */

import { ApiClient, get, post, put, del } from '../../apiClient';

// ============================================
// Admin Users Functions
// ============================================

/**
 * Get Admin Users
 */
export async function getAdminUsers() {
  const result = await (ApiClient.admin as any).getUsers?.() || await get('/users/admin');
  return result.users || result.items || result || [];
}

/**
 * Create Admin User
 */
export async function createAdminUser(userData: any) {
  return post(`/users/admin`, userData);
}

/**
 * Update Admin User
 */
export async function updateAdminUser(userId: string, updates: any) {
  return put(`/users/admin/${userId}`, updates);
}

/**
 * Delete Admin User
 */
export async function deleteAdminUser(userId: string) {
  return del(`/users/admin/${userId}`);
}

/**
 * Approve Admin User
 */
export async function approveAdminUser(userId: string) {
  return put(`/users/admin/${userId}/approve`);
}

/**
 * Block Admin User
 */
export async function blockAdminUser(userId: string) {
  return put(`/users/admin/${userId}/block`);
}

// ============================================
// Roles Functions
// ============================================

/**
 * Get Roles
 */
export async function getRoles() {
  const result = await ApiClient.permissions.getRoles();
  return result.roles || result || [];
}

/**
 * Create Role
 */
export async function createRole(roleData: any) {
  return (ApiClient.permissions as any).createRole?.(roleData) || post('/roles', roleData);
}

/**
 * Update Role
 */
export async function updateRole(roleId: string, updates: any) {
  return (ApiClient.permissions as any).updateRole?.(roleId, updates) || put(`/roles/${roleId}`, updates);
}

/**
 * Delete Role
 */
export async function deleteRole(roleId: string) {
  return (ApiClient.permissions as any).deleteRole?.(roleId) || del(`/roles/${roleId}`);
}

// ============================================
// Permissions Functions
// ============================================

/**
 * Get Permissions
 */
export async function getPermissions() {
  const result = await (ApiClient.permissions as any).getAll?.() || await get('/permissions');
  return result.permissions || result || [];
}

/**
 * Assign Role to User
 */
export async function assignRoleToUser(userId: string, roleId: string) {
  try {
    return await post(`/users/${userId}/roles/${roleId}`);
  } catch {
    return { success: false };
  }
}

/**
 * Remove Role from User
 */
export async function removeRoleFromUser(userId: string, roleId: string) {
  try {
    return await del(`/users/${userId}/roles/${roleId}`);
  } catch {
    return { success: false };
  }
}
