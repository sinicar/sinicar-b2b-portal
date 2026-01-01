/**
 * Currency API Module
 * وحدة API للعملات وأسعار الصرف
 */

import { get, put } from '../../apiClient';

// ============================================
// Currency Functions
// ============================================

/**
 * Get Exchange Rates
 */
export async function getExchangeRates() {
  try {
    const result = await get('/settings/exchange-rates');
    return (result as any)?.data || result || {};
  } catch {
    return {};
  }
}

/**
 * Update Exchange Rates
 */
export async function updateExchangeRates(rates: any) {
  return put('/settings/exchange-rates', rates);
}
