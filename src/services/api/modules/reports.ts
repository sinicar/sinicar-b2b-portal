/**
 * Reports API Module
 * وحدة API للتقارير
 */

import { get, post } from '../../apiClient';

// ============================================
// Reports Functions
// ============================================

/**
 * Get Reports
 */
export async function getReports(_filters?: any) {
  const result = await get('/reports');
  return (result as any)?.data?.reports || (result as any)?.reports || [];
}

/**
 * Generate Report
 */
export async function generateReport(type: string, params: any) {
  return post('/reports/generate', { type, ...params });
}

/**
 * Get Report By ID
 */
export async function getReportById(reportId: string) {
  const result = await get(`/reports/${reportId}`);
  return (result as any)?.data?.report || (result as any)?.report || null;
}
