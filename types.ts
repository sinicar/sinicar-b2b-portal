
export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'CUSTOMER_OWNER' // Was ADMIN
  | 'CUSTOMER_STAFF'; // Was EMPLOYEE

export enum EmployeeRole {
  MANAGER = 'MANAGER', // Can view prices, order, manage
  BUYER = 'BUYER' // Can browse, add to cart (needs approval)
}

export enum CustomerType {
  SPARE_PARTS_SHOP = 'محل قطع غيار',
  RENTAL_COMPANY = 'شركة تأجير سيارات',
  SALES_REP = 'مندوب مبيعات',
  MAINTENANCE_CENTER = 'مركز صيانة',
  INSURANCE_COMPANY = 'شركة تأمين'
}

// --- Account Opening Request Types (New) ---

export type CustomerCategory =
  | 'SPARE_PARTS_SHOP'   // محل قطع غيار
  | 'INSURANCE_COMPANY'  // شركة تأمين
  | 'RENTAL_COMPANY'     // شركة تأجير سيارات
  | 'SALES_REP';         // مندوب مبيعات

// Updated Statuses
export type AccountRequestStatus = 
  | 'NEW'           // طلب جديد
  | 'UNDER_REVIEW'  // قيد المراجعة
  | 'APPROVED'      // تم الموافقة
  | 'REJECTED'      // مرفوض
  | 'ON_HOLD';      // مؤجل

// Admin Decision Enums
export type PriceLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'SPECIAL';

export type BusinessCustomerType =
  | 'PARTS_SHOP'        // محل قطع غيار
  | 'RENTAL_COMPANY'    // شركة تأجير سيارات
  | 'INSURANCE_COMPANY' // شركة تأمين
  | 'SALES_AGENT'       // مندوب مبيعات
  | 'FLEET_CUSTOMER'    // عميل أسطول سيارات
  | 'OTHER';

export interface AccountOpeningRequest {
  id: string;
  category: CustomerCategory;     // نوع النشاط
  status: AccountRequestStatus;   // NEW عند الإنشاء

  // بيانات عامة
  businessName?: string;          // اسم المنشأة أو الشركة (إجباري للشركات والمحلات)
  fullName?: string;              // الاسم الكامل (للمندوب)
  contactPerson?: string;         // شخص التواصل (للعرض فقط)
  phone: string;                  // رقم جوال للتواصل
  email?: string;

  // للشركات والمحلات فقط:
  commercialRegNumber?: string;   // السجل التجاري
  vatNumber?: string;             // الرقم الضريبي
  nationalAddress?: string;       // العنوان الوطني
  branchesCount?: number;         // عدد الفروع

  // للمندوب:
  representativeRegion?: string;  // المنطقة/المدن التي يغطيها
  representativeClientsType?: string; // نوع العملاء الذين يخدمهم
  approximateClientsCount?: string;    // عدد العملاء التقريبي

  // معلومات عامة:
  country?: string;
  city?: string;
  hasImportedBefore?: boolean;
  previousDealingsNotes?: string;
  expectedMonthlyVolume?: string; // حجم التعامل التقريبي شهريًا أو سنويًا
  notes?: string;                 // ملاحظات إضافية

  // --- Admin Review Fields (New) ---
  reviewedBy?: string | null;             // اسم أو معرف الأدمن الذي راجع الطلب
  reviewedAt?: string | null;             // تاريخ المراجعة
  adminNotes?: string | null;             // ملاحظات داخلية للأدمن

  assignedPriceLevel?: PriceLevel | null; // مستوى التسعير المخصص للعميل
  assignedCustomerType?: BusinessCustomerType | null;

  // Search Permissions
  allowedSearchPoints?: number;           // (Legacy Field kept for compat)
  searchPointsInitial?: number | null;    // رصيد نقاط البحث الأولي
  searchPointsMonthly?: number | null;    // رصيد شهري يتم منحه (اختياري)
  searchDailyLimit?: number | null;       // حد أقصى يومي للبحث (اختياري)

  // Portal Access
  portalAccessStart?: string | null;      // تاريخ بداية صلاحية الدخول
  portalAccessEnd?: string | null;        // تاريخ نهاية الصلاحية (أو null = مفتوحة)

