// ============================================
// COMMON / SHARED TYPES
// ============================================

// Multilingual Text Interface - used across many modules
export interface MultilingualText {
  ar: string;
  en: string;
  hi?: string;
  zh?: string;
}

// Banner for homepage/marketing
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  colorClass: string; // Tailwind class for gradient
  buttonText: string;
  imageUrl?: string;
  link?: string;
  isActive: boolean;
}

// --- Search Service Types ---

export type SearchResultType = 'NOT_FOUND' | 'FOUND_OUT_OF_STOCK' | 'FOUND_AVAILABLE';

// Search History Item
export interface SearchHistoryItem {
  id: string;
  userId: string;
  productId: string;
  partNumber: string;
  productName: string;
  viewedAt: string;      // ISO date
  priceSnapshot: number; // السعر وقت العرض
}

// --- Sidebar Preferences Types ---

export interface SidebarPreferences {
  collapsed: boolean;
  width: number;
  mobileAutoClose: boolean;
}

// Device Types
export type DeviceType = 'WEB' | 'MOBILE';

// --- Currency Types ---

export interface Currency {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  symbol: string;
  isBase: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExchangeRate {
  id: string;
  currencyId: string;
  rateToBase: number;
  syncPercent: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  syncPercent: number;
}

// --- Global Settings & Feature Flags ---

export type SettingValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

export interface GlobalSetting {
  id: string;
  key: string;
  value: string;
  valueType: SettingValueType;
  category?: string;
  label?: string;
  labelAr?: string;
  description?: string;
  isEditable: boolean;
  isVisible: boolean;
  sortOrder: number;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  nameAr?: string;
  description?: string;
  isEnabled: boolean;
  enabledFor: string[];
  createdAt: string;
  updatedAt?: string;
}
