import { 
  SiteSettings, 
  Product, 
  Order, 
  OrderStatus, 
  Banner, 
  QuoteRequest 
} from '../../../types';

export const DEFAULT_UI_TEXTS: Record<string, string> = {
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

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Sini Pro - صيني كار',
  description: 'بوابة عملاء الجملة لقطع الغيار الصينية',
  supportPhone: '920000000',
  supportWhatsapp: '0500000000',
  supportEmail: 'support@sinipro.com',
  announcementBarColor: 'bg-primary-900',
  fontFamily: 'Cairo',
  maintenanceMode: false,
  primaryColor: '#2563eb',
  logoUrl: '',
  uiTexts: DEFAULT_UI_TEXTS,
  
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
  
  guestSettings: {
    showBusinessTypes: true,
    showMainServices: true,
    showHowItWorks: true,
    showWhySiniCar: true,
    showCart: false,
    showMarketingCards: true,
    blurIntensity: 'medium',
    showBlurOverlay: true,
    allowedPages: [],
    allowSearch: true,
    showSearchResults: true
  },
  
  orderStatusPointsConfig: {
    enabled: true,
    pointsPerStatus: {
      'DELIVERED': 5,
      'APPROVED': 2,
      'SHIPPED': 1
    }
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', partNumber: 'CN-102030', name: 'فحمات فرامل أمامية سيراميك - شانجان CS95', brand: 'Changan', price: 150, oldPrice: 180, isOnSale: true, stock: 50, isNew: false, category: 'فرامل', description: 'فحمات سيراميك عالية الجودة تدوم طويلاً، متوافقة مع موديلات 2020-2023' },
  { id: '2', partNumber: 'CN-550011', name: 'صدام أمامي - إيدو بلس 2022', brand: 'Changan', price: 850, stock: 10, isNew: true, category: 'بدي', description: 'صدام أصلي وكالة مع ضمان اللون والمقاس 100%' },
  { id: '3', partNumber: 'CN-CS85-09', name: 'مساعد خلفي يسار - CS85', brand: 'Changan', price: 420, stock: 15, category: 'نظام تعليق' },
  { id: '4', partNumber: 'CN-UNIK-FILT', name: 'طقم فلاتر صيانة (زيت+هواء+مكيف) - يوني كي', brand: 'Changan', price: 180, stock: 40, category: 'فلاتر' },
  { id: '5', partNumber: 'CN-ALT-95', name: 'دينمو كهرباء - شانجان CS95', brand: 'Changan', price: 1200, stock: 5, category: 'كهرباء' },
  { id: '6', partNumber: 'CN-RAD-75', name: 'راديتر ماء - شانجان CS75', brand: 'Changan', price: 550, stock: 8, category: 'تبريد' },
  
  { id: '7', partNumber: 'MG-998877', name: 'فلتر زيت مكينة أصلي - MG All Models', brand: 'MG', price: 35, stock: 200, category: 'فلاتر', description: 'فلتر زيت أصلي يضمن حماية المحرك لجميع سيارات ام جي' },
  { id: '8', partNumber: 'MG-RX5-01', name: 'شمعة أمامية يمين LED - MG RX5', brand: 'MG', price: 1800, oldPrice: 2100, isOnSale: true, stock: 5, category: 'إنارة' },
  { id: '9', partNumber: 'MG-GT-SPOILER', name: 'جناح خلفي رياضي كربون - MG GT', brand: 'MG', price: 600, stock: 3, isNew: true, category: 'اكسسوارات' },
  { id: '10', partNumber: 'MG-ZS-BUMP', name: 'شبك أمامي - MG ZS 2021', brand: 'MG', price: 450, stock: 12, category: 'بدي' },
  { id: '11', partNumber: 'MG-HS-PADS', name: 'فحمات خلفية - MG HS', brand: 'MG', price: 140, stock: 60, category: 'فرامل' },
  { id: '12', partNumber: 'MG-ENG-MNT', name: 'كراسي مكينة طقم - MG 6', brand: 'MG', price: 900, stock: 4, category: 'محرك' },

  { id: '13', partNumber: 'GL-COOL-01', name: 'راديتر ماء تيربو - جيلي كولراي', brand: 'Geely', price: 650, stock: 8, category: 'تبريد', isNew: true },
  { id: '14', partNumber: 'GL-MON-BUMP', name: 'شبك أمامي رياضي كروم - جيلي مونجارو', brand: 'Geely', price: 1100, stock: 4, category: 'بدي', isNew: true },
  { id: '15', partNumber: 'GL-TUG-HL', name: 'اسطب خلفي متصل - جيلي توجيلا', brand: 'Geely', price: 2200, stock: 2, category: 'إنارة' },
  { id: '16', partNumber: 'GL-EMG-BRK', name: 'حساس فرامل ABS - جيلي امجراند', brand: 'Geely', price: 180, stock: 25, category: 'كهرباء' },
  { id: '17', partNumber: 'GL-OKA-FDR', name: 'رفرف أمامي يمين - جيلي أوكافانجو', brand: 'Geely', price: 700, stock: 6, category: 'بدي' },

  { id: '18', partNumber: 'HV-H6-BRK', name: 'قماشات خلفية - هافال H6', brand: 'Haval', price: 120, stock: 80, category: 'فرامل' },
  { id: '19', partNumber: 'HV-JOLION-LGT', name: 'سطب خلفي يسار - هافال جوليون', brand: 'Haval', price: 750, oldPrice: 900, isOnSale: true, stock: 6, category: 'إنارة' },
  { id: '20', partNumber: 'HV-H9-TURBO', name: 'تيربو تشارجر - هافال H9', brand: 'Haval', price: 3500, stock: 2, category: 'محرك' },
  { id: '21', partNumber: 'HV-DARGO-MAT', name: 'دعاسات أرضية جلد - هافال دارجو', brand: 'Haval', price: 250, stock: 15, category: 'اكسسوارات' },

  { id: '22', partNumber: 'CH-TIGGO-OIL', name: 'زيت قير CVT - شيري تيجو 8', brand: 'Chery', price: 60, stock: 100, category: 'زيوت' },
  { id: '23', partNumber: 'CH-ARRIZO-DR', name: 'مقبض باب خارجي - شيري اريزو 6', brand: 'Chery', price: 85, stock: 30, category: 'بدي' },
  { id: '24', partNumber: 'GW-POER-FLT', name: 'فلتر ديزل - باور بيك اب', brand: 'Great Wall', price: 55, stock: 45, category: 'فلاتر' },
  
  { id: '25', partNumber: 'GEN-SPK-PLG', name: 'بوجي إشعال إيريديوم - عام', brand: 'Generic', price: 45, stock: 500, category: 'كهرباء' },
  { id: '26', partNumber: 'GEN-BAT-70', name: 'بطارية 70 أمبير - هانكوك', brand: 'Generic', price: 350, stock: 20, category: 'كهرباء' },
  { id: '27', partNumber: 'CN-EADO-MIR', name: 'مراية جانبية يمين (كاميرا) - إيدو', brand: 'Changan', price: 650, stock: 12, category: 'بدي' },
  { id: '28', partNumber: 'MG-5-CVT', name: 'كارتير قير - MG 5', brand: 'MG', price: 320, stock: 8, category: 'محرك' },
  { id: '29', partNumber: 'HV-JUL-SEN', name: 'حساس ضغط هواء الإطارات - جوليون', brand: 'Haval', price: 120, stock: 50, category: 'كهرباء' },
  { id: '30', partNumber: 'GL-COOL-PMP', name: 'طرمبة ماء - كولراي', brand: 'Geely', price: 280, stock: 14, category: 'تبريد' },
];

export const INITIAL_BANNERS: Banner[] = [
  { id: '1', title: 'صيني كار.. بوابتك للمستودع', subtitle: 'اطلب قطع غيار شانجان و MG مباشرة من الموقع ووفر وقت الانتظار', colorClass: 'from-primary-700 to-primary-900', buttonText: 'ابدأ الطلب الآن', isActive: true },
  { id: '2', title: 'وصل حديثاً: قطع جيلي وهافال', subtitle: 'تغطية شاملة لموديلات جيلي مونجارو وهافال H6 الجديدة', colorClass: 'from-slate-700 to-slate-900', buttonText: 'تصفح القطع', isActive: true },
  { id: '3', title: 'عروض الجملة الخاصة', subtitle: 'أسعار خاصة لطلبات الجملة ومراكز الصيانة المعتمدة', colorClass: 'from-secondary-600 to-secondary-800', buttonText: 'عروض الكميات', isActive: true },
  { id: '4', title: 'شحن مجاني للطلبات الكبيرة', subtitle: 'احصل على شحن مجاني لأي طلب يتجاوز 5000 ريال', colorClass: 'from-green-600 to-green-800', buttonText: 'تفاصيل العرض', isActive: true },
];

export const INITIAL_NEWS: string[] = [
  "تنبيه: تحديث شامل لأسعار قطع غيار MG ابتداءً من يوم الأحد القادم",
  "وصل حديثاً: دفعة قطع بودي لسيارات جيلي كولراي 2024 وشانجان يوني كي",
  "عميلنا العزيز: تم تفعيل خدمة التوصيل السريع داخل الرياض (نفس اليوم)",
  "عرض خاص: خصم 10% على جميع الفلاتر والزيوت لنهاية الشهر",
  "تنويه: أوقات العمل في المستودع من 8 صباحاً حتى 8 مساءً"
];

export const DEMO_ORDERS: Order[] = [
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

export const DEMO_QUOTES: QuoteRequest[] = [
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
