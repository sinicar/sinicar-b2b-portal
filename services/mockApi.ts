
import { BusinessProfile, User, Product, Order, OrderStatus, UserRole, CustomerType, Branch, Banner, SiteSettings, QuoteRequest, EmployeeRole, SearchHistoryItem, MissingProductRequest, QuoteItem, ImportRequest, ImportRequestStatus, ImportRequestTimelineEntry, AccountOpeningRequest, AccountRequestStatus, Notification, NotificationType, ActivityLogEntry, ActivityEventType, OrderInternalStatus, PriceLevel, BusinessCustomerType, QuoteItemApprovalStatus, QuoteRequestStatus, MissingStatus, MissingSource, CustomerStatus } from '../types';
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
    rateLimit: 120
  },
  // Default Status Labels Configuration
  statusLabels: {
    orderStatus: {
      'PENDING': { label: 'بانتظار الموافقة', color: '#f59e0b', bgColor: '#fef3c7' },
      'APPROVED': { label: 'تم الاعتماد', color: '#10b981', bgColor: '#d1fae5' },
      'REJECTED': { label: 'مرفوض', color: '#ef4444', bgColor: '#fee2e2' },
      'SHIPPED': { label: 'تم الشحن', color: '#3b82f6', bgColor: '#dbeafe' },
      'DELIVERED': { label: 'تم التسليم', color: '#059669', bgColor: '#a7f3d0' },
      'CANCELLED': { label: 'تم الإلغاء', color: '#6b7280', bgColor: '#f3f4f6' }
    },
    orderInternalStatus: {
      'NEW': { label: 'طلب جديد', color: '#8b5cf6', bgColor: '#ede9fe' },
      'SENT_TO_WAREHOUSE': { label: 'تم الإرسال للمستودع', color: '#3b82f6', bgColor: '#dbeafe' },
      'WAITING_PAYMENT': { label: 'بانتظار التحويل', color: '#f59e0b', bgColor: '#fef3c7' },
      'PAYMENT_CONFIRMED': { label: 'تم تأكيد الدفع', color: '#10b981', bgColor: '#d1fae5' },
      'SALES_INVOICE_CREATED': { label: 'تم إصدار الفاتورة', color: '#06b6d4', bgColor: '#cffafe' },
      'READY_FOR_SHIPMENT': { label: 'جاهز للشحن', color: '#0ea5e9', bgColor: '#e0f2fe' },
      'COMPLETED_INTERNAL': { label: 'مكتمل داخلياً', color: '#059669', bgColor: '#a7f3d0' },
      'CANCELLED_INTERNAL': { label: 'ملغى داخلياً', color: '#6b7280', bgColor: '#f3f4f6' }
    },
    accountRequestStatus: {
      'NEW': { label: 'طلب جديد', color: '#8b5cf6', bgColor: '#ede9fe' },
      'UNDER_REVIEW': { label: 'قيد المراجعة', color: '#f59e0b', bgColor: '#fef3c7' },
      'APPROVED': { label: 'تم الموافقة', color: '#10b981', bgColor: '#d1fae5' },
      'REJECTED': { label: 'مرفوض', color: '#ef4444', bgColor: '#fee2e2' },
      'ON_HOLD': { label: 'مؤجل', color: '#6b7280', bgColor: '#f3f4f6' }
    },
    quoteRequestStatus: {
      'NEW': { label: 'جديد', color: '#8b5cf6', bgColor: '#ede9fe' },
      'UNDER_REVIEW': { label: 'قيد المراجعة', color: '#f59e0b', bgColor: '#fef3c7' },
      'PARTIALLY_APPROVED': { label: 'معتمد جزئياً', color: '#06b6d4', bgColor: '#cffafe' },
      'APPROVED': { label: 'تم التسعير', color: '#10b981', bgColor: '#d1fae5' },
      'QUOTED': { label: 'تم التسعير', color: '#10b981', bgColor: '#d1fae5' },
      'PROCESSED': { label: 'تمت المعالجة', color: '#059669', bgColor: '#a7f3d0' },
      'REJECTED': { label: 'مرفوض', color: '#ef4444', bgColor: '#fee2e2' }
    },
    quoteItemStatus: {
      'PENDING': { label: 'قيد الانتظار', color: '#f59e0b', bgColor: '#fef3c7' },
      'MATCHED': { label: 'تم المطابقة', color: '#10b981', bgColor: '#d1fae5' },
      'NOT_FOUND': { label: 'غير متوفر', color: '#ef4444', bgColor: '#fee2e2' },
      'APPROVED': { label: 'معتمد', color: '#059669', bgColor: '#a7f3d0' },
      'REJECTED': { label: 'مرفوض', color: '#dc2626', bgColor: '#fecaca' },
      'MISSING': { label: 'ناقص', color: '#ea580c', bgColor: '#ffedd5' }
    },
    missingStatus: {
      'NEW': { label: 'نقص جديد', color: '#8b5cf6', bgColor: '#ede9fe' },
      'UNDER_REVIEW': { label: 'تحت الدراسة', color: '#f59e0b', bgColor: '#fef3c7' },
      'ORDER_PLANNED': { label: 'تم جدولة الطلب', color: '#3b82f6', bgColor: '#dbeafe' },
      'ORDERED': { label: 'تم الطلب', color: '#06b6d4', bgColor: '#cffafe' },
      'ADDED_TO_STOCK': { label: 'تمت الإضافة للمخزون', color: '#10b981', bgColor: '#d1fae5' },
      'IGNORED': { label: 'تم تجاهله', color: '#6b7280', bgColor: '#f3f4f6' }
    },
    importRequestStatus: {
      'NEW': { label: 'طلب جديد', color: '#8b5cf6', bgColor: '#ede9fe' },
      'UNDER_REVIEW': { label: 'قيد المراجعة', color: '#f59e0b', bgColor: '#fef3c7' },
      'WAITING_CUSTOMER_EXCEL': { label: 'بانتظار ملف Excel', color: '#3b82f6', bgColor: '#dbeafe' },
      'PRICING_IN_PROGRESS': { label: 'جاري التسعير', color: '#06b6d4', bgColor: '#cffafe' },
      'PRICING_SENT': { label: 'تم إرسال العرض', color: '#0ea5e9', bgColor: '#e0f2fe' },
      'WAITING_CUSTOMER_APPROVAL': { label: 'بانتظار موافقة العميل', color: '#a855f7', bgColor: '#f3e8ff' },
      'APPROVED_BY_CUSTOMER': { label: 'تمت موافقة العميل', color: '#10b981', bgColor: '#d1fae5' },
      'IN_FACTORY': { label: 'في المصنع', color: '#f97316', bgColor: '#ffedd5' },
      'SHIPPING': { label: 'جاري الشحن', color: '#3b82f6', bgColor: '#dbeafe' },
      'DELIVERED': { label: 'تم التسليم', color: '#059669', bgColor: '#a7f3d0' },
      'CANCELLED': { label: 'ملغى', color: '#6b7280', bgColor: '#f3f4f6' }
    },
    customerStatus: {
      'ACTIVE': { label: 'فعال', color: '#10b981', bgColor: '#d1fae5' },
      'SUSPENDED': { label: 'موقوف مؤقتاً', color: '#f59e0b', bgColor: '#fef3c7' },
      'BLOCKED': { label: 'محظور', color: '#ef4444', bgColor: '#fee2e2' },
      'PENDING': { label: 'قيد التفعيل', color: '#8b5cf6', bgColor: '#ede9fe' },
      'INACTIVE': { label: 'غير نشط', color: '#6b7280', bgColor: '#f3f4f6' }
    },
    staffStatus: {
      'ACTIVE': { label: 'فعال', color: '#10b981', bgColor: '#d1fae5' },
      'SUSPENDED': { label: 'موقوف', color: '#f59e0b', bgColor: '#fef3c7' },
      'BLOCKED': { label: 'محظور', color: '#ef4444', bgColor: '#fee2e2' }
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
  ACTIVITY_LOGS: 'siniCar_activity_logs'
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

// --- Internal Notification Helper ---
const internalCreateNotification = (userId: string, type: NotificationType, title: string, message: string) => {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const newNotif: Notification = {
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId,
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
        isRead: false
    };
    notifications.unshift(newNotif);
    // Keep last 50 per user
    const userNotifs = notifications.filter((n: Notification) => n.userId === userId);
    if (userNotifs.length > 50) {
        // Simple trim strategy: keep 50 newest, discard oldest
        // For simplicity in mock, just slice the whole array if it gets huge
        if(notifications.length > 500) notifications.length = 500; 
    }
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return newNotif;
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
          if (!u.lastActiveAt || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') return false;
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

      // Enrich profiles with aggregated data
      const enrichedProfiles = profiles.map(profile => {
          // Find related users (Owner + Staff)
          const profileUsers = users.filter(u => u.businessId === profile.userId || u.id === profile.userId);
          const ownerUser = users.find(u => u.id === profile.userId);

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
              missingRequestsCount: totalMissing
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

  // --- Notification System ---

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      return all.filter((n: Notification) => n.userId === userId);
  },

  async getAllNotifications(): Promise<Notification[]> {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  },

  async markNotificationsAsRead(userId: string): Promise<void> {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const updated = all.map((n: Notification) => n.userId === userId ? { ...n, isRead: true } : n);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
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

  async createNotification(notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
      return internalCreateNotification(notifData.userId, notifData.type, notifData.title, notifData.message);
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
              lastRequestedAt: today
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
          timeline: [initialTimeline]
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
          createdAt: new Date().toISOString()
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
        ]
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

      return updated;
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
      resultReady: false
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
      businessName?: string;
      commercialRegNumber?: string;
      vatNumber?: string;
      nationalAddress?: string;
      city?: string;
      country?: string;
      email?: string;
      phone?: string;
  }) {
      await delay(200);
      const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      const idx = profiles.findIndex((p:BusinessProfile) => p.userId === mainUserId);
      if (idx === -1) throw new Error('User not found');

      // Update only provided fields
      if (profileData.businessName !== undefined) profiles[idx].businessName = profileData.businessName;
      if (profileData.commercialRegNumber !== undefined) profiles[idx].commercialRegNumber = profileData.commercialRegNumber;
      if (profileData.vatNumber !== undefined) profiles[idx].vatNumber = profileData.vatNumber;
      if (profileData.nationalAddress !== undefined) profiles[idx].nationalAddress = profileData.nationalAddress;
      if (profileData.city !== undefined) profiles[idx].city = profileData.city;
      if (profileData.country !== undefined) profiles[idx].country = profileData.country;
      if (profileData.email !== undefined) profiles[idx].email = profileData.email;
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
  
  async importProductsFromOnyxExcel(file: File): Promise<{ imported: number; updated: number; skipped: number; errors: string[] }> {
      const parseNumber = (value: any): number | null => {
          if (value === null || value === undefined || value === '') return null;
          const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
          return isNaN(num) ? null : num;
      };

      const generateId = () => `P-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

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
                      
                      const partNumber = row['رقم الصنف']?.toString().trim();
                      const name = row['اسم الصنف']?.toString().trim();

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
                          priceRetail: parseNumber(row['سعر التجزئة']),
                          priceWholesale: parseNumber(row['سعر الجملة']),
                          priceWholeWholesale: parseNumber(row['سعر جملة الجملة']),
                          priceEcommerce: parseNumber(row['سعر المتجر الالكتروني']),
                          qtyStore103: parseNumber(row['  كمية المخزن 103']),
                          qtyStore105: parseNumber(row['  كمية المخزن 105']),
                          qtyTotal: parseNumber(row['الإجمالي']),
                          price: parseNumber(row['سعر الجملة']) || parseNumber(row['سعر التجزئة']) || 0,
                          stock: parseNumber(row['الإجمالي']) || 0,
                          brand: row[' الماركة']?.toString().trim() || undefined,
                          description: row[' المواصفات']?.toString().trim() || undefined,
                          carName: row[' اسم السيارة']?.toString().trim() || null,
                          globalCategory: row[' التصنيف العالمي']?.toString().trim() || null,
                          modelYear: row[' سنة الصنع']?.toString().trim() || null,
                          quality: row['الجودة']?.toString().trim() || null,
                          manufacturerPartNumber: row['رقم التصنيع']?.toString().trim() || null,
                          rack103: row['رف المخزن 103']?.toString().trim() || null,
                          rack105: row['رف المخزن 105']?.toString().trim() || null,
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
  }
};