  // Staff Permissions
  canCreateStaff?: boolean;               // هل يُسمح له بإضافة موظفين؟
  maxStaffUsers?: number | null;          // أقصى عدد للموظفين المسموحين

  createdCustomerId?: string | null;      // في المستقبل: رقم العميل عند تحويل الطلب إلى حساب فعلي

  createdAt: string;
  updatedAt?: string;
}

// ------------------------------------------

// --- Enhanced Customer & User Types for Admin Base ---

export type CustomerStatus =
  | 'ACTIVE'          // فعال
  | 'SUSPENDED'       // موقوف مؤقتًا
  | 'BLOCKED'         // محظور نهائيًا
  | 'PENDING'         // قيد التفعيل
  | 'INACTIVE';       // غير نشط (لا يستخدم النظام)

export type StaffStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  mapUrl?: string;
}

export interface User {
  id: string;
  clientId: string; // The login ID (e.g., 100200) for Owners, or Phone for Staff
  name: string;
  email: string; // Kept for contact purposes only
  password?: string; // For Owners
  role: UserRole;
  
  // Relationship Fields
  parentId?: string; // If staff, links to the main account (Customer Owner ID)
  businessId?: string; // The Company/Entity ID (Shared between Owner and Staff)
  
  isActive?: boolean; // For banning users
  branchId?: string; // Which branch they belong to
  employeeRole?: EmployeeRole; // Specific permissions
  phone?: string;
  
  // Staff Specific
  activationCode?: string; // كود التفعيل للدخول

  // Search Credits Logic (New)
  searchLimit?: number;  // الحد الأقصى لنقاط البحث (0 = بحث مفتوح)
  searchUsed?: number;   // عدد عمليات البحث المستخدمة
  lastSearchDate?: string; // لتصفير العداد يومياً (YYYY-MM-DD)

  // Notifications & Badges (New)
  hasUnreadOrders?: boolean; // يظهر شارة حمراء على سجل الطلبات
  lastOrdersViewedAt?: string;

  // API Integration Preparation Fields (New)
  priceLevel?: string; // مستوى التسعير (A, B, C) - Legacy string, consider migrating to PriceLevel type
  isApproved?: boolean; // حالة الاعتماد من النظام الخارجي
  accountStatus?: string; // Active, Hold, Closed
  customerType?: string; // نوع العميل من النظام الخارجي

  // --- New Security & Status Fields ---
  status?: CustomerStatus; // New refined status
  lastLoginAt?: string | null;
  failedLoginAttempts?: number;
  riskyLoginFlag?: boolean;
}

// --- Notifications System (New) ---
export type NotificationType =
  | 'ORDER_STATUS_CHANGED'
  | 'SEARCH_POINTS_ADDED'
  | 'QUOTE_PROCESSED'
  | 'GENERAL'
  | 'ACCOUNT_UPDATE'
  | 'IMPORT_UPDATE'
  | 'SYSTEM'; // System notifications (password reset, etc.)

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string; // Optional link to redirect
}

export interface BusinessProfile {
  userId: string; // Links to the main User ID (Owner)
  companyName: string; // Usually the user name for main account
  phone: string;
  region: string;
  city: string;
  crNumber: string; // Commercial Registration
  taxNumber: string;
  nationalAddress: string;
  
  // Legacy Type
  customerType: CustomerType;
  
  deviceFingerprint: string;
  branches: Branch[];
  isApproved: boolean; // Approved by System #1

  // --- New Advanced Fields for Admin Base ---
  
  // Enhanced Type & Status
  businessCustomerType?: BusinessCustomerType; // Mapped from AccountRequest
  assignedPriceLevel?: PriceLevel;             // LEVEL_1 / LEVEL_2 ...
  status?: CustomerStatus;
  
  // Access Control
  portalAccessStart?: string | null;
  portalAccessEnd?: string | null;
  suspendedUntil?: string | null; // If suspended, until when?

  // Search Points Wallet
  searchPointsTotal?: number;          // مجموع النقاط الممنوحة
  searchPointsRemaining?: number;      // المتبقية (Alternative source of truth to User.searchLimit)

