// ============================================
// CUSTOMER PORTAL SETTINGS TYPES
// ============================================

import type { MultilingualText } from './common';

// Customer Portal Settings - Full Portal Configuration
export interface CustomerPortalSettings {
  id: string;
  
  // Branding
  branding: {
    companyName: MultilingualText;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily?: string;
  };
  
  // Feature Toggles
  features: {
    enableQuoteRequests: boolean;
    enableImportRequests: boolean;
    enableInstallmentRequests: boolean;
    enableTraderTools: boolean;
    enableFeedback: boolean;
    enableNotifications: boolean;
    enableChat: boolean;
    enableOrderTracking: boolean;
    enablePriceAlerts: boolean;
    enableFavorites: boolean;
  };
  
  // Search Configuration
  search: {
    enabled: boolean;
    useAI: boolean;
    showAlternatives: boolean;
    showRecentSearches: boolean;
    maxRecentSearches: number;
  };
  
  // Cart Configuration
  cart: {
    enabled: boolean;
    requireMinimumOrder: boolean;
    minimumOrderValue?: number;
    showEstimatedDelivery: boolean;
    allowNotes: boolean;
  };
  
  // Order Configuration
  orders: {
    showPrices: boolean;
    showInternalStatus: boolean;
    allowCancellation: boolean;
    cancellationDeadlineHours?: number;
    requireReasonForCancellation: boolean;
  };
  
  // Navigation
  navigation: {
    showSidebar: boolean;
    sidebarCollapsedByDefault: boolean;
    menuItems: {
      key: string;
      labelAr: string;
      labelEn: string;
      icon: string;
      path: string;
      enabled: boolean;
      order: number;
      badge?: 'orders' | 'quotes' | 'notifications' | 'cart';
    }[];
  };
  
  // Footer
  footer: {
    showFooter: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    customText?: MultilingualText;
    links: {
      labelAr: string;
      labelEn: string;
      url: string;
    }[];
  };
  
  // Support
  support: {
    whatsappNumber?: string;
    phoneNumber?: string;
    email?: string;
    showFloatingButton: boolean;
    floatingButtonPosition: 'bottom-left' | 'bottom-right';
  };
  
  // Announcements
  announcements: {
    enabled: boolean;
    position: 'top' | 'bottom';
    messages: {
      id: string;
      text: MultilingualText;
      type: 'info' | 'warning' | 'success' | 'error';
      dismissible: boolean;
      startsAt?: string;
      endsAt?: string;
    }[];
  };
  
  lastModifiedAt: string;
  lastModifiedBy?: string;
}

// Supplier Portal Settings
export interface SupplierPortalSettings {
  id: string;
  
  // Feature Toggles
  features: {
    enableProductManagement: boolean;
    enableQuoteSubmission: boolean;
    enableBulkImport: boolean;
    enableAnalytics: boolean;
    enableTeamManagement: boolean;
  };
  
  // Product Settings
  products: {
    requireApproval: boolean;
    maxProducts?: number;
    allowImages: boolean;
    maxImagesPerProduct: number;
    requiredFields: string[];
  };
  
  // Quote Settings
  quotes: {
    autoAssignRequests: boolean;
    responseDeadlineHours: number;
    showCustomerName: boolean;
    allowPartialQuotes: boolean;
  };
  
  // Notifications
  notifications: {
    onNewRequest: boolean;
    onQuoteAccepted: boolean;
    onQuoteRejected: boolean;
    onDeadlineApproaching: boolean;
    deadlineReminderHours: number;
  };
  
  lastModifiedAt: string;
  lastModifiedBy?: string;
}

// Marketer Portal Settings
export interface MarketerPortalSettings {
  id: string;
  
  // Feature Toggles
  features: {
    enableReferralLinks: boolean;
    enableCommissionTracking: boolean;
    enablePayoutRequests: boolean;
    enableAnalytics: boolean;
    enableTeamManagement: boolean;
  };
  
  // Referral Settings
  referrals: {
    showCustomerDetails: boolean;
    showOrderDetails: boolean;
    showOrderTotals: boolean;
    attributionWindowDays: number;
  };
  
  // Payout Settings
  payouts: {
    minimumAmount: number;
    paymentMethods: ('bank_transfer' | 'cash' | 'wallet')[];
    processingDays: number;
    autoApproveUnder?: number;
  };
  
  lastModifiedAt: string;
  lastModifiedBy?: string;
}
