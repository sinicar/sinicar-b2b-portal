// ============================================
// SETTINGS TYPES
// ============================================

import type { MultilingualText } from './common';
import type { PriceLevel } from './products';
import type { OrderStatus, OrderInternalStatus } from './orders';
import type { QuoteRequestStatus, QuoteItemStatus, ImportRequestStatus, MissingProductStatus } from './requests';
import type { AccountRequestStatus } from './customers';
import type { CustomerStatus, StaffStatus } from './users';

// --- Guest Mode Settings ---

export interface GuestModeSettings {
  enabled: boolean;                   // تفعيل وضع الزائر
  
  // Elements to show for guests
  showHeader?: boolean;               // إظهار الهيدر
  showCarousel?: boolean;             // إظهار سلايدر الصور
  showCTA?: boolean;                  // إظهار زر CTA الرئيسي
  showBusinessTypes?: boolean;        // قسم "من نخدم" (أنواع الأعمال)
  showMainServices?: boolean;         // قسم الخدمات الرئيسية
  showHowItWorks?: boolean;           // قسم "كيف تعمل المنظومة"
  showWhySiniCar?: boolean;           // قسم "لماذا صيني كار"
  showCart?: boolean;                 // عربة التسوق الجانبية
  showMarketingCards?: boolean;       // بطاقات التسويق الجانبية
  
  // Blur settings
  blurIntensity?: 'light' | 'medium' | 'heavy';  // شدة التشويش
  showBlurOverlay?: boolean;          // إظهار overlay فوق المحتوى المشوش
  
  // Pages accessible to guests (empty = none except HOME)
  allowedPages?: string[];            // الصفحات المسموح الوصول إليها
  
  // Search settings
  allowSearch?: boolean;              // السماح بالبحث (نتائج مشوشة)
  showSearchResults?: boolean;        // إظهار نتائج البحث (مشوشة)
}

// Feature Card for "Why Sini Car" section
export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: 'box' | 'chart' | 'anchor' | 'headphones' | 'truck' | 'shield' | 'globe' | 'star' | 'clock' | 'award';
  iconColor: string; // Tailwind color class like 'text-cyan-400'
}

// --- Status Labels Configuration ---

export interface StatusLabel {
  value: string;
  label: string;       // Arabic label
  labelEn?: string;    // English label
  color: string;       // Tailwind color class
  bgColor?: string;    // Background color class
  isDefault?: boolean; // Is this the default status
  isSystem?: boolean;  // System status can't be deleted
  order?: number;      // Display order
}

export interface StatusLabelsConfig {
  orderStatus: StatusLabel[];
  orderInternalStatus: StatusLabel[];
  accountRequestStatus: StatusLabel[];
  quoteRequestStatus: StatusLabel[];
  quoteItemStatus: StatusLabel[];
  missingStatus: StatusLabel[];
  importRequestStatus: StatusLabel[];
  customerStatus: StatusLabel[];
  staffStatus: StatusLabel[];
}

export type StatusDomain = keyof StatusLabelsConfig;

export const STATUS_DOMAIN_LABELS: Record<StatusDomain, string> = {
  orderStatus: 'حالات الطلبات',
  orderInternalStatus: 'الحالات الداخلية للطلبات',
  accountRequestStatus: 'حالات طلبات فتح الحساب',
  quoteRequestStatus: 'حالات طلبات عروض الأسعار',
  quoteItemStatus: 'حالات عناصر عرض السعر',
  missingStatus: 'حالات النواقص',
  importRequestStatus: 'حالات طلبات الاستيراد',
  customerStatus: 'حالات العملاء',
  staffStatus: 'حالات الموظفين'
};

// --- API Configuration ---

export interface ApiConfig {
  enabled: boolean;
  baseUrl?: string;
  apiKey?: string;
  syncInterval?: number; // in minutes
  lastSyncAt?: string;
  syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

// --- Webhook Configuration ---

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  failCount?: number;
  createdAt: string;
}

// --- Site Settings ---

export interface SiteSettings {
  // Basic Info
  siteName: string;
  siteNameEn?: string;
  tagline?: string;
  taglineEn?: string;
  logoUrl?: string;
  faviconUrl?: string;
  
  // Contact Info
  supportEmail?: string;
  supportPhone?: string;
  supportWhatsapp?: string;
  address?: string;
  
  // Social Links
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  
  // Business Settings
  currency: string;
  vatRate: number;
  defaultLanguage: 'ar' | 'en';
  timezone: string;
  
  // Feature Toggles
  enableGuestMode: boolean;
  guestModeSettings?: GuestModeSettings;
  enableRegistration: boolean;
  requireApproval: boolean;
  enableImportService: boolean;
  enableQuoteService: boolean;
  enableSearchPoints: boolean;
  enableNotifications: boolean;
  
  // Search Points Settings
  defaultSearchPoints?: number;
  searchPointsResetType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NEVER';
  
  // Status Labels
  statusLabels?: StatusLabelsConfig;
  
  // API Configurations
  onyxApiConfig?: ApiConfig;
  smsApiConfig?: ApiConfig;
  emailApiConfig?: ApiConfig;
  
  // Webhooks
  webhooks?: WebhookConfig[];
  
  // Theme
  primaryColor?: string;
  secondaryColor?: string;
  darkMode?: boolean;
  
  // Why Sini Car Feature Cards
  featureCards?: FeatureCard[];
  
  // Metadata
  updatedAt?: string;
  updatedBy?: string;
}

// --- Pricing Configuration Types ---

export type PricingAdjustmentType = 'FIXED' | 'PERCENTAGE';
export type PricingAdjustmentDirection = 'INCREASE' | 'DECREASE';

export interface PricingLevelConfig {
  id: string;
  level: PriceLevel;
  name: string;
  nameEn?: string;
  description?: string;
  
  // Base source for derived levels
  derivedFrom?: PriceLevel;
  adjustmentType?: PricingAdjustmentType;
  adjustmentDirection?: PricingAdjustmentDirection;
  adjustmentValue?: number;
  
  // Display settings
  isVisible: boolean;
  visibleToRoles?: string[];
  order: number;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingSettings {
  id: string;
  levels: PricingLevelConfig[];
  defaultLevel: PriceLevel;
  showMultiplePrices: boolean;
  hideOutOfStockPrices: boolean;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

// --- Security Settings ---

export interface TwoFactorSettings {
  enabled: boolean;
  method: 'sms' | 'email' | 'authenticator' | 'all';
  requiredForAdmins: boolean;
  requiredForFinancial: boolean;
  graceLoginCount: number;
}

export interface SecuritySettings {
  id: string;
  
  // Password Policy
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordExpiryDays: number;
  passwordHistoryCount: number;
  
  // Login Security
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  allowMultipleSessions: boolean;
  
  // 2FA Settings
  twoFactor: TwoFactorSettings;
  
  // IP & Access Control
  enableIPWhitelist: boolean;
  ipWhitelist: string[];
  enableGeoBlocking: boolean;
  blockedCountries: string[];
  
  // Risk Detection
  enableRiskDetection: boolean;
  riskThreshold: number;
  notifyOnSuspiciousLogin: boolean;
  
  // Audit
  enableAuditLog: boolean;
  auditRetentionDays: number;
  
  lastModifiedAt: string;
  lastModifiedBy?: string;
}

// --- Login Tracking ---

export interface LoginRecord {
  id: string;
  userId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  success: boolean;
  failureReason?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browserName?: string;
  osName?: string;
  is2FAUsed: boolean;
  riskScore?: number;
}

// --- Session Management ---

export interface ActiveSession {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  isCurrentSession: boolean;
}