  // Staff Limits
  staffLimit?: number | null;          // الحد الأقصى لعدد الموظفين
  
  // Security
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  failedLoginAttempts?: number;        // محاولات فاشلة منذ آخر نجاح
  riskyLoginFlag?: boolean;            // علم أن هذا العميل لديه سلوك دخول غريب
  
  // Internal Notes
  internalNotes?: string;

  // Aggregated Stats (Computed on fly or cached)
  totalOrdersCount?: number;
  totalQuotesCount?: number;
  totalImportRequestsCount?: number;
  totalInvoicesCount?: number;         // عدد الطلبات التي تحولت إلى فاتورة
  totalSearchesCount?: number;         // إجمالي عمليات البحث
  missingRequestsCount?: number;       // عدد النواقص المسجلة منه
}

export interface Product {
  id: string;
  partNumber: string;         // رقم الصنف من عمود "رقم الصنف"
  name: string;               // اسم الصنف من عمود "اسم الصنف"
  
  // Legacy fields (kept for backward compatibility)
  brand?: string;             // Changan, MG - now optional
  price?: number;             // Legacy price field - optional
  stock?: number;             // Legacy stock - optional
  image?: string;
  
  // Marketing fields
  oldPrice?: number;
  isOnSale?: boolean;
  isNew?: boolean;
  description?: string;       // من " المواصفات"
  category?: string;
  
  // مستويات التسعير من نظام أونيكس برو:
  priceRetail?: number | null;        // من "سعر التجزئة"
  priceWholesale?: number | null;     // من "سعر الجملة"
  priceWholeWholesale?: number | null;// من "سعر جملة الجملة"
  priceEcommerce?: number | null;     // من "سعر المتجر الالكتروني"

  // الكميات:
  qtyStore103?: number | null;        // من "  كمية المخزن 103"
  qtyStore105?: number | null;        // من "  كمية المخزن 105"
  qtyTotal?: number | null;           // من "الإجمالي"

  // حقول إضافية (اختيارية):
  manufacturerPartNumber?: string | null; // من "رقم التصنيع"
  carName?: string | null;              // من " اسم السيارة"
  globalCategory?: string | null;       // من " التصنيف العالمي"
  modelYear?: string | null;            // من " سنة الصنع"
  quality?: string | null;              // من "الجودة"

  // مواقع الرفوف (اختيارية):
  rack103?: string | null;             // من "رف المخزن 103"
  rack105?: string | null;             // من "رف المخزن 105"

  // حقول نظامية:
  createdAt?: string;
  updatedAt?: string;
  
  // Search Indexing Fields (Optional)
  normalizedPart?: string;
  numericPartCore?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'بانتظار الموافقة',
  APPROVED = 'تم الاعتماد',
  REJECTED = 'مرفوض',
  SHIPPED = 'تم الشحن',
  DELIVERED = 'تم التسليم',
  CANCELLED = 'تم الإلغاء' // Added Cancelled
}

// --- Internal Order Logic (Admin Only) ---
export type OrderInternalStatus =
  | 'NEW'                    // طلب جديد – لم يبدأ العمل عليه
  | 'SENT_TO_WAREHOUSE'      // تم إرسال الطلب للمستودع
  | 'WAITING_PAYMENT'        // في انتظار تأكيد تحويل العميل
  | 'PAYMENT_CONFIRMED'      // تم تأكيد التحويل / السداد
  | 'SALES_INVOICE_CREATED'  // تم إصدار فاتورة مبيعات
  | 'READY_FOR_SHIPMENT'     // جاهز للشحن/التسليم
  | 'COMPLETED_INTERNAL'     // مكتمل داخليًا
  | 'CANCELLED_INTERNAL';    // ملغى من قبل الإدارة داخليًا

export interface InternalStatusHistoryItem {
  status: OrderInternalStatus;
  changedAt: string;
  changedBy: string; // Admin Name
}

export interface Order {
  id: string;
  userId: string; // The actual user who made the order (Owner or Staff)
  businessId?: string; // Links order to the Business Profile
  createdByUserId?: string; // Same as userId, redundant but for clarity
  createdByName?: string; // Name of the person who clicked submit

  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string;
  branchId?: string; // Which branch ordered this
  
