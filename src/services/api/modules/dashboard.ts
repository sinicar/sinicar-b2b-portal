/**
 * Dashboard API Module
 * وحدة API للوحات المعلومات
 */

import { get } from '../../apiClient';

// ============================================
// Dashboard Functions
// ============================================

/**
 * Get Dashboard Stats
 */
export async function getDashboardStats(_userId?: string) {
  try {
    const result = await get('/dashboard/stats');
    return (result as any)?.data || result || {};
  } catch {
    return {};
  }
}

/**
 * Get Supplier Dashboard Stats
 */
export async function getSupplierDashboardStats(supplierId: string) {
  try {
    const result = await get(`/suppliers/${supplierId}/dashboard`);
    return (result as any)?.data || result || {};
  } catch {
    return {};
  }
}
