/**
 * Storage Keys - مفاتيح التخزين
 * 
 * ملاحظة: هذه المفاتيح كانت تُستخدم مع localStorage في Api
 * الآن نحتفظ بها للتوافق، لكن البيانات تأتي من Backend الحقيقي
 */

export const STORAGE_KEYS = {
  // Users & Auth
  USERS: 'b2b_users_sini',
  SESSION: 'b2b_session_sini_v2',
  
  // Products
  PRODUCTS: 'b2b_products_sini',
  
  // Orders
  ORDERS: 'b2b_orders_sini',
  
  // Settings
  SETTINGS: 'b2b_settings_sini',
  BANNERS: 'b2b_banners_sini',
  NEWS: 'b2b_news_sini',
  
  // Notifications
  NOTIFICATIONS: 'b2b_notifications_sini',
  
  // SEO
  SEO_SETTINGS: 'b2b_seo_settings_sini',
  SEO_META: 'b2b_seo_meta_sini',
  SEO_VERSION_HISTORY: 'b2b_seo_version_history_sini',
  
  // Activity
  ACTIVITY_LOGS: 'b2b_activity_logs_sini',
  
  // Cache
  CACHE_KEY: 'b2b_cache_key_sini',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

export default STORAGE_KEYS;
