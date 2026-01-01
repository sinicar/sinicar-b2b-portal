/**
 * Settings API Module
 * وحدة API للإعدادات
 */

import { ApiClient, get, put, post } from '../../apiClient';

// ============================================
// Settings Functions - وظائف الإعدادات
// ============================================

/**
 * Get All Settings
 */
export async function getSettings(category?: string) {
  try {
    const result = await get('/settings/site-settings');
    const data = result as any;
    return data?.data || data || {};
  } catch (error) {
    // Fallback
    const result = await ApiClient.settings.getAll(category);
    const data = result as any;
    return data?.data || data?.settings || data || {};
  }
}

/**
 * Get Setting by Key
 */
export async function getSettingByKey(key: string) {
  const result = await get(`/settings/${key}`);
  const data = result as any;
  return data?.data || data;
}

/**
 * Update Setting
 */
export async function updateSetting(key: string, value: any, updatedBy?: string) {
  return put(`/settings/${key}`, { value, updatedBy });
}

/**
 * Update Settings (bulk)
 */
export async function updateSettings(settings: Record<string, any>) {
  return put(`/settings/bulk/update`, { 
    settings: Object.entries(settings).map(([key, value]) => ({ key, value })) 
  });
}

/**
 * Get Feature Flags
 */
export async function getFeatureFlags() {
  const result = await ApiClient.settings.getFeatureFlags();
  const data = result as any;
  return data?.data || data || [];
}

/**
 * Update Feature Flag
 */
export async function updateFeatureFlag(key: string, isEnabled: boolean, enabledFor?: string[]) {
  return put(`/settings/features/flags/${key}`, { isEnabled, enabledFor });
}

/**
 * Get Quality Codes
 */
export async function getQualityCodes() {
  const result = await ApiClient.settings.getQualityCodes();
  const data = result as any;
  return data?.data || data || [];
}

/**
 * Create Quality Code
 */
export async function createQualityCode(data: any) {
  return post(`/settings/quality-codes`, data);
}

/**
 * Update Quality Code
 */
export async function updateQualityCode(id: string, data: any) {
  return put(`/settings/quality-codes/${id}`, data);
}

/**
 * Get Brand Codes
 */
export async function getBrandCodes() {
  const result = await ApiClient.settings.getBrandCodes();
  const data = result as any;
  return data?.data || data || [];
}

/**
 * Create Brand Code
 */
export async function createBrandCode(data: any) {
  return post(`/settings/brand-codes`, data);
}

/**
 * Update Brand Code
 */
export async function updateBrandCode(id: string, data: any) {
  return put(`/settings/brand-codes/${id}`, data);
}

/**
 * Get Shipping Methods
 */
export async function getShippingMethods() {
  const result = await ApiClient.settings.getShippingMethods();
  const data = result as any;
  return data?.data || data || [];
}

/**
 * Create Shipping Method
 */
export async function createShippingMethod(data: any) {
  return post(`/settings/shipping/methods`, data);
}

/**
 * Update Shipping Method
 */
export async function updateShippingMethod(id: string, data: any) {
  return put(`/settings/shipping/methods/${id}`, data);
}

/**
 * Get Shipping Zones
 */
export async function getShippingZones() {
  const result = await get(`/settings/shipping/zones`);
  const data = result as any;
  return data?.data || data || [];
}

/**
 * Get Banners
 */
export async function getBanners() {
  const result = await get(`/settings/banners`);
  const data = result as any;
  return data?.data || data?.banners || [];
}

/**
 * Update Banners
 */
export async function updateBanners(banners: any[]) {
  return put(`/settings/banners`, { banners });
}

/**
 * Get News
 */
export async function getNews() {
  const result = await get(`/settings/news`);
  const data = result as any;
  return data?.data || data?.news || [];
}

/**
 * Update News
 */
export async function updateNews(news: any[]) {
  return put(`/settings/news`, { news });
}

/**
 * Get Status Labels
 */
export async function getStatusLabels() {
  const result = await get(`/settings/status-labels`);
  const data = result as any;
  return data?.data || data?.labels || data || {};
}

/**
 * Update Status Labels
 */
export async function updateStatusLabels(labels: any[]) {
  return put(`/settings/status-labels`, { labels });
}
