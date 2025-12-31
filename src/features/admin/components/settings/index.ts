/**
 * Admin Settings Components
 * مكونات إعدادات الإدارة المستخرجة
 * 
 * هذه المكونات جاهزة للاستخراج من AdminSettings.tsx
 * يمكن استخدامها لتفريق الملف الكبير إلى أجزاء أصغر
 */

// Placeholder - سيتم إضافة المكونات لاحقاً
// export { GeneralSettingsSection } from './GeneralSettingsSection';
// export { SupplierSettingsSection } from './SupplierSettingsSection';
// export { PricingSettingsSection } from './PricingSettingsSection';
// export { PortalSettingsSection } from './PortalSettingsSection';
// export { NotificationsSettingsSection } from './NotificationsSettingsSection';

export const ADMIN_SETTINGS_SECTIONS = [
  'general',
  'supplier',
  'pricing',
  'portal',
  'notifications',
] as const;

export type AdminSettingsSection = typeof ADMIN_SETTINGS_SECTIONS[number];
