import type { MultilingualText } from './common';

// ===== Dynamic Marketing Home Page Types =====

// Homepage Customer Type for dynamic content
export type HomepageCustomerType = 
  | 'WORKSHOP'          // ورشة صيانة
  | 'RENTAL'            // شركة تأجير
  | 'INSURANCE'         // شركة تأمين
  | 'SUPPLIER'          // مورد
  | 'MARKETER'          // مسوق
  | 'PARTS_SHOP'        // محل قطع غيار
  | 'DEFAULT';          // افتراضي

// Homepage Banner Configuration
export interface HomepageBanner {
  id: string;
  title: MultilingualText;
  subtitle: MultilingualText;
  imageUrl?: string;
  backgroundColor: string;
  textColor?: string;
  ctaLabel: MultilingualText;
  ctaLink: string;
  ctaVariant?: 'primary' | 'secondary' | 'outline';
  isActive: boolean;
  order: number;
  targetCustomerTypes?: HomepageCustomerType[];
}

// Homepage Shortcut/Action Card
export interface HomepageShortcut {
  id: string;
  icon: string;  // Lucide icon name
  title: MultilingualText;
  description: MultilingualText;
  link: string;
  colorClass?: string;
  isActive: boolean;
  order: number;
  requiredPermission?: string;
}

// Homepage Section Types
export type HomepageSectionType = 
  | 'hero'
  | 'banners'
  | 'keyActions'
  | 'tools'
  | 'stats'
  | 'feedback'
  | 'supplierStats'
  | 'incomingRequests'
  | 'marketerStats'
  | 'referralSection'
  | 'recentOrders';

// Homepage Layout Configuration
export interface HomepageLayoutConfig {
  heroTitle: MultilingualText;
  heroSubtitle: MultilingualText;
  heroBackgroundGradient?: string;
  heroImageUrl?: string;
  showProductSearchShortcut: boolean;
  showTraderTools: boolean;
  showImportServices: boolean;
  showQuoteRequest: boolean;
  showOrderHistory: boolean;
  sectionsOrder: HomepageSectionType[];
  primaryCtaLabel?: MultilingualText;
  primaryCtaLink?: string;
  secondaryCtaLabel?: MultilingualText;
  secondaryCtaLink?: string;
}

// Homepage Banners Configuration
export interface HomepageBannersConfig {
  autoPlayInterval: number; // milliseconds
  showDots: boolean;
  showArrows: boolean;
  transitionType: 'fade' | 'slide';
  banners: HomepageBanner[];
}

// Homepage Shortcuts Configuration
export interface HomepageShortcutsConfig {
  shortcuts: HomepageShortcut[];
}

// Complete Homepage Configuration Response
export interface HomepageConfig {
  customerType: HomepageCustomerType;
  layoutConfig: HomepageLayoutConfig;
  bannersConfig: HomepageBannersConfig;
  shortcutsConfig?: HomepageShortcutsConfig;
}

// Homepage Stats for display
export interface HomepageStats {
  pendingRequests: number;
  approvedOrders: number;
  inProgressOrders: number;
  totalOrders: number;
  searchPointsRemaining?: number;
  // Supplier-specific
  requestsReceived?: number;
  quotesSent?: number;
  conversionRate?: number;
  // Marketer-specific
  referredCustomers?: number;
  referredOrders?: number;
  totalCommission?: number;
}