  // Cancellation Logic
  cancelledBy?: 'CUSTOMER' | 'ADMIN';
  cancelledAt?: string;

  // --- Admin Internal Workflow Fields ---
  internalStatus?: OrderInternalStatus;
  internalNotes?: string;
  internalStatusHistory?: InternalStatusHistoryItem[];
}

// --- Bulk Quote Logic (Enhanced for Admin Review) ---

export type QuoteRequestStatus =
  | 'NEW'               // جديد – لم يفتح من الأدمن
  | 'UNDER_REVIEW'      // قيد المراجعة في لوحة التحكم
  | 'PARTIALLY_APPROVED'// جزء من الأصناف معتمد وجزء ناقص
  | 'APPROVED'          // تم التسعير الكامل
  | 'QUOTED'            // Legacy compatible
  | 'PROCESSED'         // Legacy compatible
  | 'REJECTED';         // تم رفض الطلب بالكامل

export type PriceType = 'OEM' | 'AFTERMARKET' | 'BOTH';

// Updated Item Statuses: PENDING (New), APPROVED (Matched), MISSING (Not Found), REJECTED (Admin rejected)
export type QuoteItemApprovalStatus = 'PENDING' | 'APPROVED' | 'MISSING' | 'REJECTED';

// Legacy: MATCHED, NOT_FOUND, APPROVED, REJECTED kept for compatibility with old data
export type QuoteItemStatus = 'PENDING' | 'MATCHED' | 'NOT_FOUND' | 'APPROVED' | 'REJECTED' | 'MISSING';

export interface QuoteItem {
  partNumber: string;
  partName: string; // Name from excel
  requestedQty: number;
  
  // New Admin Review Fields
  approvalStatus?: QuoteItemApprovalStatus;
  adminNote?: string; // Reason for rejection or note
  rowIndex?: number; // Row index in original excel

  // Fields populated after matching
  matchedProductId?: string;
  matchedProductName?: string;
  matchedPrice?: number;
  isAvailable?: boolean;
  totalPrice?: number; // Calculated after approval
  
  // Legacy fields
  status?: QuoteItemStatus; 
  notes?: string; 
}

export interface QuoteRequest {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  date: string;
  
  status: QuoteRequestStatus; // NEW, UNDER_REVIEW, APPROVED, PARTIALLY_APPROVED...
  
  items: QuoteItem[];
  totalQuotedAmount?: number;
  priceType?: PriceType; // Selected price type
  processedDate?: string; // When admin finalized it

  // Admin Review Metadata
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  adminGeneralNote?: string;
  
  approvedItemsCount?: number;
  missingItemsCount?: number;
  resultReady?: boolean; // Is ready for customer download
}

// --- Missing Parts (Nawaqis) ---

export type MissingSource = 'QUOTE' | 'SEARCH';

export type MissingStatus =
  | 'NEW'            // نقص جديد لم يُعالَج بعد
  | 'UNDER_REVIEW'   // تحت الدراسة
  | 'ORDER_PLANNED'  // تم جدولة طلب استيراد
  | 'ORDERED'        // تم طلبه من المورد/الصين
  | 'ADDED_TO_STOCK' // تم إضافته كمنتج في النظام
  | 'IGNORED';       // تم تجاهله أو لا جدوى منه

export interface MissingProductRequest {
  id: string;
  userId: string; // Initiator
  source?: MissingSource; // 'QUOTE' or 'SEARCH'
  query: string;     // Part number or text searched
  createdAt: string;
  
  // Identity info
  userName?: string; 
  branchId?: string;
  
  // New fields for structured tracking (Optional for compatibility)
  partNumber?: string;
  normalizedPartNumber?: string;
  name?: string;
  brand?: string;
  carModel?: string;
  quantityRequested?: number;

  // If from QUOTE
  quoteRequestId?: string;
  quoteItemId?: string;

  // Aggregation & Stats
  totalRequestsCount?: number;      // How many times this item was requested
  uniqueCustomersCount?: number;    // How many unique customers
  customerIds?: string[];           // List of user IDs who requested this
  lastRequestedAt?: string;         // Most recent request date

