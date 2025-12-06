
import { BusinessProfile, User, Product, Order, OrderStatus, UserRole, CustomerType, Branch, Banner, SiteSettings, QuoteRequest, EmployeeRole, SearchHistoryItem, MissingProductRequest, QuoteItem, ImportRequest, ImportRequestStatus, ImportRequestTimelineEntry, AccountOpeningRequest, AccountRequestStatus, Notification, NotificationType, ActivityLogEntry, ActivityEventType, OrderInternalStatus, PriceLevel, BusinessCustomerType, QuoteItemApprovalStatus, QuoteRequestStatus, MissingStatus, MissingSource, CustomerStatus, ExcelColumnPreset, AdminUser, Role, Permission, PermissionResource, PermissionAction, MarketingCampaign, CampaignStatus, CampaignAudienceType, ConfigurablePriceLevel, ProductPriceEntry, CustomerPricingProfile, GlobalPricingSettings, PricingAuditLogEntry, ToolKey, ToolConfig, CustomerToolsOverride, ToolUsageRecord, SupplierPriceRecord, VinExtractionRecord, PriceComparisonSession, SupplierCatalogItem, SupplierMarketplaceSettings, SupplierProfile, Marketer, CustomerReferral, MarketerCommissionEntry, MarketerSettings, CommissionStatus, Advertiser, AdCampaign, AdSlot, AdSlotRotationState, InstallmentRequest, InstallmentOffer, InstallmentSettings, CustomerCreditProfile, InstallmentRequestStatus, InstallmentOfferStatus, InstallmentPaymentSchedule, InstallmentPaymentInstallment, SinicarDecisionPayload, InstallmentStats, PaymentFrequency, Organization, OrganizationType, OrganizationUser, OrganizationUserRole, ScopedPermissionKey, OrganizationSettings, OrganizationActivityLog, TeamInvitation, OrganizationStats, CustomerPortalSettings, MultilingualText, NavMenuItemConfig, DashboardSectionConfig, HeroBannerConfig, AnnouncementConfig, InfoCardConfig, PortalFeatureToggles, PortalDesignSettings, AISettings, AIConversation, AIChatMessage, AIUsageLog, SavedPriceComparison, SavedVinExtraction, SavedQuoteTemplate, FileConversionRecord, SecuritySettings, LoginRecord, CouponCode, LoyaltySettings, CustomerLoyalty, AdvancedNotificationSettings, CartItem, AbandonedCart, AlternativePart, PurchaseRequest, PurchaseRequestStatus, ActorType, EntityType, ActivityLogFilters, ActivityLogResponse, OnlineUser, OnlineUsersResponse } from '../types';
import { buildPartIndex, normalizePartNumberRaw } from '../utils/partNumberUtils';
import * as XLSX from 'xlsx';

// Default UI Texts for the Text Manager System
const DEFAULT_UI_TEXTS: Record<string, string> = {
  'dashboard.hero.title': 'منظومة صيني كار',
  'dashboard.hero.subtitle': 'بوابة عملاء الجملة المعتمدة',
  'dashboard.search.placeholder': 'ابحث برقم القطعة، اسم المنتج...',
  'sidebar.home': 'الرئيسية',
  'sidebar.orders': 'سجل الطلبات',
  'sidebar.quotes': 'طلبات التسعير',
  'sidebar.history': 'سجل البحث',
  'sidebar.import': 'الاستيراد من الصين',
  'sidebar.organization': 'إدارة المنشأة',
  'sidebar.support': 'الدعم الفني',
  'cart.title': 'سلة المشتريات',
  'cart.empty': 'السلة فارغة حالياً',
  'cart.checkout': 'اعتماد الطلب',
  'features.card1.title': 'قطع أصلية ومضمونة',
  'features.card1.desc': 'موزع معتمد لقطع غيار شانجان، إم جي، جيلي، وهافال.',
  'features.card2.title': 'شحن سريع للمناطق',
  'features.card2.desc': 'شحن خلال 24 ساعة للمدن الرئيسية وشحن مبرد.',
  'features.card3.title': 'أسعار جملة تنافسية',
  'features.card3.desc': 'نظام تسعير ذكي يعتمد على حجم مشترياتك.'
};

// Initial Data Wrappers
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Sini Pro - صيني كار',
  description: 'بوابة عملاء الجملة لقطع الغيار الصينية',
  supportPhone: '920000000',
  supportWhatsapp: '0500000000',
  supportEmail: 'support@sinipro.com',
  announcementBarColor: 'bg-primary-900',
  fontFamily: 'Cairo',
  maintenanceMode: false,
  primaryColor: '#2563eb', // Default Blue
  logoUrl: '',
  uiTexts: DEFAULT_UI_TEXTS, // Initialize with defaults
  
  // Ticker Defaults
  tickerEnabled: true,
  tickerText: 'مرحباً بكم في بوابة عملاء الجملة - صيني كار لقطع غيار السيارات الصينية. شحن مجاني للطلبات فوق 5000 ريال.',
  tickerSpeed: 4,
  tickerBgColor: '#0f172a',
  tickerTextColor: '#fb923c',

  apiConfig: {
    baseUrl: 'https://api.sini-pro-erp.com/v1',
    authToken: '',
    enableLiveSync: true,
    endpoints: {
      products: '/inventory/products',
      orders: '/sales/orders',
      customers: '/crm/customers'
    },
    webhookSecret: '',
    environment: 'PRODUCTION',
    syncInterval: 'REALTIME',
    syncEntities: {
        products: true,
        inventory: true,
        prices: true,
        customers: true,
        orders: true
    },
    webhooks: [],
    fieldMapping: '{\n  "sku": "item_code",\n  "price": "unit_price",\n  "stock": "qty_on_hand"\n}',
    debugMode: false,
    rateLimit: '120'
  },
  // Default Status Labels Configuration
  statusLabels: {
    orderStatus: {
      'PENDING': { label: 'بانتظار الموافقة', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, isDefault: true, sortOrder: 1 },
      'APPROVED': { label: 'تم الاعتماد', color: '#10b981', bgColor: '#d1fae5', isSystem: true, sortOrder: 2 },
      'REJECTED': { label: 'مرفوض', color: '#ef4444', bgColor: '#fee2e2', isSystem: true, sortOrder: 3 },
      'SHIPPED': { label: 'تم الشحن', color: '#3b82f6', bgColor: '#dbeafe', isSystem: true, sortOrder: 4 },
      'DELIVERED': { label: 'تم التسليم', color: '#059669', bgColor: '#a7f3d0', isSystem: true, sortOrder: 5 },
      'CANCELLED': { label: 'تم الإلغاء', color: '#6b7280', bgColor: '#f3f4f6', isSystem: true, sortOrder: 6 }
    },
    orderInternalStatus: {
      'NEW': { label: 'طلب جديد', color: '#8b5cf6', bgColor: '#ede9fe', isSystem: true, isDefault: true, sortOrder: 1 },
      'SENT_TO_WAREHOUSE': { label: 'تم الإرسال للمستودع', color: '#3b82f6', bgColor: '#dbeafe', isSystem: true, sortOrder: 2 },
      'WAITING_PAYMENT': { label: 'بانتظار التحويل', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, sortOrder: 3 },
      'PAYMENT_CONFIRMED': { label: 'تم تأكيد الدفع', color: '#10b981', bgColor: '#d1fae5', isSystem: true, sortOrder: 4 },
      'SALES_INVOICE_CREATED': { label: 'تم إصدار الفاتورة', color: '#06b6d4', bgColor: '#cffafe', isSystem: true, sortOrder: 5 },
      'READY_FOR_SHIPMENT': { label: 'جاهز للشحن', color: '#0ea5e9', bgColor: '#e0f2fe', isSystem: true, sortOrder: 6 },
      'COMPLETED_INTERNAL': { label: 'مكتمل داخلياً', color: '#059669', bgColor: '#a7f3d0', isSystem: true, sortOrder: 7 },
      'CANCELLED_INTERNAL': { label: 'ملغى داخلياً', color: '#6b7280', bgColor: '#f3f4f6', isSystem: true, sortOrder: 8 }
    },
    accountRequestStatus: {
      'NEW': { label: 'طلب جديد', color: '#8b5cf6', bgColor: '#ede9fe', isSystem: true, isDefault: true, sortOrder: 1 },
      'UNDER_REVIEW': { label: 'قيد المراجعة', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, sortOrder: 2 },
      'APPROVED': { label: 'تم الموافقة', color: '#10b981', bgColor: '#d1fae5', isSystem: true, sortOrder: 3 },
      'REJECTED': { label: 'مرفوض', color: '#ef4444', bgColor: '#fee2e2', isSystem: true, sortOrder: 4 },
      'ON_HOLD': { label: 'مؤجل', color: '#6b7280', bgColor: '#f3f4f6', isSystem: true, sortOrder: 5 }
    },
    quoteRequestStatus: {
      'NEW': { label: 'جديد', color: '#8b5cf6', bgColor: '#ede9fe', isSystem: true, isDefault: true, sortOrder: 1 },
      'UNDER_REVIEW': { label: 'قيد المراجعة', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, sortOrder: 2 },
      'PARTIALLY_APPROVED': { label: 'معتمد جزئياً', color: '#06b6d4', bgColor: '#cffafe', isSystem: true, sortOrder: 3 },
      'APPROVED': { label: 'تم التسعير', color: '#10b981', bgColor: '#d1fae5', isSystem: true, sortOrder: 4 },
      'QUOTED': { label: 'تم التسعير', color: '#10b981', bgColor: '#d1fae5', sortOrder: 5 },
      'PROCESSED': { label: 'تمت المعالجة', color: '#059669', bgColor: '#a7f3d0', sortOrder: 6 },
      'REJECTED': { label: 'مرفوض', color: '#ef4444', bgColor: '#fee2e2', isSystem: true, sortOrder: 7 }
    },
    quoteItemStatus: {
      'PENDING': { label: 'قيد الانتظار', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, isDefault: true, sortOrder: 1 },
      'MATCHED': { label: 'تم المطابقة', color: '#10b981', bgColor: '#d1fae5', isSystem: true, sortOrder: 2 },
      'NOT_FOUND': { label: 'غير متوفر', color: '#ef4444', bgColor: '#fee2e2', isSystem: true, sortOrder: 3 },
      'APPROVED': { label: 'معتمد', color: '#059669', bgColor: '#a7f3d0', isSystem: true, sortOrder: 4 },
      'REJECTED': { label: 'مرفوض', color: '#dc2626', bgColor: '#fecaca', isSystem: true, sortOrder: 5 },
      'MISSING': { label: 'ناقص', color: '#ea580c', bgColor: '#ffedd5', isSystem: true, sortOrder: 6 }
    },
    missingStatus: {
      'NEW': { label: 'نقص جديد', color: '#8b5cf6', bgColor: '#ede9fe', isSystem: true, isDefault: true, sortOrder: 1 },
      'UNDER_REVIEW': { label: 'تحت الدراسة', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, sortOrder: 2 },
      'ORDER_PLANNED': { label: 'تم جدولة الطلب', color: '#3b82f6', bgColor: '#dbeafe', isSystem: true, sortOrder: 3 },
      'ORDERED': { label: 'تم الطلب', color: '#06b6d4', bgColor: '#cffafe', isSystem: true, sortOrder: 4 },
      'ADDED_TO_STOCK': { label: 'تمت الإضافة للمخزون', color: '#10b981', bgColor: '#d1fae5', isSystem: true, sortOrder: 5 },
      'IGNORED': { label: 'تم تجاهله', color: '#6b7280', bgColor: '#f3f4f6', isSystem: true, sortOrder: 6 }
    },
    importRequestStatus: {
      'NEW': { label: 'طلب جديد', color: '#8b5cf6', bgColor: '#ede9fe', isSystem: true, isDefault: true, sortOrder: 1 },
      'UNDER_REVIEW': { label: 'قيد المراجعة', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, sortOrder: 2 },
      'WAITING_CUSTOMER_EXCEL': { label: 'بانتظار ملف Excel', color: '#3b82f6', bgColor: '#dbeafe', isSystem: true, sortOrder: 3 },
      'PRICING_IN_PROGRESS': { label: 'جاري التسعير', color: '#06b6d4', bgColor: '#cffafe', isSystem: true, sortOrder: 4 },
      'PRICING_SENT': { label: 'تم إرسال العرض', color: '#0ea5e9', bgColor: '#e0f2fe', isSystem: true, sortOrder: 5 },
      'WAITING_CUSTOMER_APPROVAL': { label: 'بانتظار موافقة العميل', color: '#a855f7', bgColor: '#f3e8ff', isSystem: true, sortOrder: 6 },
      'APPROVED_BY_CUSTOMER': { label: 'تمت موافقة العميل', color: '#10b981', bgColor: '#d1fae5', isSystem: true, sortOrder: 7 },
      'IN_FACTORY': { label: 'في المصنع', color: '#f97316', bgColor: '#ffedd5', isSystem: true, sortOrder: 8 },
      'SHIPMENT_BOOKED': { label: 'تم حجز الشحن', color: '#0284c7', bgColor: '#e0f2fe', isSystem: true, sortOrder: 9 },
      'ON_THE_SEA': { label: 'الشحنة في البحر', color: '#0369a1', bgColor: '#bae6fd', isSystem: true, sortOrder: 10 },
      'IN_PORT': { label: 'في الميناء', color: '#0891b2', bgColor: '#cffafe', isSystem: true, sortOrder: 11 },
      'CUSTOMS_CLEARED': { label: 'تم التخليص الجمركي', color: '#059669', bgColor: '#d1fae5', isSystem: true, sortOrder: 12 },
      'ON_THE_WAY': { label: 'في الطريق للعميل', color: '#16a34a', bgColor: '#bbf7d0', isSystem: true, sortOrder: 13 },
      'DELIVERED': { label: 'تم التسليم', color: '#059669', bgColor: '#a7f3d0', isSystem: true, sortOrder: 14 },
      'CANCELLED': { label: 'ملغى', color: '#6b7280', bgColor: '#f3f4f6', isSystem: true, sortOrder: 15 }
    },
    customerStatus: {
      'ACTIVE': { label: 'فعال', color: '#10b981', bgColor: '#d1fae5', isSystem: true, isDefault: true, sortOrder: 1 },
      'SUSPENDED': { label: 'موقوف مؤقتاً', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, sortOrder: 2 },
      'BLOCKED': { label: 'محظور', color: '#ef4444', bgColor: '#fee2e2', isSystem: true, sortOrder: 3 },
      'PENDING': { label: 'قيد التفعيل', color: '#8b5cf6', bgColor: '#ede9fe', isSystem: true, sortOrder: 4 },
      'INACTIVE': { label: 'غير نشط', color: '#6b7280', bgColor: '#f3f4f6', isSystem: true, sortOrder: 5 }
    },
    staffStatus: {
      'ACTIVE': { label: 'فعال', color: '#10b981', bgColor: '#d1fae5', isSystem: true, isDefault: true, sortOrder: 1 },
      'SUSPENDED': { label: 'موقوف', color: '#f59e0b', bgColor: '#fef3c7', isSystem: true, sortOrder: 2 },
      'BLOCKED': { label: 'محظور', color: '#ef4444', bgColor: '#fee2e2', isSystem: true, sortOrder: 3 }
    }
  },
  guestModeEnabled: true,
  
  // Guest Mode Visibility Settings - Default Configuration
  guestSettings: {
    showBusinessTypes: true,      // قسم "من نخدم" (مشوش)
    showMainServices: true,       // قسم الخدمات الرئيسية (مشوش)
    showHowItWorks: true,         // قسم "كيف تعمل المنظومة" (مشوش)
    showWhySiniCar: true,         // قسم "لماذا صيني كار" (مشوش)
    showCart: false,              // عربة التسوق - مخفية
    showMarketingCards: true,     // بطاقات التسويق الجانبية (مشوشة)
    blurIntensity: 'medium',      // شدة التشويش
    showBlurOverlay: true,        // إظهار overlay فوق المحتوى المشوش
    allowedPages: [],             // الصفحات المسموحة (فارغ = الرئيسية فقط)
    allowSearch: true,            // السماح بالبحث
    showSearchResults: true       // إظهار نتائج البحث (مشوشة)
  },
  
  // إعدادات نقاط البحث التلقائية حسب حالة الطلب
  orderStatusPointsConfig: {
    enabled: true,                // تفعيل الإضافة التلقائية
    pointsPerStatus: {
      'DELIVERED': 5,             // تم التسليم = 5 نقاط
      'APPROVED': 2,              // تم الاعتماد = 2 نقاط
      'SHIPPED': 1                // تم الشحن = 1 نقطة
    }
  }
};

const INITIAL_PRODUCTS: Product[] = [
  // Changan Parts
  { id: '1', partNumber: 'CN-102030', name: 'فحمات فرامل أمامية سيراميك - شانجان CS95', brand: 'Changan', price: 150, oldPrice: 180, isOnSale: true, stock: 50, isNew: false, category: 'فرامل', description: 'فحمات سيراميك عالية الجودة تدوم طويلاً، متوافقة مع موديلات 2020-2023' },
  { id: '2', partNumber: 'CN-550011', name: 'صدام أمامي - إيدو بلس 2022', brand: 'Changan', price: 850, stock: 10, isNew: true, category: 'بدي', description: 'صدام أصلي وكالة مع ضمان اللون والمقاس 100%' },
  { id: '3', partNumber: 'CN-CS85-09', name: 'مساعد خلفي يسار - CS85', brand: 'Changan', price: 420, stock: 15, category: 'نظام تعليق' },
  { id: '4', partNumber: 'CN-UNIK-FILT', name: 'طقم فلاتر صيانة (زيت+هواء+مكيف) - يوني كي', brand: 'Changan', price: 180, stock: 40, category: 'فلاتر' },
  { id: '5', partNumber: 'CN-ALT-95', name: 'دينمو كهرباء - شانجان CS95', brand: 'Changan', price: 1200, stock: 5, category: 'كهرباء' },
  { id: '6', partNumber: 'CN-RAD-75', name: 'راديتر ماء - شانجان CS75', brand: 'Changan', price: 550, stock: 8, category: 'تبريد' },
  
  // MG Parts
  { id: '7', partNumber: 'MG-998877', name: 'فلتر زيت مكينة أصلي - MG All Models', brand: 'MG', price: 35, stock: 200, category: 'فلاتر', description: 'فلتر زيت أصلي يضمن حماية المحرك لجميع سيارات ام جي' },
  { id: '8', partNumber: 'MG-RX5-01', name: 'شمعة أمامية يمين LED - MG RX5', brand: 'MG', price: 1800, oldPrice: 2100, isOnSale: true, stock: 5, category: 'إنارة' },
  { id: '9', partNumber: 'MG-GT-SPOILER', name: 'جناح خلفي رياضي كربون - MG GT', brand: 'MG', price: 600, stock: 3, isNew: true, category: 'اكسسوارات' },
  { id: '10', partNumber: 'MG-ZS-BUMP', name: 'شبك أمامي - MG ZS 2021', brand: 'MG', price: 450, stock: 12, category: 'بدي' },
  { id: '11', partNumber: 'MG-HS-PADS', name: 'فحمات خلفية - MG HS', brand: 'MG', price: 140, stock: 60, category: 'فرامل' },
  { id: '12', partNumber: 'MG-ENG-MNT', name: 'كراسي مكينة طقم - MG 6', brand: 'MG', price: 900, stock: 4, category: 'محرك' },

  // Geely Parts
  { id: '13', partNumber: 'GL-COOL-01', name: 'راديتر ماء تيربو - جيلي كولراي', brand: 'Geely', price: 650, stock: 8, category: 'تبريد', isNew: true },
  { id: '14', partNumber: 'GL-MON-BUMP', name: 'شبك أمامي رياضي كروم - جيلي مونجارو', brand: 'Geely', price: 1100, stock: 4, category: 'بدي', isNew: true },
  { id: '15', partNumber: 'GL-TUG-HL', name: 'اسطب خلفي متصل - جيلي توجيلا', brand: 'Geely', price: 2200, stock: 2, category: 'إنارة' },
  { id: '16', partNumber: 'GL-EMG-BRK', name: 'حساس فرامل ABS - جيلي امجراند', brand: 'Geely', price: 180, stock: 25, category: 'كهرباء' },
  { id: '17', partNumber: 'GL-OKA-FDR', name: 'رفرف أمامي يمين - جيلي أوكافانجو', brand: 'Geely', price: 700, stock: 6, category: 'بدي' },

  // Haval Parts
  { id: '18', partNumber: 'HV-H6-BRK', name: 'قماشات خلفية - هافال H6', brand: 'Haval', price: 120, stock: 80, category: 'فرامل' },
  { id: '19', partNumber: 'HV-JOLION-LGT', name: 'سطب خلفي يسار - هافال جوليون', brand: 'Haval', price: 750, oldPrice: 900, isOnSale: true, stock: 6, category: 'إنارة' },
  { id: '20', partNumber: 'HV-H9-TURBO', name: 'تيربو تشارجر - هافال H9', brand: 'Haval', price: 3500, stock: 2, category: 'محرك' },
  { id: '21', partNumber: 'HV-DARGO-MAT', name: 'دعاسات أرضية جلد - هافال دارجو', brand: 'Haval', price: 250, stock: 15, category: 'اكسسوارات' },

  // Great Wall & Chery
  { id: '22', partNumber: 'CH-TIGGO-OIL', name: 'زيت قير CVT - شيري تيجو 8', brand: 'Chery', price: 60, stock: 100, category: 'زيوت' },
  { id: '23', partNumber: 'CH-ARRIZO-DR', name: 'مقبض باب خارجي - شيري اريزو 6', brand: 'Chery', price: 85, stock: 30, category: 'بدي' },
  { id: '24', partNumber: 'GW-POER-FLT', name: 'فلتر ديزل - باور بيك اب', brand: 'Great Wall', price: 55, stock: 45, category: 'فلاتر' },
  
  // More Miscellaneous
  { id: '25', partNumber: 'GEN-SPK-PLG', name: 'بوجي إشعال إيريديوم - عام', brand: 'Generic', price: 45, stock: 500, category: 'كهرباء' },
  { id: '26', partNumber: 'GEN-BAT-70', name: 'بطارية 70 أمبير - هانكوك', brand: 'Generic', price: 350, stock: 20, category: 'كهرباء' },
  { id: '27', partNumber: 'CN-EADO-MIR', name: 'مراية جانبية يمين (كاميرا) - إيدو', brand: 'Changan', price: 650, stock: 12, category: 'بدي' },
  { id: '28', partNumber: 'MG-5-CVT', name: 'كارتير قير - MG 5', brand: 'MG', price: 320, stock: 8, category: 'محرك' },
  { id: '29', partNumber: 'HV-JUL-SEN', name: 'حساس ضغط هواء الإطارات - جوليون', brand: 'Haval', price: 120, stock: 50, category: 'كهرباء' },
  { id: '30', partNumber: 'GL-COOL-PMP', name: 'طرمبة ماء - كولراي', brand: 'Geely', price: 280, stock: 14, category: 'تبريد' },
];

const INITIAL_BANNERS: Banner[] = [
  { id: '1', title: 'صيني كار.. بوابتك للمستودع', subtitle: 'اطلب قطع غيار شانجان و MG مباشرة من الموقع ووفر وقت الانتظار', colorClass: 'from-primary-700 to-primary-900', buttonText: 'ابدأ الطلب الآن', isActive: true },
  { id: '2', title: 'وصل حديثاً: قطع جيلي وهافال', subtitle: 'تغطية شاملة لموديلات جيلي مونجارو وهافال H6 الجديدة', colorClass: 'from-slate-700 to-slate-900', buttonText: 'تصفح القطع', isActive: true },
  { id: '3', title: 'عروض الجملة الخاصة', subtitle: 'أسعار خاصة لطلبات الجملة ومراكز الصيانة المعتمدة', colorClass: 'from-secondary-600 to-secondary-800', buttonText: 'عروض الكميات', isActive: true },
  { id: '4', title: 'شحن مجاني للطلبات الكبيرة', subtitle: 'احصل على شحن مجاني لأي طلب يتجاوز 5000 ريال', colorClass: 'from-green-600 to-green-800', buttonText: 'تفاصيل العرض', isActive: true },
];

const INITIAL_NEWS = [
  "تنبيه: تحديث شامل لأسعار قطع غيار MG ابتداءً من يوم الأحد القادم",
  "وصل حديثاً: دفعة قطع بودي لسيارات جيلي كولراي 2024 وشانجان يوني كي",
  "عميلنا العزيز: تم تفعيل خدمة التوصيل السريع داخل الرياض (نفس اليوم)",
  "عرض خاص: خصم 10% على جميع الفلاتر والزيوت لنهاية الشهر",
  "تنويه: أوقات العمل في المستودع من 8 صباحاً حتى 8 مساءً"
];

// Initial Orders for Demo User
const DEMO_ORDERS: Order[] = [
    { 
      id: 'ORD-99201', 
      userId: 'demo-user-id', 
      businessId: 'demo-user-id', 
      items: [{...INITIAL_PRODUCTS[0], quantity: 10}, {...INITIAL_PRODUCTS[6], quantity: 20}], 
      totalAmount: 2200, 
      status: OrderStatus.SHIPPED, 
      date: '2023-10-15T10:30:00Z', 
      branchId: 'b1',
      internalStatus: 'READY_FOR_SHIPMENT',
      internalStatusHistory: [
        { status: 'NEW', changedAt: '2023-10-15T10:30:00Z', changedBy: 'system' },
        { status: 'READY_FOR_SHIPMENT', changedAt: '2023-10-16T09:00:00Z', changedBy: 'Ahmed' }
      ]
    },
    { 
      id: 'ORD-99255', 
      userId: 'demo-user-id', 
      businessId: 'demo-user-id', 
      items: [{...INITIAL_PRODUCTS[1], quantity: 1}], 
      totalAmount: 850, 
      status: OrderStatus.APPROVED, 
      date: '2023-10-20T14:15:00Z', 
      branchId: 'b1',
      internalStatus: 'PAYMENT_CONFIRMED',
      internalStatusHistory: [
        { status: 'NEW', changedAt: '2023-10-20T14:15:00Z', changedBy: 'system' },
        { status: 'PAYMENT_CONFIRMED', changedAt: '2023-10-20T15:30:00Z', changedBy: 'Finance' }
      ]
    },
    { 
      id: 'ORD-99310', 
      userId: 'demo-user-id', 
      businessId: 'demo-user-id', 
      items: [{...INITIAL_PRODUCTS[2], quantity: 5}, {...INITIAL_PRODUCTS[7], quantity: 2}], 
      totalAmount: 5700, 
      status: OrderStatus.PENDING, 
      date: new Date().toISOString(), 
      branchId: 'b1',
      internalStatus: 'NEW',
      internalStatusHistory: [
        { status: 'NEW', changedAt: new Date().toISOString(), changedBy: 'system' }
      ]
    },
];

const DEMO_QUOTES: QuoteRequest[] = [
    { 
      id: 'Q-5001', 
      userId: 'demo-user-id', 
      userName: 'مدير النظام (تجريبي)', 
      companyName: 'مركز صيني كار التجريبي', 
      date: '2023-09-01T09:00:00Z', 
      status: 'PROCESSED', 
      priceType: 'BOTH',
      items: [
        {partNumber: 'CN-102030', partName: 'فحمات أمامي', requestedQty: 100, matchedPrice: 140, status: 'MATCHED', approvalStatus: 'APPROVED', matchedProductName: 'فحمات أمامي جملة', isAvailable: true},
        {partNumber: 'UNK-999', partName: 'قطعة غير معروفة', requestedQty: 10, status: 'NOT_FOUND', approvalStatus: 'MISSING', notes: 'القطعة غير موجودة في الكتالوج'}
      ], 
      totalQuotedAmount: 14000,
      resultReady: true
    }
];

const STORAGE_KEYS = {
  USERS: 'b2b_users_sini_v2',
  PROFILES: 'b2b_profiles_sini_v2',
  ORDERS: 'b2b_orders_sini_v2',
  QUOTE_REQUESTS: 'b2b_quotes_sini_v2',
  SESSION: 'b2b_session_sini_v2',
  SETTINGS: 'b2b_settings_sini_v2',
  PRODUCTS: 'b2b_products_sini_v2',
  BANNERS: 'b2b_banners_sini_v2',
  NEWS: 'b2b_news_sini_v2',
  LOGS: 'b2b_logs_sini_v2',
  SEARCH_HISTORY: 'b2b_search_history_sini_v2',
  MISSING_REQUESTS: 'b2b_missing_requests_sini_v2',
  IMPORT_REQUESTS: 'b2b_import_requests_sini_v2',
  ACCOUNT_REQUESTS: 'siniCar_account_opening_requests',
  NOTIFICATIONS: 'siniCar_notifications_v2',
  ACTIVITY_LOGS: 'siniCar_activity_logs',
  EXCEL_COLUMN_PRESETS: 'siniCar_excel_column_presets',
  STATUS_LABELS: 'siniCar_status_labels_v1',
  ADMIN_USERS: 'siniCar_admin_users_v2',
  ADMIN_ROLES: 'siniCar_admin_roles_v1',
  CAMPAIGNS: 'siniCar_marketing_campaigns',
  PRICE_LEVELS: 'sini_price_levels',
  PRODUCT_PRICE_MATRIX: 'sini_price_matrix',
  GLOBAL_PRICING_SETTINGS: 'sini_global_pricing_settings',
  CUSTOMER_PRICING_PROFILES: 'sini_customer_pricing_profiles',
  PRICING_AUDIT_LOG: 'sini_pricing_audit_log',
  // Trader Tools
  TOOL_CONFIGS: 'sini_tool_configs',
  CUSTOMER_TOOLS_OVERRIDES: 'sini_customer_tools_overrides',
  TOOL_USAGE_RECORDS: 'sini_tool_usage_records',
  SUPPLIER_PRICE_RECORDS: 'sini_supplier_price_records',
  VIN_EXTRACTIONS: 'sini_vin_extractions',
  PRICE_COMPARISON_SESSIONS: 'sini_price_comparison_sessions',
  // Supplier Marketplace
  SUPPLIER_CATALOG_ITEMS: 'sini_supplier_catalog_items',
  SUPPLIER_MARKETPLACE_SETTINGS: 'sini_supplier_marketplace_settings',
  SUPPLIER_PROFILES: 'sini_supplier_profiles',
  // Marketer/Affiliate System
  MARKETERS: 'sini_marketers',
  CUSTOMER_REFERRALS: 'sini_customer_referrals',
  MARKETER_COMMISSIONS: 'sini_marketer_commissions',
  MARKETER_SETTINGS: 'sini_marketer_settings',
  // Advertising System
  ADVERTISERS: 'sini_advertisers',
  AD_CAMPAIGNS: 'sini_ad_campaigns',
  AD_SLOTS: 'sini_ad_slots',
  AD_SLOT_ROTATIONS: 'sini_ad_slot_rotations',
  // Installment Wholesale Purchase System
  INSTALLMENT_REQUESTS: 'sini_installment_requests',
  INSTALLMENT_OFFERS: 'sini_installment_offers',
  CUSTOMER_CREDIT_PROFILES: 'sini_customer_credit_profiles',
  INSTALLMENT_SETTINGS: 'sini_installment_settings',
  // Organization & Team Management System
  ORGANIZATIONS: 'sini_organizations',
  ORGANIZATION_USERS: 'sini_organization_users',
  ORGANIZATION_SETTINGS: 'sini_organization_settings',
  ORGANIZATION_ACTIVITY_LOGS: 'sini_organization_activity_logs',
  TEAM_INVITATIONS: 'sini_team_invitations',
  // Abandoned Carts
  ABANDONED_CARTS: 'sini_abandoned_carts',
  ALTERNATIVE_PARTS: 'sini_alternative_parts',
  PURCHASE_REQUESTS: 'sini_purchase_requests'
};

// Optimized delay function (default minimal delay to allow UI painting)
const delay = (ms: number = 0) => {
    if (ms === 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
};

const generateClientId = () => 'C-' + Math.floor(10000 + Math.random() * 90000);
const generateActivationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Internal Activity Log Helper ---
const internalRecordActivity = (input: Omit<ActivityLogEntry, 'id' | 'createdAt'>) => {
    try {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
        
        let userName = input.userName;
        let role = input.role;

        // Try to fill missing info if userId is present
        if (!userName || !role) {
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
            const user = users.find((u: User) => u.id === input.userId);
            if (user) {
                if(!userName) userName = user.name;
                if(!role) role = user.role;
            } else if (input.userId === 'super-admin') {
                userName = 'المدير العام';
                role = 'SUPER_ADMIN';
            }
        }

        const newEntry: ActivityLogEntry = {
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date().toISOString(),
            userId: input.userId,
            userName,
            role,
            eventType: input.eventType,
            description: input.description,
            page: input.page,
            metadata: input.metadata
        };

        logs.unshift(newEntry);
        
        // Cap the log size to 1000 entries to prevent storage overflow
        if (logs.length > 1000) {
            logs.length = 1000;
        }

        localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    } catch (e) {
        console.error("Failed to record activity", e);
    }
};

// Helper for local logging (Simple Logging System)
const logActivity = (type: string, data: any) => {
    try {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
        logs.push({ type, data, timestamp: new Date().toISOString() });
        // Keep only last 100 logs
        if(logs.length > 100) logs.shift();
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
        console.error("Failed to log activity", e);
    }
};

// Helper for daily reset (Search Points System)
const checkAndResetDailySearch = (user: User) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check suspension validity
    // NOTE: This logic assumes profile data is merged into user for session, or checked separately.
    // In current simplified mock, we check if user status is suspended.
    if (user.status === 'SUSPENDED') {
       // logic to check suspension date could go here, but for now we block login elsewhere
    }

    if (user.lastSearchDate !== today) {
        user.searchUsed = 0;
        user.lastSearchDate = today;
    }
    return user;
};

// --- Internal Helper to Update User ---
const updateLocalUser = (updatedUser: User) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Update Session if it matches
        const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
        if(session.id === updatedUser.id) {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));
        }
    }
};

// --- Internal Notification Helper (Enhanced) ---
interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedType?: 'ORDER' | 'REQUEST' | 'ACCOUNT' | 'QUOTE' | 'IMPORT' | 'PRODUCT' | 'USER' | 'CART';
    relatedId?: string;
    link?: string;
}

const internalCreateNotification = (
    userId: string, 
    type: NotificationType, 
    title: string, 
    message: string,
    relatedType?: CreateNotificationParams['relatedType'],
    relatedId?: string,
    link?: string
): Notification => {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const newNotif: Notification = {
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId,
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
        isRead: false,
        relatedType,
        relatedId,
        link
    };
    notifications.unshift(newNotif);
    if(notifications.length > 500) notifications.length = 500; 
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return newNotif;
};

// Helper to create notifications for specific events
const createEventNotification = (params: CreateNotificationParams): Notification => {
    return internalCreateNotification(
        params.userId,
        params.type,
        params.title,
        params.message,
        params.relatedType,
        params.relatedId,
        params.link
    );
};

// Helper to get all admin/staff user IDs for system notifications
const getAdminUserIds = (): string[] => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users
        .filter((u: User) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' || u.role === 'EMPLOYEE')
        .map((u: User) => u.id);
};

