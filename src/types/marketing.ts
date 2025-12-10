// ============================================
// MARKETING TYPES
// ============================================

import type { MultilingualText } from './common';

// --- Marketing Campaign Types ---

export type CampaignDisplayType = 'POPUP' | 'BANNER' | 'BELL' | 'DASHBOARD_CARD';
export type CampaignContentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'HTML';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export type CampaignAudienceType = 
  | 'ALL' 
  | 'SPARE_PARTS_SHOP' 
  | 'RENTAL_COMPANY' 
  | 'MAINTENANCE_CENTER' 
  | 'INSURANCE_COMPANY'
  | 'SALES_REP';

export interface MarketingCampaign {
  id: string;
  title: string;
  message: string;
  displayType: CampaignDisplayType;
  skippable: boolean;
  contentType: CampaignContentType;
  mediaUrl?: string;
  htmlContent?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  audienceType: CampaignAudienceType;
  status: CampaignStatus;
  priority: number;
  createdAt: string;
  startsAt?: string;
  expiresAt?: string;
}

// --- Coupon/Discount Code ---

export interface CouponCode {
  id: string;
  code: string;
  name: MultilingualText;
  description?: MultilingualText;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  applicableCategories?: string[];
  applicableBrands?: string[];
  excludedProducts?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

// --- Loyalty Program ---

export interface LoyaltyLevel {
  id: string;
  name: MultilingualText;
  minPoints: number;
  maxPoints?: number;
  benefits: {
    type: 'discount' | 'free_shipping' | 'priority_support' | 'exclusive_access';
    value?: number;
    description: MultilingualText;
  }[];
  iconUrl?: string;
  color: string;
}

export interface LoyaltySettings {
  id: string;
  enabled: boolean;
  programName: MultilingualText;
  pointsPerCurrency: number;  // Points earned per 1 SAR spent
  pointsRedemptionRate: number;  // SAR value per point when redeeming
  levels: LoyaltyLevel[];
  pointsExpiryDays?: number;
  allowPartialRedemption: boolean;
  minimumRedemptionPoints: number;
  lastModifiedAt: string;
}

// --- Promotional Campaign ---

export interface PromotionalCampaign {
  id: string;
  name: MultilingualText;
  type: 'flash_sale' | 'bundle' | 'buy_x_get_y' | 'seasonal' | 'clearance';
  description: MultilingualText;
  startDate: string;
  endDate: string;
  rules: {
    minQuantity?: number;
    bundleProducts?: string[];
    discountPercentage?: number;
    freeProduct?: string;
    applicableCategories?: string[];
  };
  bannerImageUrl?: string;
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: string;
}

// --- Homepage Configuration ---

export type HomepageCustomerType = 
  | 'WORKSHOP'          // ورشة صيانة
  | 'RENTAL'            // شركة تأجير
  | 'INSURANCE'         // شركة تأمين
  | 'SUPPLIER'          // مورد
  | 'MARKETER'          // مسوق
  | 'PARTS_SHOP'        // محل قطع غيار
  | 'DEFAULT';          // افتراضي

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

export interface HomepageBannersConfig {
  autoPlayInterval: number; // milliseconds
  showDots: boolean;
  showArrows: boolean;
  transitionType: 'fade' | 'slide';
  banners: HomepageBanner[];
}

export interface HomepageShortcutsConfig {
  shortcuts: HomepageShortcut[];
}

export interface HomepageConfig {
  customerType: HomepageCustomerType;
  layoutConfig: HomepageLayoutConfig;
  bannersConfig: HomepageBannersConfig;
  shortcutsConfig?: HomepageShortcutsConfig;
}

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

// --- Marketer / Affiliate System ---

export type CommissionType = 'PERCENT' | 'FIXED';
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
export type MarketerStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'PENDING';

export interface Marketer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  referralCode: string;
  referralUrl: string;
  commissionType: CommissionType;
  commissionValue: number;
  active: boolean;
  status?: MarketerStatus;
  createdAt: string;
  notes?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    holderName?: string;
  };
  address?: string;
  nationalId?: string;
  profileImageUrl?: string;
  totalReferrals?: number;
  totalEarnings?: number;
  pendingEarnings?: number;
  paidEarnings?: number;
  lastPaymentDate?: string;
  paymentMethod?: 'BANK_TRANSFER' | 'CASH' | 'WALLET';
  minPayoutAmount?: number;
  customCommissionTiers?: {
    minOrders: number;
    commissionType: CommissionType;
    commissionValue: number;
  }[];
}

export interface MarketerCommissionEntry {
  id: string;
  marketerId: string;
  customerId: string;
  orderId: string;
  orderTotal: number;
  commissionAmount: number;
  commissionType: CommissionType;
  commissionRate: number;
  status: CommissionStatus;
  calculatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  paidBy?: string;
  paymentReference?: string;
  notes?: string;
}

export type MultiAttributionMode = 'SINGLE' | 'LAST_CLICK' | 'FIRST_CLICK' | 'LINEAR';

export interface MarketerSettings {
  enabled: boolean;
  attributionWindowDays: number;
  defaultCommissionType: CommissionType;
  defaultCommissionValue: number;
  multiAttributionMode: MultiAttributionMode;
  marketerCanViewCustomerNames: boolean;
  marketerCanViewOrderTotals: boolean;
  marketerCanViewOrderDetails?: boolean;
  marketerCanExportData?: boolean;
  autoApproveCommissions: boolean;
  autoApproveThreshold?: number;
  minPayoutAmount?: number;
  paymentCycleDays?: number;
  enableTierCommissions?: boolean;
  tierCommissions?: {
    minTotalSales: number;
    commissionType: CommissionType;
    commissionValue: number;
  }[];
  enableCategoryCommissions?: boolean;
  categoryCommissions?: {
    categoryId: string;
    commissionType: CommissionType;
    commissionValue: number;
  }[];
  referralLinkDomain?: string;
  referralLinkPrefix?: string;
  showReferralBanner?: boolean;
  referralBannerText?: string;
  notifyMarketerOnReferral?: boolean;
  notifyMarketerOnCommission?: boolean;
  notifyAdminOnNewMarketer?: boolean;
  requireMarketerApproval?: boolean;
  allowSelfRegistration?: boolean;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface MarketerPerformanceStats {
  marketerId: string;
  period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL_TIME';
  periodStart?: string;
  periodEnd?: string;
  totalReferrals: number;
  activeReferrals: number;
  totalOrders: number;
  totalSalesAmount: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  conversionRate?: number;
  avgOrderValue?: number;
}