  // Management
  status?: MissingStatus;
  adminNotes?: string;
  importRequestId?: string;         // Link to future import request
}

// --- New Features Interfaces ---

export interface SearchHistoryItem {
  id: string;
  userId: string;
  productId: string;
  partNumber: string;
  productName: string;
  viewedAt: string;      // ISO date
  priceSnapshot: number; // السعر وقت العرض
}

// --- Import From China Logic (Expanded) ---

export type ImportRequestStatus =
  | 'NEW'                      // طلب جديد – بانتظار مراجعة فريق صيني كار
  | 'UNDER_REVIEW'             // قيد المراجعة / التواصل مع العميل
  | 'WAITING_CUSTOMER_EXCEL'   // في انتظار ملف Excel من العميل
  | 'PRICING_IN_PROGRESS'      // يتم إعداد عرض السعر
  | 'PRICING_SENT'             // تم إرسال عرض السعر للعميل
  | 'WAITING_CUSTOMER_APPROVAL'// في انتظار موافقة العميل على عرض السعر
  | 'APPROVED_BY_CUSTOMER'     // العميل وافق على العرض – بدأ الاستيراد
  | 'IN_FACTORY'               // الطلب في المصنع/التجهيز
  | 'SHIPMENT_BOOKED'          // تم حجز الشحن
  | 'ON_THE_SEA'               // الشحنة في البحر
  | 'IN_PORT'                  // الشحنة في الميناء
  | 'CUSTOMS_CLEARED'          // تم التخليص الجمركي
  | 'ON_THE_WAY'               // في الطريق للمستودع / للعميل
  | 'DELIVERED'                // تم التسليم
  | 'CANCELLED'                // ملغي
  | 'IN_REVIEW'                // Legacy compatible
  | 'CONTACTED'                // Legacy compatible
  | 'CLOSED';                  // Legacy compatible

export interface ImportRequestTimelineEntry {
  status: ImportRequestStatus;
  note?: string | null;
  changedAt: string;     // ISO date
  changedBy: string;     // اسم أو معرف المستخدم (أدمن أو عميل)
  actorRole: 'ADMIN' | 'CUSTOMER';
}

export interface ImportRequest {
  id: string;
  customerId: string;         // المنشأة
  createdByUserId?: string;    // المستخدم الذي أنشأ الطلب
  businessName?: string;       // اسم المنشأة/الشركة
  createdAt: string;
  updatedAt?: string;

  // بيانات أساسية من نموذج العميل:
  branchesCount?: number;      // عدد الفروع
  targetCarBrands: string[];  // الشركات التي يريد توفير قطع غيارها
  brandPreferences?: string;  // الماركات المطلوبة (legacy alias)
  hasImportedBefore: boolean; // هل سبق له الاستيراد من الصين؟
  previousImportDetails?: string; // وصف مختصر إذا كانت الإجابة نعم

  serviceMode: 'FULL_SERVICE' | 'GOODS_ONLY';
  // FULL_SERVICE = نحن نشتري ونشحن ونخلص له (استيراد كامل)
  // GOODS_ONLY  = نجهز البضاعة فقط وهو يتولى الشحن والتخليص

  preferredPorts?: string;      // الميناء أو منفذ الوصول المفضل
  estimatedAnnualValue?: string; // قيمة أو كمية الاستيراد التقريبية سنوياً
  paymentPreference?: string;    // تفضيل طريقة الدفع

  notes?: string;              // ملاحظات إضافية من العميل
  status: ImportRequestStatus; // NEW عند الإنشاء

  // ملف Excel الخاص بقطع الاستيراد:
  customerExcelFileName?: string | null;
  customerExcelUploadedAt?: string | null;

  // بيانات التسعير:
  pricingPreparedBy?: string | null;
  pricingPreparedAt?: string | null;
  pricingFileNameForCustomer?: string | null; // اسم ملف التسعير (Excel/PDF) المخزّن
  pricingTotalAmount?: number | null;

  // موافقة العميل على عرض السعر:
  customerApprovedAt?: string | null;
  customerApprovalNote?: string | null;

  // خط الزمن:
  timeline?: ImportRequestTimelineEntry[];