export const MockApi = {
  // --- Connection Check ---
  async checkHealth(): Promise<{ status: 'ok' | 'error', latency: number }> {
      const start = performance.now();
      // Simulate minimal delay
      await new Promise(r => setTimeout(r, Math.random() * 50)); 
      const end = performance.now();
      return { status: 'ok', latency: Math.round(end - start) };
  },

  // --- Activity Log System ---
  async recordActivity(entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Promise<void> {
      internalRecordActivity(entry);
  },

  async getActivityLogs(): Promise<ActivityLogEntry[]> {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
  },

  async getCustomerActivityLogs(customerId: string): Promise<ActivityLogEntry[]> {
      const logs = await this.getActivityLogs();
      // Get all logs where userId matches OR metadata includes targetUserId (for admin actions on this user)
      return logs.filter(l => l.userId === customerId || l.metadata?.targetUserId === customerId);
  },

  // --- Heartbeat & Online Status ---
  async recordHeartbeat(userId: string): Promise<void> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex((u: User) => u.id === userId);
      if (idx !== -1) {
          users[idx].lastActiveAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
  },

  async getOnlineUsers(minutesThreshold: number = 5): Promise<User[]> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const now = new Date().getTime();
      const thresholdMs = minutesThreshold * 60 * 1000;
      
      return users.filter((u: User) => {
          // Exclude admin roles - only show customers online
          if (!u.lastActiveAt || u.role === 'SUPER_ADMIN') return false;
          const lastActive = new Date(u.lastActiveAt).getTime();
          return (now - lastActive) <= thresholdMs;
      });
  },

  // --- Admin & Settings ---
  async getSettings(): Promise<SiteSettings> {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
          return DEFAULT_SETTINGS;
      }
      const parsed = JSON.parse(stored);
      // Merge with default to handle new fields if missing in storage
      const mergedStatusLabels = DEFAULT_SETTINGS.statusLabels ? {
          orderStatus: { ...DEFAULT_SETTINGS.statusLabels.orderStatus, ...(parsed.statusLabels?.orderStatus || {}) },
          orderInternalStatus: { ...DEFAULT_SETTINGS.statusLabels.orderInternalStatus, ...(parsed.statusLabels?.orderInternalStatus || {}) },
          accountRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.accountRequestStatus, ...(parsed.statusLabels?.accountRequestStatus || {}) },
          quoteRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteRequestStatus, ...(parsed.statusLabels?.quoteRequestStatus || {}) },
          quoteItemStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteItemStatus, ...(parsed.statusLabels?.quoteItemStatus || {}) },
          missingStatus: { ...DEFAULT_SETTINGS.statusLabels.missingStatus, ...(parsed.statusLabels?.missingStatus || {}) },
          importRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.importRequestStatus, ...(parsed.statusLabels?.importRequestStatus || {}) },
          customerStatus: { ...DEFAULT_SETTINGS.statusLabels.customerStatus, ...(parsed.statusLabels?.customerStatus || {}) },
          staffStatus: { ...DEFAULT_SETTINGS.statusLabels.staffStatus, ...(parsed.statusLabels?.staffStatus || {}) }
      } : parsed.statusLabels;
      
      return { 
          ...DEFAULT_SETTINGS, 
          ...parsed, 
          apiConfig: { ...DEFAULT_SETTINGS.apiConfig, ...parsed.apiConfig },
          uiTexts: { ...DEFAULT_SETTINGS.uiTexts, ...(parsed.uiTexts || {}) },
          statusLabels: mergedStatusLabels
      };
  },

  async updateSettings(settings: SiteSettings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  async updateBanners(banners: Banner[]) {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  },

  async updateNews(news: string[]) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
  },

  // --- Status Labels Management ---
  async getStatusLabels(): Promise<typeof DEFAULT_SETTINGS.statusLabels> {
      const stored = localStorage.getItem(STORAGE_KEYS.STATUS_LABELS);
      if (!stored) {
          localStorage.setItem(STORAGE_KEYS.STATUS_LABELS, JSON.stringify(DEFAULT_SETTINGS.statusLabels));
          return DEFAULT_SETTINGS.statusLabels;
      }
      const parsed = JSON.parse(stored);
      return {
          orderStatus: { ...DEFAULT_SETTINGS.statusLabels.orderStatus, ...parsed.orderStatus },
          orderInternalStatus: { ...DEFAULT_SETTINGS.statusLabels.orderInternalStatus, ...parsed.orderInternalStatus },
          accountRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.accountRequestStatus, ...parsed.accountRequestStatus },
          quoteRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteRequestStatus, ...parsed.quoteRequestStatus },
          quoteItemStatus: { ...DEFAULT_SETTINGS.statusLabels.quoteItemStatus, ...parsed.quoteItemStatus },
          missingStatus: { ...DEFAULT_SETTINGS.statusLabels.missingStatus, ...parsed.missingStatus },
          importRequestStatus: { ...DEFAULT_SETTINGS.statusLabels.importRequestStatus, ...parsed.importRequestStatus },
          customerStatus: { ...DEFAULT_SETTINGS.statusLabels.customerStatus, ...parsed.customerStatus },
          staffStatus: { ...DEFAULT_SETTINGS.statusLabels.staffStatus, ...parsed.staffStatus }
      };
  },

  async updateStatusLabels(statusLabels: typeof DEFAULT_SETTINGS.statusLabels): Promise<void> {
      localStorage.setItem(STORAGE_KEYS.STATUS_LABELS, JSON.stringify(statusLabels));
      const settings = await this.getSettings();
      settings.statusLabels = statusLabels;
      await this.updateSettings(settings);
  },

  async addStatusLabel(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, key: string, definition: { label: string; color: string; bgColor: string; icon?: string; isDefault?: boolean; isSystem?: boolean; sortOrder?: number }): Promise<{ success: boolean; error?: string }> {
      const statusLabels = await this.getStatusLabels();
      if (statusLabels[domain][key]) {
          return { success: false, error: 'المفتاح موجود بالفعل في هذا المجال' };
      }
      const existingLabels = Object.values(statusLabels[domain]) as { sortOrder?: number }[];
      const maxOrder = existingLabels.reduce((max: number, item) => Math.max(max, item.sortOrder || 0), 0);
      statusLabels[domain][key] = {
          ...definition,
          sortOrder: definition.sortOrder || maxOrder + 1,
          isSystem: false
      };
      if (definition.isDefault) {
          Object.keys(statusLabels[domain]).forEach(k => {
              if (k !== key) statusLabels[domain][k].isDefault = false;
          });
      }
      await this.updateStatusLabels(statusLabels);
      return { success: true };
  },

  async updateStatusLabel(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, key: string, definition: { label: string; color: string; bgColor: string; icon?: string; isDefault?: boolean; sortOrder?: number }): Promise<{ success: boolean; error?: string }> {
      const statusLabels = await this.getStatusLabels();
      if (!statusLabels[domain][key]) {
          return { success: false, error: 'الحالة غير موجودة' };
      }
      const existing = statusLabels[domain][key];
      statusLabels[domain][key] = {
          ...existing,
          label: definition.label,
          color: definition.color,
          bgColor: definition.bgColor,
          icon: definition.icon,
          sortOrder: definition.sortOrder ?? existing.sortOrder
      };
      if (definition.isDefault) {
          Object.keys(statusLabels[domain]).forEach(k => {
              if (k !== key) statusLabels[domain][k].isDefault = false;
          });
          statusLabels[domain][key].isDefault = true;
      }
      await this.updateStatusLabels(statusLabels);
      return { success: true };
  },

  async deleteStatusLabel(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, key: string): Promise<{ success: boolean; error?: string }> {
      const statusLabels = await this.getStatusLabels();
      if (!statusLabels[domain][key]) {
          return { success: false, error: 'الحالة غير موجودة' };
      }
      if (statusLabels[domain][key].isSystem) {
          return { success: false, error: 'لا يمكن حذف حالة نظامية' };
      }
      const usageCount = await this.checkStatusUsage(domain, key);
      if (usageCount > 0) {
          return { success: false, error: `لا يمكن الحذف، يوجد ${usageCount} سجل يستخدم هذه الحالة` };
      }
      delete statusLabels[domain][key];
      await this.updateStatusLabels(statusLabels);
      return { success: true };
  },

  async checkStatusUsage(domain: keyof typeof DEFAULT_SETTINGS.statusLabels, statusKey: string): Promise<number> {
      let count = 0;
      switch (domain) {
          case 'orderStatus':
              const orders = await this.getAllOrders();
              count = orders.filter(o => o.status === statusKey || o.status === OrderStatus[statusKey as keyof typeof OrderStatus]).length;
              break;
          case 'orderInternalStatus':
              const allOrders = await this.getAllOrders();
              count = allOrders.filter(o => o.internalStatus === statusKey).length;
              break;
          case 'accountRequestStatus':
              const accounts = await this.getAccountOpeningRequests();
              count = accounts.filter(a => a.status === statusKey).length;
              break;
          case 'quoteRequestStatus':
              const quotes = await this.getAllQuoteRequests();
              count = quotes.filter(q => q.status === statusKey).length;
              break;
          case 'importRequestStatus':
              const imports = await this.getImportRequests();
              count = imports.filter(i => i.status === statusKey).length;
              break;
          case 'missingStatus':
              const missing = await this.getMissingProductRequests();
              count = missing.filter(m => m.status === statusKey).length;
              break;
          case 'customerStatus':
              const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]') as BusinessProfile[];
              count = profiles.filter(p => p.status === statusKey).length;
              break;
          case 'staffStatus':
              const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
              count = users.filter(u => u.role === 'CUSTOMER_STAFF' && u.status === statusKey).length;
              break;
      }
      return count;
  },

  async getAdminStats() {
      // Removed delay
      const orders = await this.getAllOrders();
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const products = await this.searchProducts('');
      const quotes = await this.getAllQuoteRequests();
      const accountRequests = await this.getAccountOpeningRequests();
      
      return {
          totalOrders: orders.length,
          pendingOrders: orders.filter((o:Order) => o.status === OrderStatus.PENDING).length,
          totalRevenue: orders.reduce((acc:number, o:Order) => acc + o.totalAmount, 0),
          totalUsers: users.length,
          totalProducts: products.length,
          pendingQuotes: quotes.filter(q => q.status === 'NEW' || q.status === 'UNDER_REVIEW').length,
          newAccountRequests: accountRequests.filter(r => r.status === 'NEW').length
      };
  },

  async getAllUsers(): Promise<{user: User, profile: BusinessProfile}[]> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      
      return users.map((u: User) => ({
          user: u,
          profile: profiles.find((p: BusinessProfile) => p.userId === (u.role === 'CUSTOMER_STAFF' ? u.parentId : u.id))
      })).filter((u: any) => u.user.role !== 'SUPER_ADMIN');
  },

  // --- NEW: Aggregated Customer Database Getter ---
  async getCustomersDatabase(): Promise<BusinessProfile[]> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]') as BusinessProfile[];
      const orders = await this.getAllOrders();
      const quotes = await this.getAllQuoteRequests();
      const importRequests = await this.getImportRequests();
      const activityLogs = await this.getActivityLogs();
      const missingRequests = await this.getMissingProductRequests();
      const accountRequests = await this.getAccountOpeningRequests();

      // Enrich profiles with aggregated data
      const enrichedProfiles = profiles.map(profile => {
          // Find related users (Owner + Staff)
          const profileUsers = users.filter(u => u.businessId === profile.userId || u.id === profile.userId);
          const ownerUser = users.find(u => u.id === profile.userId);

          // Find approved account request for documents
          const approvedRequest = accountRequests.find(r => 
              r.status === 'APPROVED' && 
              (r.phone === ownerUser?.phone || r.businessName === profile.companyName)
          );
          const customerDocuments = approvedRequest?.documents || profile.documents || [];

          // Aggregate Orders
          const profileOrders = orders.filter(o => o.businessId === profile.userId || o.userId === profile.userId);
          const totalOrders = profileOrders.length;
          const totalInvoices = profileOrders.filter(o => o.internalStatus === 'SALES_INVOICE_CREATED' || o.internalStatus === 'COMPLETED_INTERNAL').length;

          // Aggregate Quotes
          const totalQuotes = quotes.filter(q => q.userId === profile.userId).length;

          // Aggregate Imports
          const totalImports = importRequests.filter(r => r.customerId === profile.userId).length;

          // Aggregate Searches (From Activity Logs or User Stats)
          // We can sum searchUsed from all users or count logs
          const totalSearches = activityLogs.filter(l => 
              (l.eventType === 'SEARCH_PERFORMED') && 
              profileUsers.some(u => u.id === l.userId)
          ).length;

          // Missing Requests
          const totalMissing = missingRequests.filter(m => profileUsers.some(u => u.id === m.userId)).length;

          // Security: Get last login from owner
          const lastLogin = ownerUser?.lastLoginAt || null;
          const failedAttempts = ownerUser?.failedLoginAttempts || 0;

          // Merge fields ensuring backward compatibility defaults
          return {
              ...profile,
              status: profile.status || (ownerUser?.status as CustomerStatus) || (ownerUser?.isActive ? 'ACTIVE' : 'SUSPENDED'), // fallback
              assignedPriceLevel: profile.assignedPriceLevel || (ownerUser?.priceLevel as PriceLevel) || 'LEVEL_2',
              businessCustomerType: profile.businessCustomerType || (ownerUser?.customerType as BusinessCustomerType),
              customerType: profile.customerType, // Must keep CustomerType
              
              searchPointsTotal: profile.searchPointsTotal || (ownerUser?.searchLimit ?? 50),
              searchPointsRemaining: profile.searchPointsRemaining || ((ownerUser?.searchLimit || 50) - (ownerUser?.searchUsed || 0)),
              
              staffLimit: profile.staffLimit || 5,
              staffUsersCount: profileUsers.filter(u => u.role === 'CUSTOMER_STAFF').length,

              lastLoginAt: lastLogin,
              failedLoginAttempts: failedAttempts,
              riskyLoginFlag: failedAttempts > 5, // Simple logic

              totalOrdersCount: totalOrders,
              totalQuotesCount: totalQuotes,
              totalImportRequestsCount: totalImports,
              totalInvoicesCount: totalInvoices,
              totalSearchesCount: totalSearches,
              missingRequestsCount: totalMissing,
              documents: customerDocuments
          };
      });

      return enrichedProfiles;
  },

  // --- Customer Management Actions ---

  async updateCustomerStatus(customerId: string, status: CustomerStatus, suspendedUntil?: string): Promise<void> {
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

      // Update Profile
      const pIdx = profiles.findIndex((p: BusinessProfile) => p.userId === customerId);
      if (pIdx !== -1) {
          profiles[pIdx].status = status;
          if (suspendedUntil) profiles[pIdx].suspendedUntil = suspendedUntil;
          else profiles[pIdx].suspendedUntil = null;
      }

      // Update Owner User Status
      const uIdx = users.findIndex((u: User) => u.id === customerId);
      if (uIdx !== -1) {
          users[uIdx].status = status as any; // Cast for now
          users[uIdx].isActive = status === 'ACTIVE'; // Legacy compatibility
      }

      // Update All Staff Users if blocked/suspended? Maybe optional. 
      // For strict block, we should block staff too.
      if (status === 'BLOCKED' || status === 'SUSPENDED') {
          users.forEach((u: User) => {
              if (u.businessId === customerId) {
                  u.status = status as any;
                  u.isActive = false;
              }
          });
      } else if (status === 'ACTIVE') {
           // Reactivate owner, but maybe keep staff as is? 
           // For simplicity, reactivate owner only, staff managed separately usually.
      }

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Log
      internalRecordActivity({
          userId: 'super-admin',
          userName: 'System Admin',
          role: 'SUPER_ADMIN',
          eventType: status === 'ACTIVE' ? 'CUSTOMER_REACTIVATED' : 'CUSTOMER_SUSPENDED',
          description: `تغيير حالة العميل إلى ${status}`,
          metadata: { targetUserId: customerId, suspendedUntil }
      });
  },

  async addCustomerSearchPoints(customerId: string, points: number): Promise<void> {
      // Similar to adminGrantPoints but ensuring Profile is updated too
      await this.adminGrantPoints(customerId, points);
      
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      const pIdx = profiles.findIndex((p: BusinessProfile) => p.userId === customerId);
      if (pIdx !== -1) {
          profiles[pIdx].searchPointsTotal = (profiles[pIdx].searchPointsTotal || 0) + points;
          profiles[pIdx].searchPointsRemaining = (profiles[pIdx].searchPointsRemaining || 0) + points;
          localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      }
      
      // Log activity
      internalRecordActivity({
          userId: 'super-admin',
          userName: 'System Admin',
          role: 'SUPER_ADMIN',
          eventType: 'SEARCH_POINTS_ADDED',
          description: `تم إضافة ${points} نقطة بحث للعميل`,
          metadata: { targetUserId: customerId, pointsAdded: points }
      });
  },

  async deductCustomerSearchPoints(customerId: string, points: number): Promise<boolean> {
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      const pIdx = profiles.findIndex((p: BusinessProfile) => p.userId === customerId);
      
      if (pIdx === -1) return false;
      
      const currentRemaining = profiles[pIdx].searchPointsRemaining || 0;
      if (points > currentRemaining) return false;
      
      profiles[pIdx].searchPointsRemaining = currentRemaining - points;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      
      // Also update user's searchLimit to reflect remaining
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const uIdx = users.findIndex((u: User) => u.id === customerId);
      if (uIdx !== -1) {
          users[uIdx].searchLimit = profiles[pIdx].searchPointsRemaining;
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
      
      // Log activity
      internalRecordActivity({
          userId: 'super-admin',
          userName: 'System Admin',
          role: 'SUPER_ADMIN',
          eventType: 'SEARCH_POINTS_DEDUCTED',
          description: `تم خصم ${points} نقطة بحث من العميل`,
          metadata: { targetUserId: customerId, pointsDeducted: points, newBalance: profiles[pIdx].searchPointsRemaining }
      });
      
      return true;
  },

  async updateCustomerPriceVisibility(customerId: string, visibility: 'VISIBLE' | 'HIDDEN'): Promise<void> {
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      const pIdx = profiles.findIndex((p: BusinessProfile) => p.userId === customerId);
      
      if (pIdx !== -1) {
          profiles[pIdx].priceVisibility = visibility;
          localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
          
          // Log activity
          internalRecordActivity({
              userId: 'super-admin',
              userName: 'System Admin',
              role: 'SUPER_ADMIN',
              eventType: 'OTHER',
              description: `تغيير نوع عرض الأسعار للعميل إلى ${visibility === 'VISIBLE' ? 'ظاهرة' : 'مخفية'}`,
              metadata: { targetUserId: customerId, priceVisibility: visibility }
          });
      }
  },

  async updateStaffStatus(staffId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED'): Promise<void> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const uIdx = users.findIndex((u: User) => u.id === staffId);
      if (uIdx !== -1) {
          users[uIdx].status = status;
          users[uIdx].isActive = status === 'ACTIVE';
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          
          internalRecordActivity({
              userId: 'super-admin',
              eventType: status === 'ACTIVE' ? 'USER_REACTIVATED' : 'USER_SUSPENDED',
              description: `تغيير حالة الموظف ${users[uIdx].name} إلى ${status}`,
              metadata: { targetUserId: staffId }
          });
      }
  },

  async resetFailedLogin(userId: string): Promise<void> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const uIdx = users.findIndex((u: User) => u.id === userId);
      if (uIdx !== -1) {
          users[uIdx].failedLoginAttempts = 0;
          users[uIdx].riskyLoginFlag = false;
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
  },

  // --- End Customer Management ---

  async getAllOrders(): Promise<Order[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!stored) {
           localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
           return DEMO_ORDERS;
      }
      return JSON.parse(stored);
  },
  
  async cancelOrder(orderId: string, cancelledBy: 'CUSTOMER' | 'ADMIN') {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const index = orders.findIndex((o: Order) => o.id === orderId);
      if (index === -1) throw new Error('الطلب غير موجود');
      const order = orders[index];

      // Validation for Customer: cannot cancel if shipped or delivered
      if (cancelledBy === 'CUSTOMER') {
          const sensitive = [OrderStatus.SHIPPED, OrderStatus.DELIVERED];
          if (sensitive.includes(order.status as OrderStatus)) {
               throw new Error('CANNOT_CANCEL_SENSITIVE_STATUS');
          }
      }

      // Update Order
      const updatedOrder: Order = {
          ...order,
          status: OrderStatus.CANCELLED,
          cancelledBy,
          cancelledAt: new Date().toISOString()
      };
      
      orders[index] = updatedOrder;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      logActivity('ORDER_CANCELLED', { orderId, by: cancelledBy });

      // Record Activity
      internalRecordActivity({
          userId: updatedOrder.userId,
          eventType: 'ORDER_CANCELLED',
          description: `تم إلغاء الطلب #${updatedOrder.id} بواسطة ${cancelledBy === 'CUSTOMER' ? 'العميل' : 'الإدارة'}`,
          metadata: { orderId: updatedOrder.id, cancelledBy }
      });

      // --- Trigger Notifications Logic ---
      
      // If Admin cancelled, notify user
      if (cancelledBy === 'ADMIN') {
          internalCreateNotification(
              updatedOrder.userId,
              'ORDER_STATUS_CHANGED',
              'إلغاء الطلب',
              `تم إلغاء طلبك رقم ${updatedOrder.id} من قبل الإدارة.`
          );
          
          // Mark as unread orders for user
          const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
          const userIdx = users.findIndex((u:User) => u.id === updatedOrder.userId);
          if (userIdx !== -1) {
              const u = users[userIdx];
              u.hasUnreadOrders = true;
              updateLocalUser(u);
          }
      }

      return updatedOrder;
  },
  
  async deleteOrder(orderId: string): Promise<void> {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const orderToDelete = orders.find((o: Order) => o.id === orderId);
      const filteredOrders = orders.filter((o: Order) => o.id !== orderId);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredOrders));
      logActivity('ORDER_DELETED', { orderId });
      
      if(orderToDelete) {
          internalRecordActivity({
              userId: orderToDelete.userId,
              eventType: 'ORDER_DELETED',
              description: `تم حذف الطلب #${orderId} من السجل`,
              metadata: { orderId }
          });
      }
  },

  // --- Notification System (Enhanced) ---

  async getNotificationsForUser(userId: string, options?: { 
      isRead?: boolean; 
      limit?: number; 
      page?: number;
      type?: NotificationType;
      types?: NotificationType[];
  }): Promise<{ items: Notification[]; unreadCount: number; total: number }> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      let userNotifs = all.filter((n: Notification) => n.userId === userId);
      
      // Apply filters
      if (options?.isRead !== undefined) {
          userNotifs = userNotifs.filter((n: Notification) => n.isRead === options.isRead);
      }
      if (options?.types && options.types.length > 0) {
          userNotifs = userNotifs.filter((n: Notification) => options.types!.includes(n.type));
      } else if (options?.type) {
          userNotifs = userNotifs.filter((n: Notification) => n.type === options.type);
      }
      
      // Sort by createdAt DESC
      userNotifs.sort((a: Notification, b: Notification) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const total = userNotifs.length;
      const unreadCount = all.filter((n: Notification) => n.userId === userId && !n.isRead).length;
      
      // Pagination
      const limit = options?.limit || 20;
      const page = options?.page || 1;
      const startIndex = (page - 1) * limit;
      const items = userNotifs.slice(startIndex, startIndex + limit);
      
      return { items, unreadCount, total };
  },

  async getAllNotifications(): Promise<Notification[]> {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  },

  async markNotificationAsRead(userId: string, notificationId: string): Promise<Notification | null> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const idx = all.findIndex((n: Notification) => n.id === notificationId && n.userId === userId);
      if (idx === -1) return null;
      
      all[idx] = { ...all[idx], isRead: true, readAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
      return all[idx];
  },

  async markAllNotificationsAsRead(userId: string): Promise<number> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const now = new Date().toISOString();
      let count = 0;
      
      const updated = all.map((n: Notification) => {
          if (n.userId === userId && !n.isRead) {
              count++;
              return { ...n, isRead: true, readAt: now };
          }
          return n;
      });
      
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      return count;
  },

  // Legacy function for backwards compatibility
  async markNotificationsAsRead(userId: string): Promise<void> {
      await this.markAllNotificationsAsRead(userId);
  },

  async clearNotificationsForUser(userId: string): Promise<void> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const filtered = all.filter((n: Notification) => n.userId !== userId);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
  },

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const filtered = all.filter((n: Notification) => !(n.id === notificationId && n.userId === userId));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
  },

  async createNotification(notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'readAt'>): Promise<Notification> {
      return internalCreateNotification(
          notifData.userId, 
          notifData.type, 
          notifData.title, 
          notifData.message,
          notifData.relatedType,
          notifData.relatedId,
          notifData.link
      );
  },

  // Notify all admin users about an event
  async notifyAdmins(type: NotificationType, title: string, message: string, relatedType?: CreateNotificationParams['relatedType'], relatedId?: string): Promise<void> {
      const adminIds = getAdminUserIds();
      adminIds.forEach(adminId => {
          internalCreateNotification(adminId, type, title, message, relatedType, relatedId);
      });
  },

  // Get unread count for a user
  async getUnreadNotificationCount(userId: string): Promise<number> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      return all.filter((n: Notification) => n.userId === userId && !n.isRead).length;
  },

  async markOrdersAsReadForUser(userId: string): Promise<void> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex((u: User) => u.id === userId);
      if (idx !== -1) {
          const user = users[idx];
          if (user.hasUnreadOrders) {
              user.hasUnreadOrders = false;
              user.lastOrdersViewedAt = new Date().toISOString();
              updateLocalUser(user);
          }
      }
  },

  async markQuotesAsReadForUser(userId: string): Promise<void> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex((u: User) => u.id === userId);
      if (idx !== -1) {
          const user = users[idx];
          if (user.hasUnreadQuotes) {
              user.hasUnreadQuotes = false;
              user.lastQuotesViewedAt = new Date().toISOString();
              updateLocalUser(user);
          }
      }
  },

  // Helper to simulate Admin Granting Points (Triggers Notification)
  async adminGrantPoints(userId: string, points: number): Promise<void> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex((u: User) => u.id === userId);
      if (idx !== -1) {
          const user = users[idx];
          user.searchLimit = (user.searchLimit || 0) + points;
          updateLocalUser(user);

          // Notify
          internalCreateNotification(
              userId,
              'SEARCH_POINTS_ADDED',
              'تحديث رصيد نقاط البحث',
              `تم إضافة ${points} نقطة بحث إلى رصيدك. رصيدك الحالي: ${user.searchLimit}`
          );

          // Record Activity
          internalRecordActivity({
              userId: 'super-admin', // Admin Action
              eventType: 'SEARCH_POINTS_ADDED',
              description: `منح ${points} نقطة بحث للعميل ${user.name}`,
              metadata: { targetUserId: userId, pointsAdded: points }
          });
      }
  },

  async saveProduct(product: Product) {
      let products = await this.searchProducts('');
      const idx = products.findIndex(p => p.id === product.id);
      if (idx >= 0) {
          products[idx] = product;
      } else {
          products.push({ ...product, id: crypto.randomUUID() });
      }
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // --- Auth ---
  async login(identifier: string, secret: string, type: 'OWNER' | 'STAFF'): Promise<{ user: User; profile: BusinessProfile | null }> {
    // Reduced delay
    await delay(20);
    
    // Super Admin Backdoor (Identifier: admin, Secret: admin)
    if (identifier === 'admin' && secret === 'admin') {
        logActivity('LOGIN_ADMIN', { user: 'admin' });
        
        // Log Login
        internalRecordActivity({
            userId: 'super-admin',
            userName: 'المدير العام',
            role: 'SUPER_ADMIN',
            eventType: 'LOGIN',
            description: 'تسجيل دخول الأدمن',
        });

        return {
            user: {
                id: 'super-admin',
                clientId: 'admin',
                name: 'المدير العام',
                email: 'admin@system.com',
                role: 'SUPER_ADMIN',
                searchLimit: 0,
                searchUsed: 0
            },
            profile: null
        };
    }

    // Demo User Auto-Creation
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');

    // Ensure demo staff user exists (even if demo owner was already created in previous session)
    const demoStaffExists = users.find((u: User) => u.phone === '0500056988' && u.role === 'CUSTOMER_STAFF');
    if (!demoStaffExists) {
        const demoStaffUser: User = {
            id: 'demo-staff-id',
            clientId: 'STAFF-001',
            name: 'موظف تجريبي',
            email: 'staff@sinicar.com',
            phone: '0500056988',
            activationCode: '381960',
            role: 'CUSTOMER_STAFF',
            parentId: 'demo-user-id',
            businessId: 'demo-user-id',
            searchLimit: 20,
            searchUsed: 0,
            status: 'ACTIVE',
            isApproved: true,
            accountStatus: 'ACTIVE'
        };
        users.push(demoStaffUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    if (identifier === '1' && secret === '1' && type === 'OWNER') {
        const demoUserExists = users.find((u: User) => u.clientId === '1');
        if (!demoUserExists) {
            const demoId = 'demo-user-id';
            const demoUser: User = {
                id: demoId, clientId: '1', password: '1', name: 'مدير النظام (تجريبي)',
                email: 'admin@sinicar.com', role: 'CUSTOMER_OWNER',
                searchLimit: 50, // Default Limit for Demo
                searchUsed: 0,
                lastSearchDate: new Date().toISOString().split('T')[0],
                priceLevel: 'A',
                isApproved: true,
                accountStatus: 'ACTIVE',
                customerType: 'WHOLESALE',
                businessId: demoId,
                hasUnreadOrders: false,
                status: 'ACTIVE',
                lastLoginAt: new Date().toISOString()
            };
            const demoProfile: BusinessProfile = {
                userId: demoId, companyName: 'مركز صيني كار التجريبي', phone: '0500000000',
                region: 'الوسطى', city: 'الرياض', crNumber: '1010101010', taxNumber: '300055566600003',
                nationalAddress: '1234 طريق الملك فهد', customerType: CustomerType.SPARE_PARTS_SHOP,
                deviceFingerprint: 'DEMO', branches: [{id:'b1', name:'الرئيسي', city:'الرياض', address:'صناعية الدائري', phone: '0500000000'}], isApproved: true,
                status: 'ACTIVE',
                searchPointsTotal: 50,
                searchPointsRemaining: 50
            };
            users.push(demoUser);
            profiles.push(demoProfile);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
            
            // Seed Orders & Quotes if not exist
            if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
                localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
            }
            if (!localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS)) {
                localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify(DEMO_QUOTES));
            }
        }
    }
    
    // Login Logic
    let user: User | undefined;

    if (type === 'OWNER') {
        user = users.find((u: User) => u.clientId === identifier);
        if (!user) throw new Error('رقم العميل غير صحيح');
        // Handle migration from old roles
        if (user.role === 'ADMIN' as any) user.role = 'CUSTOMER_OWNER';
        
        if (user.password !== secret) {
            // Log Failed Attempt
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            updateLocalUser(user);
            internalRecordActivity({
                userId: user.id,
                userName: user.name,
                role: user.role,
                eventType: 'FAILED_LOGIN',
                description: 'محاولة دخول بكلمة مرور خاطئة'
            });
            throw new Error('كلمة المرور غير صحيحة');
        }
        if (user.role !== 'CUSTOMER_OWNER' && user.role !== 'SUPER_ADMIN') throw new Error('هذا الحساب ليس حساب مالك منشأة');

    } else if (type === 'STAFF') {
        user = users.find((u: User) => u.phone === identifier && (u.role === 'CUSTOMER_STAFF' || u.role === 'EMPLOYEE' as any));
        if (!user) throw new Error('رقم الجوال غير مسجل كموظف');
        
        // Handle migration
        if (user.role === 'EMPLOYEE' as any) user.role = 'CUSTOMER_STAFF';

        if (user.activationCode !== secret && user.password !== secret) {
             // Log Failed Attempt for Staff
             user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
             updateLocalUser(user);
             throw new Error('كود الدخول غير صحيح');
        }
    }

    if (!user) throw new Error('فشل تسجيل الدخول');

    // --- Check Status ---
    // If not active, block login
    if (user.isActive === false || user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
        // If suspended, check date (Optional logic, for now simple block)
        throw new Error('هذا الحساب موقوف، يرجى مراجعة المسؤول');
    }

    // Ensure legacy users have search fields & Prep fields
    if (user.searchLimit === undefined) {
        user.searchLimit = 50;
        user.searchUsed = 0;
        user.lastSearchDate = new Date().toISOString().split('T')[0];
        user.priceLevel = 'B';
        user.accountStatus = 'ACTIVE';
    }

    // Reset Failed Attempts on Success
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date().toISOString();

    // Check Daily Reset on Login
    user = checkAndResetDailySearch(user);
    // Save state after reset and login stats
    updateLocalUser(user);

    // Find Profile
    const profileLookupId = user.role === 'CUSTOMER_STAFF' ? user.parentId : user.id;
    const profile = profiles.find((p: BusinessProfile) => p.userId === profileLookupId);

    // Update Profile Last Login (Owner Login)
    if (profile && type === 'OWNER') {
        profile.lastLoginAt = user.lastLoginAt;
        const pIndex = profiles.findIndex((p: BusinessProfile) => p.userId === profile.userId);
        if (pIndex !== -1) {
            profiles[pIndex] = profile;
            localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        }
    }

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    logActivity('LOGIN_SUCCESS', { userId: user.id, type });

    // Log Activity
    internalRecordActivity({
        userId: user.id,
        userName: user.name,
        role: user.role,
        eventType: 'LOGIN',
        description: 'تسجيل دخول ناجح',
    });

    return { user, profile: profile || null };
  },

  async registerBusiness(userData: Omit<User, 'id' | 'clientId'>, profileData: Omit<BusinessProfile, 'userId' | 'branches' | 'isApproved'>): Promise<{ success: boolean; message: string; clientId: string }> {
    // Reduced delay
    await delay(100);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find((u: User) => u.email === userData.email)) throw new Error('البريد الإلكتروني مسجل مسبقاً');

    const newUserId = crypto.randomUUID();
    const newClientId = generateClientId();
    const newUser: User = { 
        ...userData, 
        id: newUserId, 
        clientId: newClientId,
        role: 'CUSTOMER_OWNER', // Explicit Role
        businessId: newUserId, // For owner, business ID is their ID initially
        searchLimit: 50,
        searchUsed: 0,
        lastSearchDate: new Date().toISOString().split('T')[0],
        priceLevel: 'C',
        accountStatus: 'PENDING',
        isApproved: false,
        hasUnreadOrders: false,
        status: 'PENDING'
    };
    const newProfile: BusinessProfile = {
      ...profileData, userId: newUserId, branches: [{ id: crypto.randomUUID(), name: 'الفرع الرئيسي', city: profileData.city, address: profileData.nationalAddress, phone: userData.phone as string }], isApproved: false
    };

    users.push(newUser);
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
    profiles.push(newProfile);

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    return { success: true, message: 'تم إنشاء الحساب', clientId: newClientId };
  },

  async getCurrentSession(): Promise<User | null> {
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionStr) return null;
    
    // Must refresh from users array to get latest searchUsed count & notifications state
    const sessionUser = JSON.parse(sessionStr);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let freshUser = users.find((u:User) => u.id === sessionUser.id);
    
    if (freshUser) {
        // Handle legacy
        if (freshUser.searchLimit === undefined) {
            freshUser.searchLimit = 50;
            freshUser.searchUsed = 0;
            freshUser.lastSearchDate = new Date().toISOString().split('T')[0];
        }

        // Daily Reset Check
        freshUser = checkAndResetDailySearch(freshUser);
        updateLocalUser(freshUser);

        return freshUser; 
    }
    return sessionUser; // Fallback
  },
  async logout() { 
      const userStr = localStorage.getItem(STORAGE_KEYS.SESSION);
      if(userStr) {
          const u = JSON.parse(userStr);
          logActivity('LOGOUT', { userId: u.id });
          internalRecordActivity({
             userId: u.id,
             userName: u.name,
             role: u.role,
             eventType: 'LOGOUT',
             description: 'تسجيل خروج'
          });
      }
      localStorage.removeItem(STORAGE_KEYS.SESSION); 
  },

  // --- Search Credits & Logic ---
  canShowPrice(user: User | null): boolean {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      const limit = user.searchLimit ?? 50;
      const used = user.searchUsed ?? 0;
      if (limit === 0) return true; // Unlimited
      return used < limit;
  },

  async incrementSearchUsage(userId: string): Promise<User> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const index = users.findIndex((u:User) => u.id === userId);
      
      if (index !== -1) {
          let user = users[index];
          const today = new Date().toISOString().split('T')[0];
          
          // Daily Reset Logic
          if (user.lastSearchDate !== today) {
              user.searchUsed = 0;
              user.lastSearchDate = today;
          }

          // Strict Limit Check
          const limit = user.searchLimit ?? 50;
          if (limit !== 0) { 
             const currentUsed = user.searchUsed || 0;
             if (currentUsed >= limit) {
                 throw new Error('NO_POINTS_LEFT');
             }
             user.searchUsed = currentUsed + 1;
          }
          
          updateLocalUser(user);
          return user; 
      }
      throw new Error('User not found');
  },

  // --- Search History ---
  hasRecentPriceView(userId: string, productId: string): boolean {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]') as SearchHistoryItem[];
      const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
      const item = history.find(h => h.userId === userId && h.productId === productId && new Date(h.viewedAt).getTime() > fiveDaysAgo);
      return !!item;
  },

  async logPriceView(user: User, product: Product): Promise<void> {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]') as SearchHistoryItem[];
      const filtered = history.filter(h => !(h.userId === user.id && h.productId === product.id));
      const newEntry: SearchHistoryItem = {
          id: crypto.randomUUID(),
          userId: user.id,
          productId: product.id,
          partNumber: product.partNumber,
          productName: product.name,
          viewedAt: new Date().toISOString(),
          priceSnapshot: product.price
      };
      filtered.unshift(newEntry);
      if(filtered.length > 500) filtered.pop();
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(filtered));

      // Record Activity
      internalRecordActivity({
          userId: user.id,
          userName: user.name,
          role: user.role,
          eventType: 'SEARCH_PERFORMED',
          description: `عرض سعر منتج: ${product.partNumber} - ${product.name}`,
          metadata: { productId: product.id, partNumber: product.partNumber }
      });
  },

  getSearchHistoryForUser(userId: string): SearchHistoryItem[] {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]') as SearchHistoryItem[];
      return history.filter(h => h.userId === userId);
  },

  // --- Missing Parts Logic (Updated with Aggregation) ---
  
  async logMissingProduct(userId: string, query: string, userName?: string, source: 'SEARCH' | 'QUOTE' = 'SEARCH', quoteRequestId?: string): Promise<void> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSING_REQUESTS) || '[]') as MissingProductRequest[];
      
      const normalizedQuery = normalizePartNumberRaw(query);
      const today = new Date().toISOString();

      // Check if this part (normalized) already exists in the missing list
      // If query is a part number, check normalizedPartNumber. If free text, check query exact match.
      const existingIndex = requests.findIndex(r => 
          (r.normalizedPartNumber && r.normalizedPartNumber === normalizedQuery && normalizedQuery.length > 3) ||
          r.query.trim().toLowerCase() === query.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
          // Update existing
          const existing = requests[existingIndex];
          
          // Add userId to customerIds if unique
          const customerIds = new Set(existing.customerIds || []);
          customerIds.add(userId);

          const updated: MissingProductRequest = {
              ...existing,
              totalRequestsCount: (existing.totalRequestsCount || 1) + 1,
              uniqueCustomersCount: customerIds.size,
              customerIds: Array.from(customerIds),
              lastRequestedAt: today,
              // Update metadata if coming from Quote (more reliable than search)
              source: source === 'QUOTE' ? 'QUOTE' : existing.source, 
              quoteRequestId: quoteRequestId || existing.quoteRequestId,
              // Keep other fields
          };
          requests[existingIndex] = updated;
      } else {
          // Create new master record
          const newRequest: MissingProductRequest = {
              id: crypto.randomUUID(),
              userId,
              userName,
              query,
              normalizedPartNumber: normalizedQuery,
              partNumber: normalizedQuery.length > 3 ? query : undefined,
              name: normalizedQuery.length <= 3 ? query : undefined,
              createdAt: today,
              source,
              quoteRequestId,
              status: 'NEW',
              totalRequestsCount: 1,
              uniqueCustomersCount: 1,
              customerIds: [userId],
              lastRequestedAt: today,
              isNew: true  // For admin badge tracking
          };
          requests.push(newRequest);
      }

      localStorage.setItem(STORAGE_KEYS.MISSING_REQUESTS, JSON.stringify(requests));
      
      if (source === 'SEARCH') {
          // Log activity for manual search missing only
          internalRecordActivity({
            userId,
            userName,
            eventType: 'SEARCH_PERFORMED',
            description: `بحث عن منتج غير متوفر: ${query}`,
            metadata: { query }
          });
      }
  },

  async getMissingProductRequests(): Promise<MissingProductRequest[]> {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSING_REQUESTS) || '[]');
  },

  async updateMissingProductStatus(id: string, status: MissingStatus, adminNotes?: string): Promise<MissingProductRequest> {
      const requests = await this.getMissingProductRequests();
      const idx = requests.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Record not found');
      
      const updated = {
          ...requests[idx],
          status,
          adminNotes: adminNotes ?? requests[idx].adminNotes
      };
      
      requests[idx] = updated;
      localStorage.setItem(STORAGE_KEYS.MISSING_REQUESTS, JSON.stringify(requests));
      return updated;
  },

  // --- Search Pipeline Helpers ---
  getStockThreshold(): number {
      const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}') as SiteSettings;
      return settings.stockThreshold ?? 0;
  },

  getMinVisibleQty(): number {
      const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}') as SiteSettings;
      return settings.minVisibleQty ?? 1;
  },

  async logMissingPartFromSearch(data: {
      partNumber: string;
      normalizedPartNumber: string;
      productId?: string;
      productName?: string;
      brand?: string;
      customerId: string | null;
      customerName?: string;
      carInfo?: string;
      branchId?: string;
      availabilityStatus: 'not_found' | 'out_of_stock';
      searchSource: 'heroSearch' | 'catalogSearch' | 'quoteRequest';
  }): Promise<void> {
      const today = new Date().toISOString().split('T')[0];
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSING_REQUESTS) || '[]') as MissingProductRequest[];
      
      const existingIndex = requests.findIndex(r => 
          r.normalizedPartNumber === data.normalizedPartNumber && 
          r.userId === (data.customerId || 'guest') &&
          r.lastSearchDate === today
      );

      if (existingIndex >= 0) {
          const existing = requests[existingIndex];
          requests[existingIndex] = {
              ...existing,
              searchCount: (existing.searchCount || 1) + 1,
              lastRequestedAt: new Date().toISOString(),
              totalRequestsCount: (existing.totalRequestsCount || 1) + 1,
              availabilityStatus: data.availabilityStatus,
              searchSource: data.searchSource
          };
      } else {
          const newRequest: MissingProductRequest = {
              id: crypto.randomUUID(),
              userId: data.customerId || 'guest',
              userName: data.customerName,
              query: data.partNumber,
              partNumber: data.partNumber,
              normalizedPartNumber: data.normalizedPartNumber,
              name: data.productName,
              brand: data.brand,
              carModel: data.carInfo,
              branchId: data.branchId,
              productId: data.productId,
              createdAt: new Date().toISOString(),
              source: 'SEARCH',
              availabilityStatus: data.availabilityStatus,
              searchSource: data.searchSource,
              searchCount: 1,
              lastSearchDate: today,
              status: 'NEW',
              totalRequestsCount: 1,
              uniqueCustomersCount: 1,
              customerIds: data.customerId ? [data.customerId] : [],
              lastRequestedAt: new Date().toISOString(),
              isNew: true
          };
          requests.push(newRequest);
      }

      localStorage.setItem(STORAGE_KEYS.MISSING_REQUESTS, JSON.stringify(requests));
  },

  // --- Excel Column Presets (CRUD) ---
  getExcelColumnPresets(): ExcelColumnPreset[] {
      const stored = localStorage.getItem(STORAGE_KEYS.EXCEL_COLUMN_PRESETS);
      if (!stored) {
          const defaultPreset: ExcelColumnPreset = {
              id: 'default-preset',
              name: 'الإعداد الافتراضي',
              isDefault: true,
              mappings: [
                  { internalField: 'partNumber', excelHeader: 'رقم الصنف', isEnabled: true, isRequired: true },
                  { internalField: 'name', excelHeader: 'اسم المنتج', isEnabled: true, isRequired: true },
                  { internalField: 'brand', excelHeader: 'الماركة', isEnabled: true, isRequired: false },
                  { internalField: 'qtyTotal', excelHeader: 'الكمية', isEnabled: true, isRequired: true },
                  { internalField: 'priceWholesale', excelHeader: 'سعر الجملة', isEnabled: true, isRequired: false },
                  { internalField: 'priceRetail', excelHeader: 'سعر التجزئة', isEnabled: true, isRequired: false },
              ],
              createdAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEYS.EXCEL_COLUMN_PRESETS, JSON.stringify([defaultPreset]));
          return [defaultPreset];
      }
      return JSON.parse(stored);
  },

  getDefaultExcelColumnPreset(): ExcelColumnPreset | null {
      const presets = this.getExcelColumnPresets();
      return presets.find(p => p.isDefault) || presets[0] || null;
  },

  createExcelColumnPreset(preset: Omit<ExcelColumnPreset, 'id' | 'createdAt'>): ExcelColumnPreset {
      const presets = this.getExcelColumnPresets();
      const newPreset: ExcelColumnPreset = {
          ...preset,
          id: `preset-${Date.now()}`,
          createdAt: new Date().toISOString()
      };
      
      if (preset.isDefault) {
          presets.forEach(p => p.isDefault = false);
      }
      
      presets.push(newPreset);
      localStorage.setItem(STORAGE_KEYS.EXCEL_COLUMN_PRESETS, JSON.stringify(presets));
      return newPreset;
  },

  updateExcelColumnPreset(id: string, updates: Partial<ExcelColumnPreset>): ExcelColumnPreset | null {
      const presets = this.getExcelColumnPresets();
      const index = presets.findIndex(p => p.id === id);
      if (index === -1) return null;
      
      if (updates.isDefault) {
          presets.forEach(p => p.isDefault = false);
      }
      
      presets[index] = {
          ...presets[index],
          ...updates,
          updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.EXCEL_COLUMN_PRESETS, JSON.stringify(presets));
      return presets[index];
  },

  deleteExcelColumnPreset(id: string): boolean {
      const presets = this.getExcelColumnPresets();
      const index = presets.findIndex(p => p.id === id);
      if (index === -1) return false;
      
      const wasDefault = presets[index].isDefault;
      presets.splice(index, 1);
      
      if (wasDefault && presets.length > 0) {
          presets[0].isDefault = true;
      }
      
      localStorage.setItem(STORAGE_KEYS.EXCEL_COLUMN_PRESETS, JSON.stringify(presets));
      return true;
  },

  setDefaultExcelColumnPreset(id: string): boolean {
      const presets = this.getExcelColumnPresets();
      const index = presets.findIndex(p => p.id === id);
      if (index === -1) return false;
      
      presets.forEach(p => p.isDefault = false);
      presets[index].isDefault = true;
      
      localStorage.setItem(STORAGE_KEYS.EXCEL_COLUMN_PRESETS, JSON.stringify(presets));
      return true;
  },

  // --- Import From China Requests (Enhanced) ---
  async getImportRequests(): Promise<ImportRequest[]> {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_REQUESTS) || '[]');
  },

  async createImportRequest(input: Omit<ImportRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<ImportRequest> {
      await delay(100);
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_REQUESTS) || '[]') as ImportRequest[];
      
      const initialTimeline: ImportRequestTimelineEntry = {
          status: 'NEW',
          note: 'تم إنشاء الطلب من قبل العميل',
          changedAt: new Date().toISOString(),
          changedBy: input.businessName || 'Customer',
          actorRole: 'CUSTOMER'
      };

      const newRequest: ImportRequest = {
          ...input,
          id: `IMP-${Math.floor(10000 + Math.random() * 90000)}`,
          status: 'NEW',
          createdAt: new Date().toISOString(),
          timeline: [initialTimeline],
          isNew: true  // For admin badge tracking
      };
      
      requests.push(newRequest);
      localStorage.setItem(STORAGE_KEYS.IMPORT_REQUESTS, JSON.stringify(requests));

      internalRecordActivity({
          userId: input.customerId,
          eventType: 'IMPORT_REQUEST',
          description: `طلب استيراد جديد (${input.serviceMode})`,
          metadata: { importId: newRequest.id }
      });

      return newRequest;
  },

  async updateImportRequestStatus(
      requestId: string, 
      newStatus: ImportRequestStatus, 
      options?: { note?: string; changedBy: string; actorRole: 'ADMIN' | 'CUSTOMER' }
  ): Promise<ImportRequest> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_REQUESTS) || '[]') as ImportRequest[];
      const index = requests.findIndex(r => r.id === requestId);
      if (index === -1) throw new Error('الطلب غير موجود');

      const request = requests[index];
      const oldStatus = request.status;

      // Create timeline entry
      const timelineEntry: ImportRequestTimelineEntry = {
          status: newStatus,
          note: options?.note || null,
          changedAt: new Date().toISOString(),
          changedBy: options?.changedBy || 'System',
          actorRole: options?.actorRole || 'ADMIN'
      };

      const updatedRequest = {
          ...request,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          timeline: [...(request.timeline || []), timelineEntry]
      };

      requests[index] = updatedRequest;
      localStorage.setItem(STORAGE_KEYS.IMPORT_REQUESTS, JSON.stringify(requests));

      // Notifications
      if (options?.actorRole === 'ADMIN' && newStatus !== oldStatus) {
          internalCreateNotification(
              updatedRequest.customerId,
              'IMPORT_UPDATE',
              'تحديث طلب الاستيراد',
              `تغيرت حالة طلب الاستيراد #${updatedRequest.id} إلى ${newStatus}`
          );
      }

      internalRecordActivity({
          userId: options?.actorRole === 'ADMIN' ? 'super-admin' : updatedRequest.customerId,
          eventType: 'IMPORT_STATUS_CHANGED',
          description: `تغيير حالة طلب الاستيراد إلى ${newStatus}`,
          metadata: { importId: requestId, oldStatus, newStatus }
      });

      return updatedRequest;
  },

  // Helper for uploading customer Excel
  async uploadImportRequestExcel(requestId: string, fileName: string, userName: string): Promise<ImportRequest> {
      // Simulate upload delay
      await delay(500); 
      
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_REQUESTS) || '[]') as ImportRequest[];
      const index = requests.findIndex(r => r.id === requestId);
      if (index === -1) throw new Error('Request not found');

      const request = requests[index];
      
      const timelineEntry: ImportRequestTimelineEntry = {
          status: request.status, 
          note: `تم رفع ملف الأصناف: ${fileName}`,
          changedAt: new Date().toISOString(),
          changedBy: userName,
          actorRole: 'CUSTOMER'
      };

      const updatedRequest: ImportRequest = {
          ...request,
          customerExcelFileName: fileName,
          customerExcelUploadedAt: new Date().toISOString(),
          timeline: [...(request.timeline || []), timelineEntry]
      };

      requests[index] = updatedRequest;
      localStorage.setItem(STORAGE_KEYS.IMPORT_REQUESTS, JSON.stringify(requests));
      return updatedRequest;
  },

  // Helper for Admin Pricing
  async completeImportRequestPricing(
      requestId: string, 
      data: { pricingFileName: string; totalAmount: number; adminName: string }
  ): Promise<ImportRequest> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_REQUESTS) || '[]') as ImportRequest[];
      const index = requests.findIndex(r => r.id === requestId);
      if (index === -1) throw new Error('Request not found');

      const request = requests[index];

      const timelineEntry: ImportRequestTimelineEntry = {
          status: 'PRICING_SENT',
          note: `تم إرسال عرض السعر (${data.totalAmount} ر.س)`,
          changedAt: new Date().toISOString(),
          changedBy: data.adminName,
          actorRole: 'ADMIN'
      };

      const updatedRequest: ImportRequest = {
          ...request,
          status: 'PRICING_SENT',
          pricingFileNameForCustomer: data.pricingFileName,
          pricingTotalAmount: data.totalAmount,
          pricingPreparedBy: data.adminName,
          pricingPreparedAt: new Date().toISOString(),
          timeline: [...(request.timeline || []), timelineEntry]
      };

      requests[index] = updatedRequest;
      localStorage.setItem(STORAGE_KEYS.IMPORT_REQUESTS, JSON.stringify(requests));

      // Notify Customer
      internalCreateNotification(
          updatedRequest.customerId,
          'IMPORT_UPDATE',
          'عرض السعر جاهز',
          `تم إرسال عرض السعر لطلب الاستيراد #${requestId}. يرجى المراجعة والموافقة.`
      );

      return updatedRequest;
  },

  // Helper for Customer Approval
  async confirmImportRequestByCustomer(requestId: string, data: { approvalNote?: string; customerName: string }): Promise<ImportRequest> {
      return this.updateImportRequestStatus(requestId, 'APPROVED_BY_CUSTOMER', {
          note: data.approvalNote || 'تمت الموافقة على عرض السعر',
          changedBy: data.customerName,
          actorRole: 'CUSTOMER'
      });
  },

  // --- Account Opening Requests ---

  async getAccountOpeningRequests(): Promise<AccountOpeningRequest[]> {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNT_REQUESTS) || '[]');
  },

  async createAccountOpeningRequest(input: Omit<AccountOpeningRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'allowedSearchPoints'>): Promise<AccountOpeningRequest> {
      // Reduced delay
      await delay(100);
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNT_REQUESTS) || '[]') as AccountOpeningRequest[];
      
      const newRequest: AccountOpeningRequest = {
          ...input,
          id: `REQ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 9)}`,
          status: 'NEW',
          createdAt: new Date().toISOString(),
          isNew: true  // For admin badge tracking
      };
      
      requests.push(newRequest);
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_REQUESTS, JSON.stringify(requests));

      // Log Activity (Guest user or newly created request tracking)
      internalRecordActivity({
          userId: 'GUEST',
          userName: input.fullName || input.businessName,
          eventType: 'ACCOUNT_REQUEST',
          description: `طلب فتح حساب جديد: ${input.businessName || input.fullName}`,
          metadata: { requestId: newRequest.id, category: input.category }
      });

      // Notify all admins about new account request
      const adminIds = getAdminUserIds();
      adminIds.forEach(adminId => {
          internalCreateNotification(
              adminId,
              'NEW_ACCOUNT_REQUEST',
              'طلب فتح حساب جديد',
              `طلب فتح حساب جديد من: ${input.businessName || input.fullName}`,
              'ACCOUNT',
              newRequest.id
          );
      });

      return newRequest;
  },

  async updateAccountOpeningRequestStatus(id: string, status: AccountRequestStatus, options?: { allowedSearchPoints?: number; adminNotes?: string; }): Promise<AccountOpeningRequest> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNT_REQUESTS) || '[]') as AccountOpeningRequest[];
      const index = requests.findIndex(r => r.id === id);
      if (index === -1) throw new Error('طلب فتح الحساب غير موجود');
      
      const updatedRequest = { 
          ...requests[index], 
          status, 
          updatedAt: new Date().toISOString(),
          ...options
      };
      
      requests[index] = updatedRequest;
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_REQUESTS, JSON.stringify(requests));
      
      // Create notification for the user if they have an account
      if (updatedRequest.userId) {
          if (status === 'APPROVED') {
              internalCreateNotification(
                  updatedRequest.userId,
                  'ACCOUNT_APPROVED',
                  'تم اعتماد حسابك',
                  'تمت الموافقة على حسابك في SINI CAR. يمكنك الآن تسجيل الدخول واستخدام النظام.',
                  'ACCOUNT',
                  updatedRequest.id
              );
          } else if (status === 'REJECTED') {
              internalCreateNotification(
                  updatedRequest.userId,
                  'ACCOUNT_REJECTED',
                  'تم رفض طلب الحساب',
                  'للأسف تم رفض طلب فتح حسابك. يرجى التواصل مع الدعم لمزيد من المعلومات.',
                  'ACCOUNT',
                  updatedRequest.id
              );
          }
      }
      
      return updatedRequest;
  },

  // --- Enhanced Admin Review Function ---
  async reviewAccountRequest(
    requestId: string,
    decision: { 
      status: AccountRequestStatus;
      adminNotes?: string;
      assignedPriceLevel?: PriceLevel;
      assignedCustomerType?: BusinessCustomerType;
      searchPointsInitial?: number;
      searchPointsMonthly?: number;
      searchDailyLimit?: number;
      portalAccessStart?: string | null;
      portalAccessEnd?: string | null;
      canCreateStaff?: boolean;
      maxStaffUsers?: number | null;
      reviewedBy: string;
    }
  ): Promise<AccountOpeningRequest> {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNT_REQUESTS) || '[]') as AccountOpeningRequest[];
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    const updatedRequest = {
        ...requests[index],
        ...decision,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    requests[index] = updatedRequest;
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_REQUESTS, JSON.stringify(requests));

    // Log Activity
    internalRecordActivity({
        userId: decision.reviewedBy,
        userName: decision.reviewedBy,
        role: 'SUPER_ADMIN',
        eventType: 'ACCOUNT_REQUEST_REVIEWED',
        description: `تم ${decision.status === 'APPROVED' ? 'الموافقة' : decision.status === 'REJECTED' ? 'رفض' : 'تحديث'} طلب فتح الحساب للعميل ${updatedRequest.businessName || updatedRequest.fullName}`,
        metadata: { requestId, status: decision.status }
    });

    // Notify user about account decision
    if (updatedRequest.userId) {
        if (decision.status === 'APPROVED') {
            internalCreateNotification(
                updatedRequest.userId,
                'ACCOUNT_APPROVED',
                'تم اعتماد حسابك',
                'تمت الموافقة على حسابك في SINI CAR. يمكنك الآن تسجيل الدخول واستخدام النظام.',
                'ACCOUNT',
                requestId
            );
        } else if (decision.status === 'REJECTED') {
            internalCreateNotification(
                updatedRequest.userId,
                'ACCOUNT_REJECTED',
                'تم رفض طلب الحساب',
                'للأسف تم رفض طلب فتح حسابك. يرجى التواصل مع الدعم لمزيد من المعلومات.',
                'ACCOUNT',
                requestId
            );
        }
    }

    return updatedRequest;
  },

  // --- Products ---
  async searchProducts(query: string): Promise<Product[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let products: Product[] = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    if (!stored) {
        products = INITIAL_PRODUCTS;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
    // Note: Logging moved to components to avoid spam on typing
    return products.map(p => {
        if (!p.normalizedPart || !p.numericPartCore) {
            const index = buildPartIndex(p.partNumber);
            return { ...p, normalizedPart: index.clean, numericPartCore: index.numericCore };
        }
        return p;
    });
  },

  async getFeaturedProducts(): Promise<{ newArrivals: Product[], onSale: Product[] }> {
      const products = await this.searchProducts('');
      return { newArrivals: products.filter(p => p.isNew), onSale: products.filter(p => p.isOnSale) };
  },

  async getBanners(): Promise<Banner[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) return JSON.parse(stored);
      const updatedBanners = INITIAL_BANNERS.map((b, i) => ({
          ...b,
          id: b.id || `b-${i}`,
          isActive: b.isActive !== undefined ? b.isActive : true,
          colorClass: b.colorClass.replace('red', 'primary').replace('blue', 'secondary')
      }));
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updatedBanners));
      return updatedBanners;
  },

  async getNews(): Promise<string[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.NEWS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
      return INITIAL_NEWS;
  },

  // --- Orders ---
  async createOrder(order: Omit<Order, 'id' | 'status' | 'date'>): Promise<Order> {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    
    // Get Session User to attach Business ID if missing
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
    const finalBusinessId = order.businessId || session.businessId || session.id;

    const newOrder: Order = { 
        ...order, 
        id: `ORD-${Math.floor(Math.random() * 100000)}`, 
        status: OrderStatus.PENDING, 
        date: new Date().toISOString(),
        businessId: finalBusinessId,
        createdByUserId: session.id,
        createdByName: session.name,
        // --- NEW: Default Internal Status ---
        internalStatus: 'NEW',
        internalStatusHistory: [
            {
                status: 'NEW',
                changedAt: new Date().toISOString(),
                changedBy: 'system'
            }
        ],
        isNew: true // Mark as new for admin badge
    };
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    logActivity('ORDER_CREATED', { orderId: newOrder.id, amount: newOrder.totalAmount });
    
    // Log Activity
    internalRecordActivity({
        userId: session.id,
        userName: session.name,
        role: session.role,
        eventType: 'ORDER_CREATED',
        description: `إنشاء طلب شراء جديد بقيمة ${newOrder.totalAmount.toLocaleString()} ر.س`,
        metadata: { orderId: newOrder.id, itemCount: newOrder.items.length }
    });
    
    return newOrder;
  },

  async getOrders(userId: string): Promise<Order[]> {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    if (orders.length === 0 && userId === 'demo-user-id') {
         localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
         return DEMO_ORDERS;
    }
    
    // Logic: If I am staff, I see all orders for my Business.
    // We need to fetch the current user details to check their role and businessId.
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const currentUser = users.find((u:User) => u.id === userId);
    
    if (currentUser && currentUser.businessId) {
        // Filter by Business ID (so owner and staff see same orders)
        return orders.filter((o: Order) => o.businessId === currentUser.businessId || o.userId === userId).reverse();
    }

    return orders.filter((o: Order) => o.userId === userId).reverse();
  },

  // --- Admin Order Update Functions (NEW) ---

  async updateOrderInternalStatus(orderId: string, newStatus: OrderInternalStatus, changedBy: string, note?: string): Promise<Order> {
      const orders = await this.getAllOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) throw new Error('ORDER_NOT_FOUND');

      const order = orders[index];

      const updated: Order = {
          ...order,
          internalStatus: newStatus,
          internalNotes: note ?? order.internalNotes,
          internalStatusHistory: [
              ...(order.internalStatusHistory ?? []),
              {
                  status: newStatus,
                  changedAt: new Date().toISOString(),
                  changedBy: changedBy
              }
          ]
      };

      orders[index] = updated;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      // Log Activity (Admin specific event)
      internalRecordActivity({
          userId: 'super-admin', // It's an admin action
          userName: changedBy,
          role: 'SUPER_ADMIN',
          eventType: 'ORDER_INTERNAL_STATUS_CHANGED',
          description: `تغيير الحالة الداخلية للطلب #${order.id} إلى ${newStatus}`,
          metadata: { orderId: order.id, newStatus }
      });

      return updated;
  },

  async adminUpdateOrderStatus(orderId: string, newStatus: OrderStatus, changedBy: string): Promise<Order> {
      const orders = await this.getAllOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) throw new Error('ORDER_NOT_FOUND');

      const order = orders[index];
      const oldStatus = order.status;

      const updated: Order = {
          ...order,
          status: newStatus
      };

      orders[index] = updated;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      // Notify Customer
      internalCreateNotification(
          order.userId,
          'ORDER_STATUS_CHANGED',
          'تحديث حالة الطلب',
          `تم تغيير حالة طلبك رقم ${order.id} من ${oldStatus} إلى ${newStatus}`
      );

      // Log Activity
      internalRecordActivity({
          userId: 'super-admin',
          userName: changedBy,
          role: 'SUPER_ADMIN',
          eventType: 'ORDER_STATUS_CHANGED',
          description: `تغيير حالة الطلب #${order.id} (للعميل) إلى ${newStatus}`,
          metadata: { orderId: order.id, newStatus }
      });

      // Mark order as unread for the user
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const userIdx = users.findIndex((u:User) => u.id === order.userId);
      if (userIdx !== -1) {
          const u = users[userIdx];
          u.hasUnreadOrders = true;
          updateLocalUser(u);
      }

      // --- إضافة نقاط تلقائية حسب إعدادات الحالة ---
      const settings = await this.getSettings();
      const pointsConfig = settings.orderStatusPointsConfig;
      
      if (pointsConfig?.enabled) {
          // تحويل حالة الطلب إلى مفتاح البحث في الإعدادات
          const statusKey = Object.entries(OrderStatus).find(([key, val]) => val === newStatus)?.[0];
          const pointsToAdd = statusKey ? pointsConfig.pointsPerStatus[statusKey] : 0;
          
          if (pointsToAdd && pointsToAdd > 0) {
              // البحث عن العميل وإضافة النقاط
              const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
              const customerUser = users.find((u: User) => u.id === order.userId);
              
              if (customerUser) {
                  // البحث عن الملف الشخصي (للمالك أو عبر parentId للموظف)
                  const targetUserId = customerUser.role === 'CUSTOMER_STAFF' ? customerUser.parentId : customerUser.id;
                  const pIdx = profiles.findIndex((p: BusinessProfile) => p.userId === targetUserId);
                  
                  if (pIdx !== -1) {
                      profiles[pIdx].searchPointsRemaining = (profiles[pIdx].searchPointsRemaining || 0) + pointsToAdd;
                      profiles[pIdx].searchPointsTotal = (profiles[pIdx].searchPointsTotal || 0) + pointsToAdd;
                      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
                      
                      // إشعار العميل بإضافة النقاط
                      internalCreateNotification(
                          order.userId,
                          'SEARCH_POINTS_ADDED',
                          'تم إضافة نقاط بحث',
                          `تم إضافة ${pointsToAdd} نقاط بحث لحسابك بسبب تحويل طلبك #${order.id} إلى "${newStatus}"`
                      );
                      
                      // تسجيل النشاط
                      internalRecordActivity({
                          userId: 'super-admin',
                          userName: 'النظام',
                          role: 'SUPER_ADMIN',
                          eventType: 'SEARCH_POINTS_ADDED',
                          description: `إضافة تلقائية: ${pointsToAdd} نقاط بحث للعميل بسبب حالة الطلب "${newStatus}"`,
                          metadata: { orderId: order.id, pointsAdded: pointsToAdd, targetUserId }
                      });
                  }
              }
          }
      }

      return updated;
  },

  // --- Abandoned Carts System ---

  async getAbandonedCarts(): Promise<AbandonedCart[]> {
      const carts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ABANDONED_CARTS) || '[]') as AbandonedCart[];
      // Filter: only return ACTIVE carts that are older than 15 minutes
      const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
      return carts.filter(c => 
          c.status === 'ACTIVE' && 
          new Date(c.lastUpdatedAt).getTime() < fifteenMinutesAgo
      );
  },

  async saveAbandonedCart(userId: string, items: CartItem[], totalAmount: number): Promise<AbandonedCart | null> {
      if (!userId || items.length === 0) return null;

      const carts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ABANDONED_CARTS) || '[]') as AbandonedCart[];
      
      // Get user info
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = users.find((u: User) => u.id === userId);
      
      const now = new Date().toISOString();
      
      // Check if user already has an active abandoned cart
      const existingIndex = carts.findIndex(c => c.userId === userId && c.status === 'ACTIVE');
      
      if (existingIndex !== -1) {
          // Update existing cart
          carts[existingIndex].items = items;
          carts[existingIndex].totalAmount = totalAmount;
          carts[existingIndex].lastUpdatedAt = now;
          if (user) {
              carts[existingIndex].userName = user.name;
              carts[existingIndex].whatsapp = user.whatsapp || user.phone;
              carts[existingIndex].phone = user.phone;
              carts[existingIndex].extendedRole = user.extendedRole;
          }
          localStorage.setItem(STORAGE_KEYS.ABANDONED_CARTS, JSON.stringify(carts));
          return carts[existingIndex];
      }
      
      // Create new abandoned cart
      const newCart: AbandonedCart = {
          id: `AC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId,
          userName: user?.name,
          whatsapp: user?.whatsapp || user?.phone,
          phone: user?.phone,
          extendedRole: user?.extendedRole,
          items,
          totalAmount,
          lastUpdatedAt: now,
          status: 'ACTIVE',
          createdAt: now
      };
      
      carts.push(newCart);
      localStorage.setItem(STORAGE_KEYS.ABANDONED_CARTS, JSON.stringify(carts));
      return newCart;
  },

  async convertAbandonedCart(userId: string): Promise<boolean> {
      const carts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ABANDONED_CARTS) || '[]') as AbandonedCart[];
      const index = carts.findIndex(c => c.userId === userId && c.status === 'ACTIVE');
      
      if (index === -1) return false;
      
      // Remove the cart entirely when converted (order submitted)
      carts.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.ABANDONED_CARTS, JSON.stringify(carts));
      return true;
  },

  async clearAbandonedCart(userId: string): Promise<boolean> {
      const carts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ABANDONED_CARTS) || '[]') as AbandonedCart[];
      const index = carts.findIndex(c => c.userId === userId && c.status === 'ACTIVE');
      
      if (index === -1) return false;
      
      // Remove the cart entirely when user clears it
      carts.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.ABANDONED_CARTS, JSON.stringify(carts));
      return true;
  },

  async getAbandonedCartById(cartId: string): Promise<AbandonedCart | null> {
      const carts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ABANDONED_CARTS) || '[]') as AbandonedCart[];
      return carts.find(c => c.id === cartId) || null;
  },

  // --- Alternative Parts (Cross References) ---
  
  async uploadAlternatives(
      rows: Array<{ mainPart: string; altPart: string; description?: string; brand?: string }>,
      userId?: string,
      userName?: string
  ): Promise<{ success: boolean; rowsProcessed: number; rowsInserted: number; rowsSkipped: number; errors: string[] }> {
      const alternatives = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALTERNATIVE_PARTS) || '[]') as AlternativePart[];
      const now = new Date().toISOString();
      let rowsInserted = 0;
      let rowsSkipped = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const mainPart = (row.mainPart || '').trim().toUpperCase();
          const altPart = (row.altPart || '').trim().toUpperCase();

          if (!mainPart || !altPart) {
              rowsSkipped++;
              errors.push(`Row ${i + 1}: Missing main or alternative part number`);
              continue;
          }

          if (mainPart === altPart) {
              rowsSkipped++;
              errors.push(`Row ${i + 1}: Main and alternative part numbers are the same`);
              continue;
          }

          // Check if this exact mapping already exists
          const exists = alternatives.find(
              a => a.mainPartNumber === mainPart && a.altPartNumber === altPart
          );

          if (exists) {
              // Update existing record
              exists.description = row.description || exists.description;
              exists.brand = row.brand || exists.brand;
              exists.updatedAt = now;
              rowsInserted++; // Count as processed
          } else {
              // Insert new record
              alternatives.push({
                  id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  mainPartNumber: mainPart,
                  altPartNumber: altPart,
                  description: row.description || undefined,
                  brand: row.brand || undefined,
                  sourceType: 'CUSTOMER_UPLOAD',
                  sourceUserId: userId,
                  sourceUserName: userName,
                  createdAt: now,
                  updatedAt: now
              });
              rowsInserted++;
          }
      }

      localStorage.setItem(STORAGE_KEYS.ALTERNATIVE_PARTS, JSON.stringify(alternatives));

      return {
          success: true,
          rowsProcessed: rows.length,
          rowsInserted,
          rowsSkipped,
          errors: errors.slice(0, 10) // Limit errors to first 10
      };
  },

  async searchAlternatives(partNumber: string): Promise<AlternativePart[]> {
      const alternatives = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALTERNATIVE_PARTS) || '[]') as AlternativePart[];
      const searchTerm = (partNumber || '').trim().toUpperCase();
      
      if (!searchTerm) return [];

      // Find all records where mainPartNumber or altPartNumber matches
      return alternatives.filter(
          a => a.mainPartNumber === searchTerm || a.altPartNumber === searchTerm
      );
  },

  async getAllAlternatives(page: number = 1, pageSize: number = 50): Promise<{ data: AlternativePart[]; total: number }> {
      const alternatives = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALTERNATIVE_PARTS) || '[]') as AlternativePart[];
      const sorted = alternatives.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return {
          data: sorted.slice(start, end),
          total: alternatives.length
      };
  },

  async deleteAlternative(id: string): Promise<boolean> {
      const alternatives = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALTERNATIVE_PARTS) || '[]') as AlternativePart[];
      const index = alternatives.findIndex(a => a.id === id);
      
      if (index === -1) return false;
      
      alternatives.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.ALTERNATIVE_PARTS, JSON.stringify(alternatives));
      return true;
  },

  async deleteAllAlternativesByUser(userId: string): Promise<number> {
      const alternatives = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALTERNATIVE_PARTS) || '[]') as AlternativePart[];
      const filtered = alternatives.filter(a => a.sourceUserId !== userId);
      const deletedCount = alternatives.length - filtered.length;
      
      localStorage.setItem(STORAGE_KEYS.ALTERNATIVE_PARTS, JSON.stringify(filtered));
      return deletedCount;
  },

  // --- Advanced Product Search API ---
  async advancedSearchProducts(params: {
    q?: string;
    brand?: string;
    make?: string;
    model?: string;
    year?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Product[]; page: number; pageSize: number; total: number }> {
      const { q = '', brand, make, model, year, page = 1, pageSize = 20 } = params;
      const products = await this.searchProducts('');
      
      let filtered = products;
      
      // Text search
      if (q.trim()) {
          const query = q.toLowerCase().trim();
          filtered = filtered.filter(p => 
              p.partNumber.toLowerCase().includes(query) ||
              p.name.toLowerCase().includes(query) ||
              (p.manufacturerPartNumber && p.manufacturerPartNumber.toLowerCase().includes(query)) ||
              (p.description && p.description.toLowerCase().includes(query))
          );
      }
      
      // Filter by brand
      if (brand) {
          filtered = filtered.filter(p => p.brand?.toLowerCase() === brand.toLowerCase());
      }
      
      // Filter by make (car name)
      if (make) {
          filtered = filtered.filter(p => p.carName?.toLowerCase().includes(make.toLowerCase()));
      }
      
      // Filter by model
      if (model) {
          filtered = filtered.filter(p => p.carName?.toLowerCase().includes(model.toLowerCase()));
      }
      
      // Filter by year
      if (year) {
          filtered = filtered.filter(p => p.modelYear?.includes(year));
      }
      
      // Pagination
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);
      
      return { items, page, pageSize, total };
  },

  // --- Purchase Request API ---
  async createPurchaseRequest(
    userId: string,
    userName: string,
    companyName: string,
    items: Array<{ productId: string; partNumber: string; productName: string; quantity: number; priceAtRequest?: number; notes?: string }>,
    notes?: string
  ): Promise<{ success: boolean; requestId: string }> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASE_REQUESTS) || '[]') as PurchaseRequest[];
      
      const requestId = `PR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const newRequest: PurchaseRequest = {
          id: requestId,
          customerId: userId,
          customerName: userName,
          companyName,
          createdAt: new Date().toISOString(),
          status: 'NEW',
          source: 'PRODUCT_SEARCH_PAGE',
          items: items.map((item, idx) => ({
              id: `${requestId}-item-${idx}`,
              productId: item.productId,
              partNumber: item.partNumber,
              productName: item.productName,
              quantity: item.quantity,
              priceAtRequest: item.priceAtRequest,
              notes: item.notes
          })),
          totalItemsCount: items.length,
          notes,
          createdByUserId: userId,
          createdByName: userName,
          isNew: true
      };
      
      requests.push(newRequest);
      localStorage.setItem(STORAGE_KEYS.PURCHASE_REQUESTS, JSON.stringify(requests));
      
      // Log activity
      internalRecordActivity({
          userId,
          userName,
          role: 'CUSTOMER_OWNER',
          eventType: 'PURCHASE_REQUEST_CREATED',
          description: `تم إرسال طلب شراء جديد يحتوي على ${items.length} صنف`,
          metadata: { requestId, itemsCount: items.length }
      });
      
      // Notify admins about new purchase request
      const adminIds = getAdminUserIds();
      adminIds.forEach(adminId => {
          internalCreateNotification(
              adminId,
              'NEW_PURCHASE_REQUEST',
              'طلب شراء جديد',
              `طلب شراء جديد من ${userName} (${companyName}) - ${items.length} صنف`,
              'REQUEST',
              requestId
          );
      });
      
      return { success: true, requestId };
  },

  async getPurchaseRequests(filters?: { customerId?: string; status?: PurchaseRequestStatus }, page: number = 1, pageSize: number = 20): Promise<{ items: PurchaseRequest[]; total: number; page: number; pageSize: number }> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASE_REQUESTS) || '[]') as PurchaseRequest[];
      
      let filtered = requests;
      
      if (filters?.customerId) {
          filtered = filtered.filter(r => r.customerId === filters.customerId);
      }
      
      if (filters?.status) {
          filtered = filtered.filter(r => r.status === filters.status);
      }
      
      // Sort by createdAt descending
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);
      
      return { items, total, page, pageSize };
  },

  async getPurchaseRequestById(id: string): Promise<PurchaseRequest | null> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASE_REQUESTS) || '[]') as PurchaseRequest[];
      return requests.find(r => r.id === id) || null;
  },

  async updatePurchaseRequestStatus(id: string, status: PurchaseRequestStatus, adminName?: string, adminNote?: string): Promise<PurchaseRequest | null> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASE_REQUESTS) || '[]') as PurchaseRequest[];
      const idx = requests.findIndex(r => r.id === id);
      
      if (idx === -1) return null;
      
      const previousStatus = requests[idx].status;
      
      requests[idx] = {
          ...requests[idx],
          status,
          updatedAt: new Date().toISOString(),
          adminReviewedBy: adminName,
          adminReviewedAt: new Date().toISOString(),
          adminNote: adminNote || requests[idx].adminNote,
          isNew: false
      };
      
      localStorage.setItem(STORAGE_KEYS.PURCHASE_REQUESTS, JSON.stringify(requests));
      
      // Notify customer about status change
      if (requests[idx].customerId && previousStatus !== status) {
          const statusLabels: Record<string, string> = {
              'NEW': 'جديد',
              'PROCESSING': 'قيد المعالجة',
              'COMPLETED': 'مكتمل',
              'CANCELLED': 'ملغي'
          };
          
          internalCreateNotification(
              requests[idx].customerId,
              'ORDER_STATUS_CHANGED',
              'تحديث حالة طلب الشراء',
              `تم تحديث حالة طلب الشراء #${id} إلى: ${statusLabels[status] || status}`,
              'REQUEST',
              id
          );
      }
      
      return requests[idx];
  },

  async getNewPurchaseRequestsCount(): Promise<number> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASE_REQUESTS) || '[]') as PurchaseRequest[];
      return requests.filter(r => r.isNew).length;
  },

  // --- Quote Requests (Refactored Logic) ---
  
  // 1. Create Quote (Customer Side - Simple Submission)
  async createQuoteRequest(request: Omit<QuoteRequest, 'id' | 'status' | 'date' | 'totalQuotedAmount' | 'processedDate'>): Promise<QuoteRequest> {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS) || '[]');
    const allProducts = await this.searchProducts('');
    
    // Initial basic processing: Check for existence but DO NOT finalize prices/status
    // This allows the admin to confirm.
    const initialItems: QuoteItem[] = request.items.map((item, idx) => {
        const itemPartClean = normalizePartNumberRaw(item.partNumber);
        // Find potential match for admin convenience, but don't set as APPROVED yet
        const match = allProducts.find(p => normalizePartNumberRaw(p.partNumber) === itemPartClean || p.partNumber === item.partNumber);

        return {
            ...item,
            rowIndex: idx,
            status: 'PENDING', // Legacy
            approvalStatus: 'PENDING', // New Logic
            // We suggest match but don't enforce it
            matchedProductId: match ? match.id : undefined,
            matchedProductName: match ? match.name : undefined,
            matchedPrice: match ? match.price : undefined,
            isAvailable: match ? match.stock > 0 : undefined
        };
    });

    const newReq: QuoteRequest = {
      ...request,
      items: initialItems,
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: 'NEW', // Starts as NEW now, not PROCESSED
      totalQuotedAmount: 0, // Calculated later by Admin
      resultReady: false,
      isNew: true  // For admin badge tracking
    };

    requests.push(newReq);
    localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify(requests));
    
    // Log Activity
    internalRecordActivity({
        userId: request.userId,
        userName: request.userName,
        eventType: 'QUOTE_REQUEST',
        description: `رفع طلب تسعير جديد (${request.priceType})`,
        metadata: { quoteId: newReq.id, itemCount: newReq.items.length }
    });

    return newReq;
  },

  async getAllQuoteRequests(): Promise<QuoteRequest[]> {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS) || '[]');
    if (requests.length === 0) {
        // Only seed demo if empty and explicitly requested via check in login logic (which already happened)
        // But for safety here:
        return DEMO_QUOTES;
    }
    return requests;
  },

  // 2. Admin: Update Quote Request Item Logic (e.g. approve single line)
  async updateQuoteRequest(updatedReq: QuoteRequest): Promise<void> {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS) || '[]');
    const idx = requests.findIndex((r: QuoteRequest) => r.id === updatedReq.id);
    if (idx !== -1) {
      requests[idx] = updatedReq;
      localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify(requests));
    }
  },

  // 3. Admin: Finalize Quote (Calculate totals, generate missing, notify)
  async finalizeQuoteRequest(quoteId: string, reviewedBy: string, generalNote?: string): Promise<QuoteRequest> {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS) || '[]');
      const idx = requests.findIndex((r: QuoteRequest) => r.id === quoteId);
      if (idx === -1) throw new Error('Quote request not found');

      const quote = requests[idx];
      
      // Calculate Approvals & Totals
      const approvedItems = quote.items.filter(i => i.approvalStatus === 'APPROVED');
      const missingItems = quote.items.filter(i => i.approvalStatus === 'MISSING');
      
      const totalAmount = approvedItems.reduce((sum, item) => sum + ((item.matchedPrice || 0) * item.requestedQty), 0);

      // Determine Status
      let newStatus: QuoteRequestStatus = 'APPROVED';
      if (approvedItems.length === 0 && missingItems.length > 0) newStatus = 'REJECTED'; // Or PARTIALLY_APPROVED depending on policy, but usually Rejected if nothing found
      else if (missingItems.length > 0) newStatus = 'PARTIALLY_APPROVED';

      // Update Quote Object
      const finalizedQuote: QuoteRequest = {
          ...quote,
          status: newStatus,
          totalQuotedAmount: totalAmount,
          approvedItemsCount: approvedItems.length,
          missingItemsCount: missingItems.length,
          processedDate: new Date().toISOString(),
          adminReviewedBy: reviewedBy,
          adminReviewedAt: new Date().toISOString(),
          adminGeneralNote: generalNote,
          resultReady: true
      };

      // Generate Missing Requests Registry
      for (const item of missingItems) {
          await this.logMissingProduct(
              quote.userId,
              item.partNumber, // Search Query equivalent
              quote.userName,
              'QUOTE',
              quote.id
          );
      }

      // Save Quote
      requests[idx] = finalizedQuote;
      localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify(requests));

      // Notify Customer
      internalCreateNotification(
          quote.userId,
          'QUOTE_PROCESSED',
          'تمت مراجعة طلب التسعير',
          `تم الانتهاء من مراجعة طلب التسعير رقم ${quote.id}. يمكنك الآن الاطلاع على النتائج.`
      );

      // Mark quote as unread for the user (badge notification)
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const userIdx = users.findIndex((u:User) => u.id === quote.userId);
      if (userIdx !== -1) {
          const u = users[userIdx];
          u.hasUnreadQuotes = true;
          updateLocalUser(u);
      }

      // Log Activity
      internalRecordActivity({
          userId: 'super-admin',
          userName: reviewedBy,
          role: 'SUPER_ADMIN',
          eventType: 'QUOTE_REVIEWED',
          description: `تم اعتماد طلب التسعير #${quote.id}`,
          metadata: { 
              quoteId: quote.id, 
              approved: approvedItems.length, 
              missing: missingItems.length, 
              total: totalAmount 
          }
      });

      return finalizedQuote;
  },

  // --- Branch & Employee Mgmt ---
  async addBranch(mainUserId: string, branch: Omit<Branch, 'id'>) {
     // Reduced delay
     await delay(100);
     const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
     // Find profile by owner ID
     const idx = profiles.findIndex((p:BusinessProfile) => p.userId === mainUserId);
     if (idx === -1) throw new Error('User not found');
     profiles[idx].branches.push({ ...branch, id: crypto.randomUUID() });
     localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
     return profiles[idx].branches;
  },

  async deleteBranch(mainUserId: string, branchId: string) {
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      const idx = profiles.findIndex((p:BusinessProfile) => p.userId === mainUserId);
      if (idx === -1) throw new Error('User not found');
      
      profiles[idx].branches = profiles[idx].branches.filter((b: Branch) => b.id !== branchId);
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      return profiles[idx].branches;
  },

  // Update customer business profile
  async updateCustomerProfile(mainUserId: string, profileData: {
      companyName?: string;
      crNumber?: string;
      taxNumber?: string;
      nationalAddress?: string;
      city?: string;
      region?: string;
      phone?: string;
  }) {
      await delay(200);
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      const idx = profiles.findIndex((p:BusinessProfile) => p.userId === mainUserId);
      if (idx === -1) throw new Error('User not found');

      // Update only provided fields (using correct BusinessProfile field names)
      if (profileData.companyName !== undefined) profiles[idx].companyName = profileData.companyName;
      if (profileData.crNumber !== undefined) profiles[idx].crNumber = profileData.crNumber;
      if (profileData.taxNumber !== undefined) profiles[idx].taxNumber = profileData.taxNumber;
      if (profileData.nationalAddress !== undefined) profiles[idx].nationalAddress = profileData.nationalAddress;
      if (profileData.city !== undefined) profiles[idx].city = profileData.city;
      if (profileData.region !== undefined) profiles[idx].region = profileData.region;
      if (profileData.phone !== undefined) profiles[idx].phone = profileData.phone;

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      return profiles[idx];
  },
  
  async addEmployee(mainUserId: string, empData: Partial<User>) {
      // Reduced delay
      await delay(100);
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      if (users.find((u: User) => u.phone === empData.phone)) {
          throw new Error('رقم الجوال مسجل كموظف بالفعل');
      }

      if (!empData.phone || !empData.name) {
        throw new Error('Missing required employee fields');
      }

      const newEmpId = crypto.randomUUID();
      const activationCode = generateActivationCode();
      
      const newEmployee: User = {
          id: newEmpId,
          clientId: empData.phone, // Phone is used as clientId in some legacy checks, but login uses phone
          name: empData.name,
          email: `${empData.phone}@employee.com`,
          phone: empData.phone,
          role: 'CUSTOMER_STAFF',
          parentId: mainUserId, // Links to Owner
          businessId: mainUserId, // Links to Owner's Business (initially same as owner ID in this mock)
          activationCode: activationCode,
          isActive: true,
          branchId: empData.branchId,
          employeeRole: empData.employeeRole || EmployeeRole.BUYER,
          searchLimit: 50,
          searchUsed: 0,
          lastSearchDate: new Date().toISOString().split('T')[0],
          hasUnreadOrders: false,
          status: 'ACTIVE'
      };
      
      users.push(newEmployee);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      return { user: newEmployee, activationCode }; // Return code to display
  },

  async toggleEmployeeStatus(employeeId: string) {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex((u: User) => u.id === employeeId);
      if (idx >= 0) {
          users[idx].isActive = !users[idx].isActive;
          users[idx].status = users[idx].isActive ? 'ACTIVE' : 'SUSPENDED'; // Sync status
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          return users[idx];
      }
      throw new Error('Employee not found');
  },

  async deleteEmployee(employeeId: string) {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const filteredUsers = users.filter((u: User) => u.id !== employeeId);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
  },

  /**
   * Change password for a user (customer can change their own password)
   * Validates old password before allowing change
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
      const idx = users.findIndex((u: User) => u.id === userId);
      
      if (idx === -1) {
          return { success: false, message: 'المستخدم غير موجود' };
      }

      const user = users[idx];
      
      // Verify old password
      if (user.password !== oldPassword) {
          return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
      }

      // Validate new password
      if (!newPassword || newPassword.length < 4) {
          return { success: false, message: 'كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل' };
      }

      // Update password
      users[idx].password = newPassword;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Log activity
      internalRecordActivity({
          userId: userId,
          userName: user.name,
          role: user.role,
          eventType: 'PASSWORD_CHANGED',
          description: 'تم تغيير كلمة المرور بنجاح'
      });

      // Invalidate persistent session tokens (forces re-login with new password)
      this.invalidateSessionTokens(userId);

      return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
  },

  /**
   * Admin reset password for any user (customer, staff, or admin)
   * Sets a new password without requiring old password verification
   */
  async adminResetPassword(adminUserId: string, targetUserId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
      const adminUser = users.find(u => u.id === adminUserId);
      const targetIdx = users.findIndex((u: User) => u.id === targetUserId);
      
      // Verify admin has permission
      if (!adminUser || (adminUser.role !== 'SUPER_ADMIN' && adminUser.role !== 'CUSTOMER_OWNER')) {
          return { success: false, message: 'ليس لديك صلاحية لإعادة تعيين كلمة المرور' };
      }

      if (targetIdx === -1) {
          return { success: false, message: 'المستخدم المستهدف غير موجود' };
      }

      // Validate new password
      if (!newPassword || newPassword.length < 4) {
          return { success: false, message: 'كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل' };
      }

      const targetUser = users[targetIdx];
      
      // Update password
      users[targetIdx].password = newPassword;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Log activity
      internalRecordActivity({
          userId: adminUserId,
          userName: adminUser.name,
          role: adminUser.role,
          eventType: 'PASSWORD_RESET',
          description: `تم إعادة تعيين كلمة المرور للمستخدم: ${targetUser.name}`,
          metadata: { targetUserId, targetUserName: targetUser.name }
      });

      // Notify user
      internalCreateNotification(
          targetUserId,
          'SYSTEM',
          'تم إعادة تعيين كلمة المرور',
          'تم إعادة تعيين كلمة المرور الخاصة بك من قبل الإدارة. يرجى تسجيل الدخول بكلمة المرور الجديدة.'
      );

      // Invalidate persistent session tokens (forces re-login with new password)
      this.invalidateSessionTokens(targetUserId);

      return { success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' };
  },

  /**
   * Store a session token for persistent login (for later validation)
   */
  storeSessionToken(userId: string, token: string): void {
      const tokens = JSON.parse(localStorage.getItem('sini_car_session_tokens') || '{}');
      if (!tokens[userId]) {
          tokens[userId] = [];
      }
      // Keep only last 5 tokens per user (multiple devices)
      tokens[userId] = [...tokens[userId].slice(-4), token];
      localStorage.setItem('sini_car_session_tokens', JSON.stringify(tokens));
  },

  /**
   * Validate a session token for persistent login
   */
  validateSessionToken(userId: string, token: string): boolean {
      const tokens = JSON.parse(localStorage.getItem('sini_car_session_tokens') || '{}');
      return tokens[userId]?.includes(token) || false;
  },

  /**
   * Invalidate all session tokens for a user (on password change)
   */
  invalidateSessionTokens(userId: string): void {
      const tokens = JSON.parse(localStorage.getItem('sini_car_session_tokens') || '{}');
      delete tokens[userId];
      localStorage.setItem('sini_car_session_tokens', JSON.stringify(tokens));
  },

  /**
   * Get user by ID for session token restoration
   */
  async getUserById(userId: string): Promise<User | null> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
      return users.find(u => u.id === userId) || null;
  },

  async getEmployees(mainUserId: string): Promise<User[]> {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      return users.filter((u:User) => u.parentId === mainUserId && u.role === 'CUSTOMER_STAFF');
  },

  // --- Products Import from Onyx Pro Excel ---
  
  async importProductsFromOnyxExcel(file: File, presetId?: string): Promise<{ imported: number; updated: number; skipped: number; errors: string[] }> {
      const parseNumber = (value: any): number | null => {
          if (value === null || value === undefined || value === '') return null;
          const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
          return isNaN(num) ? null : num;
      };

      const generateId = () => `P-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      const preset = presetId 
          ? this.getExcelColumnPresets().find(p => p.id === presetId)
          : this.getDefaultExcelColumnPreset();
      
      const getExcelHeader = (internalField: string): string => {
          if (!preset) {
              const defaultHeaders: Record<string, string> = {
                  partNumber: 'رقم الصنف',
                  name: 'اسم الصنف',
                  brand: ' الماركة',
                  qtyTotal: 'الإجمالي',
                  priceWholesale: 'سعر الجملة',
                  priceRetail: 'سعر التجزئة',
                  priceWholeWholesale: 'سعر جملة الجملة',
                  priceEcommerce: 'سعر المتجر الالكتروني',
                  qtyStore103: '  كمية المخزن 103',
                  qtyStore105: '  كمية المخزن 105',
                  rack103: 'رف المخزن 103',
                  rack105: 'رف المخزن 105',
                  carName: ' اسم السيارة',
                  description: ' المواصفات',
                  manufacturerPartNumber: 'رقم التصنيع',
                  globalCategory: ' التصنيف العالمي',
                  modelYear: ' سنة الصنع',
                  quality: 'الجودة'
              };
              return defaultHeaders[internalField] || internalField;
          }
          const mapping = preset.mappings.find(m => m.internalField === internalField && m.isEnabled);
          return mapping?.excelHeader || internalField;
      };
      
      const getDefaultValue = (internalField: string): any => {
          if (!preset) return undefined;
          const mapping = preset.mappings.find(m => m.internalField === internalField);
          return mapping?.defaultValue;
      };
      
      const isFieldEnabled = (internalField: string): boolean => {
          if (!preset) return true;
          const mapping = preset.mappings.find(m => m.internalField === internalField);
          return mapping?.isEnabled ?? false;
      };

      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = async (e) => {
              try {
                  const data = new Uint8Array(e.target?.result as ArrayBuffer);
                  const workbook = XLSX.read(data, { type: 'array' });
                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  const jsonData = XLSX.utils.sheet_to_json(worksheet);

                  const existingProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]') as Product[];
                  
                  let imported = 0;
                  let updated = 0;
                  let skipped = 0;
                  const errors: string[] = [];

                  for (let i = 0; i < jsonData.length; i++) {
                      const row = jsonData[i] as Record<string, any>;
                      const rowNum = i + 2;
                      
                      const partNumberHeader = getExcelHeader('partNumber');
                      const nameHeader = getExcelHeader('name');
                      
                      const partNumber = row[partNumberHeader]?.toString().trim() || getDefaultValue('partNumber');
                      const name = row[nameHeader]?.toString().trim() || getDefaultValue('name');

                      if (!partNumber) {
                          skipped++;
                          continue;
                      }

                      if (!name) {
                          errors.push(`صف ${rowNum}: اسم الصنف فارغ لرقم الصنف ${partNumber}`);
                          skipped++;
                          continue;
                      }

                      const product: Product = {
                          id: generateId(),
                          partNumber,
                          name,
                          priceRetail: isFieldEnabled('priceRetail') ? parseNumber(row[getExcelHeader('priceRetail')]) ?? parseNumber(getDefaultValue('priceRetail')) : null,
                          priceWholesale: isFieldEnabled('priceWholesale') ? parseNumber(row[getExcelHeader('priceWholesale')]) ?? parseNumber(getDefaultValue('priceWholesale')) : null,
                          priceWholeWholesale: isFieldEnabled('priceWholeWholesale') ? parseNumber(row[getExcelHeader('priceWholeWholesale')]) ?? parseNumber(getDefaultValue('priceWholeWholesale')) : null,
                          priceEcommerce: isFieldEnabled('priceEcommerce') ? parseNumber(row[getExcelHeader('priceEcommerce')]) ?? parseNumber(getDefaultValue('priceEcommerce')) : null,
                          qtyStore103: isFieldEnabled('qtyStore103') ? parseNumber(row[getExcelHeader('qtyStore103')]) ?? parseNumber(getDefaultValue('qtyStore103')) : null,
                          qtyStore105: isFieldEnabled('qtyStore105') ? parseNumber(row[getExcelHeader('qtyStore105')]) ?? parseNumber(getDefaultValue('qtyStore105')) : null,
                          qtyTotal: isFieldEnabled('qtyTotal') ? parseNumber(row[getExcelHeader('qtyTotal')]) ?? parseNumber(getDefaultValue('qtyTotal')) : 0,
                          price: parseNumber(row[getExcelHeader('priceWholesale')]) || parseNumber(row[getExcelHeader('priceRetail')]) || 0,
                          stock: parseNumber(row[getExcelHeader('qtyTotal')]) || 0,
                          brand: isFieldEnabled('brand') ? row[getExcelHeader('brand')]?.toString().trim() || getDefaultValue('brand') : undefined,
                          description: isFieldEnabled('description') ? row[getExcelHeader('description')]?.toString().trim() || getDefaultValue('description') : undefined,
                          carName: isFieldEnabled('carName') ? row[getExcelHeader('carName')]?.toString().trim() || getDefaultValue('carName') : null,
                          globalCategory: isFieldEnabled('globalCategory') ? row[getExcelHeader('globalCategory')]?.toString().trim() || getDefaultValue('globalCategory') : null,
                          modelYear: isFieldEnabled('modelYear') ? row[getExcelHeader('modelYear')]?.toString().trim() || getDefaultValue('modelYear') : null,
                          quality: isFieldEnabled('quality') ? row[getExcelHeader('quality')]?.toString().trim() || getDefaultValue('quality') : null,
                          manufacturerPartNumber: isFieldEnabled('manufacturerPartNumber') ? row[getExcelHeader('manufacturerPartNumber')]?.toString().trim() || getDefaultValue('manufacturerPartNumber') : null,
                          rack103: isFieldEnabled('rack103') ? row[getExcelHeader('rack103')]?.toString().trim() || getDefaultValue('rack103') : null,
                          rack105: isFieldEnabled('rack105') ? row[getExcelHeader('rack105')]?.toString().trim() || getDefaultValue('rack105') : null,
                          createdAt: new Date().toISOString()
                      };

                      const existingIndex = existingProducts.findIndex(p => p.partNumber === partNumber);
                      
                      if (existingIndex !== -1) {
                          existingProducts[existingIndex] = {
                              ...existingProducts[existingIndex],
                              ...product,
                              id: existingProducts[existingIndex].id,
                              createdAt: existingProducts[existingIndex].createdAt,
                              updatedAt: new Date().toISOString()
                          };
                          updated++;
                      } else {
                          existingProducts.push(product);
                          imported++;
                      }
                  }

                  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(existingProducts));
                  
                  resolve({ imported, updated, skipped, errors });
              } catch (err: any) {
                  reject(new Error(`خطأ في قراءة الملف: ${err.message}`));
              }
          };

          reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
          reader.readAsArrayBuffer(file);
      });
  },

  async getProducts(): Promise<Product[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
  },

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
      const products = await this.getProducts();
      const newProduct: Product = {
          ...product,
          id: `P-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('المنتج غير موجود');
      
      products[index] = {
          ...products[index],
          ...updates,
          updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return products[index];
  },

  async deleteProduct(id: string): Promise<void> {
      const products = await this.getProducts();
      const filtered = products.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  async bulkUpdateProductVisibility(productIds: string[], useVisibilityRule: boolean): Promise<number> {
      const products = await this.getProducts();
      let updatedCount = 0;
      
      const updatedProducts = products.map(p => {
          if (productIds.includes(p.id)) {
              updatedCount++;
              return {
                  ...p,
                  useVisibilityRuleForQty: useVisibilityRule,
                  updatedAt: new Date().toISOString()
              };
          }
          return p;
      });
      
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
      return updatedCount;
  },

  generateOnyxExcelTemplate(): void {
      const headers = [
          'رقم الصنف',
          'اسم الصنف',
          'سعر التجزئة',
          'سعر الجملة',
          'سعر جملة الجملة',
          'سعر المتجر الالكتروني',
          '  كمية المخزن 103',
          '  كمية المخزن 105',
          'الإجمالي'
      ];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers]), 'Products');
      XLSX.writeFile(wb, 'نموذج_أصناف_أونيكس.xlsx');
  },

  // --- Admin Badge Tracking - Mark All As Seen ---
  
  markOrdersAsSeen(): void {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]') as Order[];
      const updated = orders.map(o => ({ ...o, isNew: false }));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  },

  markAccountRequestsAsSeen(): void {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNT_REQUESTS) || '[]') as AccountOpeningRequest[];
      const updated = requests.map(r => ({ ...r, isNew: false }));
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_REQUESTS, JSON.stringify(updated));
  },

  markQuoteRequestsAsSeen(): void {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS) || '[]') as QuoteRequest[];
      const updated = requests.map(r => ({ ...r, isNew: false }));
      localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify(updated));
  },

  markImportRequestsAsSeen(): void {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_REQUESTS) || '[]') as ImportRequest[];
      const updated = requests.map(r => ({ ...r, isNew: false }));
      localStorage.setItem(STORAGE_KEYS.IMPORT_REQUESTS, JSON.stringify(updated));
  },

  markMissingRequestsAsSeen(): void {
      const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSING_REQUESTS) || '[]') as MissingProductRequest[];
      const updated = requests.map(r => ({ ...r, isNew: false }));
      localStorage.setItem(STORAGE_KEYS.MISSING_REQUESTS, JSON.stringify(updated));
  },

  // Get counts of new/unseen items for badges
  getNewItemCounts(): { orders: number; accounts: number; quotes: number; imports: number; missing: number } {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]') as Order[];
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNT_REQUESTS) || '[]') as AccountOpeningRequest[];
      const quotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS) || '[]') as QuoteRequest[];
      const imports = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMPORT_REQUESTS) || '[]') as ImportRequest[];
      const missing = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSING_REQUESTS) || '[]') as MissingProductRequest[];

      return {
          orders: orders.filter(o => o.isNew === true).length,
          accounts: accounts.filter(r => r.isNew === true).length,
          quotes: quotes.filter(r => r.isNew === true).length,
          imports: imports.filter(r => r.isNew === true).length,
          missing: missing.filter(r => r.isNew === true).length
      };
  },

  // --- Admin Users Management ---

  getDefaultAdminUsers(): AdminUser[] {
      return [
          {
              id: 'admin-1',
              fullName: 'أحمد المشرف العام',
              username: 'admin',
              phone: '0500000001',
              email: 'admin@sinicar.com',
              password: 'admin123',
              roleId: 'role-super-admin',
              isActive: true,
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'ADMIN',
              accountStatus: 'APPROVED',
              completionPercent: 100,
              whatsapp: '+966500000001',
              clientCode: 'ADM-001'
          },
          {
              id: 'admin-2',
              fullName: 'محمد مدير المبيعات',
              username: 'sales_manager',
              phone: '0500000002',
              email: 'sales@sinicar.com',
              password: 'sales123',
              roleId: 'role-sales-manager',
              isActive: true,
              lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'EMPLOYEE',
              accountStatus: 'APPROVED',
              completionPercent: 85,
              whatsapp: '+966500000002',
              clientCode: 'EMP-002'
          },
          {
              id: 'admin-3',
              fullName: 'سارة موظفة المبيعات',
              username: 'sales_agent',
              phone: '0500000003',
              password: 'agent123',
              roleId: 'role-sales-agent',
              isActive: true,
              createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'EMPLOYEE',
              accountStatus: 'APPROVED',
              completionPercent: 70,
              whatsapp: '+966500000003'
          },
          {
              id: 'admin-4',
              fullName: 'خالد المشاهد',
              username: 'viewer',
              phone: '0500000004',
              password: 'viewer123',
              roleId: 'role-viewer',
              isActive: false,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'EMPLOYEE',
              accountStatus: 'BLOCKED',
              completionPercent: 50
          },
          {
              id: 'customer-1',
              fullName: 'عبدالله التاجر',
              username: 'customer1',
              phone: '0550000001',
              email: 'customer1@example.com',
              password: 'customer123',
              roleId: 'role-viewer',
              isActive: true,
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'CUSTOMER',
              accountStatus: 'APPROVED',
              completionPercent: 90,
              whatsapp: '+966550000001',
              clientCode: 'C-10001',
              isCustomer: true
          },
          {
              id: 'customer-2',
              fullName: 'فهد الجديد',
              username: 'customer2',
              phone: '0550000002',
              password: 'customer123',
              roleId: 'role-viewer',
              isActive: false,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'CUSTOMER',
              accountStatus: 'PENDING',
              completionPercent: 40,
              whatsapp: '+966550000002',
              clientCode: 'C-10002',
              isCustomer: true
          },
          {
              id: 'supplier-1',
              fullName: 'شركة الأمل للتوريد',
              username: 'supplier1',
              phone: '0560000001',
              email: 'supplier1@alamal.com',
              password: 'supplier123',
              roleId: 'role-viewer',
              isActive: true,
              createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'SUPPLIER_LOCAL',
              accountStatus: 'APPROVED',
              completionPercent: 95,
              whatsapp: '+966560000001',
              clientCode: 'SL-20001',
              isSupplier: true
          },
          {
              id: 'supplier-2',
              fullName: 'مصنع قوانغجو',
              username: 'guangzhou_supplier',
              phone: '+8613800000001',
              email: 'supplier@guangzhou.cn',
              password: 'supplier123',
              roleId: 'role-viewer',
              isActive: false,
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'SUPPLIER_INTERNATIONAL',
              accountStatus: 'PENDING',
              completionPercent: 60,
              whatsapp: '+8613800000001',
              clientCode: 'SI-30001',
              isSupplier: true
          },
          {
              id: 'marketer-1',
              fullName: 'سعيد المسوق',
              username: 'marketer1',
              phone: '0570000001',
              password: 'marketer123',
              roleId: 'role-viewer',
              isActive: true,
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'MARKETER',
              accountStatus: 'APPROVED',
              completionPercent: 80,
              whatsapp: '+966570000001',
              clientCode: 'M-40001'
          },
          {
              id: 'marketer-2',
              fullName: 'نورة المسوقة',
              username: 'marketer2',
              phone: '0570000002',
              password: 'marketer123',
              roleId: 'role-viewer',
              isActive: false,
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              extendedRole: 'MARKETER',
              accountStatus: 'REJECTED',
              completionPercent: 30,
              whatsapp: '+966570000002',
              clientCode: 'M-40002'
          }
      ];
  },

  async getAdminUsers(): Promise<AdminUser[]> {
      let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || 'null') as AdminUser[] | null;
      if (!users) {
          users = this.getDefaultAdminUsers();
          localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      }
      // Normalize legacy entries that lack new fields
      let needsSave = false;
      users = users.map(u => {
          const normalized = { ...u };
          if (!normalized.extendedRole) {
              normalized.extendedRole = 'EMPLOYEE';
              needsSave = true;
          }
          if (!normalized.accountStatus) {
              normalized.accountStatus = normalized.isActive ? 'APPROVED' : 'PENDING';
              needsSave = true;
          }
          if (normalized.completionPercent === undefined) {
              normalized.completionPercent = 50;
              needsSave = true;
          }
          return normalized;
      });
      if (needsSave) {
          localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      }
      return users;
  },

  async createAdminUser(userData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
      const users = await this.getAdminUsers();
      
      // Check for duplicate username
      if (users.some(u => u.username === userData.username)) {
          throw new Error('اسم المستخدم موجود بالفعل');
      }
      
      // Validate password
      if (!userData.password || userData.password.trim() === '') {
          throw new Error('كلمة المرور مطلوبة');
      }

      // Generate client code based on extendedRole
      const generateClientCode = (role: string | undefined): string => {
          const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
          switch (role) {
              case 'CUSTOMER': return `C-${timestamp}`;
              case 'SUPPLIER_LOCAL': return `SL-${timestamp}`;
              case 'SUPPLIER_INTERNATIONAL': return `SI-${timestamp}`;
              case 'MARKETER': return `M-${timestamp}`;
              case 'ADMIN': return `ADM-${timestamp}`;
              case 'EMPLOYEE': return `EMP-${timestamp}`;
              default: return `U-${timestamp}`;
          }
      };
      
      const newUser: AdminUser = {
          ...userData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          extendedRole: userData.extendedRole || 'EMPLOYEE',
          accountStatus: userData.accountStatus || 'PENDING',
          completionPercent: userData.completionPercent ?? 50,
          whatsapp: userData.whatsapp || userData.phone,
          clientCode: userData.clientCode || generateClientCode(userData.extendedRole)
      };
      
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: `تم إنشاء مستخدم جديد: ${newUser.fullName} (${newUser.username})`,
          metadata: { adminUserId: newUser.id, action: 'create_admin_user' }
      });
      
      return newUser;
  },

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
      const users = await this.getAdminUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return null;
      
      // Check for duplicate username if changing username
      if (updates.username && updates.username !== users[index].username) {
          if (users.some(u => u.username === updates.username && u.id !== id)) {
              throw new Error('اسم المستخدم موجود بالفعل');
          }
      }
      
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: `تم تحديث بيانات المستخدم: ${users[index].fullName}`,
          metadata: { adminUserId: id, action: 'update_admin_user', updates }
      });
      
      return users[index];
  },

  async resetAdminUserPassword(id: string, newPassword: string): Promise<boolean> {
      if (!newPassword || newPassword.trim() === '') {
          throw new Error('كلمة المرور الجديدة مطلوبة');
      }
      
      const users = await this.getAdminUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return false;
      
      users[index].password = newPassword;
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: `تم إعادة تعيين كلمة مرور المستخدم: ${users[index].fullName}`,
          metadata: { adminUserId: id, action: 'reset_admin_password' }
      });
      
      return true;
  },

  async toggleAdminUserStatus(id: string): Promise<AdminUser | null> {
      const users = await this.getAdminUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return null;
      
      // Prevent deactivating the last active super admin
      if (users[index].role === 'SUPER_ADMIN' && users[index].isActive) {
          const activeSuperAdmins = users.filter(u => u.role === 'SUPER_ADMIN' && u.isActive);
          if (activeSuperAdmins.length <= 1) {
              throw new Error('لا يمكن إيقاف المشرف العام الوحيد النشط');
          }
      }
      
      users[index].isActive = !users[index].isActive;
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      const action = users[index].isActive ? 'تفعيل' : 'إيقاف';
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: users[index].isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED',
          description: `تم ${action} المستخدم: ${users[index].fullName}`,
          metadata: { adminUserId: id, action: 'toggle_admin_user_status' }
      });
      
      return users[index];
  },

  async approveAdminUser(id: string): Promise<AdminUser | null> {
      const users = await this.getAdminUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return null;
      
      users[index].accountStatus = 'APPROVED';
      users[index].isActive = true;
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'USER_APPROVED',
          description: `تم قبول حساب المستخدم: ${users[index].fullName}`,
          metadata: { adminUserId: id, action: 'approve_admin_user' }
      });
      
      return users[index];
  },

  async rejectAdminUser(id: string): Promise<AdminUser | null> {
      const users = await this.getAdminUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return null;
      
      users[index].accountStatus = 'REJECTED';
      users[index].isActive = false;
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'USER_REJECTED',
          description: `تم رفض حساب المستخدم: ${users[index].fullName}`,
          metadata: { adminUserId: id, action: 'reject_admin_user' }
      });
      
      return users[index];
  },

  async blockAdminUser(id: string): Promise<AdminUser | null> {
      const users = await this.getAdminUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return null;
      
      // Prevent blocking super admin
      if (users[index].roleId === 'role-super-admin') {
          throw new Error('لا يمكن حظر المشرف العام');
      }
      
      users[index].accountStatus = 'BLOCKED';
      users[index].isActive = false;
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'USER_SUSPENDED',
          description: `تم حظر حساب المستخدم: ${users[index].fullName}`,
          metadata: { adminUserId: id, action: 'block_admin_user' }
      });
      
      return users[index];
  },

  async deleteAdminUser(id: string): Promise<boolean> {
      const users = await this.getAdminUsers();
      const userToDelete = users.find(u => u.id === id);
      
      if (!userToDelete) return false;
      
      // Prevent deleting the last super admin
      if (userToDelete.roleId === 'role-super-admin') {
          const superAdmins = users.filter(u => u.roleId === 'role-super-admin');
          if (superAdmins.length <= 1) {
              throw new Error('لا يمكن حذف المشرف العام الوحيد');
          }
      }
      
      const filteredUsers = users.filter(u => u.id !== id);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(filteredUsers));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: `تم حذف المستخدم: ${userToDelete.fullName} (${userToDelete.username})`,
          metadata: { adminUserId: id, action: 'delete_admin_user' }
      });
      
      return true;
  },

  async getAdminUserById(id: string): Promise<AdminUser | null> {
      const users = await this.getAdminUsers();
      return users.find(u => u.id === id) || null;
  },

  // --- Roles & Permissions Management ---

  getDefaultRoles(): Role[] {
      const allResources: PermissionResource[] = [
          'dashboard', 'products', 'customers', 'customer_requests', 'account_requests',
          'quotes', 'orders', 'imports', 'missing', 'crm', 'activity_log', 'notifications',
          'settings_general', 'settings_status_labels', 'settings_api', 'settings_backup',
          'settings_security', 'users', 'roles', 'export_center', 'content_management', 'other'
      ];
      
      const allActions: PermissionAction[] = [
          'view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'import',
          'configure', 'manage_status', 'manage_users', 'manage_roles', 'run_backup', 'manage_api', 'other'
      ];
      
      // صلاحيات كاملة
      const fullPermissions: Permission[] = allResources.map(resource => ({
          resource,
          actions: [...allActions]
      }));
      
      // صلاحيات المبيعات
      const salesResources: PermissionResource[] = [
          'dashboard', 'products', 'customers', 'customer_requests', 'quotes', 
          'orders', 'imports', 'missing', 'crm', 'notifications'
      ];
      const salesManagerActions: PermissionAction[] = ['view', 'create', 'edit', 'approve', 'reject', 'export'];
      const salesAgentActions: PermissionAction[] = ['view', 'create', 'edit'];
      
      return [
          {
              id: 'role-super-admin',
              name: 'مشرف عام',
              description: 'صلاحيات كاملة على النظام',
              permissions: fullPermissions,
              isSystem: true,
              createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
              id: 'role-admin',
              name: 'مدير النظام',
              description: 'إدارة عامة مع بعض القيود البسيطة',
              permissions: allResources.filter(r => r !== 'roles').map(resource => ({
                  resource,
                  actions: allActions.filter(a => a !== 'manage_roles')
              })),
              isSystem: true,
              createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
              id: 'role-sales-manager',
              name: 'مدير المبيعات',
              description: 'إدارة المبيعات والعملاء والطلبات',
              permissions: salesResources.map(resource => ({
                  resource,
                  actions: salesManagerActions
              })),
              isSystem: true,
              createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
              id: 'role-sales-agent',
              name: 'موظف مبيعات',
              description: 'إضافة عروض أسعار وطلبات بدون إدارة الإعدادات',
              permissions: salesResources.map(resource => ({
                  resource,
                  actions: salesAgentActions
              })),
              isSystem: true,
              createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
              id: 'role-viewer',
              name: 'مشاهد فقط',
              description: 'عرض البيانات فقط بدون تعديل',
              permissions: allResources.map(resource => ({
                  resource,
                  actions: ['view'] as PermissionAction[]
              })),
              isSystem: true,
              createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
          }
      ];
  },

  async getRoles(): Promise<Role[]> {
      let roles = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_ROLES) || 'null') as Role[] | null;
      if (!roles) {
          roles = this.getDefaultRoles();
          localStorage.setItem(STORAGE_KEYS.ADMIN_ROLES, JSON.stringify(roles));
      }
      return roles;
  },

  async getRoleById(id: string): Promise<Role | null> {
      const roles = await this.getRoles();
      return roles.find(r => r.id === id) || null;
  },

  async createRole(roleData: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
      const roles = await this.getRoles();
      
      // Check for duplicate name
      if (roles.some(r => r.name === roleData.name)) {
          throw new Error('اسم الدور موجود بالفعل');
      }
      
      const newRole: Role = {
          ...roleData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
      };
      
      roles.push(newRole);
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLES, JSON.stringify(roles));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: `تم إنشاء دور جديد: ${newRole.name}`,
          metadata: { roleId: newRole.id, action: 'create_role' }
      });
      
      return newRole;
  },

  async updateRole(id: string, updates: Partial<Role>): Promise<Role | null> {
      const roles = await this.getRoles();
      const index = roles.findIndex(r => r.id === id);
      
      if (index === -1) return null;
      
      // Check for duplicate name if changing name
      if (updates.name && updates.name !== roles[index].name) {
          if (roles.some(r => r.name === updates.name && r.id !== id)) {
              throw new Error('اسم الدور موجود بالفعل');
          }
      }
      
      // Prevent changing isSystem flag
      delete updates.isSystem;
      
      roles[index] = { ...roles[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLES, JSON.stringify(roles));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: `تم تحديث الدور: ${roles[index].name}`,
          metadata: { roleId: id, action: 'update_role', updates }
      });
      
      return roles[index];
  },

  async deleteRole(id: string): Promise<boolean> {
      const roles = await this.getRoles();
      const roleToDelete = roles.find(r => r.id === id);
      
      if (!roleToDelete) return false;
      
      // Prevent deleting system roles
      if (roleToDelete.isSystem) {
          throw new Error('لا يمكن حذف الأدوار النظامية');
      }
      
      // Check if any users are assigned to this role
      const users = await this.getAdminUsers();
      const usersWithRole = users.filter(u => u.roleId === id);
      if (usersWithRole.length > 0) {
          throw new Error('لا يمكن حذف هذا الدور لوجود مستخدمين مرتبطين به');
      }
      
      const filteredRoles = roles.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.ADMIN_ROLES, JSON.stringify(filteredRoles));
      
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: `تم حذف الدور: ${roleToDelete.name}`,
          metadata: { roleId: id, action: 'delete_role' }
      });
      
      return true;
  },

  async getUserCountByRole(roleId: string): Promise<number> {
      const users = await this.getAdminUsers();
      return users.filter(u => u.roleId === roleId).length;
  },

  // تصدير جميع البيانات للنسخ الاحتياطي
  async exportAllData(): Promise<Record<string, any>> {
      return {
          exportDate: new Date().toISOString(),
          version: '1.0',
          data: {
              products: await this.getProducts(),
              orders: await this.getOrders(),
              customers: await this.getCustomersDatabase(),
              settings: await this.getSettings(),
              banners: await this.getBanners(),
              quoteRequests: await this.getQuoteRequests(),
              accountRequests: await this.getAccountRequests(),
              notifications: JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'),
              activityLogs: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]')
          }
      };
  },

  // إعادة ضبط جميع البيانات (فورمات)
  async resetAllData(): Promise<void> {
      // مسح جميع البيانات من localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
      });
      
      // إعادة تهيئة البيانات الافتراضية
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_REQUESTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      
      // تسجيل النشاط
      internalRecordActivity({
          userId: 'system',
          userName: 'النظام',
          eventType: 'OTHER',
          description: 'تم إعادة ضبط جميع البيانات (فورمات)',
          metadata: { action: 'reset_all_data' }
      });
  },

  // =============================================
  // Marketing Campaigns - مركز التسويق
  // =============================================

  async getAllCampaigns(): Promise<MarketingCampaign[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
          if (!stored) return [];
          return JSON.parse(stored) as MarketingCampaign[];
      } catch (error) {
          console.error('Error loading campaigns:', error);
          return [];
      }
  },

  async createCampaign(campaignInput: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
      const campaigns = await this.getAllCampaigns();
      
      const newCampaign: MarketingCampaign = {
          id: `CAMP-${Date.now()}`,
          title: campaignInput.title || '',
          message: campaignInput.message || '',
          displayType: campaignInput.displayType || 'POPUP',
          skippable: campaignInput.skippable ?? true,
          contentType: campaignInput.contentType || 'TEXT',
          mediaUrl: campaignInput.mediaUrl,
          htmlContent: campaignInput.htmlContent,
          ctaLabel: campaignInput.ctaLabel,
          ctaUrl: campaignInput.ctaUrl,
          audienceType: campaignInput.audienceType || 'ALL',
          status: campaignInput.status || 'DRAFT',
          priority: campaignInput.priority || 1,
          createdAt: new Date().toISOString(),
          startsAt: campaignInput.startsAt,
          expiresAt: campaignInput.expiresAt
      };
      
      campaigns.push(newCampaign);
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      
      internalRecordActivity({
          userId: 'admin',
          userName: 'المدير',
          eventType: 'OTHER',
          description: `تم إنشاء حملة تسويقية جديدة: ${newCampaign.title}`,
          metadata: { campaignId: newCampaign.id, action: 'create_campaign' }
      });
      
      return newCampaign;
  },

  async updateCampaign(id: string, updates: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
      const campaigns = await this.getAllCampaigns();
      const index = campaigns.findIndex(c => c.id === id);
      
      if (index === -1) {
          throw new Error('Campaign not found');
      }
      
      const updatedCampaign = { ...campaigns[index], ...updates };
      campaigns[index] = updatedCampaign;
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      
      return updatedCampaign;
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<MarketingCampaign> {
      const campaign = await this.updateCampaign(id, { status });
      
      internalRecordActivity({
          userId: 'admin',
          userName: 'المدير',
          eventType: 'OTHER',
          description: `تم تحديث حالة الحملة "${campaign.title}" إلى ${status}`,
          metadata: { campaignId: id, status, action: 'update_campaign_status' }
      });
      
      return campaign;
  },

  async deleteCampaign(id: string): Promise<void> {
      const campaigns = await this.getAllCampaigns();
      const campaign = campaigns.find(c => c.id === id);
      const filtered = campaigns.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(filtered));
      
      if (campaign) {
          internalRecordActivity({
              userId: 'admin',
              userName: 'المدير',
              eventType: 'OTHER',
              description: `تم حذف الحملة التسويقية: ${campaign.title}`,
              metadata: { campaignId: id, action: 'delete_campaign' }
          });
      }
  },

  async dismissCampaignForUser(userId: string, campaignId: string): Promise<void> {
      try {
          const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]') as BusinessProfile[];
          const index = profiles.findIndex(p => p.userId === userId);
          
          if (index !== -1) {
              const dismissedIds = profiles[index].dismissedCampaignIds || [];
              if (!dismissedIds.includes(campaignId)) {
                  dismissedIds.push(campaignId);
                  profiles[index].dismissedCampaignIds = dismissedIds;
                  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
              }
          }
      } catch (error) {
          console.error('Error dismissing campaign:', error);
      }
  },

  async getDismissedCampaignIds(userId: string): Promise<string[]> {
      try {
          const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]') as BusinessProfile[];
          const profile = profiles.find(p => p.userId === userId);
          return profile?.dismissedCampaignIds || [];
      } catch (error) {
          console.error('Error getting dismissed campaigns:', error);
          return [];
      }
  },

  async getActiveCampaignsForUser(userId: string, customerType?: string): Promise<MarketingCampaign[]> {
      try {
          const allCampaigns = await this.getAllCampaigns();
          const dismissedIds = await this.getDismissedCampaignIds(userId);
          const now = new Date();
          
          return allCampaigns.filter(campaign => {
              // Filter by status
              if (campaign.status !== 'ACTIVE') return false;
              
              // Filter by dismissed
              if (dismissedIds.includes(campaign.id)) return false;
              
              // Filter by date range
              if (campaign.startsAt && new Date(campaign.startsAt) > now) return false;
              if (campaign.expiresAt && new Date(campaign.expiresAt) < now) return false;
              
              // Filter by audience type
              if (campaign.audienceType === 'ALL') return true;
              if (!customerType) return true;
              
              // Map customer type to audience type
              const audienceMap: Record<string, CampaignAudienceType> = {
                  'محل قطع غيار': 'SPARE_PARTS_SHOP',
                  'شركة تأجير سيارات': 'RENTAL_COMPANY',
                  'مركز صيانة': 'MAINTENANCE_CENTER',
                  'شركة تأمين': 'INSURANCE_COMPANY',
                  'مندوب مبيعات': 'SALES_REP'
              };
              
              const mappedType = audienceMap[customerType];
              return campaign.audienceType === mappedType;
          }).sort((a, b) => b.priority - a.priority);
      } catch (error) {
          console.error('Error getting active campaigns:', error);
          return [];
      }
  },

  // ============================================================
  // PRICING CENTER API (مركز التسعيرات)
  // ============================================================

  // --- Price Levels ---
  async getPriceLevels(): Promise<ConfigurablePriceLevel[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.PRICE_LEVELS);
          if (stored) {
              return JSON.parse(stored);
          }
          // Initialize with default base level
          const defaultLevel: ConfigurablePriceLevel = {
              id: 'L1',
              code: '1',
              name: 'المستوى 1 الافتراضي',
              description: 'المستوى الأساسي للتسعير',
              isBaseLevel: true,
              isActive: true,
              sortOrder: 1,
              color: '#2563eb',
              createdAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEYS.PRICE_LEVELS, JSON.stringify([defaultLevel]));
          return [defaultLevel];
      } catch (error) {
          console.error('Error getting price levels:', error);
          return [];
      }
  },

  async savePriceLevels(levels: ConfigurablePriceLevel[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.PRICE_LEVELS, JSON.stringify(levels));
          internalRecordActivity({
              userId: 'admin',
              userName: 'المدير',
              eventType: 'OTHER',
              description: 'تم تحديث مستويات التسعير',
              metadata: { action: 'update_price_levels', count: levels.length }
          });
      } catch (error) {
          console.error('Error saving price levels:', error);
          throw error;
      }
  },

  async addPriceLevel(level: Omit<ConfigurablePriceLevel, 'id' | 'createdAt'>): Promise<ConfigurablePriceLevel> {
      try {
          const levels = await this.getPriceLevels();
          const newLevel: ConfigurablePriceLevel = {
              ...level,
              id: `L${Date.now()}`,
              createdAt: new Date().toISOString()
          };
          levels.push(newLevel);
          await this.savePriceLevels(levels);
          return newLevel;
      } catch (error) {
          console.error('Error adding price level:', error);
          throw error;
      }
  },

  async updatePriceLevel(id: string, updates: Partial<ConfigurablePriceLevel>): Promise<ConfigurablePriceLevel | null> {
      try {
          const levels = await this.getPriceLevels();
          const index = levels.findIndex(l => l.id === id);
          if (index === -1) return null;
          
          levels[index] = { ...levels[index], ...updates, updatedAt: new Date().toISOString() };
          await this.savePriceLevels(levels);
          return levels[index];
      } catch (error) {
          console.error('Error updating price level:', error);
          throw error;
      }
  },

  async deletePriceLevel(id: string): Promise<boolean> {
      try {
          const levels = await this.getPriceLevels();
          const filtered = levels.filter(l => l.id !== id);
          if (filtered.length === levels.length) return false;
          await this.savePriceLevels(filtered);
          return true;
      } catch (error) {
          console.error('Error deleting price level:', error);
          return false;
      }
  },

  // --- Product Price Matrix ---
  async getProductPriceMatrix(): Promise<ProductPriceEntry[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.PRODUCT_PRICE_MATRIX);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting price matrix:', error);
          return [];
      }
  },

  async saveProductPriceMatrix(entries: ProductPriceEntry[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.PRODUCT_PRICE_MATRIX, JSON.stringify(entries));
          internalRecordActivity({
              userId: 'admin',
              userName: 'المدير',
              eventType: 'OTHER',
              description: 'تم تحديث مصفوفة الأسعار',
              metadata: { action: 'update_price_matrix', count: entries.length }
          });
      } catch (error) {
          console.error('Error saving price matrix:', error);
          throw error;
      }
  },

  async addProductPriceEntry(entry: Omit<ProductPriceEntry, 'id' | 'createdAt'>): Promise<ProductPriceEntry> {
      try {
          const matrix = await this.getProductPriceMatrix();
          const newEntry: ProductPriceEntry = {
              ...entry,
              id: `PE${Date.now()}`,
              createdAt: new Date().toISOString()
          };
          matrix.push(newEntry);
          await this.saveProductPriceMatrix(matrix);
          return newEntry;
      } catch (error) {
          console.error('Error adding price entry:', error);
          throw error;
      }
  },

  async updateProductPriceEntry(id: string, updates: Partial<ProductPriceEntry>): Promise<ProductPriceEntry | null> {
      try {
          const matrix = await this.getProductPriceMatrix();
          const index = matrix.findIndex(e => e.id === id);
          if (index === -1) return null;
          
          matrix[index] = { ...matrix[index], ...updates, updatedAt: new Date().toISOString() };
          await this.saveProductPriceMatrix(matrix);
          return matrix[index];
      } catch (error) {
          console.error('Error updating price entry:', error);
          throw error;
      }
  },

  async deleteProductPriceEntry(id: string): Promise<boolean> {
      try {
          const matrix = await this.getProductPriceMatrix();
          const filtered = matrix.filter(e => e.id !== id);
          if (filtered.length === matrix.length) return false;
          await this.saveProductPriceMatrix(filtered);
          return true;
      } catch (error) {
          console.error('Error deleting price entry:', error);
          return false;
      }
  },

  async getProductPriceForLevel(productId: string, levelId: string): Promise<number | null> {
      try {
          const matrix = await this.getProductPriceMatrix();
          const entry = matrix.find(e => e.productId === productId && e.priceLevelId === levelId);
          return entry ? entry.price : null;
      } catch (error) {
          console.error('Error getting product price for level:', error);
          return null;
      }
  },

  // --- Global Pricing Settings ---
  async getGlobalPricingSettings(): Promise<GlobalPricingSettings> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.GLOBAL_PRICING_SETTINGS);
          if (stored) {
              return JSON.parse(stored);
          }
          // Initialize with defaults
          const levels = await this.getPriceLevels();
          const defaultSettings: GlobalPricingSettings = {
              defaultPriceLevelId: levels.length > 0 ? levels[0].id : null,
              currency: 'SAR',
              currencySymbol: 'ر.س',
              roundingMode: 'ROUND',
              roundingDecimals: 2,
              pricePrecedenceOrder: ['CUSTOM_RULE', 'LEVEL_EXPLICIT', 'LEVEL_DERIVED'],
              allowNegativeDiscounts: false,
              allowFallbackToOtherLevels: true,
              fallbackLevelId: null,
              enableVolumeDiscounts: false,
              volumeDiscountRules: [],
              enableTimePromotions: false,
              timePromotions: [],
              showPriceBreakdown: false,
              taxRate: 15,
              taxIncluded: true
          };
          localStorage.setItem(STORAGE_KEYS.GLOBAL_PRICING_SETTINGS, JSON.stringify(defaultSettings));
          return defaultSettings;
      } catch (error) {
          console.error('Error getting global pricing settings:', error);
          // Return safe defaults
          return {
              defaultPriceLevelId: null,
              currency: 'SAR',
              currencySymbol: 'ر.س',
              roundingMode: 'ROUND',
              roundingDecimals: 2,
              pricePrecedenceOrder: ['CUSTOM_RULE', 'LEVEL_EXPLICIT', 'LEVEL_DERIVED'],
              allowNegativeDiscounts: false,
              allowFallbackToOtherLevels: true
          };
      }
  },

  async saveGlobalPricingSettings(settings: GlobalPricingSettings): Promise<void> {
      try {
          settings.lastModifiedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.GLOBAL_PRICING_SETTINGS, JSON.stringify(settings));
          internalRecordActivity({
              userId: 'admin',
              userName: 'المدير',
              eventType: 'OTHER',
              description: 'تم تحديث إعدادات التسعير العامة',
              metadata: { action: 'update_pricing_settings' }
          });
      } catch (error) {
          console.error('Error saving global pricing settings:', error);
          throw error;
      }
  },

  // --- Customer Pricing Profiles ---
  async getAllCustomerPricingProfiles(): Promise<CustomerPricingProfile[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PRICING_PROFILES);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting customer pricing profiles:', error);
          return [];
      }
  },

  async getCustomerPricingProfile(customerId: string): Promise<CustomerPricingProfile | null> {
      try {
          const profiles = await this.getAllCustomerPricingProfiles();
          return profiles.find(p => p.customerId === customerId) || null;
      } catch (error) {
          console.error('Error getting customer pricing profile:', error);
          return null;
      }
  },

  async upsertCustomerPricingProfile(profile: CustomerPricingProfile): Promise<void> {
      try {
          const profiles = await this.getAllCustomerPricingProfiles();
          const index = profiles.findIndex(p => p.customerId === profile.customerId);
          
          profile.lastModifiedAt = new Date().toISOString();
          
          if (index === -1) {
              profiles.push(profile);
          } else {
              profiles[index] = profile;
          }
          
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_PRICING_PROFILES, JSON.stringify(profiles));
          internalRecordActivity({
              userId: 'admin',
              userName: 'المدير',
              eventType: 'OTHER',
              description: `تم تحديث ملف تسعير العميل: ${profile.customerId}`,
              metadata: { action: 'upsert_customer_pricing', customerId: profile.customerId }
          });
      } catch (error) {
          console.error('Error upserting customer pricing profile:', error);
          throw error;
      }
  },

  async deleteCustomerPricingProfile(customerId: string): Promise<boolean> {
      try {
          const profiles = await this.getAllCustomerPricingProfiles();
          const filtered = profiles.filter(p => p.customerId !== customerId);
          if (filtered.length === profiles.length) return false;
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_PRICING_PROFILES, JSON.stringify(filtered));
          return true;
      } catch (error) {
          console.error('Error deleting customer pricing profile:', error);
          return false;
      }
  },

  async copyCustomerPricingProfile(fromCustomerId: string, toCustomerId: string): Promise<boolean> {
      try {
          const sourceProfile = await this.getCustomerPricingProfile(fromCustomerId);
          if (!sourceProfile) return false;
          
          const newProfile: CustomerPricingProfile = {
              ...sourceProfile,
              customerId: toCustomerId,
              lastModifiedAt: new Date().toISOString(),
              notes: `نُسخ من العميل ${fromCustomerId}`
          };
          
          await this.upsertCustomerPricingProfile(newProfile);
          return true;
      } catch (error) {
          console.error('Error copying customer pricing profile:', error);
          return false;
      }
  },

  // --- Pricing Audit Log ---
  async getPricingAuditLog(): Promise<PricingAuditLogEntry[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.PRICING_AUDIT_LOG);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting pricing audit log:', error);
          return [];
      }
  },

  async addPricingAuditEntry(entry: Omit<PricingAuditLogEntry, 'id' | 'changedAt'>): Promise<void> {
      try {
          const logs = await this.getPricingAuditLog();
          const newEntry: PricingAuditLogEntry = {
              ...entry,
              id: `PAL${Date.now()}`,
              changedAt: new Date().toISOString()
          };
          logs.unshift(newEntry);
          // Keep only last 500 entries
          if (logs.length > 500) logs.length = 500;
          localStorage.setItem(STORAGE_KEYS.PRICING_AUDIT_LOG, JSON.stringify(logs));
      } catch (error) {
          console.error('Error adding pricing audit entry:', error);
      }
  },

  // --- Bulk Operations ---
  async bulkImportPriceMatrix(entries: Array<{ productId: string; priceLevelId: string; price: number }>): Promise<{ imported: number; updated: number; errors: string[] }> {
      try {
          const matrix = await this.getProductPriceMatrix();
          let imported = 0;
          let updated = 0;
          const errors: string[] = [];
          
          for (const entry of entries) {
              if (!entry.productId || !entry.priceLevelId || typeof entry.price !== 'number') {
                  errors.push(`بيانات غير صالحة: ${JSON.stringify(entry)}`);
                  continue;
              }
              
              const existingIndex = matrix.findIndex(
                  e => e.productId === entry.productId && e.priceLevelId === entry.priceLevelId
              );
              
              if (existingIndex !== -1) {
                  matrix[existingIndex].price = entry.price;
                  matrix[existingIndex].updatedAt = new Date().toISOString();
                  updated++;
              } else {
                  matrix.push({
                      id: `PE${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                      productId: entry.productId,
                      priceLevelId: entry.priceLevelId,
                      price: entry.price,
                      createdAt: new Date().toISOString()
                  });
                  imported++;
              }
          }
          
          await this.saveProductPriceMatrix(matrix);
          return { imported, updated, errors };
      } catch (error) {
          console.error('Error bulk importing price matrix:', error);
          throw error;
      }
  },

  async exportPriceMatrixForLevel(levelId: string): Promise<Array<{ productId: string; productName: string; partNumber: string; price: number }>> {
      try {
          const matrix = await this.getProductPriceMatrix();
          const products = await this.searchProducts('');
          
          const levelEntries = matrix.filter(e => e.priceLevelId === levelId);
          
          return levelEntries.map(entry => {
              const product = products.find(p => p.id === entry.productId);
              return {
                  productId: entry.productId,
                  productName: product?.name || 'غير معروف',
                  partNumber: product?.partNumber || '',
                  price: entry.price
              };
          });
      } catch (error) {
          console.error('Error exporting price matrix:', error);
          return [];
      }
  },

  // ============================================================
  // TRADER TOOLS SYSTEM
  // ============================================================

  // Default Tool Configs
  getDefaultToolConfigs(): ToolConfig[] {
      return [
          {
              toolKey: 'PDF_TO_EXCEL',
              enabled: true,
              allowedCustomerTypes: ['PARTS_SHOP', 'RENTAL_COMPANY', 'INSURANCE_COMPANY', 'SALES_AGENT', 'FLEET_CUSTOMER', 'محل قطع غيار', 'شركة تأجير سيارات', 'شركة تأمين', 'وكيل مبيعات', 'عميل أسطول'],
              blockedCustomerIds: [],
              maxFilesPerDay: 10,
              maxFilesPerMonth: 100,
              logUsageForAnalytics: true,
              showInDashboardShortcuts: true,
              toolNameAr: 'تحويل PDF إلى Excel',
              toolNameEn: 'PDF to Excel Converter',
              descriptionAr: 'تحويل ملفات PDF لقوائم الأسعار إلى جداول Excel قابلة للتعديل',
              descriptionEn: 'Convert PDF price lists to editable Excel spreadsheets',
              iconName: 'FileSpreadsheet',
              sortOrder: 1
          },
          {
              toolKey: 'VIN_EXTRACTOR',
              enabled: true,
              allowedCustomerTypes: ['PARTS_SHOP', 'RENTAL_COMPANY', 'INSURANCE_COMPANY', 'MAINTENANCE_CENTER', 'محل قطع غيار', 'شركة تأجير سيارات', 'شركة تأمين', 'مركز صيانة'],
              blockedCustomerIds: [],
              maxFilesPerDay: 20,
              maxFilesPerMonth: 200,
              logUsageForAnalytics: true,
              showInDashboardShortcuts: true,
              toolNameAr: 'استخراج رقم الشاصي',
              toolNameEn: 'VIN Extractor',
              descriptionAr: 'استخراج رقم الشاصي (VIN) من صور السيارة أو المستندات',
              descriptionEn: 'Extract VIN numbers from car images or documents',
              iconName: 'Car',
              sortOrder: 2
          },
          {
              toolKey: 'PRICE_COMPARISON',
              enabled: true,
              allowedCustomerTypes: ['PARTS_SHOP', 'RENTAL_COMPANY', 'INSURANCE_COMPANY', 'SALES_AGENT', 'محل قطع غيار', 'شركة تأجير سيارات', 'شركة تأمين', 'وكيل مبيعات'],
              blockedCustomerIds: [],
              maxFilesPerDay: 5,
              maxFilesPerMonth: 50,
              logUsageForAnalytics: true,
              showInDashboardShortcuts: true,
              toolNameAr: 'مقارنة الأسعار',
              toolNameEn: 'Price Comparison',
              descriptionAr: 'مقارنة أسعار الموردين واختيار أفضل العروض',
              descriptionEn: 'Compare supplier prices and find the best deals',
              iconName: 'Scale',
              sortOrder: 3
          }
      ];
  },

  async getToolConfigs(): Promise<ToolConfig[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.TOOL_CONFIGS);
          if (!stored) {
              const defaults = this.getDefaultToolConfigs();
              localStorage.setItem(STORAGE_KEYS.TOOL_CONFIGS, JSON.stringify(defaults));
              return defaults;
          }
          return JSON.parse(stored);
      } catch (error) {
          console.error('Error getting tool configs:', error);
          return this.getDefaultToolConfigs();
      }
  },

  async saveToolConfigs(configs: ToolConfig[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.TOOL_CONFIGS, JSON.stringify(configs));
      } catch (error) {
          console.error('Error saving tool configs:', error);
      }
  },

  async getToolConfig(toolKey: ToolKey): Promise<ToolConfig | null> {
      const configs = await this.getToolConfigs();
      return configs.find(c => c.toolKey === toolKey) || null;
  },

  async updateToolConfig(toolKey: ToolKey, updates: Partial<ToolConfig>): Promise<void> {
      const configs = await this.getToolConfigs();
      const index = configs.findIndex(c => c.toolKey === toolKey);
      if (index !== -1) {
          configs[index] = { ...configs[index], ...updates };
          await this.saveToolConfigs(configs);
      }
  },

  // Customer Tools Override
  async getCustomerToolsOverrides(): Promise<CustomerToolsOverride[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOOLS_OVERRIDES);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting customer tools overrides:', error);
          return [];
      }
  },

  async getCustomerToolsOverride(customerId: string): Promise<CustomerToolsOverride | null> {
      const overrides = await this.getCustomerToolsOverrides();
      return overrides.find(o => o.customerId === customerId) || null;
  },

  async saveCustomerToolsOverride(override: CustomerToolsOverride): Promise<void> {
      try {
          const overrides = await this.getCustomerToolsOverrides();
          const index = overrides.findIndex(o => o.customerId === override.customerId);
          if (index !== -1) {
              overrides[index] = { ...override, updatedAt: new Date().toISOString() };
          } else {
              overrides.push({ ...override, updatedAt: new Date().toISOString() });
          }
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOOLS_OVERRIDES, JSON.stringify(overrides));
      } catch (error) {
          console.error('Error saving customer tools override:', error);
      }
  },

  async deleteCustomerToolsOverride(customerId: string): Promise<void> {
      try {
          const overrides = await this.getCustomerToolsOverrides();
          const filtered = overrides.filter(o => o.customerId !== customerId);
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOOLS_OVERRIDES, JSON.stringify(filtered));
      } catch (error) {
          console.error('Error deleting customer tools override:', error);
      }
  },

  // Tool Usage Records
  async getToolUsageRecords(customerId?: string, toolKey?: ToolKey): Promise<ToolUsageRecord[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.TOOL_USAGE_RECORDS);
          let records: ToolUsageRecord[] = stored ? JSON.parse(stored) : [];
          if (customerId) records = records.filter(r => r.customerId === customerId);
          if (toolKey) records = records.filter(r => r.toolKey === toolKey);
          return records.sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
      } catch (error) {
          console.error('Error getting tool usage records:', error);
          return [];
      }
  },

  async addToolUsageRecord(record: Omit<ToolUsageRecord, 'id'>): Promise<ToolUsageRecord> {
      try {
          const records = await this.getToolUsageRecords();
          const newRecord: ToolUsageRecord = {
              ...record,
              id: `TU${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          };
          records.unshift(newRecord);
          if (records.length > 1000) records.length = 1000;
          localStorage.setItem(STORAGE_KEYS.TOOL_USAGE_RECORDS, JSON.stringify(records));
          return newRecord;
      } catch (error) {
          console.error('Error adding tool usage record:', error);
          throw error;
      }
  },

  async getCustomerToolUsageToday(customerId: string, toolKey: ToolKey): Promise<number> {
      const today = new Date().toISOString().split('T')[0];
      const records = await this.getToolUsageRecords(customerId, toolKey);
      return records.filter(r => r.usedAt.startsWith(today) && r.success).length;
  },

  async getCustomerToolUsageThisMonth(customerId: string, toolKey: ToolKey): Promise<number> {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const records = await this.getToolUsageRecords(customerId, toolKey);
      return records.filter(r => r.usedAt.startsWith(thisMonth) && r.success).length;
  },

  // Supplier Price Records (PDF to Excel results)
  async getSupplierPriceRecords(ownerCustomerId?: string): Promise<SupplierPriceRecord[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PRICE_RECORDS);
          let records: SupplierPriceRecord[] = stored ? JSON.parse(stored) : [];
          if (ownerCustomerId) records = records.filter(r => r.ownerCustomerId === ownerCustomerId);
          return records.sort((a, b) => new Date(b.parsedAt).getTime() - new Date(a.parsedAt).getTime());
      } catch (error) {
          console.error('Error getting supplier price records:', error);
          return [];
      }
  },

  async saveSupplierPriceRecord(record: SupplierPriceRecord): Promise<void> {
      try {
          const records = await this.getSupplierPriceRecords();
          const index = records.findIndex(r => r.id === record.id);
          if (index !== -1) {
              records[index] = record;
          } else {
              records.unshift(record);
          }
          localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRICE_RECORDS, JSON.stringify(records));
      } catch (error) {
          console.error('Error saving supplier price record:', error);
      }
  },

  async deleteSupplierPriceRecord(id: string): Promise<void> {
      try {
          const records = await this.getSupplierPriceRecords();
          const filtered = records.filter(r => r.id !== id);
          localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRICE_RECORDS, JSON.stringify(filtered));
      } catch (error) {
          console.error('Error deleting supplier price record:', error);
      }
  },

  // VIN Extraction Records
  async getVinExtractionRecords(ownerCustomerId?: string): Promise<VinExtractionRecord[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.VIN_EXTRACTIONS);
          let records: VinExtractionRecord[] = stored ? JSON.parse(stored) : [];
          if (ownerCustomerId) records = records.filter(r => r.ownerCustomerId === ownerCustomerId);
          return records.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      } catch (error) {
          console.error('Error getting VIN extraction records:', error);
          return [];
      }
  },

  async saveVinExtractionRecord(record: VinExtractionRecord): Promise<void> {
      try {
          const records = await this.getVinExtractionRecords();
          const index = records.findIndex(r => r.id === record.id);
          if (index !== -1) {
              records[index] = record;
          } else {
              records.unshift(record);
          }
          localStorage.setItem(STORAGE_KEYS.VIN_EXTRACTIONS, JSON.stringify(records));
      } catch (error) {
          console.error('Error saving VIN extraction record:', error);
      }
  },

  async deleteVinExtractionRecord(id: string): Promise<void> {
      try {
          const records = await this.getVinExtractionRecords();
          const filtered = records.filter(r => r.id !== id);
          localStorage.setItem(STORAGE_KEYS.VIN_EXTRACTIONS, JSON.stringify(filtered));
      } catch (error) {
          console.error('Error deleting VIN extraction record:', error);
      }
  },

  // Price Comparison Sessions
  async getPriceComparisonSessions(ownerCustomerId?: string): Promise<PriceComparisonSession[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.PRICE_COMPARISON_SESSIONS);
          let sessions: PriceComparisonSession[] = stored ? JSON.parse(stored) : [];
          if (ownerCustomerId) sessions = sessions.filter(s => s.ownerCustomerId === ownerCustomerId);
          return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (error) {
          console.error('Error getting price comparison sessions:', error);
          return [];
      }
  },

  async savePriceComparisonSession(session: PriceComparisonSession): Promise<void> {
      try {
          const sessions = await this.getPriceComparisonSessions();
          const index = sessions.findIndex(s => s.id === session.id);
          if (index !== -1) {
              sessions[index] = session;
          } else {
              sessions.unshift(session);
          }
          localStorage.setItem(STORAGE_KEYS.PRICE_COMPARISON_SESSIONS, JSON.stringify(sessions));
      } catch (error) {
          console.error('Error saving price comparison session:', error);
      }
  },

  async deletePriceComparisonSession(id: string): Promise<void> {
      try {
          const sessions = await this.getPriceComparisonSessions();
          const filtered = sessions.filter(s => s.id !== id);
          localStorage.setItem(STORAGE_KEYS.PRICE_COMPARISON_SESSIONS, JSON.stringify(filtered));
      } catch (error) {
          console.error('Error deleting price comparison session:', error);
      }
  },

  // ============================================================
  // SUPPLIER MARKETPLACE SYSTEM
  // ============================================================

  getDefaultSupplierMarketplaceSettings(): SupplierMarketplaceSettings {
      return {
          enabled: false,
          selectionMode: 'SINI_FIRST_THEN_SUPPLIERS',
          hideRealSupplierFromCustomer: true,
          supplierPriorities: [],
          defaultMarkupPercent: 15,
          minProfitMargin: 5,
          maxLeadTimeDays: 14,
          autoApproveSupplierItems: false,
          showSupplierStockLevel: false,
          enableSupplierRating: false,
          notifyAdminOnNewSupplierItem: true
      };
  },

  async getSupplierMarketplaceSettings(): Promise<SupplierMarketplaceSettings> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIER_MARKETPLACE_SETTINGS);
          if (!stored) {
              const defaults = this.getDefaultSupplierMarketplaceSettings();
              localStorage.setItem(STORAGE_KEYS.SUPPLIER_MARKETPLACE_SETTINGS, JSON.stringify(defaults));
              return defaults;
          }
          return JSON.parse(stored);
      } catch (error) {
          console.error('Error getting supplier marketplace settings:', error);
          return this.getDefaultSupplierMarketplaceSettings();
      }
  },

  async saveSupplierMarketplaceSettings(settings: SupplierMarketplaceSettings): Promise<void> {
      try {
          settings.lastModifiedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.SUPPLIER_MARKETPLACE_SETTINGS, JSON.stringify(settings));
      } catch (error) {
          console.error('Error saving supplier marketplace settings:', error);
      }
  },

  // Supplier Catalog Items
  async getSupplierCatalogItems(supplierId?: string): Promise<SupplierCatalogItem[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIER_CATALOG_ITEMS);
          let items: SupplierCatalogItem[] = stored ? JSON.parse(stored) : [];
          if (supplierId) items = items.filter(i => i.supplierId === supplierId);
          return items;
      } catch (error) {
          console.error('Error getting supplier catalog items:', error);
          return [];
      }
  },

  async saveSupplierCatalogItems(items: SupplierCatalogItem[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.SUPPLIER_CATALOG_ITEMS, JSON.stringify(items));
      } catch (error) {
          console.error('Error saving supplier catalog items:', error);
      }
  },

  async addSupplierCatalogItem(item: Omit<SupplierCatalogItem, 'id' | 'lastUpdatedAt'>): Promise<SupplierCatalogItem> {
      try {
          const items = await this.getSupplierCatalogItems();
          const newItem: SupplierCatalogItem = {
              ...item,
              id: `SCI${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              lastUpdatedAt: new Date().toISOString(),
              isActive: item.isActive ?? true
          };
          items.push(newItem);
          await this.saveSupplierCatalogItems(items);
          return newItem;
      } catch (error) {
          console.error('Error adding supplier catalog item:', error);
          throw error;
      }
  },

  async updateSupplierCatalogItem(id: string, updates: Partial<SupplierCatalogItem>): Promise<void> {
      try {
          const items = await this.getSupplierCatalogItems();
          const index = items.findIndex(i => i.id === id);
          if (index !== -1) {
              items[index] = { ...items[index], ...updates, lastUpdatedAt: new Date().toISOString() };
              await this.saveSupplierCatalogItems(items);
          }
      } catch (error) {
          console.error('Error updating supplier catalog item:', error);
      }
  },

  async deleteSupplierCatalogItem(id: string): Promise<void> {
      try {
          const items = await this.getSupplierCatalogItems();
          const filtered = items.filter(i => i.id !== id);
          await this.saveSupplierCatalogItems(filtered);
      } catch (error) {
          console.error('Error deleting supplier catalog item:', error);
      }
  },

  async searchSupplierCatalog(partNumber: string): Promise<SupplierCatalogItem[]> {
      const items = await this.getSupplierCatalogItems();
      const normalizedSearch = partNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return items.filter(item => {
          if (!item.isActive) return false;
          const normalizedPart = item.partNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
          const normalizedOem = (item.oemNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
          return normalizedPart.includes(normalizedSearch) || normalizedOem.includes(normalizedSearch);
      });
  },

  // Supplier Profiles
  async getSupplierProfiles(): Promise<SupplierProfile[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PROFILES);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting supplier profiles:', error);
          return [];
      }
  },

  async getSupplierProfile(supplierId: string): Promise<SupplierProfile | null> {
      const profiles = await this.getSupplierProfiles();
      return profiles.find(p => p.supplierId === supplierId) || null;
  },

  async saveSupplierProfile(profile: SupplierProfile): Promise<void> {
      try {
          const profiles = await this.getSupplierProfiles();
          const index = profiles.findIndex(p => p.supplierId === profile.supplierId);
          if (index !== -1) {
              profiles[index] = profile;
          } else {
              profiles.push(profile);
          }
          localStorage.setItem(STORAGE_KEYS.SUPPLIER_PROFILES, JSON.stringify(profiles));
      } catch (error) {
          console.error('Error saving supplier profile:', error);
      }
  },

  // ============================================================
  // MARKETER / AFFILIATE SYSTEM
  // ============================================================

  getDefaultMarketerSettings(): MarketerSettings {
      return {
          enabled: false,
          attributionWindowDays: 90,
          defaultCommissionType: 'PERCENT',
          defaultCommissionValue: 2,
          multiAttributionMode: 'SINGLE',
          marketerCanViewCustomerNames: false,
          marketerCanViewOrderTotals: false,
          marketerCanViewOrderDetails: false,
          marketerCanExportData: false,
          autoApproveCommissions: false,
          autoApproveThreshold: 100,
          minPayoutAmount: 500,
          paymentCycleDays: 30,
          enableTierCommissions: false,
          enableCategoryCommissions: false,
          showReferralBanner: false,
          notifyMarketerOnReferral: true,
          notifyMarketerOnCommission: true,
          notifyAdminOnNewMarketer: true,
          requireMarketerApproval: true,
          allowSelfRegistration: false
      };
  },

  async getMarketerSettings(): Promise<MarketerSettings> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.MARKETER_SETTINGS);
          if (!stored) {
              const defaults = this.getDefaultMarketerSettings();
              localStorage.setItem(STORAGE_KEYS.MARKETER_SETTINGS, JSON.stringify(defaults));
              return defaults;
          }
          return JSON.parse(stored);
      } catch (error) {
          console.error('Error getting marketer settings:', error);
          return this.getDefaultMarketerSettings();
      }
  },

  async saveMarketerSettings(settings: MarketerSettings): Promise<void> {
      try {
          settings.lastModifiedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.MARKETER_SETTINGS, JSON.stringify(settings));
      } catch (error) {
          console.error('Error saving marketer settings:', error);
      }
  },

  // Marketers
  async getMarketers(): Promise<Marketer[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.MARKETERS);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting marketers:', error);
          return [];
      }
  },

  async saveMarketers(marketers: Marketer[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.MARKETERS, JSON.stringify(marketers));
      } catch (error) {
          console.error('Error saving marketers:', error);
      }
  },

  async getMarketer(id: string): Promise<Marketer | null> {
      const marketers = await this.getMarketers();
      return marketers.find(m => m.id === id) || null;
  },

  async getMarketerByReferralCode(code: string): Promise<Marketer | null> {
      const marketers = await this.getMarketers();
      return marketers.find(m => m.referralCode.toUpperCase() === code.toUpperCase()) || null;
  },

  async addMarketer(marketer: Omit<Marketer, 'id' | 'createdAt' | 'referralCode' | 'referralUrl'>): Promise<Marketer> {
      try {
          const marketers = await this.getMarketers();
          const referralCode = `${marketer.name.substring(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase().slice(-4)}`;
          const baseUrl = window.location.origin;
          const newMarketer: Marketer = {
              ...marketer,
              id: `MKT${Date.now()}`,
              referralCode,
              referralUrl: `${baseUrl}/?ref=${referralCode}`,
              createdAt: new Date().toISOString(),
              totalReferrals: 0,
              totalEarnings: 0,
              pendingEarnings: 0,
              paidEarnings: 0
          };
          marketers.push(newMarketer);
          await this.saveMarketers(marketers);
          return newMarketer;
      } catch (error) {
          console.error('Error adding marketer:', error);
          throw error;
      }
  },

  async updateMarketer(id: string, updates: Partial<Marketer>): Promise<void> {
      try {
          const marketers = await this.getMarketers();
          const index = marketers.findIndex(m => m.id === id);
          if (index !== -1) {
              marketers[index] = { ...marketers[index], ...updates };
              await this.saveMarketers(marketers);
          }
      } catch (error) {
          console.error('Error updating marketer:', error);
      }
  },

  async deleteMarketer(id: string): Promise<void> {
      try {
          const marketers = await this.getMarketers();
          const filtered = marketers.filter(m => m.id !== id);
          await this.saveMarketers(filtered);
      } catch (error) {
          console.error('Error deleting marketer:', error);
      }
  },

  // Customer Referrals
  async getCustomerReferrals(): Promise<CustomerReferral[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER_REFERRALS);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting customer referrals:', error);
          return [];
      }
  },

  async getCustomerReferralsByCustomerId(customerId: string): Promise<CustomerReferral[]> {
      const referrals = await this.getCustomerReferrals();
      return referrals.filter(r => r.customerId === customerId);
  },

  async getCustomerReferralsByMarketerId(marketerId: string): Promise<CustomerReferral[]> {
      const referrals = await this.getCustomerReferrals();
      return referrals.filter(r => r.marketerId === marketerId);
  },

  async addCustomerReferral(referral: CustomerReferral): Promise<void> {
      try {
          const referrals = await this.getCustomerReferrals();
          referrals.push(referral);
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_REFERRALS, JSON.stringify(referrals));
          
          // Update marketer stats
          const marketers = await this.getMarketers();
          const marketerIndex = marketers.findIndex(m => m.id === referral.marketerId);
          if (marketerIndex !== -1) {
              marketers[marketerIndex].totalReferrals = (marketers[marketerIndex].totalReferrals || 0) + 1;
              await this.saveMarketers(marketers);
          }
      } catch (error) {
          console.error('Error adding customer referral:', error);
      }
  },

  async getActiveReferralForCustomer(customerId: string): Promise<CustomerReferral | null> {
      const referrals = await this.getCustomerReferralsByCustomerId(customerId);
      const now = new Date();
      return referrals.find(r => r.isActive && new Date(r.attributionExpiresAt) > now) || null;
  },

  // Marketer Commissions
  async getMarketerCommissions(): Promise<MarketerCommissionEntry[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.MARKETER_COMMISSIONS);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting marketer commissions:', error);
          return [];
      }
  },

  async getMarketerCommissionsByMarketerId(marketerId: string): Promise<MarketerCommissionEntry[]> {
      const commissions = await this.getMarketerCommissions();
      return commissions.filter(c => c.marketerId === marketerId)
          .sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime());
  },

  async addMarketerCommissionEntry(entry: Omit<MarketerCommissionEntry, 'id' | 'calculatedAt'>): Promise<MarketerCommissionEntry> {
      try {
          const commissions = await this.getMarketerCommissions();
          const newEntry: MarketerCommissionEntry = {
              ...entry,
              id: `COM${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              calculatedAt: new Date().toISOString()
          };
          commissions.push(newEntry);
          localStorage.setItem(STORAGE_KEYS.MARKETER_COMMISSIONS, JSON.stringify(commissions));
          
          // Update marketer earnings
          const marketers = await this.getMarketers();
          const marketerIndex = marketers.findIndex(m => m.id === entry.marketerId);
          if (marketerIndex !== -1) {
              marketers[marketerIndex].totalEarnings = (marketers[marketerIndex].totalEarnings || 0) + entry.commissionAmount;
              marketers[marketerIndex].pendingEarnings = (marketers[marketerIndex].pendingEarnings || 0) + entry.commissionAmount;
              await this.saveMarketers(marketers);
          }
          
          return newEntry;
      } catch (error) {
          console.error('Error adding marketer commission entry:', error);
          throw error;
      }
  },

  async updateMarketerCommissionStatus(id: string, status: CommissionStatus, approvedBy?: string, paidBy?: string, paymentReference?: string): Promise<void> {
      try {
          const commissions = await this.getMarketerCommissions();
          const index = commissions.findIndex(c => c.id === id);
          if (index !== -1) {
              const commission = commissions[index];
              const previousStatus = commission.status;
              commission.status = status;
              
              if (status === 'APPROVED') {
                  commission.approvedAt = new Date().toISOString();
                  commission.approvedBy = approvedBy;
              } else if (status === 'PAID') {
                  commission.paidAt = new Date().toISOString();
                  commission.paidBy = paidBy;
                  commission.paymentReference = paymentReference;
                  
                  // Update marketer paid/pending earnings
                  const marketers = await this.getMarketers();
                  const marketerIndex = marketers.findIndex(m => m.id === commission.marketerId);
                  if (marketerIndex !== -1) {
                      marketers[marketerIndex].pendingEarnings = (marketers[marketerIndex].pendingEarnings || 0) - commission.commissionAmount;
                      marketers[marketerIndex].paidEarnings = (marketers[marketerIndex].paidEarnings || 0) + commission.commissionAmount;
                      marketers[marketerIndex].lastPaymentDate = new Date().toISOString();
                      await this.saveMarketers(marketers);
                  }
              }
              
              localStorage.setItem(STORAGE_KEYS.MARKETER_COMMISSIONS, JSON.stringify(commissions));
          }
      } catch (error) {
          console.error('Error updating marketer commission status:', error);
      }
  },

  // Calculate commission for an order
  async calculateOrderCommission(orderId: string, customerId: string, orderTotal: number): Promise<MarketerCommissionEntry | null> {
      try {
          const settings = await this.getMarketerSettings();
          if (!settings.enabled) return null;
          
          const referral = await this.getActiveReferralForCustomer(customerId);
          if (!referral) return null;
          
          const marketer = await this.getMarketer(referral.marketerId);
          if (!marketer || !marketer.active) return null;
          
          const commissionType = marketer.commissionType || settings.defaultCommissionType;
          const commissionValue = marketer.commissionValue || settings.defaultCommissionValue;
          
          let commissionAmount: number;
          if (commissionType === 'PERCENT') {
              commissionAmount = orderTotal * (commissionValue / 100);
          } else {
              commissionAmount = commissionValue;
          }
          
          const entry = await this.addMarketerCommissionEntry({
              marketerId: marketer.id,
              customerId,
              orderId,
              orderTotal,
              commissionAmount,
              commissionType,
              commissionRate: commissionValue,
              status: settings.autoApproveCommissions && commissionAmount <= (settings.autoApproveThreshold || 100) ? 'APPROVED' : 'PENDING'
          });
          
          return entry;
      } catch (error) {
          console.error('Error calculating order commission:', error);
          return null;
      }
  },

  // ============================================================
  // ADVERTISING SYSTEM
  // ============================================================

  // Default Ad Slots
  getDefaultAdSlots(): AdSlot[] {
      const now = new Date().toISOString();
      return [
          {
              id: 'slot-home-top',
              slotKey: 'HOME_TOP_BANNER',
              nameAr: 'بانر الصفحة الرئيسية العلوي',
              nameEn: 'Home Top Banner',
              descriptionAr: 'بانر إعلاني في أعلى الصفحة الرئيسية',
              descriptionEn: 'Ad banner at the top of the home page',
              isEnabled: true,
              maxAds: 3,
              selectionMode: 'rotate',
              createdAt: now,
              updatedAt: now
          },
          {
              id: 'slot-dashboard-sidebar',
              slotKey: 'CUSTOMER_DASHBOARD_SIDEBAR',
              nameAr: 'الشريط الجانبي لوحة العميل',
              nameEn: 'Customer Dashboard Sidebar',
              descriptionAr: 'إعلانات في الشريط الجانبي للوحة تحكم العميل',
              descriptionEn: 'Ads in the customer dashboard sidebar',
              isEnabled: true,
              maxAds: 2,
              selectionMode: 'by_priority',
              createdAt: now,
              updatedAt: now
          },
          {
              id: 'slot-tools-banner',
              slotKey: 'TOOLS_PAGE_BANNER',
              nameAr: 'بانر صفحة الأدوات',
              nameEn: 'Tools Page Banner',
              descriptionAr: 'بانر إعلاني في صفحة أدوات التاجر',
              descriptionEn: 'Ad banner on the trader tools page',
              isEnabled: true,
              maxAds: 1,
              selectionMode: 'by_priority',
              createdAt: now,
              updatedAt: now
          },
          {
              id: 'slot-products-card',
              slotKey: 'PRODUCTS_PAGE_CARD',
              nameAr: 'بطاقة صفحة المنتجات',
              nameEn: 'Products Page Card',
              descriptionAr: 'بطاقة إعلانية تظهر ضمن نتائج البحث عن المنتجات',
              descriptionEn: 'Ad card appearing within product search results',
              isEnabled: true,
              maxAds: 2,
              selectionMode: 'random',
              createdAt: now,
              updatedAt: now
          }
      ];
  },

  // --- Advertisers CRUD ---
  async getAdvertisers(): Promise<Advertiser[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.ADVERTISERS);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting advertisers:', error);
          return [];
      }
  },

  async saveAdvertisers(advertisers: Advertiser[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.ADVERTISERS, JSON.stringify(advertisers));
      } catch (error) {
          console.error('Error saving advertisers:', error);
      }
  },

  async getAdvertiserById(id: string): Promise<Advertiser | null> {
      const advertisers = await this.getAdvertisers();
      return advertisers.find(a => a.id === id) || null;
  },

  async createAdvertiser(data: Omit<Advertiser, 'id' | 'createdAt' | 'updatedAt'>): Promise<Advertiser> {
      const advertisers = await this.getAdvertisers();
      const now = new Date().toISOString();
      const newAdvertiser: Advertiser = {
          ...data,
          id: `adv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now
      };
      advertisers.push(newAdvertiser);
      await this.saveAdvertisers(advertisers);
      return newAdvertiser;
  },

  async updateAdvertiser(id: string, updates: Partial<Advertiser>): Promise<Advertiser | null> {
      const advertisers = await this.getAdvertisers();
      const index = advertisers.findIndex(a => a.id === id);
      if (index === -1) return null;
      
      advertisers[index] = {
          ...advertisers[index],
          ...updates,
          updatedAt: new Date().toISOString()
      };
      await this.saveAdvertisers(advertisers);
      return advertisers[index];
  },

  async deleteAdvertiser(id: string): Promise<boolean> {
      const advertisers = await this.getAdvertisers();
      const index = advertisers.findIndex(a => a.id === id);
      if (index === -1) return false;
      
      advertisers.splice(index, 1);
      await this.saveAdvertisers(advertisers);
      return true;
  },

  // --- Ad Campaigns CRUD ---
  async getAdCampaigns(): Promise<AdCampaign[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.AD_CAMPAIGNS);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting ad campaigns:', error);
          return [];
      }
  },

  async saveAdCampaigns(campaigns: AdCampaign[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.AD_CAMPAIGNS, JSON.stringify(campaigns));
      } catch (error) {
          console.error('Error saving ad campaigns:', error);
      }
  },

  async getAdCampaignById(id: string): Promise<AdCampaign | null> {
      const campaigns = await this.getAdCampaigns();
      return campaigns.find(c => c.id === id) || null;
  },

  async createAdCampaign(data: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt' | 'currentViews' | 'currentClicks'>): Promise<AdCampaign> {
      const campaigns = await this.getAdCampaigns();
      const now = new Date().toISOString();
      const newCampaign: AdCampaign = {
          ...data,
          id: `camp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          currentViews: 0,
          currentClicks: 0,
          createdAt: now,
          updatedAt: now
      };
      campaigns.push(newCampaign);
      await this.saveAdCampaigns(campaigns);
      return newCampaign;
  },

  async updateAdCampaign(id: string, updates: Partial<AdCampaign>): Promise<AdCampaign | null> {
      const campaigns = await this.getAdCampaigns();
      const index = campaigns.findIndex(c => c.id === id);
      if (index === -1) return null;
      
      campaigns[index] = {
          ...campaigns[index],
          ...updates,
          updatedAt: new Date().toISOString()
      };
      await this.saveAdCampaigns(campaigns);
      return campaigns[index];
  },

  async deleteAdCampaign(id: string): Promise<boolean> {
      const campaigns = await this.getAdCampaigns();
      const index = campaigns.findIndex(c => c.id === id);
      if (index === -1) return false;
      
      campaigns.splice(index, 1);
      await this.saveAdCampaigns(campaigns);
      return true;
  },

  // --- Ad Slots CRUD ---
  async getAdSlots(): Promise<AdSlot[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.AD_SLOTS);
          if (!stored) {
              const defaults = this.getDefaultAdSlots();
              localStorage.setItem(STORAGE_KEYS.AD_SLOTS, JSON.stringify(defaults));
              return defaults;
          }
          return JSON.parse(stored);
      } catch (error) {
          console.error('Error getting ad slots:', error);
          return this.getDefaultAdSlots();
      }
  },

  async saveAdSlots(slots: AdSlot[]): Promise<void> {
      try {
          localStorage.setItem(STORAGE_KEYS.AD_SLOTS, JSON.stringify(slots));
      } catch (error) {
          console.error('Error saving ad slots:', error);
      }
  },

  async getAdSlotByKey(slotKey: string): Promise<AdSlot | null> {
      const slots = await this.getAdSlots();
      return slots.find(s => s.slotKey === slotKey) || null;
  },

  async createAdSlot(data: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdSlot> {
      const slots = await this.getAdSlots();
      const now = new Date().toISOString();
      const newSlot: AdSlot = {
          ...data,
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now
      };
      slots.push(newSlot);
      await this.saveAdSlots(slots);
      return newSlot;
  },

  async updateAdSlot(id: string, updates: Partial<AdSlot>): Promise<AdSlot | null> {
      const slots = await this.getAdSlots();
      const index = slots.findIndex(s => s.id === id);
      if (index === -1) return null;
      
      slots[index] = {
          ...slots[index],
          ...updates,
          updatedAt: new Date().toISOString()
      };
      await this.saveAdSlots(slots);
      return slots[index];
  },

  // --- Get Active Ads By Slot ---
  async getActiveAdsBySlot(slotKey: string, customerId?: string): Promise<AdCampaign[]> {
      try {
          const slot = await this.getAdSlotByKey(slotKey);
          if (!slot || !slot.isEnabled) return [];
          
          const campaigns = await this.getAdCampaigns();
          const today = new Date().toISOString().split('T')[0];
          
          // Filter active campaigns for this slot
          let activeCampaigns = campaigns.filter(campaign => {
              if (campaign.status !== 'running') return false;
              if (campaign.startDate > today) return false;
              if (campaign.endDate && campaign.endDate < today) return false;
              
              // Check if campaign targets this slot type
              const slotTypeMap: Record<string, string[]> = {
                  'HOME_TOP_BANNER': ['banner_top'],
                  'CUSTOMER_DASHBOARD_SIDEBAR': ['banner_sidebar'],
                  'TOOLS_PAGE_BANNER': ['banner_top', 'banner_sidebar'],
                  'PRODUCTS_PAGE_CARD': ['card_in_products']
              };
              const allowedTypes = slotTypeMap[slotKey] || [];
              if (!allowedTypes.includes(campaign.type)) return false;
              
              // Check max views/clicks
              if (campaign.maxViews && (campaign.currentViews || 0) >= campaign.maxViews) return false;
              if (campaign.maxClicks && (campaign.currentClicks || 0) >= campaign.maxClicks) return false;
              
              return true;
          });
          
          // Apply selection mode
          if (slot.selectionMode === 'by_priority') {
              activeCampaigns.sort((a, b) => a.priority - b.priority);
          } else if (slot.selectionMode === 'random') {
              activeCampaigns = activeCampaigns.sort(() => Math.random() - 0.5);
          } else if (slot.selectionMode === 'rotate') {
              // Get rotation state
              const rotations = JSON.parse(localStorage.getItem(STORAGE_KEYS.AD_SLOT_ROTATIONS) || '[]') as AdSlotRotationState[];
              let rotation = rotations.find(r => r.slotKey === slotKey);
              
              if (!rotation) {
                  rotation = { slotKey, currentIndex: 0, lastRotatedAt: new Date().toISOString() };
                  rotations.push(rotation);
              }
              
              // Rotate through campaigns
              const startIndex = rotation.currentIndex % activeCampaigns.length || 0;
              activeCampaigns = [
                  ...activeCampaigns.slice(startIndex),
                  ...activeCampaigns.slice(0, startIndex)
              ];
              
              // Update rotation index
              rotation.currentIndex = (rotation.currentIndex + 1) % Math.max(activeCampaigns.length, 1);
              rotation.lastRotatedAt = new Date().toISOString();
              localStorage.setItem(STORAGE_KEYS.AD_SLOT_ROTATIONS, JSON.stringify(rotations));
          }
          
          // Limit to maxAds
          return activeCampaigns.slice(0, slot.maxAds);
      } catch (error) {
          console.error('Error getting active ads by slot:', error);
          return [];
      }
  },

  // Record ad view
  async recordAdView(campaignId: string): Promise<void> {
      const campaign = await this.getAdCampaignById(campaignId);
      if (campaign) {
          await this.updateAdCampaign(campaignId, {
              currentViews: (campaign.currentViews || 0) + 1
          });
      }
  },

  // Record ad click
  async recordAdClick(campaignId: string): Promise<void> {
      const campaign = await this.getAdCampaignById(campaignId);
      if (campaign) {
          await this.updateAdCampaign(campaignId, {
              currentClicks: (campaign.currentClicks || 0) + 1
          });
      }
  },

  // Get advertising statistics
  async getAdvertisingStats(): Promise<{
      totalAdvertisers: number;
      activeAdvertisers: number;
      totalCampaigns: number;
      runningCampaigns: number;
      totalViews: number;
      totalClicks: number;
  }> {
      const advertisers = await this.getAdvertisers();
      const campaigns = await this.getAdCampaigns();
      
      return {
          totalAdvertisers: advertisers.length,
          activeAdvertisers: advertisers.filter(a => a.status === 'active').length,
          totalCampaigns: campaigns.length,
          runningCampaigns: campaigns.filter(c => c.status === 'running').length,
          totalViews: campaigns.reduce((sum, c) => sum + (c.currentViews || 0), 0),
          totalClicks: campaigns.reduce((sum, c) => sum + (c.currentClicks || 0), 0)
      };
  },

  // ============================================================
  // INSTALLMENT WHOLESALE PURCHASE SYSTEM
  // ============================================================

  // Default Installment Settings
  getDefaultInstallmentSettings(): InstallmentSettings {
      return {
          enabled: true,
          sinicarHasFirstPriority: true,
          allowPartialApprovalBySinicar: true,
          allowPartialApprovalBySuppliers: true,
          autoForwardToSuppliersOnSinicarReject: false,
          autoForwardToSuppliersOnSinicarPartialRemainder: false,
          onCustomerRejectsSinicarPartial: 'forward_to_suppliers',
          onCustomerRejectsSupplierOffer: 'keep_waiting_for_other_suppliers',
          maxDurationMonths: 12,
          minDurationMonths: 1,
          maxDurationWeeks: 52,
          minDurationWeeks: 4,
          requireDownPayment: false,
          minDownPaymentPercent: 10,
          maxDownPaymentPercent: 50,
          minRequestAmount: 1000,
          maxRequestAmount: 500000,
          requireCreditCheck: false,
          minCreditScoreForApproval: 'medium',
          autoRejectLowCredit: false,
          allowedCustomerTypes: [],
          blockedCustomerIds: [],
          autoSelectAllSuppliers: false,
          defaultSupplierIds: [],
          maxSuppliersPerRequest: 5,
          requireAdminApprovalForSinicar: true,
          autoGeneratePaymentSchedule: true,
          defaultPaymentFrequency: 'monthly',
          notifyCustomerOnNewOffer: true,
          notifyCustomerOnStatusChange: true,
          notifyAdminOnNewRequest: true,
          notifyAdminOnCustomerDecision: true,
          notifySuppliersOnForward: true,
          notifySuppliersOnCustomerDecision: true,
          showInstallmentInSidebar: true,
          showInstallmentInDashboard: true,
          showCreditProfileToCustomer: false,
          showPaymentHistoryToCustomer: true,
          termsAndConditionsAr: 'الشروط والأحكام للشراء بالتقسيط من صيني كار...',
          termsAndConditionsEn: 'Terms and conditions for installment purchases from SINI CAR...',
          requireTermsAcceptance: true,
          overdueGracePeriodDays: 7,
          autoMarkOverdue: true,
          notifyOnOverdue: true
      };
  },

  // --- Installment Settings ---
  async getInstallmentSettings(): Promise<InstallmentSettings> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.INSTALLMENT_SETTINGS);
          if (stored) {
              return { ...this.getDefaultInstallmentSettings(), ...JSON.parse(stored) };
          }
          return this.getDefaultInstallmentSettings();
      } catch (error) {
          console.error('Error getting installment settings:', error);
          return this.getDefaultInstallmentSettings();
      }
  },

  async updateInstallmentSettings(settings: Partial<InstallmentSettings>): Promise<InstallmentSettings> {
      try {
          const current = await this.getInstallmentSettings();
          const updated = {
              ...current,
              ...settings,
              lastModifiedAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEYS.INSTALLMENT_SETTINGS, JSON.stringify(updated));
          internalRecordActivity({
              userId: 'admin',
              userName: 'المدير',
              eventType: 'OTHER',
              description: 'تم تحديث إعدادات نظام التقسيط',
              metadata: { action: 'update_installment_settings' }
          });
          return updated;
      } catch (error) {
          console.error('Error updating installment settings:', error);
          throw error;
      }
  },

  // --- Installment Requests ---
  async getInstallmentRequests(): Promise<InstallmentRequest[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.INSTALLMENT_REQUESTS);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting installment requests:', error);
          return [];
      }
  },

  async getInstallmentRequestById(id: string): Promise<InstallmentRequest | null> {
      const requests = await this.getInstallmentRequests();
      return requests.find(r => r.id === id) || null;
  },

  async getInstallmentRequestsByCustomerId(customerId: string): Promise<InstallmentRequest[]> {
      const requests = await this.getInstallmentRequests();
      return requests.filter(r => r.customerId === customerId);
  },

  async getInstallmentRequestsByStatus(status: InstallmentRequestStatus): Promise<InstallmentRequest[]> {
      const requests = await this.getInstallmentRequests();
      return requests.filter(r => r.status === status);
  },

  async createInstallmentRequest(data: Omit<InstallmentRequest, 'id' | 'createdAt' | 'updatedAt' | 'sinicarDecision' | 'status' | 'allowedForSuppliers'>): Promise<InstallmentRequest> {
      try {
          const settings = await this.getInstallmentSettings();
          if (!settings.enabled) {
              throw new Error('نظام التقسيط غير مفعل حالياً');
          }
          
          const requests = await this.getInstallmentRequests();
          const now = new Date().toISOString();
          const newRequest: InstallmentRequest = {
              ...data,
              id: `IR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              status: 'PENDING_SINICAR_REVIEW',
              sinicarDecision: 'pending',
              allowedForSuppliers: false,
              createdAt: now,
              updatedAt: now
          };
          
          requests.push(newRequest);
          localStorage.setItem(STORAGE_KEYS.INSTALLMENT_REQUESTS, JSON.stringify(requests));
          
          internalRecordActivity({
              userId: data.customerId,
              userName: data.customerName || 'عميل',
              eventType: 'OTHER',
              description: `تم تقديم طلب تقسيط جديد بقيمة ${data.totalRequestedValue || 0} ريال`,
              metadata: { action: 'create_installment_request', requestId: newRequest.id }
          });
          
          return newRequest;
      } catch (error) {
          console.error('Error creating installment request:', error);
          throw error;
      }
  },

  async updateInstallmentRequest(id: string, data: Partial<InstallmentRequest>): Promise<InstallmentRequest | null> {
      try {
          const requests = await this.getInstallmentRequests();
          const index = requests.findIndex(r => r.id === id);
          if (index === -1) return null;
          
          requests[index] = {
              ...requests[index],
              ...data,
              updatedAt: new Date().toISOString()
          };
          
          localStorage.setItem(STORAGE_KEYS.INSTALLMENT_REQUESTS, JSON.stringify(requests));
          return requests[index];
      } catch (error) {
          console.error('Error updating installment request:', error);
          return null;
      }
  },

  async deleteInstallmentRequest(id: string): Promise<boolean> {
      try {
          const requests = await this.getInstallmentRequests();
          const filtered = requests.filter(r => r.id !== id);
          if (filtered.length === requests.length) return false;
          localStorage.setItem(STORAGE_KEYS.INSTALLMENT_REQUESTS, JSON.stringify(filtered));
          return true;
      } catch (error) {
          console.error('Error deleting installment request:', error);
          return false;
      }
  },

  // --- Installment Offers ---
  async getInstallmentOffers(): Promise<InstallmentOffer[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.INSTALLMENT_OFFERS);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting installment offers:', error);
          return [];
      }
  },

  async getInstallmentOfferById(id: string): Promise<InstallmentOffer | null> {
      const offers = await this.getInstallmentOffers();
      return offers.find(o => o.id === id) || null;
  },

  async getOffersByRequestId(requestId: string): Promise<InstallmentOffer[]> {
      const offers = await this.getInstallmentOffers();
      return offers.filter(o => o.requestId === requestId);
  },

  async createInstallmentOffer(data: Omit<InstallmentOffer, 'id' | 'createdAt' | 'updatedAt'>): Promise<InstallmentOffer> {
      try {
          const offers = await this.getInstallmentOffers();
          const now = new Date().toISOString();
          const newOffer: InstallmentOffer = {
              ...data,
              id: `IO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              createdAt: now,
              updatedAt: now
          };
          
          offers.push(newOffer);
          localStorage.setItem(STORAGE_KEYS.INSTALLMENT_OFFERS, JSON.stringify(offers));
          
          internalRecordActivity({
              userId: 'admin',
              userName: data.sourceType === 'sinicar' ? 'صيني كار' : (data.supplierName || 'مورد'),
              eventType: 'OTHER',
              description: `تم إنشاء عرض ${data.type === 'full' ? 'كامل' : 'جزئي'} للطلب ${data.requestId}`,
              metadata: { action: 'create_installment_offer', offerId: newOffer.id, requestId: data.requestId }
          });
          
          return newOffer;
      } catch (error) {
          console.error('Error creating installment offer:', error);
          throw error;
      }
  },

  async updateInstallmentOffer(id: string, data: Partial<InstallmentOffer>): Promise<InstallmentOffer | null> {
      try {
          const offers = await this.getInstallmentOffers();
          const index = offers.findIndex(o => o.id === id);
          if (index === -1) return null;
          
          offers[index] = {
              ...offers[index],
              ...data,
              updatedAt: new Date().toISOString()
          };
          
          localStorage.setItem(STORAGE_KEYS.INSTALLMENT_OFFERS, JSON.stringify(offers));
          return offers[index];
      } catch (error) {
          console.error('Error updating installment offer:', error);
          return null;
      }
  },

  // --- Customer Credit Profiles ---
  async getCustomerCreditProfiles(): Promise<CustomerCreditProfile[]> {
      try {
          const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER_CREDIT_PROFILES);
          return stored ? JSON.parse(stored) : [];
      } catch (error) {
          console.error('Error getting customer credit profiles:', error);
          return [];
      }
  },

  async getCustomerCreditProfile(customerId: string): Promise<CustomerCreditProfile | null> {
      const profiles = await this.getCustomerCreditProfiles();
      return profiles.find(p => p.customerId === customerId) || null;
  },

  async upsertCustomerCreditProfile(profile: Partial<CustomerCreditProfile> & { customerId: string }): Promise<CustomerCreditProfile> {
      try {
          const profiles = await this.getCustomerCreditProfiles();
          const index = profiles.findIndex(p => p.customerId === profile.customerId);
          
          const now = new Date().toISOString();
          const fullProfile: CustomerCreditProfile = {
              customerId: profile.customerId,
              customerName: profile.customerName,
              scoreLevel: profile.scoreLevel || 'medium',
              totalInstallmentRequests: profile.totalInstallmentRequests || 0,
              totalActiveContracts: profile.totalActiveContracts || 0,
              totalOverdueInstallments: profile.totalOverdueInstallments || 0,
              totalPaidAmount: profile.totalPaidAmount || 0,
              totalRemainingAmount: profile.totalRemainingAmount || 0,
              paymentHistoryScore: profile.paymentHistoryScore,
              notes: profile.notes,
              lastUpdated: now
          };
          
          if (index === -1) {
              profiles.push(fullProfile);
          } else {
              profiles[index] = { ...profiles[index], ...fullProfile, lastUpdated: now };
          }
          
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_CREDIT_PROFILES, JSON.stringify(profiles));
          return index === -1 ? fullProfile : profiles[index];
      } catch (error) {
          console.error('Error upserting customer credit profile:', error);
          throw error;
      }
  },

  // --- Business Logic Functions ---

  // Generate Payment Schedule
  generatePaymentSchedule(
      totalAmount: number,
      frequency: PaymentFrequency,
      numberOfInstallments: number,
      startDate?: string
  ): InstallmentPaymentSchedule {
      const start = startDate ? new Date(startDate) : new Date();
      start.setDate(start.getDate() + 7); // Start one week after approval
      
      const installmentAmount = Math.ceil(totalAmount / numberOfInstallments);
      const installments: InstallmentPaymentInstallment[] = [];
      
      for (let i = 0; i < numberOfInstallments; i++) {
          const dueDate = new Date(start);
          if (frequency === 'monthly') {
              dueDate.setMonth(dueDate.getMonth() + i);
          } else {
              dueDate.setDate(dueDate.getDate() + (i * 7));
          }
          
          installments.push({
              id: `INS-${Date.now()}-${i}`,
              dueDate: dueDate.toISOString(),
              amount: i === numberOfInstallments - 1 
                  ? totalAmount - (installmentAmount * (numberOfInstallments - 1)) // Last installment adjusts for rounding
                  : installmentAmount,
              status: 'pending'
          });
      }
      
      return {
          frequency,
          numberOfInstallments,
          installmentAmount,
          startDate: installments[0]?.dueDate || start.toISOString(),
          endDate: installments[installments.length - 1]?.dueDate || start.toISOString(),
          installments
      };
  },

  // Record SINI CAR Decision
  async recordSinicarDecision(requestId: string, payload: SinicarDecisionPayload): Promise<{ request: InstallmentRequest; offer?: InstallmentOffer }> {
      const settings = await this.getInstallmentSettings();
      const request = await this.getInstallmentRequestById(requestId);
      
      if (!request) {
          throw new Error('طلب التقسيط غير موجود');
      }
      
      const now = new Date().toISOString();
      let updatedRequest: InstallmentRequest = { ...request };
      let createdOffer: InstallmentOffer | undefined;
      
      if (payload.decisionType === 'approve_full') {
          // Full approval by SINI CAR
          const schedule = this.generatePaymentSchedule(
              payload.offer?.totalApprovedValue || request.totalRequestedValue || 0,
              request.paymentFrequency,
              request.requestedDurationMonths || 3
          );
          
          createdOffer = await this.createInstallmentOffer({
              requestId,
              sourceType: 'sinicar',
              type: 'full',
              itemsApproved: payload.offer?.itemsApproved || request.items.map(item => ({
                  id: `OI-${Date.now()}-${Math.random()}`,
                  offerId: '',
                  requestItemId: item.id,
                  productId: item.productId,
                  productName: item.productName,
                  quantityApproved: item.quantityRequested,
                  unitPriceApproved: item.unitPriceRequested || 0
              })),
              totalApprovedValue: payload.offer?.totalApprovedValue || request.totalRequestedValue || 0,
              schedule,
              status: 'WAITING_FOR_CUSTOMER',
              adminNotes: payload.adminNotes
          });
          
          updatedRequest.sinicarDecision = 'approved_full';
          updatedRequest.status = 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR';
          updatedRequest.reviewedAt = now;
          updatedRequest.adminNotes = payload.adminNotes;
          
      } else if (payload.decisionType === 'approve_partial') {
          // Partial approval by SINI CAR
          if (!settings.allowPartialApprovalBySinicar) {
              throw new Error('الموافقة الجزئية غير مسموحة في الإعدادات');
          }
          
          const schedule = this.generatePaymentSchedule(
              payload.offer?.totalApprovedValue || 0,
              request.paymentFrequency,
              request.requestedDurationMonths || 3
          );
          
          createdOffer = await this.createInstallmentOffer({
              requestId,
              sourceType: 'sinicar',
              type: 'partial',
              itemsApproved: payload.offer?.itemsApproved || [],
              totalApprovedValue: payload.offer?.totalApprovedValue || 0,
              schedule,
              status: 'WAITING_FOR_CUSTOMER',
              adminNotes: payload.adminNotes
          });
          
          updatedRequest.sinicarDecision = 'approved_partial';
          updatedRequest.status = 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR';
          updatedRequest.reviewedAt = now;
          updatedRequest.adminNotes = payload.adminNotes;
          
      } else if (payload.decisionType === 'reject') {
          // Rejection by SINI CAR
          updatedRequest.sinicarDecision = 'rejected';
          updatedRequest.reviewedAt = now;
          updatedRequest.adminNotes = payload.adminNotes;
          
          if (settings.autoForwardToSuppliersOnSinicarReject && payload.forwardToSuppliers !== false) {
              updatedRequest.status = 'FORWARDED_TO_SUPPLIERS';
              updatedRequest.allowedForSuppliers = true;
              updatedRequest.forwardedToSupplierIds = payload.supplierIds || [];
          } else {
              updatedRequest.status = 'REJECTED_BY_SINICAR';
          }
      }
      
      await this.updateInstallmentRequest(requestId, updatedRequest);
      
      internalRecordActivity({
          userId: 'admin',
          userName: 'صيني كار',
          eventType: 'OTHER',
          description: `قرار صيني كار على طلب التقسيط ${requestId}: ${payload.decisionType}`,
          metadata: { action: 'sinicar_decision', requestId, decision: payload.decisionType }
      });
      
      return { request: updatedRequest, offer: createdOffer };
  },

  // Forward Request to Suppliers
  async forwardRequestToSuppliers(requestId: string, supplierIds: string[]): Promise<InstallmentRequest | null> {
      const request = await this.getInstallmentRequestById(requestId);
      if (!request) return null;
      
      // Only allow forwarding after SINI CAR decision
      if (request.sinicarDecision === 'pending') {
          throw new Error('يجب انتظار قرار صيني كار أولاً');
      }
      
      const updated = await this.updateInstallmentRequest(requestId, {
          status: 'FORWARDED_TO_SUPPLIERS',
          allowedForSuppliers: true,
          forwardedToSupplierIds: supplierIds
      });
      
      internalRecordActivity({
          userId: 'admin',
          userName: 'المدير',
          eventType: 'OTHER',
          description: `تم تحويل طلب التقسيط ${requestId} إلى ${supplierIds.length} موردين`,
          metadata: { action: 'forward_to_suppliers', requestId, supplierIds }
      });
      
      return updated;
  },

  // Supplier Submit Offer
  async supplierSubmitOffer(
      requestId: string,
      supplierId: string,
      supplierName: string,
      offerData: {
          type: 'full' | 'partial';
          itemsApproved: InstallmentOffer['itemsApproved'];
          totalApprovedValue: number;
          frequency: PaymentFrequency;
          numberOfInstallments: number;
          notes?: string;
      }
  ): Promise<InstallmentOffer> {
      const settings = await this.getInstallmentSettings();
      const request = await this.getInstallmentRequestById(requestId);
      
      if (!request) {
          throw new Error('طلب التقسيط غير موجود');
      }
      
      if (!request.allowedForSuppliers) {
          throw new Error('هذا الطلب غير متاح للموردين');
      }
      
      if (offerData.type === 'partial' && !settings.allowPartialApprovalBySuppliers) {
          throw new Error('العروض الجزئية غير مسموحة للموردين');
      }
      
      const schedule = this.generatePaymentSchedule(
          offerData.totalApprovedValue,
          offerData.frequency,
          offerData.numberOfInstallments
      );
      
      const offer = await this.createInstallmentOffer({
          requestId,
          sourceType: 'supplier',
          supplierId,
          supplierName,
          type: offerData.type,
          itemsApproved: offerData.itemsApproved,
          totalApprovedValue: offerData.totalApprovedValue,
          schedule,
          status: 'WAITING_FOR_CUSTOMER',
          notes: offerData.notes
      });
      
      // Update request status
      await this.updateInstallmentRequest(requestId, {
          status: 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER'
      });
      
      return offer;
  },

  // Customer Respond to Offer
  async customerRespondToOffer(offerId: string, decision: 'accept' | 'reject'): Promise<{ offer: InstallmentOffer; request: InstallmentRequest }> {
      const settings = await this.getInstallmentSettings();
      const offer = await this.getInstallmentOfferById(offerId);
      
      if (!offer) {
          throw new Error('العرض غير موجود');
      }
      
      const request = await this.getInstallmentRequestById(offer.requestId);
      if (!request) {
          throw new Error('طلب التقسيط غير موجود');
      }
      
      if (decision === 'accept') {
          // Accept the offer
          await this.updateInstallmentOffer(offerId, {
              status: 'ACCEPTED_BY_CUSTOMER'
          });
          
          await this.updateInstallmentRequest(offer.requestId, {
              status: 'ACTIVE_CONTRACT',
              acceptedOfferId: offerId
          });
          
          // Update credit profile
          const profile = await this.getCustomerCreditProfile(request.customerId);
          await this.upsertCustomerCreditProfile({
              customerId: request.customerId,
              customerName: request.customerName,
              totalInstallmentRequests: (profile?.totalInstallmentRequests || 0) + 1,
              totalActiveContracts: (profile?.totalActiveContracts || 0) + 1,
              totalRemainingAmount: (profile?.totalRemainingAmount || 0) + offer.totalApprovedValue,
              scoreLevel: profile?.scoreLevel || 'medium'
          });
          
          internalRecordActivity({
              userId: request.customerId,
              userName: request.customerName || 'عميل',
              eventType: 'OTHER',
              description: `قبل العميل عرض التقسيط من ${offer.sourceType === 'sinicar' ? 'صيني كار' : offer.supplierName}`,
              metadata: { action: 'customer_accept_offer', offerId, requestId: offer.requestId }
          });
          
          return {
              offer: { ...offer, status: 'ACCEPTED_BY_CUSTOMER' },
              request: { ...request, status: 'ACTIVE_CONTRACT', acceptedOfferId: offerId }
          };
          
      } else {
          // Reject the offer
          await this.updateInstallmentOffer(offerId, {
              status: 'REJECTED_BY_CUSTOMER'
          });
          
          let newStatus: InstallmentRequestStatus = request.status;
          
          if (offer.sourceType === 'sinicar') {
              // Customer rejected SINI CAR offer
              if (settings.onCustomerRejectsSinicarPartial === 'forward_to_suppliers') {
                  newStatus = 'FORWARDED_TO_SUPPLIERS';
                  await this.updateInstallmentRequest(offer.requestId, {
                      status: newStatus,
                      allowedForSuppliers: true
                  });
              } else {
                  newStatus = 'CLOSED';
                  await this.updateInstallmentRequest(offer.requestId, {
                      status: newStatus,
                      closedAt: new Date().toISOString(),
                      closedReason: 'رفض العميل عرض صيني كار'
                  });
              }
          } else {
              // Customer rejected supplier offer
              if (settings.onCustomerRejectsSupplierOffer === 'keep_waiting_for_other_suppliers') {
                  // Check if there are other pending offers
                  const allOffers = await this.getOffersByRequestId(offer.requestId);
                  const pendingOffers = allOffers.filter(o => o.id !== offerId && o.status === 'WAITING_FOR_CUSTOMER');
                  
                  if (pendingOffers.length > 0) {
                      newStatus = 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER';
                  } else {
                      newStatus = 'WAITING_FOR_SUPPLIER_OFFERS';
                  }
              } else {
                  newStatus = 'CLOSED';
                  await this.updateInstallmentRequest(offer.requestId, {
                      status: newStatus,
                      closedAt: new Date().toISOString(),
                      closedReason: 'رفض العميل عرض المورد'
                  });
              }
          }
          
          internalRecordActivity({
              userId: request.customerId,
              userName: request.customerName || 'عميل',
              eventType: 'OTHER',
              description: `رفض العميل عرض التقسيط من ${offer.sourceType === 'sinicar' ? 'صيني كار' : offer.supplierName}`,
              metadata: { action: 'customer_reject_offer', offerId, requestId: offer.requestId }
          });
          
          const updatedRequest = await this.getInstallmentRequestById(offer.requestId);
          return {
              offer: { ...offer, status: 'REJECTED_BY_CUSTOMER' },
              request: updatedRequest || request
          };
      }
  },

  // Mark Installment as Paid
  async markInstallmentAsPaid(offerId: string, installmentId: string, paymentDetails?: { method?: string; reference?: string }): Promise<InstallmentOffer | null> {
      const offer = await this.getInstallmentOfferById(offerId);
      if (!offer) return null;
      
      const installmentIndex = offer.schedule.installments.findIndex(i => i.id === installmentId);
      if (installmentIndex === -1) return null;
      
      offer.schedule.installments[installmentIndex] = {
          ...offer.schedule.installments[installmentIndex],
          status: 'paid',
          paidAt: new Date().toISOString(),
          paymentMethod: paymentDetails?.method,
          paymentReference: paymentDetails?.reference
      };
      
      const updated = await this.updateInstallmentOffer(offerId, {
          schedule: offer.schedule
      });
      
      // Update credit profile
      const request = await this.getInstallmentRequestById(offer.requestId);
      if (request) {
          const profile = await this.getCustomerCreditProfile(request.customerId);
          const paidAmount = offer.schedule.installments[installmentIndex].amount;
          await this.upsertCustomerCreditProfile({
              customerId: request.customerId,
              totalPaidAmount: (profile?.totalPaidAmount || 0) + paidAmount,
              totalRemainingAmount: Math.max(0, (profile?.totalRemainingAmount || 0) - paidAmount),
              scoreLevel: profile?.scoreLevel || 'medium'
          });
      }
      
      return updated;
  },

  // Get Installment Statistics
  async getInstallmentStats(): Promise<InstallmentStats> {
      const requests = await this.getInstallmentRequests();
      const offers = await this.getInstallmentOffers();
      
      const activeContracts = requests.filter(r => r.status === 'ACTIVE_CONTRACT');
      const closedContracts = requests.filter(r => r.status === 'CLOSED');
      
      let totalPaidAmount = 0;
      let totalOverdueAmount = 0;
      
      for (const offer of offers) {
          if (offer.status === 'ACCEPTED_BY_CUSTOMER') {
              for (const inst of offer.schedule.installments) {
                  if (inst.status === 'paid') {
                      totalPaidAmount += inst.amount;
                  } else if (inst.status === 'overdue') {
                      totalOverdueAmount += inst.amount;
                  }
              }
          }
      }
      
      const approvedOffers = offers.filter(o => o.status === 'ACCEPTED_BY_CUSTOMER').length;
      const totalOffers = offers.length;
      
      // Group by status
      const statusCounts: { [key: string]: number } = {};
      for (const request of requests) {
          statusCounts[request.status] = (statusCounts[request.status] || 0) + 1;
      }
      
      // Group by month
      const monthCounts: { [key: string]: { count: number; value: number } } = {};
      for (const request of requests) {
          const month = request.createdAt.substring(0, 7);
          if (!monthCounts[month]) {
              monthCounts[month] = { count: 0, value: 0 };
          }
          monthCounts[month].count++;
          monthCounts[month].value += request.totalRequestedValue || 0;
      }
      
      return {
          totalRequests: requests.length,
          pendingRequests: requests.filter(r => r.status === 'PENDING_SINICAR_REVIEW').length,
          activeContracts: activeContracts.length,
          closedContracts: closedContracts.length,
          totalRequestedValue: requests.reduce((sum, r) => sum + (r.totalRequestedValue || 0), 0),
          totalApprovedValue: offers
              .filter(o => o.status === 'ACCEPTED_BY_CUSTOMER')
              .reduce((sum, o) => sum + o.totalApprovedValue, 0),
          totalPaidAmount,
          totalOverdueAmount,
          avgApprovalRate: totalOffers > 0 ? (approvedOffers / totalOffers) * 100 : 0,
          avgProcessingDays: 3, // Placeholder
          byStatus: Object.entries(statusCounts).map(([status, count]) => ({
              status: status as InstallmentRequestStatus,
              count
          })),
          byMonth: Object.entries(monthCounts)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([month, data]) => ({
                  month,
                  count: data.count,
                  value: data.value
              }))
      };
  },

  // Get requests forwarded to a specific supplier
  async getInstallmentRequestsForSupplier(supplierId: string): Promise<InstallmentRequest[]> {
      const requests = await this.getInstallmentRequests();
      return requests.filter(r => 
          r.allowedForSuppliers && 
          (r.forwardedToSupplierIds?.includes(supplierId) || r.forwardedToSupplierIds?.length === 0)
      );
  },

  // Close/Cancel Request
  async closeInstallmentRequest(requestId: string, reason: string): Promise<InstallmentRequest | null> {
      return await this.updateInstallmentRequest(requestId, {
          status: 'CLOSED',
          closedAt: new Date().toISOString(),
          closedReason: reason
      });
  },

  // Cancel Request by Customer
  async cancelInstallmentRequest(requestId: string): Promise<InstallmentRequest | null> {
      const request = await this.getInstallmentRequestById(requestId);
      if (!request) return null;
      
      // Can only cancel if not yet active
      if (request.status === 'ACTIVE_CONTRACT') {
          throw new Error('لا يمكن إلغاء عقد نشط');
      }
      
      return await this.updateInstallmentRequest(requestId, {
          status: 'CANCELLED',
          closedAt: new Date().toISOString(),
          closedReason: 'تم الإلغاء بواسطة العميل'
      });
  },

  // =========================================================
  // PART 3: ORGANIZATION & TEAM MANAGEMENT SYSTEM
  // =========================================================

  // --- Default Organization Settings ---
  getDefaultOrganizationSettings(): OrganizationSettings {
      return {
          enableTeamsForCustomers: true,
          enableTeamsForSuppliers: true,
          enableTeamsForAdvertisers: true,
          enableTeamsForAffiliates: true,
          
          maxCustomerEmployees: 10,
          maxSupplierEmployees: 5,
          maxAdvertiserEmployees: 3,
          maxAffiliateEmployees: 3,
          
          defaultCustomerManagerPermissions: ['cust_create_orders', 'cust_view_orders', 'cust_create_installment_requests', 'cust_manage_installment_requests', 'cust_use_trader_tools', 'cust_view_prices', 'cust_manage_cart', 'org_view_logs'],
          defaultCustomerStaffPermissions: ['cust_create_orders', 'cust_view_orders', 'cust_view_prices', 'cust_manage_cart'],
          defaultCustomerReadonlyPermissions: ['cust_view_orders', 'cust_view_prices'],
          
          defaultSupplierManagerPermissions: ['sup_view_forwarded_requests', 'sup_submit_offers', 'sup_view_team_activity', 'sup_manage_products', 'sup_view_analytics', 'org_view_logs'],
          defaultSupplierStaffPermissions: ['sup_view_forwarded_requests', 'sup_submit_offers'],
          defaultSupplierReadonlyPermissions: ['sup_view_forwarded_requests', 'sup_view_analytics'],
          
          defaultAdvertiserManagerPermissions: ['adv_view_campaigns', 'adv_manage_campaigns', 'adv_manage_slots', 'adv_view_reports', 'org_view_logs'],
          defaultAdvertiserStaffPermissions: ['adv_view_campaigns', 'adv_manage_campaigns', 'adv_view_reports'],
          defaultAdvertiserReadonlyPermissions: ['adv_view_campaigns', 'adv_view_reports'],
          
          defaultAffiliateManagerPermissions: ['aff_view_links', 'aff_manage_links', 'aff_view_commissions', 'aff_view_analytics', 'org_view_logs'],
          defaultAffiliateStaffPermissions: ['aff_view_links', 'aff_manage_links', 'aff_view_commissions'],
          defaultAffiliateReadonlyPermissions: ['aff_view_links', 'aff_view_commissions'],
          
          allowCustomPermissionsForCustomers: true,
          allowCustomPermissionsForSuppliers: true,
          allowCustomPermissionsForAdvertisers: true,
          allowCustomPermissionsForAffiliates: true,
          
          trackTeamActivityPerOrganization: true,
          activityLogRetentionDays: 90,
          
          requireEmailVerification: false,
          invitationExpiryHours: 72
      };
  },

  // --- Organization Settings CRUD ---
  async getOrganizationSettings(): Promise<OrganizationSettings> {
      const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATION_SETTINGS);
      if (stored) {
          return JSON.parse(stored);
      }
      const defaultSettings = this.getDefaultOrganizationSettings();
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_SETTINGS, JSON.stringify(defaultSettings));
      return defaultSettings;
  },

  async updateOrganizationSettings(partialSettings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
      const current = await this.getOrganizationSettings();
      const updated: OrganizationSettings = {
          ...current,
          ...partialSettings,
          lastModifiedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_SETTINGS, JSON.stringify(updated));
      return updated;
  },

  // --- Organizations CRUD ---
  async getOrganizations(): Promise<Organization[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
      return stored ? JSON.parse(stored) : [];
  },

  async getOrganizationById(id: string): Promise<Organization | null> {
      const orgs = await this.getOrganizations();
      return orgs.find(o => o.id === id) || null;
  },

  async getOrganizationByCustomer(customerId: string): Promise<Organization | null> {
      const orgs = await this.getOrganizations();
      return orgs.find(o => o.type === 'customer' && o.customerId === customerId) || null;
  },

  async getOrganizationBySupplier(supplierId: string): Promise<Organization | null> {
      const orgs = await this.getOrganizations();
      return orgs.find(o => o.type === 'supplier' && o.supplierId === supplierId) || null;
  },

  async getOrganizationByAdvertiser(advertiserId: string): Promise<Organization | null> {
      const orgs = await this.getOrganizations();
      return orgs.find(o => o.type === 'advertiser' && o.advertiserId === advertiserId) || null;
  },

  async getOrganizationByAffiliate(affiliateId: string): Promise<Organization | null> {
      const orgs = await this.getOrganizations();
      return orgs.find(o => o.type === 'affiliate' && o.affiliateId === affiliateId) || null;
  },

  async getOrganizationByOwnerUserId(ownerUserId: string): Promise<Organization | null> {
      const orgs = await this.getOrganizations();
      return orgs.find(o => o.ownerUserId === ownerUserId) || null;
  },

  async getOrCreateOrganizationForEntity(
      type: OrganizationType,
      entityId: string,
      name: string,
      ownerUserId: string
  ): Promise<Organization> {
      let existing: Organization | null = null;
      
      if (type === 'customer') {
          existing = await this.getOrganizationByCustomer(entityId);
      } else if (type === 'supplier') {
          existing = await this.getOrganizationBySupplier(entityId);
      } else if (type === 'advertiser') {
          existing = await this.getOrganizationByAdvertiser(entityId);
      } else if (type === 'affiliate') {
          existing = await this.getOrganizationByAffiliate(entityId);
      }
      
      if (existing) return existing;
      
      const now = new Date().toISOString();
      const newOrg: Organization = {
          id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          name,
          ownerUserId,
          isActive: true,
          createdAt: now,
          updatedAt: now
      };
      
      if (type === 'customer') newOrg.customerId = entityId;
      else if (type === 'supplier') newOrg.supplierId = entityId;
      else if (type === 'advertiser') newOrg.advertiserId = entityId;
      else if (type === 'affiliate') newOrg.affiliateId = entityId;
      
      const orgs = await this.getOrganizations();
      orgs.push(newOrg);
      localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
      
      // Create owner as organization user
      await this.createOrganizationUser(newOrg.id, {
          userId: ownerUserId,
          role: 'owner',
          permissions: [] // Owner has all permissions
      });
      
      return newOrg;
  },

  async createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
      const now = new Date().toISOString();
      const newOrg: Organization = {
          ...data,
          id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now
      };
      
      const orgs = await this.getOrganizations();
      orgs.push(newOrg);
      localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
      return newOrg;
  },

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization | null> {
      const orgs = await this.getOrganizations();
      const index = orgs.findIndex(o => o.id === id);
      if (index === -1) return null;
      
      orgs[index] = {
          ...orgs[index],
          ...data,
          updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
      return orgs[index];
  },

  // --- Organization Users (Team Members) CRUD ---
  async getOrganizationUsers(orgId?: string): Promise<OrganizationUser[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATION_USERS);
      const users: OrganizationUser[] = stored ? JSON.parse(stored) : [];
      if (orgId) {
          return users.filter(u => u.organizationId === orgId);
      }
      return users;
  },

  async getOrganizationUser(orgId: string, userId: string): Promise<OrganizationUser | null> {
      const users = await this.getOrganizationUsers(orgId);
      return users.find(u => u.userId === userId) || null;
  },

  async getOrganizationUserById(id: string): Promise<OrganizationUser | null> {
      const users = await this.getOrganizationUsers();
      return users.find(u => u.id === id) || null;
  },

  async getOrganizationsByUserId(userId: string): Promise<Organization[]> {
      const orgUsers = await this.getOrganizationUsers();
      const userOrgIds = orgUsers.filter(u => u.userId === userId && u.isActive).map(u => u.organizationId);
      const orgs = await this.getOrganizations();
      return orgs.filter(o => userOrgIds.includes(o.id) || o.ownerUserId === userId);
  },

  async createOrganizationUser(
      orgId: string,
      data: { userId: string; role: OrganizationUserRole; permissions: ScopedPermissionKey[]; jobTitle?: string; department?: string }
  ): Promise<OrganizationUser> {
      const now = new Date().toISOString();
      const newUser: OrganizationUser = {
          id: `orguser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          organizationId: orgId,
          userId: data.userId,
          role: data.role,
          permissions: data.permissions,
          jobTitle: data.jobTitle,
          department: data.department,
          isActive: true,
          joinedAt: now,
          createdAt: now,
          updatedAt: now
      };
      
      const users = await this.getOrganizationUsers();
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_USERS, JSON.stringify(users));
      
      // Log activity
      await this.logOrganizationActivity(orgId, data.userId, 'team_member_added', 'team', {
          newMemberRole: data.role,
          newMemberUserId: data.userId
      });
      
      return newUser;
  },

  async updateOrganizationUser(id: string, data: Partial<OrganizationUser>): Promise<OrganizationUser | null> {
      const users = await this.getOrganizationUsers();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return null;
      
      users[index] = {
          ...users[index],
          ...data,
          updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_USERS, JSON.stringify(users));
      return users[index];
  },

  async deactivateOrganizationUser(id: string): Promise<OrganizationUser | null> {
      return await this.updateOrganizationUser(id, { isActive: false });
  },

  async reactivateOrganizationUser(id: string): Promise<OrganizationUser | null> {
      return await this.updateOrganizationUser(id, { isActive: true });
  },

  async removeOrganizationUser(id: string): Promise<boolean> {
      const users = await this.getOrganizationUsers();
      const filtered = users.filter(u => u.id !== id);
      if (filtered.length === users.length) return false;
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_USERS, JSON.stringify(filtered));
      return true;
  },

  // --- Team Invitations ---
  async getTeamInvitations(orgId?: string): Promise<TeamInvitation[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.TEAM_INVITATIONS);
      const invitations: TeamInvitation[] = stored ? JSON.parse(stored) : [];
      if (orgId) {
          return invitations.filter(i => i.organizationId === orgId);
      }
      return invitations;
  },

  async getTeamInvitationByCode(code: string): Promise<TeamInvitation | null> {
      const invitations = await this.getTeamInvitations();
      return invitations.find(i => i.invitationCode === code) || null;
  },

  async createTeamInvitation(
      orgId: string,
      invitedByUserId: string,
      data: { email: string; phone?: string; name?: string; role: OrganizationUserRole; permissions: ScopedPermissionKey[] }
  ): Promise<TeamInvitation> {
      const settings = await this.getOrganizationSettings();
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + settings.invitationExpiryHours * 60 * 60 * 1000).toISOString();
      
      const invitation: TeamInvitation = {
          id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          organizationId: orgId,
          invitedByUserId,
          email: data.email,
          phone: data.phone,
          name: data.name,
          role: data.role,
          permissions: data.permissions,
          status: 'pending',
          invitationCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
          expiresAt,
          createdAt: now
      };
      
      const invitations = await this.getTeamInvitations();
      invitations.push(invitation);
      localStorage.setItem(STORAGE_KEYS.TEAM_INVITATIONS, JSON.stringify(invitations));
      
      return invitation;
  },

  async acceptTeamInvitation(code: string, userId: string): Promise<{ success: boolean; message: string; orgUser?: OrganizationUser }> {
      const invitation = await this.getTeamInvitationByCode(code);
      if (!invitation) {
          return { success: false, message: 'رمز الدعوة غير صالح' };
      }
      
      if (invitation.status !== 'pending') {
          return { success: false, message: 'تم استخدام هذه الدعوة بالفعل' };
      }
      
      if (new Date(invitation.expiresAt) < new Date()) {
          // Update status to expired
          await this.updateTeamInvitation(invitation.id, { status: 'expired' });
          return { success: false, message: 'انتهت صلاحية الدعوة' };
      }
      
      // Create organization user
      const orgUser = await this.createOrganizationUser(invitation.organizationId, {
          userId,
          role: invitation.role,
          permissions: invitation.permissions
      });
      
      // Update invitation status
      await this.updateTeamInvitation(invitation.id, { 
          status: 'accepted',
          acceptedAt: new Date().toISOString()
      });
      
      return { success: true, message: 'تم قبول الدعوة بنجاح', orgUser };
  },

  async updateTeamInvitation(id: string, data: Partial<TeamInvitation>): Promise<TeamInvitation | null> {
      const invitations = await this.getTeamInvitations();
      const index = invitations.findIndex(i => i.id === id);
      if (index === -1) return null;
      
      invitations[index] = { ...invitations[index], ...data };
      localStorage.setItem(STORAGE_KEYS.TEAM_INVITATIONS, JSON.stringify(invitations));
      return invitations[index];
  },

  async cancelTeamInvitation(id: string): Promise<boolean> {
      const result = await this.updateTeamInvitation(id, { status: 'cancelled' });
      return result !== null;
  },

  // --- Organization Activity Logs ---
  async getOrganizationActivityLogs(orgId?: string, limit: number = 100): Promise<OrganizationActivityLog[]> {
      const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATION_ACTIVITY_LOGS);
      let logs: OrganizationActivityLog[] = stored ? JSON.parse(stored) : [];
      
      if (orgId) {
          logs = logs.filter(l => l.organizationId === orgId);
      }
      
      return logs
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
  },

  async logOrganizationActivity(
      orgId: string,
      userId: string,
      actionType: string,
      actionCategory: OrganizationActivityLog['actionCategory'],
      metadata?: Record<string, any>
  ): Promise<OrganizationActivityLog> {
      const settings = await this.getOrganizationSettings();
      if (!settings.trackTeamActivityPerOrganization) {
          // Return a placeholder log if tracking is disabled
          return {
              id: '',
              organizationId: orgId,
              userId,
              actionType,
              actionCategory,
              description: '',
              metadata,
              createdAt: new Date().toISOString()
          };
      }
      
      // Get user name
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = users.find((u: User) => u.id === userId);
      
      const log: OrganizationActivityLog = {
          id: `orglog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          organizationId: orgId,
          userId,
          userName: user?.name || 'مستخدم',
          actionType,
          actionCategory,
          description: this.getActivityDescription(actionType, actionCategory, metadata),
          metadata,
          createdAt: new Date().toISOString()
      };
      
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORGANIZATION_ACTIVITY_LOGS) || '[]');
      logs.unshift(log);
      
      // Keep only logs within retention period
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - settings.activityLogRetentionDays);
      const filteredLogs = logs.filter((l: OrganizationActivityLog) => 
          new Date(l.createdAt) > retentionDate
      );
      
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_ACTIVITY_LOGS, JSON.stringify(filteredLogs));
      return log;
  },

  getActivityDescription(actionType: string, category: string, metadata?: Record<string, any>): string {
      const descriptions: Record<string, string> = {
          'team_member_added': 'تمت إضافة عضو جديد للفريق',
          'team_member_removed': 'تمت إزالة عضو من الفريق',
          'team_member_updated': 'تم تحديث بيانات عضو الفريق',
          'order_created': 'تم إنشاء طلب جديد',
          'order_updated': 'تم تحديث الطلب',
          'installment_request_created': 'تم إنشاء طلب تقسيط',
          'installment_offer_submitted': 'تم تقديم عرض تقسيط',
          'campaign_created': 'تم إنشاء حملة إعلانية',
          'campaign_updated': 'تم تحديث الحملة الإعلانية',
          'offer_submitted': 'تم تقديم عرض',
          'link_created': 'تم إنشاء رابط إحالة',
          'profile_updated': 'تم تحديث الملف الشخصي'
      };
      return descriptions[actionType] || actionType;
  },

  // --- Permission Helpers ---
  async hasScopedPermission(userId: string, orgId: string, permissionKey: ScopedPermissionKey): Promise<boolean> {
      const orgUser = await this.getOrganizationUser(orgId, userId);
      if (!orgUser) {
          // Check if user is the organization owner
          const org = await this.getOrganizationById(orgId);
          if (org && org.ownerUserId === userId) {
              return true; // Owner has all permissions
          }
          return false;
      }
      
      if (!orgUser.isActive) return false;
      
      // Owner role has all permissions
      if (orgUser.role === 'owner') return true;
      
      return orgUser.permissions.includes(permissionKey);
  },

  async getUserScopedPermissions(userId: string, orgId: string): Promise<ScopedPermissionKey[]> {
      const org = await this.getOrganizationById(orgId);
      if (org && org.ownerUserId === userId) {
          // Return all permissions for owner
          return this.getAllPermissionKeys();
      }
      
      const orgUser = await this.getOrganizationUser(orgId, userId);
      if (!orgUser || !orgUser.isActive) return [];
      
      if (orgUser.role === 'owner') {
          return this.getAllPermissionKeys();
      }
      
      return orgUser.permissions;
  },

  getAllPermissionKeys(): ScopedPermissionKey[] {
      return [
          'adv_view_campaigns', 'adv_manage_campaigns', 'adv_manage_slots', 'adv_view_reports',
          'sup_view_forwarded_requests', 'sup_submit_offers', 'sup_view_team_activity', 'sup_manage_products', 'sup_view_analytics',
          'cust_create_orders', 'cust_view_orders', 'cust_create_installment_requests', 'cust_manage_installment_requests',
          'cust_use_trader_tools', 'cust_view_team_activity', 'cust_view_prices', 'cust_manage_cart',
          'aff_view_links', 'aff_manage_links', 'aff_view_commissions', 'aff_withdraw_commissions', 'aff_view_analytics',
          'org_manage_team', 'org_view_logs', 'org_view_settings', 'org_edit_profile'
      ];
  },

  getPermissionsByOrganizationType(type: OrganizationType): ScopedPermissionKey[] {
      const general: ScopedPermissionKey[] = ['org_manage_team', 'org_view_logs', 'org_view_settings', 'org_edit_profile'];
      
      switch (type) {
          case 'customer':
              return [...general, 'cust_create_orders', 'cust_view_orders', 'cust_create_installment_requests', 
                      'cust_manage_installment_requests', 'cust_use_trader_tools', 'cust_view_team_activity', 
                      'cust_view_prices', 'cust_manage_cart'];
          case 'supplier':
              return [...general, 'sup_view_forwarded_requests', 'sup_submit_offers', 'sup_view_team_activity',
                      'sup_manage_products', 'sup_view_analytics'];
          case 'advertiser':
              return [...general, 'adv_view_campaigns', 'adv_manage_campaigns', 'adv_manage_slots', 'adv_view_reports'];
          case 'affiliate':
              return [...general, 'aff_view_links', 'aff_manage_links', 'aff_view_commissions', 
                      'aff_withdraw_commissions', 'aff_view_analytics'];
          default:
              return general;
      }
  },

  async getDefaultPermissionsForRole(orgType: OrganizationType, role: OrganizationUserRole): Promise<ScopedPermissionKey[]> {
      const settings = await this.getOrganizationSettings();
      
      if (role === 'owner') {
          return this.getPermissionsByOrganizationType(orgType);
      }
      
      switch (orgType) {
          case 'customer':
              return role === 'manager' ? settings.defaultCustomerManagerPermissions :
                     role === 'staff' ? settings.defaultCustomerStaffPermissions :
                     settings.defaultCustomerReadonlyPermissions;
          case 'supplier':
              return role === 'manager' ? settings.defaultSupplierManagerPermissions :
                     role === 'staff' ? settings.defaultSupplierStaffPermissions :
                     settings.defaultSupplierReadonlyPermissions;
          case 'advertiser':
              return role === 'manager' ? settings.defaultAdvertiserManagerPermissions :
                     role === 'staff' ? settings.defaultAdvertiserStaffPermissions :
                     settings.defaultAdvertiserReadonlyPermissions;
          case 'affiliate':
              return role === 'manager' ? settings.defaultAffiliateManagerPermissions :
                     role === 'staff' ? settings.defaultAffiliateStaffPermissions :
                     settings.defaultAffiliateReadonlyPermissions;
          default:
              return [];
      }
  },

  // --- Organization Stats ---
  async getOrganizationStats(orgId: string): Promise<OrganizationStats> {
      const members = await this.getOrganizationUsers(orgId);
      const invitations = await this.getTeamInvitations(orgId);
      const activities = await this.getOrganizationActivityLogs(orgId, 100);
      
      const activeMembers = members.filter(m => m.isActive);
      const pendingInvitations = invitations.filter(i => i.status === 'pending');
      
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const recentActivities = activities.filter(a => new Date(a.createdAt) > oneDayAgo);
      
      const rolesCounts: Record<OrganizationUserRole, number> = { owner: 0, manager: 0, staff: 0, readonly: 0 };
      activeMembers.forEach(m => { rolesCounts[m.role]++; });
      
      return {
          totalMembers: members.length,
          activeMembers: activeMembers.length,
          pendingInvitations: pendingInvitations.length,
          recentActivities: recentActivities.length,
          membersByRole: Object.entries(rolesCounts).map(([role, count]) => ({
              role: role as OrganizationUserRole,
              count
          }))
      };
  },

  // --- Check Team Limits ---
  async canAddTeamMember(orgId: string): Promise<{ allowed: boolean; reason?: string }> {
      const org = await this.getOrganizationById(orgId);
      if (!org) return { allowed: false, reason: 'المنظمة غير موجودة' };
      
      const settings = await this.getOrganizationSettings();
      
      // Check if teams are enabled for this org type
      const isEnabled = 
          (org.type === 'customer' && settings.enableTeamsForCustomers) ||
          (org.type === 'supplier' && settings.enableTeamsForSuppliers) ||
          (org.type === 'advertiser' && settings.enableTeamsForAdvertisers) ||
          (org.type === 'affiliate' && settings.enableTeamsForAffiliates);
      
      if (!isEnabled) {
          return { allowed: false, reason: 'إدارة الفريق غير مفعلة لهذا النوع من الحسابات' };
      }
      
      // Check member limit
      const members = await this.getOrganizationUsers(orgId);
      const activeMembers = members.filter(m => m.isActive);
      
      const maxLimit = 
          org.type === 'customer' ? settings.maxCustomerEmployees :
          org.type === 'supplier' ? settings.maxSupplierEmployees :
          org.type === 'advertiser' ? settings.maxAdvertiserEmployees :
          settings.maxAffiliateEmployees;
      
      if (activeMembers.length >= maxLimit) {
          return { allowed: false, reason: `تم الوصول للحد الأقصى من أعضاء الفريق (${maxLimit})` };
      }
      
      return { allowed: true };
  },

  // --- Check if user can manage team ---
  async canManageTeam(userId: string, orgId: string): Promise<boolean> {
      const org = await this.getOrganizationById(orgId);
      if (!org) return false;
      
      // Owner can always manage team
      if (org.ownerUserId === userId) return true;
      
      // Check if user has org_manage_team permission
      return await this.hasScopedPermission(userId, orgId, 'org_manage_team');
  },

  // =============================================================================
  // CUSTOMER PORTAL SETTINGS
  // =============================================================================

  async getCustomerPortalSettings(): Promise<CustomerPortalSettings> {
      const stored = localStorage.getItem('b2b_customer_portal_settings_v1');
      if (stored) {
          return JSON.parse(stored);
      }
      return this.getDefaultCustomerPortalSettings();
  },

  async saveCustomerPortalSettings(settings: CustomerPortalSettings): Promise<CustomerPortalSettings> {
      settings.lastModifiedAt = new Date().toISOString();
      localStorage.setItem('b2b_customer_portal_settings_v1', JSON.stringify(settings));
      return settings;
  },

  getDefaultCustomerPortalSettings(): CustomerPortalSettings {
      return {
          id: 'portal-settings-1',
          
          design: {
              themeMode: 'light',
              primaryColor: '#0B1B3A',
              accentColor: '#C8A04F',
              backgroundColor: '#f8fafc',
              sidebarColor: '#0B1B3A',
              fontFamily: 'Cairo',
              borderRadius: 'medium',
              enableAnimations: true
          },
          
          dashboardSections: [
              { id: 'hero', key: 'HERO_BANNERS', enabled: true, order: 1, title: { ar: 'البانرات الرئيسية', en: 'Hero Banners', hi: 'हीरो बैनर', zh: '主横幅' } },
              { id: 'search', key: 'SEARCH_BAR', enabled: true, order: 2, title: { ar: 'شريط البحث', en: 'Search Bar', hi: 'सर्च बार', zh: '搜索栏' } },
              { id: 'business-types', key: 'BUSINESS_TYPES', enabled: true, order: 3, title: { ar: 'من نخدم', en: 'Who We Serve', hi: 'हम किसकी सेवा करते हैं', zh: '我们服务谁' } },
              { id: 'services', key: 'MAIN_SERVICES', enabled: true, order: 4, title: { ar: 'خدماتنا الرئيسية', en: 'Our Main Services', hi: 'हमारी मुख्य सेवाएं', zh: '我们的主要服务' } },
              { id: 'how-it-works', key: 'HOW_IT_WORKS', enabled: true, order: 5, title: { ar: 'كيف تعمل المنظومة', en: 'How It Works', hi: 'यह कैसे काम करता है', zh: '如何运作' } },
              { id: 'why-sinicar', key: 'WHY_SINICAR', enabled: true, order: 6, title: { ar: 'لماذا صيني كار', en: 'Why SINI CAR', hi: 'सिनी कार क्यों', zh: '为什么选择SINI CAR' } },
              { id: 'marketing-cards', key: 'MARKETING_CARDS', enabled: true, order: 7, title: { ar: 'بطاقات التسويق', en: 'Marketing Cards', hi: 'मार्केटिंग कार्ड', zh: '营销卡片' } }
          ],
          
          navigationMenu: [
              { id: 'nav-home', key: 'HOME', enabled: true, order: 1, label: { ar: 'الرئيسية', en: 'Home', hi: 'होम', zh: '首页' }, icon: 'Home', requiresAuth: false },
              { id: 'nav-orders', key: 'ORDERS', enabled: true, order: 2, label: { ar: 'سجل الطلبات', en: 'Order History', hi: 'ऑर्डर इतिहास', zh: '订单历史' }, icon: 'ShoppingBag', requiresAuth: true },
              { id: 'nav-quotes', key: 'QUOTE_REQUEST', enabled: true, order: 3, label: { ar: 'طلبات التسعير', en: 'Quote Requests', hi: 'उद्धरण अनुरोध', zh: '报价请求' }, icon: 'FileText', requiresAuth: true },
              { id: 'nav-import', key: 'IMPORT_CHINA', enabled: true, order: 4, label: { ar: 'الاستيراد من الصين', en: 'Import from China', hi: 'चीन से आयात', zh: '从中国进口' }, icon: 'Globe', requiresAuth: true },
              { id: 'nav-tools', key: 'TRADER_TOOLS', enabled: true, order: 5, label: { ar: 'أدوات التاجر', en: 'Trader Tools', hi: 'व्यापारी उपकरण', zh: '交易工具' }, icon: 'Wrench', requiresAuth: true },
              { id: 'nav-org', key: 'ORGANIZATION', enabled: true, order: 6, label: { ar: 'إدارة المنشأة', en: 'Organization', hi: 'संगठन', zh: '组织管理' }, icon: 'Building2', requiresAuth: true, requiredPermission: 'org_view_dashboard' },
              { id: 'nav-team', key: 'TEAM_MANAGEMENT', enabled: true, order: 7, label: { ar: 'إدارة الفريق', en: 'Team Management', hi: 'टीम प्रबंधन', zh: '团队管理' }, icon: 'Users', requiresAuth: true, requiredPermission: 'org_manage_team' },
              { id: 'nav-history', key: 'HISTORY', enabled: true, order: 8, label: { ar: 'سجل البحث', en: 'Search History', hi: 'खोज इतिहास', zh: '搜索历史' }, icon: 'Clock', requiresAuth: true },
              { id: 'nav-about', key: 'ABOUT', enabled: true, order: 9, label: { ar: 'من نحن', en: 'About Us', hi: 'हमारे बारे में', zh: '关于我们' }, icon: 'Info', requiresAuth: false }
          ],
          
          features: {
              enableSearch: true,
              enableCart: true,
              enableOrders: true,
              enableQuoteRequests: true,
              enableImportFromChina: true,
              enableVinDecoder: true,
              enablePdfToExcel: true,
              enablePriceComparison: true,
              enableSupplierMarketplace: true,
              enableInstallments: true,
              enableOrganization: true,
              enableTeamManagement: true,
              enableMarketingBanners: true,
              enableMarketingPopups: true,
              enableMarketingCards: true,
              enableAnnouncementTicker: true,
              enableGuestMode: true,
              guestCanSearch: true,
              guestCanViewPrices: false
          },
          
          heroBanners: [
              {
                  id: 'banner-1',
                  enabled: true,
                  order: 1,
                  title: { ar: 'صيني كار.. بوابتك للمستودع', en: 'SINI CAR.. Your Gateway to Warehouse', hi: 'सिनी कार.. गोदाम का आपका प्रवेश द्वार', zh: 'SINI CAR..您的仓库门户' },
                  subtitle: { ar: 'اطلب قطع غيار شانجان و MG مباشرة من الموقع ووفر وقت الانتظار', en: 'Order Changan & MG parts directly and save waiting time', hi: 'चांगान और एमजी पार्ट्स सीधे ऑर्डर करें', zh: '直接订购长安和MG零件，节省等待时间' },
                  buttonText: { ar: 'ابدأ الطلب الآن', en: 'Start Ordering Now', hi: 'अभी ऑर्डर करें', zh: '立即开始订购' },
                  buttonUrl: '#search',
                  colorClass: 'from-primary-700 to-primary-900'
              },
              {
                  id: 'banner-2',
                  enabled: true,
                  order: 2,
                  title: { ar: 'وصل حديثاً: قطع جيلي وهافال', en: 'New Arrivals: Geely & Haval Parts', hi: 'नई आवक: जीली और हावल पार्ट्स', zh: '新品：吉利和哈弗零件' },
                  subtitle: { ar: 'تغطية شاملة لموديلات جيلي مونجارو وهافال H6 الجديدة', en: 'Comprehensive coverage for new Geely Monjaro and Haval H6 models', hi: 'नए जीली मोंजारो और हावल H6 मॉडल के लिए व्यापक कवरेज', zh: '全面覆盖吉利Monjaro和哈弗H6新车型' },
                  buttonText: { ar: 'تصفح القطع', en: 'Browse Parts', hi: 'पार्ट्स ब्राउज़ करें', zh: '浏览零件' },
                  buttonUrl: '#search',
                  colorClass: 'from-slate-700 to-slate-900'
              },
              {
                  id: 'banner-3',
                  enabled: true,
                  order: 3,
                  title: { ar: 'عروض الجملة الخاصة', en: 'Special Wholesale Offers', hi: 'विशेष थोक ऑफर', zh: '特别批发优惠' },
                  subtitle: { ar: 'أسعار خاصة لطلبات الجملة ومراكز الصيانة المعتمدة', en: 'Special prices for wholesale orders and authorized service centers', hi: 'थोक ऑर्डर और अधिकृत सर्विस सेंटर के लिए विशेष कीमतें', zh: '批发订单和授权服务中心的特别价格' },
                  buttonText: { ar: 'عروض الكميات', en: 'Bulk Offers', hi: 'बल्क ऑफर', zh: '批量优惠' },
                  buttonUrl: '#offers',
                  colorClass: 'from-secondary-600 to-secondary-800'
              }
          ],
          
          announcements: [
              {
                  id: 'announcement-1',
                  enabled: true,
                  type: 'ticker',
                  content: { 
                      ar: 'مرحباً بكم في بوابة عملاء الجملة - صيني كار لقطع غيار السيارات الصينية. شحن مجاني للطلبات فوق 5000 ريال.', 
                      en: 'Welcome to SINI CAR B2B Portal - Your trusted source for Chinese auto parts. Free shipping for orders over 5000 SAR.', 
                      hi: 'सिनी कार B2B पोर्टल में आपका स्वागत है - चीनी ऑटो पार्ट्स के लिए आपका विश्वसनीय स्रोत।', 
                      zh: '欢迎来到SINI CAR B2B门户 - 您值得信赖的中国汽车零件来源。' 
                  },
                  backgroundColor: '#0f172a',
                  textColor: '#fb923c',
                  dismissible: false
              }
          ],
          
          infoCards: [
              {
                  id: 'card-1',
                  enabled: true,
                  order: 1,
                  icon: 'Shield',
                  title: { ar: 'قطع أصلية ومضمونة', en: 'Genuine & Guaranteed Parts', hi: 'असली और गारंटीकृत पार्ट्स', zh: '正品保证零件' },
                  description: { ar: 'موزع معتمد لقطع غيار شانجان، إم جي، جيلي، وهافال.', en: 'Authorized distributor for Changan, MG, Geely, and Haval parts.', hi: 'चांगान, एमजी, जीली और हावल पार्ट्स के अधिकृत वितरक।', zh: '长安、MG、吉利和哈弗零件的授权经销商。' },
                  colorClass: 'bg-green-50 text-green-600'
              },
              {
                  id: 'card-2',
                  enabled: true,
                  order: 2,
                  icon: 'Truck',
                  title: { ar: 'شحن سريع للمناطق', en: 'Fast Regional Shipping', hi: 'तेज़ क्षेत्रीय शिपिंग', zh: '快速区域配送' },
                  description: { ar: 'شحن خلال 24 ساعة للمدن الرئيسية وشحن مبرد للمناطق البعيدة.', en: '24-hour shipping to major cities with refrigerated shipping for remote areas.', hi: 'प्रमुख शहरों में 24 घंटे की शिपिंग।', zh: '主要城市24小时送货。' },
                  colorClass: 'bg-blue-50 text-blue-600'
              },
              {
                  id: 'card-3',
                  enabled: true,
                  order: 3,
                  icon: 'BadgeDollarSign',
                  title: { ar: 'أسعار جملة تنافسية', en: 'Competitive Wholesale Prices', hi: 'प्रतिस्पर्धी थोक कीमतें', zh: '有竞争力的批发价格' },
                  description: { ar: 'نظام تسعير ذكي يعتمد على حجم مشترياتك.', en: 'Smart pricing system based on your purchase volume.', hi: 'आपकी खरीद मात्रा पर आधारित स्मार्ट मूल्य निर्धारण प्रणाली।', zh: '基于您的采购量的智能定价系统。' },
                  colorClass: 'bg-amber-50 text-amber-600'
              }
          ],
          
          lastModifiedAt: new Date().toISOString()
      };
  },

  async resetCustomerPortalSettings(): Promise<CustomerPortalSettings> {
      const defaults = this.getDefaultCustomerPortalSettings();
      localStorage.setItem('b2b_customer_portal_settings_v1', JSON.stringify(defaults));
      return defaults;
  },

  // =============================================================================
  // AI SETTINGS MANAGEMENT
  // =============================================================================

  async getAISettings(): Promise<AISettings> {
      const stored = localStorage.getItem('b2b_ai_settings_v1');
      if (stored) {
          return JSON.parse(stored);
      }
      return this.getDefaultAISettings();
  },

  async saveAISettings(settings: AISettings): Promise<AISettings> {
      settings.lastModifiedAt = new Date().toISOString();
      localStorage.setItem('b2b_ai_settings_v1', JSON.stringify(settings));
      return settings;
  },

  getDefaultAISettings(): AISettings {
      return {
          id: 'ai-settings-1',
          enabled: true,
          defaultProvider: 'openai',
          
          providers: [
              {
                  id: 'openai-provider',
                  provider: 'openai',
                  displayName: { ar: 'OpenAI', en: 'OpenAI', hi: 'OpenAI', zh: 'OpenAI' },
                  enabled: true,
                  isDefault: true,
                  model: 'gpt-4o-mini',
                  maxTokens: 4096,
                  maxRequestsPerMinute: 60,
                  maxRequestsPerDay: 1000,
                  supportsChat: true,
                  supportsImageGeneration: true,
                  supportsVision: true,
                  supportsAudio: false,
                  inputTokenCost: 0.15,
                  outputTokenCost: 0.60
              },
              {
                  id: 'gemini-provider',
                  provider: 'gemini',
                  displayName: { ar: 'Google Gemini', en: 'Google Gemini', hi: 'Google Gemini', zh: 'Google Gemini' },
                  enabled: false,
                  isDefault: false,
                  model: 'gemini-2.5-flash',
                  maxTokens: 8192,
                  maxRequestsPerMinute: 60,
                  maxRequestsPerDay: 1500,
                  supportsChat: true,
                  supportsImageGeneration: true,
                  supportsVision: true,
                  supportsAudio: true,
                  inputTokenCost: 0.075,
                  outputTokenCost: 0.30
              },
              {
                  id: 'anthropic-provider',
                  provider: 'anthropic',
                  displayName: { ar: 'Anthropic Claude', en: 'Anthropic Claude', hi: 'Anthropic Claude', zh: 'Anthropic Claude' },
                  enabled: false,
                  isDefault: false,
                  model: 'claude-sonnet-4-5',
                  maxTokens: 4096,
                  maxRequestsPerMinute: 50,
                  maxRequestsPerDay: 500,
                  supportsChat: true,
                  supportsImageGeneration: false,
                  supportsVision: true,
                  supportsAudio: false,
                  inputTokenCost: 3.0,
                  outputTokenCost: 15.0
              }
          ],
          
          features: {
              enableAIAssistant: true,
              enableAIProductSearch: true,
              enableAIPartMatching: true,
              enableAIVinDecoding: true,
              enableAIPriceAnalysis: true,
              enableAITranslation: true,
              enableAIOrderAnalysis: true,
              enableAICustomerInsights: true,
              enableAIReports: true,
              enableAIFraudDetection: false,
              enableAIInventoryPrediction: false,
              enableAIContentGeneration: true,
              enableAICampaignOptimization: false
          },
          
          usageLimits: [
              {
                  role: 'SUPER_ADMIN',
                  dailyRequests: 500,
                  monthlyRequests: 10000,
                  maxTokensPerRequest: 8192,
                  allowedFeatures: ['all']
              },
              {
                  role: 'CUSTOMER_OWNER',
                  dailyRequests: 100,
                  monthlyRequests: 2000,
                  maxTokensPerRequest: 4096,
                  allowedFeatures: ['enableAIAssistant', 'enableAIProductSearch', 'enableAIPartMatching', 'enableAIVinDecoding', 'enableAIPriceAnalysis']
              },
              {
                  role: 'CUSTOMER_STAFF',
                  dailyRequests: 50,
                  monthlyRequests: 1000,
                  maxTokensPerRequest: 2048,
                  allowedFeatures: ['enableAIAssistant', 'enableAIProductSearch']
              }
          ],
          
          systemPrompts: {
              customerAssistant: {
                  ar: 'أنت مساعد ذكي لعملاء صيني كار B2B. ساعد العملاء في البحث عن قطع الغيار، الأسعار، وحالة الطلبات. كن مهذباً ومفيداً.',
                  en: 'You are an AI assistant for SINI CAR B2B customers. Help customers find spare parts, prices, and order status. Be polite and helpful.',
                  hi: 'आप सिनी कार B2B ग्राहकों के लिए एक एआई सहायक हैं। ग्राहकों को स्पेयर पार्ट्स, कीमतें और ऑर्डर स्थिति खोजने में मदद करें।',
                  zh: '您是SINI CAR B2B客户的AI助手。帮助客户查找备件、价格和订单状态。请礼貌且乐于助人。'
              },
              productSearch: {
                  ar: 'ساعد المستخدم في البحث عن قطع غيار السيارات الصينية. استخدم أرقام القطع وأسماء العلامات التجارية مثل شانجان، MG، جيلي، هافال.',
                  en: 'Help the user search for Chinese car spare parts. Use part numbers and brand names like Changan, MG, Geely, Haval.',
                  hi: 'उपयोगकर्ता को चीनी कार स्पेयर पार्ट्स खोजने में मदद करें। चांगान, एमजी, जीली, हावल जैसे पार्ट नंबर और ब्रांड नाम का उपयोग करें।',
                  zh: '帮助用户搜索中国汽车零配件。使用零件号和品牌名称，如长安、MG、吉利、哈弗。'
              },
              partMatching: {
                  ar: 'قم بمطابقة القطع بناءً على رقم VIN أو وصف السيارة. حدد القطع المتوافقة مع الموديل والسنة.',
                  en: 'Match parts based on VIN number or vehicle description. Identify parts compatible with the model and year.',
                  hi: 'VIN नंबर या वाहन विवरण के आधार पर पार्ट्स का मिलान करें। मॉडल और वर्ष के साथ संगत पार्ट्स की पहचान करें।',
                  zh: '根据VIN号或车辆描述匹配零件。识别与型号和年份兼容的零件。'
              }
          },
          
          enableContentModeration: true,
          blockedTopics: ['weapons', 'drugs', 'violence', 'politics'],
          maxConversationLength: 50,
          
          trackUsage: true,
          trackCosts: true,
          
          lastModifiedAt: new Date().toISOString()
      };
  },

  async resetAISettings(): Promise<AISettings> {
      const defaults = this.getDefaultAISettings();
      localStorage.setItem('b2b_ai_settings_v1', JSON.stringify(defaults));
      return defaults;
  },

  // =============================================================================
  // AI CONVERSATIONS & USAGE
  // =============================================================================

  async getAIConversations(userId: string): Promise<AIConversation[]> {
      const stored = localStorage.getItem(`b2b_ai_conversations_${userId}`);
      if (stored) {
          return JSON.parse(stored);
      }
      return [];
  },

  async saveAIConversation(conversation: AIConversation): Promise<AIConversation> {
      const conversations = await this.getAIConversations(conversation.userId);
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
          conversations[existingIndex] = conversation;
      } else {
          conversations.unshift(conversation);
      }
      
      // Keep only last 50 conversations
      const trimmed = conversations.slice(0, 50);
      localStorage.setItem(`b2b_ai_conversations_${conversation.userId}`, JSON.stringify(trimmed));
      return conversation;
  },

  async sendAIMessage(params: {
      message: string;
      conversationHistory?: AIChatMessage[];
      systemPrompt?: string;
      userId?: string;
      language?: string;
  }): Promise<{ content: string; tokensUsed?: number }> {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      
      const { message, language = 'ar' } = params;
      
      const responses: Record<string, { ar: string; en: string }> = {
          search: {
              ar: 'يمكنني مساعدتك في البحث عن قطع الغيار. ما نوع القطعة التي تبحث عنها؟ يرجى إخباري بنوع السيارة أو رقم القطعة.',
              en: 'I can help you search for auto parts. What type of part are you looking for? Please tell me the vehicle type or part number.'
          },
          order: {
              ar: 'لمعرفة حالة طلبك، يرجى تزويدي برقم الطلب. يمكنك العثور عليه في بريدك الإلكتروني أو في صفحة طلباتي.',
              en: 'To check your order status, please provide your order number. You can find it in your email or on the My Orders page.'
          },
          price: {
              ar: 'سأساعدك في مقارنة الأسعار. أخبرني باسم القطعة أو رقمها وسأعرض لك أفضل الخيارات المتاحة.',
              en: 'I will help you compare prices. Tell me the part name or number and I will show you the best available options.'
          },
          default: {
              ar: 'شكراً لتواصلك معنا! كيف يمكنني مساعدتك اليوم؟ يمكنني المساعدة في البحث عن قطع الغيار، تتبع الطلبات، ومقارنة الأسعار.',
              en: 'Thank you for contacting us! How can I help you today? I can assist with finding parts, tracking orders, and comparing prices.'
          }
      };
      
      const lowerMessage = message.toLowerCase();
      let responseKey = 'default';
      
      if (lowerMessage.includes('بحث') || lowerMessage.includes('قطعة') || lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('part')) {
          responseKey = 'search';
      } else if (lowerMessage.includes('طلب') || lowerMessage.includes('order') || lowerMessage.includes('status')) {
          responseKey = 'order';
      } else if (lowerMessage.includes('سعر') || lowerMessage.includes('مقارنة') || lowerMessage.includes('price') || lowerMessage.includes('compare')) {
          responseKey = 'price';
      }
      
      const lang = language === 'ar' ? 'ar' : 'en';
      
      return {
          content: responses[responseKey][lang],
          tokensUsed: Math.floor(50 + Math.random() * 100)
      };
  },

  async deleteAIConversation(userId: string, conversationId: string): Promise<boolean> {
      const conversations = await this.getAIConversations(userId);
      const filtered = conversations.filter(c => c.id !== conversationId);
      localStorage.setItem(`b2b_ai_conversations_${userId}`, JSON.stringify(filtered));
      return true;
  },

  async getAIUsageLogs(userId?: string): Promise<AIUsageLog[]> {
      const stored = localStorage.getItem('b2b_ai_usage_logs');
      let logs: AIUsageLog[] = stored ? JSON.parse(stored) : [];
      
      if (userId) {
          logs = logs.filter(l => l.userId === userId);
      }
      
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async logAIUsage(log: AIUsageLog): Promise<void> {
      const logs = await this.getAIUsageLogs();
      logs.unshift(log);
      // Keep only last 1000 logs
      const trimmed = logs.slice(0, 1000);
      localStorage.setItem('b2b_ai_usage_logs', JSON.stringify(trimmed));
  },

  // =============================================================================
  // TRADER TOOLS STORAGE - Saved Comparisons & Extractions
  // =============================================================================

  async getSavedPriceComparisons(userId: string): Promise<SavedPriceComparison[]> {
      const stored = localStorage.getItem(`b2b_saved_comparisons_${userId}`);
      if (stored) {
          return JSON.parse(stored);
      }
      return [];
  },

  async savePriceComparison(comparison: SavedPriceComparison): Promise<SavedPriceComparison> {
      const comparisons = await this.getSavedPriceComparisons(comparison.userId);
      const existingIndex = comparisons.findIndex(c => c.id === comparison.id);
      
      if (existingIndex >= 0) {
          comparisons[existingIndex] = { ...comparison, updatedAt: new Date().toISOString() };
      } else {
          comparison.createdAt = new Date().toISOString();
          comparison.updatedAt = comparison.createdAt;
          comparisons.unshift(comparison);
      }
      
      localStorage.setItem(`b2b_saved_comparisons_${comparison.userId}`, JSON.stringify(comparisons));
      return comparison;
  },

  async deletePriceComparison(userId: string, comparisonId: string): Promise<boolean> {
      const comparisons = await this.getSavedPriceComparisons(userId);
      const filtered = comparisons.filter(c => c.id !== comparisonId);
      localStorage.setItem(`b2b_saved_comparisons_${userId}`, JSON.stringify(filtered));
      return true;
  },

  async getSavedVinExtractions(userId: string): Promise<SavedVinExtraction[]> {
      const stored = localStorage.getItem(`b2b_saved_vins_${userId}`);
      if (stored) {
          return JSON.parse(stored);
      }
      return [];
  },

  async saveVinExtraction(extraction: SavedVinExtraction): Promise<SavedVinExtraction> {
      const extractions = await this.getSavedVinExtractions(extraction.userId);
      const existingIndex = extractions.findIndex(e => e.id === extraction.id);
      
      if (existingIndex >= 0) {
          extractions[existingIndex] = { ...extraction, updatedAt: new Date().toISOString() };
      } else {
          extraction.createdAt = new Date().toISOString();
          extraction.updatedAt = extraction.createdAt;
          extractions.unshift(extraction);
      }
      
      localStorage.setItem(`b2b_saved_vins_${extraction.userId}`, JSON.stringify(extractions));
      return extraction;
  },

  async deleteVinExtraction(userId: string, extractionId: string): Promise<boolean> {
      const extractions = await this.getSavedVinExtractions(userId);
      const filtered = extractions.filter(e => e.id !== extractionId);
      localStorage.setItem(`b2b_saved_vins_${userId}`, JSON.stringify(filtered));
      return true;
  },

  async getSavedQuoteTemplates(userId: string): Promise<SavedQuoteTemplate[]> {
      const stored = localStorage.getItem(`b2b_quote_templates_${userId}`);
      if (stored) {
          return JSON.parse(stored);
      }
      return [];
  },

  async saveQuoteTemplate(template: SavedQuoteTemplate): Promise<SavedQuoteTemplate> {
      const templates = await this.getSavedQuoteTemplates(template.userId);
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
          templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
      } else {
          template.createdAt = new Date().toISOString();
          template.updatedAt = template.createdAt;
          template.usageCount = 0;
          templates.unshift(template);
      }
      
      localStorage.setItem(`b2b_quote_templates_${template.userId}`, JSON.stringify(templates));
      return template;
  },

  async deleteQuoteTemplate(userId: string, templateId: string): Promise<boolean> {
      const templates = await this.getSavedQuoteTemplates(userId);
      const filtered = templates.filter(t => t.id !== templateId);
      localStorage.setItem(`b2b_quote_templates_${userId}`, JSON.stringify(filtered));
      return true;
  },

  async getFileConversionHistory(userId: string): Promise<FileConversionRecord[]> {
      const stored = localStorage.getItem(`b2b_file_conversions_${userId}`);
      if (stored) {
          return JSON.parse(stored);
      }
      return [];
  },

  async saveFileConversion(record: FileConversionRecord): Promise<FileConversionRecord> {
      const records = await this.getFileConversionHistory(record.userId);
      records.unshift(record);
      // Keep only last 100 conversions
      const trimmed = records.slice(0, 100);
      localStorage.setItem(`b2b_file_conversions_${record.userId}`, JSON.stringify(trimmed));
      return record;
  },

  // =============================================================================
  // SECURITY SETTINGS
  // =============================================================================

  async getSecuritySettings(): Promise<SecuritySettings> {
      const stored = localStorage.getItem('b2b_security_settings_v1');
      if (stored) {
          return JSON.parse(stored);
      }
      return this.getDefaultSecuritySettings();
  },

  async saveSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
      settings.lastModifiedAt = new Date().toISOString();
      localStorage.setItem('b2b_security_settings_v1', JSON.stringify(settings));
      return settings;
  },

  getDefaultSecuritySettings(): SecuritySettings {
      return {
          id: 'security-settings-1',
          
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireLowercase: true,
          passwordRequireNumbers: true,
          passwordRequireSymbols: false,
          passwordExpiryDays: 90,
          passwordHistoryCount: 3,
          
          maxLoginAttempts: 5,
          lockoutDurationMinutes: 30,
          sessionTimeoutMinutes: 60,
          allowMultipleSessions: true,
          
          twoFactor: {
              enabled: false,
              method: 'email',
              requiredForAdmins: true,
              requiredForFinancial: true,
              graceLoginCount: 3
          },
          
          enableIPWhitelist: false,
          ipWhitelist: [],
          enableGeoBlocking: false,
          blockedCountries: [],
          
          enableRiskDetection: true,
          riskThreshold: 70,
          notifyOnSuspiciousLogin: true,
          
          enableAuditLog: true,
          auditRetentionDays: 90,
          
          lastModifiedAt: new Date().toISOString()
      };
  },

  async getLoginHistory(userId?: string): Promise<LoginRecord[]> {
      const stored = localStorage.getItem('b2b_login_history');
      let records: LoginRecord[] = stored ? JSON.parse(stored) : [];
      
      if (userId) {
          records = records.filter(r => r.userId === userId);
      }
      
      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async logLogin(record: LoginRecord): Promise<void> {
      const records = await this.getLoginHistory();
      records.unshift(record);
      // Keep only last 1000 login records
      const trimmed = records.slice(0, 1000);
      localStorage.setItem('b2b_login_history', JSON.stringify(trimmed));
  },

  // =============================================================================
  // MARKETING SETTINGS - Coupons & Loyalty
  // =============================================================================

  async getCoupons(): Promise<CouponCode[]> {
      const stored = localStorage.getItem('b2b_coupons');
      if (stored) {
          return JSON.parse(stored);
      }
      return [];
  },

  async saveCoupon(coupon: CouponCode): Promise<CouponCode> {
      const coupons = await this.getCoupons();
      const existingIndex = coupons.findIndex(c => c.id === coupon.id);
      
      if (existingIndex >= 0) {
          coupons[existingIndex] = coupon;
      } else {
          coupon.createdAt = new Date().toISOString();
          coupon.usageCount = 0;
          coupons.push(coupon);
      }
      
      localStorage.setItem('b2b_coupons', JSON.stringify(coupons));
      return coupon;
  },

  async deleteCoupon(couponId: string): Promise<boolean> {
      const coupons = await this.getCoupons();
      const filtered = coupons.filter(c => c.id !== couponId);
      localStorage.setItem('b2b_coupons', JSON.stringify(filtered));
      return true;
  },

  async getLoyaltySettings(): Promise<LoyaltySettings> {
      const stored = localStorage.getItem('b2b_loyalty_settings');
      if (stored) {
          return JSON.parse(stored);
      }
      return this.getDefaultLoyaltySettings();
  },

  async saveLoyaltySettings(settings: LoyaltySettings): Promise<LoyaltySettings> {
      settings.lastModifiedAt = new Date().toISOString();
      localStorage.setItem('b2b_loyalty_settings', JSON.stringify(settings));
      return settings;
  },

  getDefaultLoyaltySettings(): LoyaltySettings {
      return {
          id: 'loyalty-settings-1',
          enabled: true,
          programName: { 
              ar: 'برنامج ولاء صيني كار', 
              en: 'SINI CAR Loyalty Program',
              hi: 'सिनी कार लॉयल्टी प्रोग्राम',
              zh: 'SINI CAR 忠诚度计划'
          },
          pointsPerCurrency: 1, // 1 point per 1 SAR
          pointsRedemptionRate: 0.1, // 10 points = 1 SAR
          levels: [
              {
                  id: 'bronze',
                  name: { ar: 'البرونزي', en: 'Bronze', hi: 'ब्रॉन्ज', zh: '青铜' },
                  minPoints: 0,
                  maxPoints: 999,
                  benefits: [
                      { type: 'discount', value: 2, description: { ar: 'خصم 2% على جميع الطلبات', en: '2% discount on all orders', hi: 'सभी ऑर्डर पर 2% छूट', zh: '所有订单2%折扣' } }
                  ],
                  color: '#CD7F32'
              },
              {
                  id: 'silver',
                  name: { ar: 'الفضي', en: 'Silver', hi: 'सिल्वर', zh: '白银' },
                  minPoints: 1000,
                  maxPoints: 4999,
                  benefits: [
                      { type: 'discount', value: 5, description: { ar: 'خصم 5% على جميع الطلبات', en: '5% discount on all orders', hi: 'सभी ऑर्डर पर 5% छूट', zh: '所有订单5%折扣' } },
                      { type: 'priority_support', description: { ar: 'دعم فني مميز', en: 'Priority support', hi: 'प्राथमिकता समर्थन', zh: '优先支持' } }
                  ],
                  color: '#C0C0C0'
              },
              {
                  id: 'gold',
                  name: { ar: 'الذهبي', en: 'Gold', hi: 'गोल्ड', zh: '黄金' },
                  minPoints: 5000,
                  maxPoints: 14999,
                  benefits: [
                      { type: 'discount', value: 10, description: { ar: 'خصم 10% على جميع الطلبات', en: '10% discount on all orders', hi: 'सभी ऑर्डर पर 10% छूट', zh: '所有订单10%折扣' } },
                      { type: 'free_shipping', description: { ar: 'شحن مجاني', en: 'Free shipping', hi: 'मुफ्त शिपिंग', zh: '免费送货' } },
                      { type: 'priority_support', description: { ar: 'دعم فني VIP', en: 'VIP support', hi: 'वीआईपी समर्थन', zh: 'VIP支持' } }
                  ],
                  color: '#FFD700'
              },
              {
                  id: 'platinum',
                  name: { ar: 'البلاتيني', en: 'Platinum', hi: 'प्लैटिनम', zh: '白金' },
                  minPoints: 15000,
                  benefits: [
                      { type: 'discount', value: 15, description: { ar: 'خصم 15% على جميع الطلبات', en: '15% discount on all orders', hi: 'सभी ऑर्डर पर 15% छूट', zh: '所有订单15%折扣' } },
                      { type: 'free_shipping', description: { ar: 'شحن مجاني ومعجل', en: 'Free express shipping', hi: 'मुफ्त एक्सप्रेस शिपिंग', zh: '免费快递' } },
                      { type: 'exclusive_access', description: { ar: 'وصول حصري للعروض', en: 'Exclusive offer access', hi: 'विशेष ऑफ़र एक्सेस', zh: '独家优惠访问' } },
                      { type: 'priority_support', description: { ar: 'مدير حساب شخصي', en: 'Personal account manager', hi: 'व्यक्तिगत खाता प्रबंधक', zh: '个人客户经理' } }
                  ],
                  color: '#E5E4E2'
              }
          ],
          pointsExpiryDays: 365,
          allowPartialRedemption: true,
          minimumRedemptionPoints: 100,
          lastModifiedAt: new Date().toISOString()
      };
  },

  async getCustomerLoyalty(userId: string): Promise<CustomerLoyalty | null> {
      const stored = localStorage.getItem(`b2b_customer_loyalty_${userId}`);
      if (stored) {
          return JSON.parse(stored);
      }
      return null;
  },

  async saveCustomerLoyalty(loyalty: CustomerLoyalty): Promise<CustomerLoyalty> {
      loyalty.lastActivityAt = new Date().toISOString();
      localStorage.setItem(`b2b_customer_loyalty_${loyalty.userId}`, JSON.stringify(loyalty));
      return loyalty;
  },

  // =============================================================================
  // ADVANCED NOTIFICATION SETTINGS
  // =============================================================================

  async getAdvancedNotificationSettings(): Promise<AdvancedNotificationSettings> {
      const stored = localStorage.getItem('b2b_advanced_notification_settings_v1');
      if (stored) {
          return JSON.parse(stored);
      }
      return this.getDefaultAdvancedNotificationSettings();
  },

  async saveAdvancedNotificationSettings(settings: AdvancedNotificationSettings): Promise<AdvancedNotificationSettings> {
      settings.lastModifiedAt = new Date().toISOString();
      localStorage.setItem('b2b_advanced_notification_settings_v1', JSON.stringify(settings));
      return settings;
  },

  getDefaultAdvancedNotificationSettings(): AdvancedNotificationSettings {
      return {
          id: 'notification-settings-1',
          enabled: true,
          defaultChannels: ['toast', 'bell'],
          
          emailConfig: {
              enabled: true,
              senderName: 'SINI CAR B2B',
              senderEmail: 'noreply@sinicar.com'
          },
          smsConfig: {
              enabled: false,
              provider: 'twilio'
          },
          whatsappConfig: {
              enabled: false,
              provider: 'twilio'
          },
          pushConfig: {
              enabled: false
          },
          
          templates: [],
          defaultPreferences: [],
          
          lastModifiedAt: new Date().toISOString()
      };
  },

  // =============================================================================
  // EXTENDED ACTIVITY LOG SYSTEM
  // =============================================================================

  determineActorType(user: User): ActorType {
      if (user.extendedRole === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'ADMIN';
      if (user.extendedRole === 'EMPLOYEE' || user.employeeRole) return 'EMPLOYEE';
      if (user.extendedRole === 'MARKETER') return 'MARKETER';
      if (user.isSupplier || user.extendedRole?.startsWith('SUPPLIER_')) return 'SUPPLIER';
      return 'CUSTOMER';
  },

  async logActivityExtended(params: {
      actorId: string;
      actorName?: string;
      actorType: ActorType;
      actionType: ActivityEventType;
      entityType?: EntityType;
      entityId?: string;
      description: string;
      page?: string;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
  }): Promise<ActivityLogEntry> {
      const logs = await this.getActivityLogs();
      
      const newLog: ActivityLogEntry = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: params.actorId,
          userName: params.actorName,
          eventType: params.actionType,
          actorType: params.actorType,
          entityType: params.entityType,
          entityId: params.entityId,
          description: params.description,
          page: params.page,
          metadata: params.metadata,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          createdAt: new Date().toISOString()
      };
      
      logs.unshift(newLog);
      
      if (logs.length > 10000) {
          logs.length = 10000;
      }
      
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
      return newLog;
  },

  async getActivityLogsFiltered(filters: ActivityLogFilters): Promise<ActivityLogResponse> {
      const logs = await this.getActivityLogs();
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 50;
      
      let filtered = logs.filter(log => {
          if (filters.actorType && log.actorType !== filters.actorType) return false;
          if (filters.actorId && log.userId !== filters.actorId) return false;
          if (filters.actionType && log.eventType !== filters.actionType) return false;
          if (filters.entityType && log.entityType !== filters.entityType) return false;
          if (filters.entityId && log.entityId !== filters.entityId) return false;
          
          if (filters.dateFrom) {
              const logDate = new Date(log.createdAt);
              const fromDate = new Date(filters.dateFrom);
              if (logDate < fromDate) return false;
          }
          
          if (filters.dateTo) {
              const logDate = new Date(log.createdAt);
              const toDate = new Date(filters.dateTo);
              toDate.setHours(23, 59, 59, 999);
              if (logDate > toDate) return false;
          }
          
          return true;
      });
      
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const total = filtered.length;
      const startIndex = (page - 1) * pageSize;
      const items = filtered.slice(startIndex, startIndex + pageSize);
      
      return {
          items,
          page,
          pageSize,
          total
      };
  },

  async updateUserLastActivity(userId: string): Promise<void> {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
          const user = users[userIndex];
          const now = new Date();
          const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
          
          if (!lastActive || (now.getTime() - lastActive.getTime()) > 2 * 60 * 1000) {
              users[userIndex] = {
                  ...user,
                  lastActiveAt: now.toISOString()
              };
              this.saveUsers(users);
          }
      }
  },

  async getOnlineUsersGrouped(onlineMinutes: number = 5): Promise<OnlineUsersResponse> {
      const users = this.getUsers();
      const cutoffTime = new Date(Date.now() - onlineMinutes * 60 * 1000);
      
      const onlineUsers = users.filter(u => {
          if (!u.lastActiveAt) return false;
          return new Date(u.lastActiveAt) >= cutoffTime;
      });
      
      const response: OnlineUsersResponse = {
          onlineCustomers: [],
          onlineSuppliers: [],
          onlineMarketers: [],
          onlineEmployees: [],
          onlineAdmins: []
      };
      
      for (const user of onlineUsers) {
          const onlineUser: OnlineUser = {
              id: user.id,
              name: user.name,
              actorType: this.determineActorType(user),
              role: user.role,
              lastActivityAt: user.lastActiveAt || ''
          };
          
          switch (onlineUser.actorType) {
              case 'ADMIN':
                  response.onlineAdmins.push(onlineUser);
                  break;
              case 'EMPLOYEE':
                  response.onlineEmployees.push(onlineUser);
                  break;
              case 'MARKETER':
                  response.onlineMarketers.push(onlineUser);
                  break;
              case 'SUPPLIER':
                  response.onlineSuppliers.push(onlineUser);
                  break;
              default:
                  response.onlineCustomers.push(onlineUser);
          }
      }
      
      return response;
  },

  async getActivityStats(): Promise<{
      totalLogs: number;
      todayLogs: number;
      logsByActorType: Record<ActorType, number>;
      logsByActionType: Record<string, number>;
  }> {
      const logs = await this.getActivityLogs();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayLogs = logs.filter(log => new Date(log.createdAt) >= today);
      
      const logsByActorType: Record<ActorType, number> = {
          CUSTOMER: 0,
          SUPPLIER: 0,
          MARKETER: 0,
          EMPLOYEE: 0,
          ADMIN: 0
      };
      
      const logsByActionType: Record<string, number> = {};
      
      for (const log of logs) {
          if (log.actorType) {
              logsByActorType[log.actorType]++;
          }
          if (log.eventType) {
              logsByActionType[log.eventType] = (logsByActionType[log.eventType] || 0) + 1;
          }
      }
      
      return {
          totalLogs: logs.length,
          todayLogs: todayLogs.length,
          logsByActorType,
          logsByActionType
      };
  }
};