  // ملاحظات إدارية داخلية:
  adminNotes?: string | null;
  assignedSalesRepId?: string | null; // الموظف المسؤول عن الاستيراد
}

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

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: string;
  status: 'Healthy' | 'Failing' | 'Inactive';
}

export interface ApiConfig {
  baseUrl: string;
  authToken: string;
  enableLiveSync: boolean;
  endpoints: {
    products: string;
    orders: string;
    customers: string;
  };
  webhookSecret?: string;
  // Advanced Integration Features
  environment: 'SANDBOX' | 'PRODUCTION';
  syncInterval: 'REALTIME' | '15MIN' | 'HOURLY' | 'DAILY';
  syncEntities: {
    products: boolean;
    inventory: boolean;
    prices: boolean;
    customers: boolean;
    orders: boolean;
  };
  webhooks: WebhookConfig[];
  fieldMapping: string; // JSON String for mapping
  debugMode: boolean;
  rateLimit: number; // Requests per minute
}

export interface SiteSettings {
  siteName: string;
  description?: string;
  supportPhone: string;
  supportWhatsapp?: string;
  supportEmail: string;
  announcementBarColor: string;
  fontFamily: string; // 'Almarai', 'Cairo', 'Tajawal'
  apiConfig: ApiConfig;
  // New Fields
  maintenanceMode: boolean;
  primaryColor: string;
  logoUrl: string;
  // Text Manager
  uiTexts?: Record<string, string>;
  // News Ticker Settings
  tickerEnabled?: boolean;
  tickerText?: string;
  tickerSpeed?: number;
  tickerBgColor?: string;
  tickerTextColor?: string;
}

// --- Activity Log Types (New) ---

export type ActivityEventType =
  | 'LOGIN'              // دخول المستخدم للنظام
  | 'LOGOUT'             // تسجيل الخروج
  | 'FAILED_LOGIN'       // محاولة دخول فاشلة
  | 'PAGE_VIEW'          // فتح صفحة معينة
  | 'ORDER_CREATED'      // إنشاء/إرسال طلب من السلة
  | 'QUOTE_REQUEST'      // إنشاء طلب تسعير (رفع ملف أو إدخال يدوي)
  | 'QUOTE_REVIEWED'     // Admin reviewed quote
  | 'IMPORT_REQUEST'     // إنشاء طلب استيراد من الصين
  | 'ACCOUNT_REQUEST'    // تقديم طلب فتح حساب
  | 'ACCOUNT_REQUEST_REVIEWED' // مراجعة طلب فتح حساب (Admin)
  | 'SEARCH_PERFORMED'   // عملية بحث عن صنف
  | 'ORDER_CANCELLED'    // إلغاء طلب
  | 'ORDER_DELETED'      // حذف طلب
  | 'SEARCH_POINTS_ADDED' // إضافة نقاط بحث
  | 'ORDER_STATUS_CHANGED' // External status changed (Admin)
  | 'ORDER_INTERNAL_STATUS_CHANGED' // Internal status changed (Admin)
  | 'USER_SUSPENDED'     // إيقاف مستخدم
  | 'USER_REACTIVATED'   // إعادة تفعيل مستخدم
  | 'CUSTOMER_SUSPENDED' // إيقاف عميل
  | 'CUSTOMER_REACTIVATED' // إعادة تفعيل عميل
  | 'IMPORT_STATUS_CHANGED' // Import request status change
  | 'PASSWORD_CHANGED'   // تغيير كلمة المرور
  | 'PASSWORD_RESET'     // إعادة تعيين كلمة المرور (بواسطة الإدارة)
  | 'OTHER';             // عمليات أخرى عامة

export interface ActivityLogEntry {
  id: string;            // رقم فريد للنشاط
  userId: string;        // المستخدم الذي قام بالنشاط
  userName?: string;     // اسم المستخدم
  role?: UserRole;       // دور المستخدم
  eventType: ActivityEventType;

  // تفاصيل إضافية
  description?: string;  // نص وصفي للنشاط بالعربي
  page?: string;         // اسم الصفحة أو المسار
  metadata?: Record<string, any>; // كائن اختياري لوضع تفاصيل إضافية

  createdAt: string;     // التاريخ والوقت الكامل للنشاط
}
