
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
  | 'SPARE_PARTS_SHOP'     // محل قطع غيار
  | 'INSURANCE_COMPANY'    // شركة تأمين
  | 'RENTAL_COMPANY'       // شركة تأجير سيارات
  | 'MAINTENANCE_CENTER'   // مركز صيانة
  | 'SALES_REP';           // مندوب مبيعات

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

// Document Upload Types
export interface UploadedDocument {
  id: string;
  name: string;           // اسم الملف
  type: 'CR_CERTIFICATE' | 'VAT_CERTIFICATE' | 'NATIONAL_ID' | 'NATIONAL_ADDRESS' | 'OTHER';
  fileType: string;       // MIME type (pdf, image/*)
  fileSize: number;       // Size in bytes
  base64Data?: string;    // For demo/mock - in production would be a URL
  uploadedAt: string;
}

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

  // المستندات المرفقة
  documents?: UploadedDocument[];

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
  
  // Admin Badge Tracking
  isNew?: boolean;                        // For admin sidebar badge - true when unseen by admin
}

// ------------------------------------------

// --- Enhanced Customer & User Types for Admin Base ---

export type CustomerStatus =
  | 'ACTIVE'          // فعال
  | 'SUSPENDED'       // موقوف مؤقتًا
  | 'BLOCKED'         // محظور نهائيًا
  | 'PENDING'         // قيد التفعيل
  | 'INACTIVE';       // غير نشط (لا يستخدم النظام)

// نوع رؤية الأسعار للعميل
export type PriceVisibilityType =
  | 'VISIBLE'         // أسعار ظاهرة دائماً (بدون نظام نقاط)
  | 'HIDDEN';         // أسعار مخفية (تحتاج نقاط بحث للكشف)

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
  hasUnreadQuotes?: boolean; // يظهر شارة حمراء على طلبات التسعير
  lastQuotesViewedAt?: string;

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
  
  // --- Activity Tracking ---
  lastActiveAt?: string; // ISO timestamp of last heartbeat (for online status)
  
  // --- Guest Mode ---
  isGuest?: boolean; // Flag for guest users with restricted access
}

// --- Notifications System (New) ---
export type NotificationType =
  | 'ORDER_STATUS_CHANGED'
  | 'SEARCH_POINTS_ADDED'
  | 'QUOTE_PROCESSED'
  | 'GENERAL'
  | 'ACCOUNT_UPDATE'
  | 'IMPORT_UPDATE'
  | 'SYSTEM'
  | 'MARKETING'; // Marketing campaign notifications

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
  
  // نوع رؤية الأسعار - VISIBLE = ظاهرة دائماً, HIDDEN = تحتاج نقاط بحث
  priceVisibility?: PriceVisibilityType;
  
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

  // Customer Documents (from account opening request)
  documents?: UploadedDocument[];

  // Aggregated Stats (Computed on fly or cached)
  totalOrdersCount?: number;
  totalQuotesCount?: number;
  totalImportRequestsCount?: number;
  totalInvoicesCount?: number;         // عدد الطلبات التي تحولت إلى فاتورة
  totalSearchesCount?: number;         // إجمالي عمليات البحث
  missingRequestsCount?: number;       // عدد النواقص المسجلة منه
  
  // Marketing Campaigns - dismissed campaign IDs
  dismissedCampaignIds?: string[];
  
  // Supplier Marketplace - Customer can act as supplier
  canActAsSupplier?: boolean;
  supplierProfileId?: string;
  supplierApprovedAt?: string;
  supplierApprovedBy?: string;
  
  // Marketer Referral - if customer was referred
  referredByMarketerId?: string;
  referredAt?: string;
  
  // Trader Tools - customer-specific tool access
  toolsOverrideId?: string;
  
  // Customer Segments/Tags - for segmentation and marketing
  segments?: string[];
  tags?: string[];
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
  
  // قواعد رؤية الكمية للعملاء
  useVisibilityRuleForQty?: boolean;  // إذا true: تطبق قاعدة إخفاء الكمية على هذا المنتج
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
  
  // Badge tracking - for admin unread notification
  isNew?: boolean;
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
  
  // Admin Badge Tracking
  isNew?: boolean;                        // For admin sidebar badge - true when unseen by admin
}

// --- Missing Parts (Nawaqis) ---

export type MissingSource = 'QUOTE' | 'SEARCH';

// حالة التوفر عند البحث
export type MissingAvailabilityStatus = 'not_found' | 'out_of_stock';

// مصدر البحث
export type SearchSourceType = 'heroSearch' | 'catalogSearch' | 'quoteRequest';

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
  
  // Search Pipeline Fields (New)
  availabilityStatus?: MissingAvailabilityStatus;  // 'not_found' or 'out_of_stock'
  searchSource?: SearchSourceType;                  // 'heroSearch', 'catalogSearch', etc.
  searchCount?: number;                             // عدد مرات البحث عن نفس القطعة (للتجميع)
  lastSearchDate?: string;                          // آخر تاريخ بحث (YYYY-MM-DD)
  productId?: string;                               // معرف المنتج إذا كان موجودًا لكن نفذت الكمية

  // Management
  status?: MissingStatus;
  adminNotes?: string;
  importRequestId?: string;         // Link to future import request
  
  // Admin Badge Tracking
  isNew?: boolean;                        // For admin sidebar badge - true when unseen by admin
}

// --- Search Service Types ---

export type SearchResultType = 'NOT_FOUND' | 'FOUND_OUT_OF_STOCK' | 'FOUND_AVAILABLE';

export interface SearchResult {
  type: SearchResultType;
  product?: Product;           // المنتج إذا تم العثور عليه
  normalizedQuery?: string;    // الاستعلام بعد التطبيع
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
  
  // Admin Badge Tracking
  isNew?: boolean;                        // For admin sidebar badge - true when unseen by admin
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
  webhooks: { url: string; events: string[]; active: boolean }[];
  fieldMapping: string; // JSON String for mapping
  debugMode: boolean;
  rateLimit: string; // Requests per minute
  // New Data Sharing Settings
  sharedData?: string[]; // Which data types to share via API
  syncDirection?: 'PULL' | 'PUSH' | 'BIDIRECTIONAL'; // Direction of sync
  timeout?: string; // Connection timeout in seconds
  retryOnFail?: boolean; // Retry failed requests
}

// Status Labels Configuration - Centralized status display names
export interface StatusLabelItem {
  label: string;
  color: string;
  bgColor: string;
  icon?: string;
  isDefault?: boolean;
  isSystem?: boolean;
  sortOrder?: number;
}

export interface StatusLabelsConfig {
  orderStatus: Record<string, StatusLabelItem>;
  orderInternalStatus: Record<string, StatusLabelItem>;
  accountRequestStatus: Record<string, StatusLabelItem>;
  quoteRequestStatus: Record<string, StatusLabelItem>;
  quoteItemStatus: Record<string, StatusLabelItem>;
  missingStatus: Record<string, StatusLabelItem>;
  importRequestStatus: Record<string, StatusLabelItem>;
  customerStatus: Record<string, StatusLabelItem>;
  staffStatus: Record<string, StatusLabelItem>;
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
  // Status Labels Configuration
  statusLabels?: StatusLabelsConfig;
  
  // --- Product Visibility & Search Settings ---
  minVisibleQty?: number;           // أقل كمية لظهور المنتج للعملاء (default: 1)
  stockThreshold?: number;          // عتبة المخزون لتحديد "نفذت الكمية" (default: 0)
  
  // --- Why Sini Car Section ---
  whySiniCarTitle?: string;         // عنوان القسم
  whySiniCarFeatures?: FeatureCard[]; // بطاقات المميزات
  
  // --- Guest Mode Settings ---
  guestModeEnabled?: boolean;       // تفعيل/إيقاف الدخول كضيف
  
  // --- Guest Visibility Controls ---
  guestSettings?: GuestModeSettings;
  
  // --- إعدادات نقاط البحث التلقائية حسب حالة الطلب ---
  orderStatusPointsConfig?: OrderStatusPointsConfig;
  
  // --- نصوص صفحات الدخول والتسجيل ---
  authPageTexts?: AuthPageTexts;
  
  // --- إعدادات الشاشة المنبثقة للكميات ---
  quantityModalSettings?: QuantityModalSettings;
}

// نصوص صفحات الدخول والتسجيل القابلة للتعديل
export interface AuthPageTexts {
  // صفحة تسجيل الدخول
  loginTitle?: string;
  loginSubtitle?: string;
  loginClientIdLabel?: string;
  loginClientIdPlaceholder?: string;
  loginPasswordLabel?: string;
  loginPasswordPlaceholder?: string;
  loginButtonText?: string;
  loginForgotPasswordText?: string;
  loginNoAccountText?: string;
  loginRegisterLinkText?: string;
  
  // صفحة طلب فتح حساب
  registerTitle?: string;
  registerSubtitle?: string;
  registerBusinessNameLabel?: string;
  registerBusinessNamePlaceholder?: string;
  registerOwnerNameLabel?: string;
  registerOwnerNamePlaceholder?: string;
  registerPhoneLabel?: string;
  registerPhonePlaceholder?: string;
  registerEmailLabel?: string;
  registerEmailPlaceholder?: string;
  registerCityLabel?: string;
  registerCityPlaceholder?: string;
  registerBusinessTypeLabel?: string;
  registerNotesLabel?: string;
  registerNotesPlaceholder?: string;
  registerButtonText?: string;
  registerHaveAccountText?: string;
  registerLoginLinkText?: string;
}

// إعدادات الشاشة المنبثقة للكميات
export interface QuantityModalSettings {
  mode: 'draggable' | 'hideSearch'; // وضع السحب أو إخفاء نتائج البحث
  defaultPosition?: { x: number; y: number }; // الموقع الافتراضي للنافذة
}

// إعدادات النقاط المضافة تلقائياً عند تغيير حالة الطلب
export interface OrderStatusPointsConfig {
  enabled: boolean;                              // تفعيل/إيقاف الإضافة التلقائية
  pointsPerStatus: Record<string, number>;       // النقاط لكل حالة (مثل: DELIVERED: 5)
}

// Guest Mode Visibility Settings - Controls what guests can see/access
export interface GuestModeSettings {
  // What sections are visible (but blurred) on home page
  showBusinessTypes?: boolean;      // قسم "من نخدم" (أنواع الأعمال)
  showMainServices?: boolean;       // قسم الخدمات الرئيسية
  showHowItWorks?: boolean;         // قسم "كيف تعمل المنظومة"
  showWhySiniCar?: boolean;         // قسم "لماذا صيني كار"
  showCart?: boolean;               // عربة التسوق الجانبية
  showMarketingCards?: boolean;     // بطاقات التسويق الجانبية
  
  // Blur settings
  blurIntensity?: 'light' | 'medium' | 'heavy';  // شدة التشويش
  showBlurOverlay?: boolean;        // إظهار overlay فوق المحتوى المشوش
  
  // Pages accessible to guests (empty = none except HOME)
  allowedPages?: string[];          // الصفحات المسموح الوصول إليها
  
  // Search settings
  allowSearch?: boolean;            // السماح بالبحث (نتائج مشوشة)
  showSearchResults?: boolean;      // إظهار نتائج البحث (مشوشة)
}

// Feature Card for "Why Sini Car" section
export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: 'box' | 'chart' | 'anchor' | 'headphones' | 'truck' | 'shield' | 'globe' | 'star' | 'clock' | 'award';
  iconColor: string; // Tailwind color class like 'text-cyan-400'
}

// --- Excel Import Column Presets ---

export interface ExcelColumnMapping {
  internalField: string;            // اسم الحقل الداخلي (partNumber, name, etc.)
  excelHeader: string;              // اسم العمود في ملف الإكسل
  isEnabled: boolean;               // هل هذا الحقل مفعل للاستيراد؟
  isRequired: boolean;              // هل هو حقل إجباري؟
  defaultValue?: string | number;   // قيمة افتراضية إذا كان العمود فارغًا
}

export interface ExcelColumnPreset {
  id: string;
  name: string;                     // اسم الإعداد (مثل "Onyx Export", "Supplier A")
  isDefault: boolean;               // هل هو الإعداد الافتراضي؟
  mappings: ExcelColumnMapping[];   // قائمة تعيينات الأعمدة
  createdAt: string;
  updatedAt?: string;
}

// الحقول الداخلية المتاحة للتعيين
export const INTERNAL_PRODUCT_FIELDS = [
  { key: 'partNumber', label: 'رقم الصنف', required: true },
  { key: 'name', label: 'اسم المنتج', required: true },
  { key: 'brand', label: 'الماركة', required: false },
  { key: 'qtyTotal', label: 'الكمية', required: true },
  { key: 'priceWholesale', label: 'سعر الجملة', required: false },
  { key: 'priceRetail', label: 'سعر التجزئة', required: false },
  { key: 'priceWholeWholesale', label: 'سعر جملة الجملة', required: false },
  { key: 'priceEcommerce', label: 'سعر المتجر الالكتروني', required: false },
  { key: 'qtyStore103', label: 'كمية المخزن 103', required: false },
  { key: 'qtyStore105', label: 'كمية المخزن 105', required: false },
  { key: 'rack103', label: 'رف المخزن 103', required: false },
  { key: 'rack105', label: 'رف المخزن 105', required: false },
  { key: 'carName', label: 'اسم السيارة', required: false },
  { key: 'description', label: 'المواصفات', required: false },
  { key: 'manufacturerPartNumber', label: 'رقم التصنيع', required: false },
  { key: 'globalCategory', label: 'التصنيف العالمي', required: false },
  { key: 'modelYear', label: 'سنة الصنع', required: false },
  { key: 'quality', label: 'الجودة', required: false },
] as const;

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
  | 'SEARCH_POINTS_DEDUCTED' // خصم نقاط بحث
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

// --- Admin Users Management Types ---

export interface AdminUser {
  id: string;
  fullName: string;       // الاسم الكامل
  username: string;       // اسم المستخدم
  phone: string;          // رقم الجوال
  email?: string;         // البريد الإلكتروني (اختياري)
  password?: string;      // كلمة المرور (مشفرة في الإنتاج)
  roleId: string;         // معرف الدور المرتبط
  isActive: boolean;      // نشط / موقوف
  lastLoginAt?: string;   // آخر تسجيل دخول
  createdAt: string;      // تاريخ الإنشاء
  createdBy?: string;     // أنشئ بواسطة
}

// --- Roles & Permissions Types ---

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'configure'
  | 'manage_status'
  | 'manage_users'
  | 'manage_roles'
  | 'run_backup'
  | 'manage_api'
  | 'other';

export type PermissionResource =
  | 'dashboard'
  | 'products'
  | 'customers'
  | 'customer_requests'
  | 'account_requests'
  | 'quotes'
  | 'orders'
  | 'imports'
  | 'missing'
  | 'crm'
  | 'activity_log'
  | 'notifications'
  | 'settings_general'
  | 'settings_status_labels'
  | 'settings_api'
  | 'settings_backup'
  | 'settings_security'
  | 'users'
  | 'roles'
  | 'export_center'
  | 'content_management'
  | 'other';

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;           // اسم الدور بالعربية
  description?: string;   // وصف الدور
  permissions: Permission[];
  isSystem?: boolean;     // أدوار النظام لا يمكن حذفها
  createdAt?: string;
}

// تسميات الموارد بالعربية
export const PERMISSION_RESOURCE_LABELS: Record<PermissionResource, string> = {
  dashboard: 'لوحة التحكم',
  products: 'المنتجات',
  customers: 'العملاء',
  customer_requests: 'طلبات العملاء',
  account_requests: 'طلبات فتح الحسابات',
  quotes: 'عروض الأسعار',
  orders: 'الطلبات',
  imports: 'طلبات الاستيراد',
  missing: 'النواقص',
  crm: 'قاعدة العملاء',
  activity_log: 'سجل النشاط',
  notifications: 'الإشعارات',
  settings_general: 'الإعدادات العامة',
  settings_status_labels: 'مسميات الحالات',
  settings_api: 'إعدادات API',
  settings_backup: 'النسخ الاحتياطي',
  settings_security: 'إعدادات الأمان',
  users: 'المستخدمون',
  roles: 'الأدوار والصلاحيات',
  export_center: 'مركز التصدير',
  content_management: 'إدارة المحتوى',
  other: 'أخرى'
};

// تسميات الإجراءات بالعربية
export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'عرض',
  create: 'إضافة',
  edit: 'تعديل',
  delete: 'حذف',
  approve: 'موافقة',
  reject: 'رفض',
  export: 'تصدير',
  import: 'استيراد',
  configure: 'إعدادات',
  manage_status: 'إدارة الحالات',
  manage_users: 'إدارة المستخدمين',
  manage_roles: 'إدارة الأدوار',
  run_backup: 'تشغيل النسخ الاحتياطي',
  manage_api: 'إدارة API',
  other: 'أخرى'
};

// الإجراءات المتاحة لكل مورد
export const RESOURCE_AVAILABLE_ACTIONS: Record<PermissionResource, PermissionAction[]> = {
  dashboard: ['view'],
  products: ['view', 'create', 'edit', 'delete', 'export', 'import'],
  customers: ['view', 'create', 'edit', 'delete', 'export', 'manage_status'],
  customer_requests: ['view', 'edit', 'approve', 'reject', 'export'],
  account_requests: ['view', 'approve', 'reject', 'export'],
  quotes: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export'],
  orders: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'manage_status'],
  imports: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'manage_status'],
  missing: ['view', 'create', 'edit', 'delete', 'export', 'manage_status'],
  crm: ['view', 'create', 'edit', 'delete', 'export'],
  activity_log: ['view', 'export'],
  notifications: ['view', 'create', 'delete'],
  settings_general: ['view', 'configure'],
  settings_status_labels: ['view', 'create', 'edit', 'delete'],
  settings_api: ['view', 'configure', 'manage_api'],
  settings_backup: ['view', 'run_backup'],
  settings_security: ['view', 'configure'],
  users: ['view', 'create', 'edit', 'delete', 'manage_users'],
  roles: ['view', 'create', 'edit', 'delete', 'manage_roles'],
  export_center: ['view', 'export'],
  content_management: ['view', 'create', 'edit', 'delete'],
  other: ['view', 'other']
};

// --- Global Status Labels Management Types ---

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

// --- Notification Management System Types ---

export type NotificationChannel = 'toast' | 'popup' | 'banner' | 'bell' | 'email' | 'sms';

export type NotificationCategory =
  | 'order'
  | 'quote'
  | 'account'
  | 'import'
  | 'search'
  | 'system'
  | 'marketing'
  | 'alert';

export interface NotificationStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
  icon?: string;
  animation?: 'slide' | 'fade' | 'bounce' | 'none';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duration?: number;
  showProgress?: boolean;
  showCloseButton?: boolean;
}

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  isActive: boolean;
  
  // Localized content
  content: {
    ar: { title: string; message: string };
    en: { title: string; message: string };
    hi: { title: string; message: string };
    zh: { title: string; message: string };
  };
  
  // Styling
  style: NotificationStyle;
  
  // Metadata
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationSettings {
  globalEnabled: boolean;
  defaultDuration: number;
  defaultPosition: NotificationStyle['position'];
  maxVisible: number;
  soundEnabled: boolean;
  templates: NotificationTemplate[];
}

// --- PDF/Print Template Designer Types ---

export type DocumentTemplateType = 
  | 'invoice'
  | 'order'
  | 'quote'
  | 'receipt'
  | 'delivery_note'
  | 'packing_list'
  | 'price_list'
  | 'report';

export type PageSize = 'A4' | 'A5' | 'Letter' | 'Legal';
export type PageOrientation = 'portrait' | 'landscape';

export interface TemplateMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TemplateHeaderFooter {
  enabled: boolean;
  height: number;
  showLogo: boolean;
  logoPosition?: 'left' | 'center' | 'right';
  logoSize?: number;
  showCompanyName: boolean;
  showDate: boolean;
  showPageNumber: boolean;
  customText?: string;
  backgroundColor?: string;
  textColor?: string;
  borderBottom?: boolean;
  borderTop?: boolean;
}

export interface TemplateField {
  id: string;
  key: string;
  label: string;
  labelAr: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'image' | 'qrcode' | 'barcode';
  enabled: boolean;
  required: boolean;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  order: number;
}

export interface TemplateTableColumn {
  id: string;
  key: string;
  header: string;
  headerAr: string;
  width: number;
  alignment: 'left' | 'center' | 'right';
  enabled: boolean;
  order: number;
}

export interface TemplateSection {
  id: string;
  name: string;
  type: 'header' | 'info' | 'table' | 'summary' | 'footer' | 'custom';
  enabled: boolean;
  order: number;
  fields?: TemplateField[];
  tableColumns?: TemplateTableColumn[];
  customContent?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  nameAr: string;
  type: DocumentTemplateType;
  isDefault: boolean;
  isActive: boolean;
  
  // Page Settings
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: TemplateMargins;
  
  // Branding
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  
  // Header & Footer
  header: TemplateHeaderFooter;
  footer: TemplateHeaderFooter;
  
  // Sections
  sections: TemplateSection[];
  
  // Watermark
  watermark?: {
    enabled: boolean;
    text?: string;
    imageUrl?: string;
    opacity: number;
    position: 'center' | 'diagonal';
  };
  
  // Localization
  defaultLanguage: 'ar' | 'en';
  showBilingual: boolean;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface PrintSettings {
  templates: DocumentTemplate[];
  companyInfo: {
    name: string;
    nameEn?: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    taxNumber?: string;
    crNumber?: string;
    logoUrl?: string;
  };
  defaultTemplate: Record<DocumentTemplateType, string>;
}

// --- Sidebar Preferences Types ---

export interface SidebarPreferences {
  collapsed: boolean;
  width: number;
  mobileAutoClose: boolean;
}

// --- Marketing Campaign Types (مركز التسويق) ---

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

// ============================================================
// --- PRICING CENTER TYPES (مركز التسعيرات) ---
// ============================================================

// Adjustment type for derived price levels
export type PriceLevelAdjustmentType = 'PERCENT' | 'FIXED';

// Rounding mode for final price calculation
export type PricingRoundingMode = 'NONE' | 'ROUND' | 'CEIL' | 'FLOOR';

// Precedence options for price calculation
export type PricePrecedenceOption = 'CUSTOM_RULE' | 'LEVEL_EXPLICIT' | 'LEVEL_DERIVED';

// Price Level - defines each pricing tier (fully configurable)
export interface ConfigurablePriceLevel {
  id: string;
  code: string;
  name: string;
  description?: string;
  isBaseLevel: boolean;
  baseLevelId?: string;
  adjustmentType?: PriceLevelAdjustmentType;
  adjustmentValue?: number;
  isActive: boolean;
  sortOrder: number;
  color?: string;
  minOrderValue?: number;
  maxDiscountPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Product Price Entry - explicit price per product per level
export interface ProductPriceEntry {
  id: string;
  productId: string;
  priceLevelId: string;
  price: number;
  currency?: string;
  minQty?: number;
  maxQty?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Customer Custom Price Rule - overrides for specific products/categories
export interface CustomerCustomPriceRule {
  id: string;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  useFixedPrice?: boolean;
  fixedPrice?: number;
  usePercentOfLevel?: boolean;
  percentOfLevel?: number;
  priceLevelIdForPercent?: string;
  minQty?: number;
  maxQty?: number;
  validFrom?: string;
  validTo?: string;
  notes?: string;
}

// Customer Pricing Profile - per-customer pricing configuration
export interface CustomerPricingProfile {
  customerId: string;
  defaultPriceLevelId: string;
  extraMarkupPercent?: number;
  extraDiscountPercent?: number;
  allowCustomRules: boolean;
  customRules?: CustomerCustomPriceRule[];
  priceFloor?: number;
  priceCeiling?: number;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  notes?: string;
}

// Volume Discount Rule - quantity-based discounts
export interface VolumeDiscountRule {
  id: string;
  minQty: number;
  maxQty?: number;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  appliesToAllProducts: boolean;
  productIds?: string[];
  categoryIds?: string[];
  isActive: boolean;
}

// Time-Based Promotion - scheduled price adjustments
export interface TimeBasedPromotion {
  id: string;
  name: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  startsAt: string;
  endsAt: string;
  appliesToAllProducts: boolean;
  productIds?: string[];
  categoryIds?: string[];
  priceLevelIds?: string[];
  isActive: boolean;
  createdAt?: string;
}

// Global Pricing Settings - master configuration
export interface GlobalPricingSettings {
  defaultPriceLevelId: string | null;
  currency: string;
  currencySymbol?: string;
  roundingMode: PricingRoundingMode;
  roundingDecimals: number;
  pricePrecedenceOrder: PricePrecedenceOption[];
  allowNegativeDiscounts: boolean;
  allowFallbackToOtherLevels: boolean;
  fallbackLevelId?: string | null;
  enableVolumeDiscounts?: boolean;
  volumeDiscountRules?: VolumeDiscountRule[];
  enableTimePromotions?: boolean;
  timePromotions?: TimeBasedPromotion[];
  minPriceFloor?: number;
  maxPriceCeiling?: number;
  showPriceBreakdown?: boolean;
  taxRate?: number;
  taxIncluded?: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

// Price Calculation Result - for simulation/debugging
export interface PriceCalculationResult {
  finalPrice: number | null;
  basePrice: number | null;
  sourcePrecedence: PricePrecedenceOption | null;
  sourceLevelId: string | null;
  sourceLevelName?: string;
  appliedMarkup?: number;
  appliedDiscount?: number;
  appliedVolumeDiscount?: number;
  appliedPromotion?: string;
  roundingApplied: boolean;
  calculationSteps: string[];
  errors?: string[];
}

// Pricing Audit Log Entry
export interface PricingAuditLogEntry {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'LEVEL' | 'MATRIX' | 'PROFILE' | 'SETTINGS' | 'RULE';
  entityId: string;
  previousValue?: any;
  newValue?: any;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

// ============================================================
// TRADER TOOLS SYSTEM TYPES
// ============================================================

export type ToolKey = 'PDF_TO_EXCEL' | 'VIN_EXTRACTOR' | 'PRICE_COMPARISON';

export interface ToolConfig {
  toolKey: ToolKey;
  enabled: boolean;
  allowedCustomerTypes: string[];
  blockedCustomerIds: string[];
  allowedPlans?: string[];
  maxFilesPerDay?: number;
  maxFilesPerMonth?: number;
  logUsageForAnalytics: boolean;
  showInDashboardShortcuts: boolean;
  toolNameAr: string;
  toolNameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  iconName?: string;
  sortOrder?: number;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}

export interface CustomerToolsOverride {
  customerId: string;
  useGlobalDefaults: boolean;
  forcedEnabledTools?: ToolKey[];
  forcedDisabledTools?: ToolKey[];
  customLimits?: {
    toolKey: ToolKey;
    maxFilesPerDay?: number;
    maxFilesPerMonth?: number;
  }[];
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ToolUsageRecord {
  id: string;
  customerId: string;
  toolKey: ToolKey;
  usedAt: string;
  filesProcessed: number;
  success: boolean;
  errorMessage?: string;
  processingTimeMs?: number;
  metadata?: Record<string, any>;
}

export interface SupplierPriceRecordRow {
  partNumber: string;
  description?: string;
  price?: number;
  currency?: string;
  quantity?: number;
  brand?: string;
  extra?: Record<string, string>;
}

export interface SupplierPriceRecord {
  id: string;
  ownerCustomerId: string;
  supplierName?: string;
  fileLabel: string;
  originalFileUrl?: string;
  originalFileName?: string;
  parsedAt: string;
  rows: SupplierPriceRecordRow[];
  totalRows?: number;
  parseErrors?: string[];
  notes?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface VinExtractionRecord {
  id: string;
  ownerCustomerId: string;
  uploadedAt: string;
  fileUrl?: string;
  fileName?: string;
  vin: string;
  carMake?: string;
  carModel?: string;
  modelYear?: string;
  plateNumber?: string;
  engineType?: string;
  transmissionType?: string;
  countryOfOrigin?: string;
  notes?: string;
  extractionMethod?: 'MANUAL' | 'OCR' | 'API';
  confidence?: number;
  isFavorite?: boolean;
  linkedOrderIds?: string[];
}

export interface PriceComparisonResultRow {
  partNumber: string;
  description?: string;
  priceA?: number;
  priceB?: number;
  bestSource?: 'A' | 'B' | 'EQUAL';
  priceDiff?: number;
  priceDiffPercent?: number;
  notes?: string;
}

export interface PriceComparisonSession {
  id: string;
  ownerCustomerId: string;
  createdAt: string;
  sessionName?: string;
  fileA: {
    label: string;
    sourceType: 'PDF' | 'EXCEL' | 'SUPPLIER_RECORD';
    originalFileUrl?: string;
    supplierRecordId?: string;
  };
  fileB: {
    label: string;
    sourceType: 'PDF' | 'EXCEL' | 'SUPPLIER_RECORD';
    originalFileUrl?: string;
    supplierRecordId?: string;
  };
  resultRows: PriceComparisonResultRow[];
  summary?: {
    totalItems: number;
    matchedItems: number;
    aIsCheaper: number;
    bIsCheaper: number;
    equalPrices: number;
    avgDiff?: number;
    totalSavings?: number;
  };
  notes?: string;
  isFavorite?: boolean;
}

// ============================================================
// SUPPLIER MARKETPLACE SYSTEM TYPES
// ============================================================

export interface SupplierCatalogItem {
  id: string;
  supplierId: string;
  partNumber: string;
  oemNumber?: string;
  brand?: string;
  description?: string;
  descriptionAr?: string;
  quantityAvailable?: number;
  purchasePrice?: number;
  sellingSuggestionPrice?: number;
  currency?: string;
  minOrderQty?: number;
  leadTimeDays?: number;
  warranty?: string;
  lastUpdatedAt: string;
  isActive: boolean;
  qualityGrade?: 'OEM' | 'AFTERMARKET' | 'REFURBISHED' | 'GENERIC';
  imageUrl?: string;
  categoryId?: string;
  tags?: string[];
}

export interface SupplierPriorityConfig {
  supplierId: string;
  supplierName?: string;
  priority: number;
  enabled: boolean;
  preferredForCategories?: string[];
  preferredForBrands?: string[];
  minProfitMargin?: number;
  maxLeadTimeDays?: number;
  notes?: string;
}

export type SupplierSelectionMode = 
  | 'SINI_FIRST_THEN_SUPPLIERS' 
  | 'SUPPLIERS_ONLY_WHEN_OUT_OF_STOCK' 
  | 'RANDOM_SUPPLIER_WHEN_OUT_OF_STOCK'
  | 'LOWEST_PRICE_FIRST'
  | 'HIGHEST_PRIORITY_FIRST';

export interface SupplierMarketplaceSettings {
  enabled: boolean;
  selectionMode: SupplierSelectionMode;
  hideRealSupplierFromCustomer: boolean;
  supplierPriorities: SupplierPriorityConfig[];
  defaultMarkupPercent?: number;
  minProfitMargin?: number;
  maxLeadTimeDays?: number;
  autoApproveSupplierItems?: boolean;
  requireApprovalForPriceAbove?: number;
  showSupplierStockLevel?: boolean;
  enableSupplierRating?: boolean;
  notifyAdminOnNewSupplierItem?: boolean;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface SupplierProfile {
  supplierId: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  rating?: number;
  totalItemsListed?: number;
  totalSalesAmount?: number;
  totalOrdersHandled?: number;
  avgLeadTime?: number;
  avgRating?: number;
  isVerified?: boolean;
  verifiedAt?: string;
  joinedAt?: string;
  lastActiveAt?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'INACTIVE';
  internalNotes?: string;
}

// ============================================================
// MARKETER / AFFILIATE SYSTEM TYPES
// ============================================================

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

export interface CustomerReferral {
  customerId: string;
  marketerId: string;
  referredAt: string;
  attributionExpiresAt: string;
  registrationIp?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  firstOrderId?: string;
  firstOrderDate?: string;
  totalOrdersCount?: number;
  totalOrdersValue?: number;
  isActive: boolean;
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

// ============================================================
// ADVERTISING SYSTEM TYPES
// ============================================================

export type AdvertiserCompanyType = 'supplier' | 'shipping' | 'workshop' | 'other';
export type AdvertiserStatus = 'active' | 'pending_verification' | 'suspended' | 'blacklisted';

export interface Advertiser {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  companyType?: AdvertiserCompanyType;
  source?: string;
  status: AdvertiserStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdCampaignType = 'banner_top' | 'banner_sidebar' | 'card_in_tools' | 'card_in_products' | 'popup';
export type AdCampaignStatus = 'draft' | 'pending_approval' | 'running' | 'paused' | 'rejected' | 'ended';
export type AdBudgetType = 'fixed' | 'per_view' | 'per_click';

export interface AdCampaign {
  id: string;
  advertiserId: string;
  name: string;
  type: AdCampaignType;
  targetPages: string[];
  priority: number;
  startDate: string;
  endDate?: string;
  budgetType?: AdBudgetType;
  maxViews?: number;
  maxClicks?: number;
  currentViews?: number;
  currentClicks?: number;
  landingUrl?: string;
  imageUrl?: string;
  status: AdCampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export type AdSlotSelectionMode = 'by_priority' | 'rotate' | 'random';

export interface AdSlot {
  id: string;
  slotKey: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isEnabled: boolean;
  maxAds: number;
  selectionMode: AdSlotSelectionMode;
  visibleForCustomerGroups?: string[];
  visibleForSpecificCustomers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdSlotRotationState {
  slotKey: string;
  currentIndex: number;
  lastRotatedAt: string;
}

// ============================================================
// INSTALLMENT WHOLESALE PURCHASE REQUEST SYSTEM TYPES
// ============================================================

// Installment Request Status
export type InstallmentRequestStatus =
  | 'PENDING_SINICAR_REVIEW'
  | 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR'
  | 'REJECTED_BY_SINICAR'
  | 'FORWARDED_TO_SUPPLIERS'
  | 'WAITING_FOR_SUPPLIER_OFFERS'
  | 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER'
  | 'ACTIVE_CONTRACT'
  | 'CLOSED'
  | 'CANCELLED';

// SINI CAR Decision
export type SinicarDecision = 'pending' | 'approved_full' | 'approved_partial' | 'rejected';

// Payment Frequency
export type PaymentFrequency = 'weekly' | 'monthly';

// Installment Offer Status
export type InstallmentOfferStatus =
  | 'WAITING_FOR_CUSTOMER'
  | 'ACCEPTED_BY_CUSTOMER'
  | 'REJECTED_BY_CUSTOMER';

// Installment Offer Source
export type InstallmentOfferSource = 'sinicar' | 'supplier';

// Installment Offer Type
export type InstallmentOfferType = 'full' | 'partial';

// Payment Installment Status
export type PaymentInstallmentStatus = 'pending' | 'paid' | 'overdue';

// Credit Score Level
export type CreditScoreLevel = 'low' | 'medium' | 'high';

// Installment Request Item
export interface InstallmentRequestItem {
  id: string;
  requestId: string;
  productId?: string;
  productName?: string;
  description?: string;
  quantityRequested: number;
  unitPriceRequested?: number;
}

// Installment Payment Installment (single payment in schedule)
export interface InstallmentPaymentInstallment {
  id: string;
  dueDate: string;
  amount: number;
  status: PaymentInstallmentStatus;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

// Installment Payment Schedule
export interface InstallmentPaymentSchedule {
  frequency: PaymentFrequency;
  numberOfInstallments: number;
  installmentAmount: number;
  startDate: string;
  endDate: string;
  installments: InstallmentPaymentInstallment[];
}

// Installment Offer Item
export interface InstallmentOfferItem {
  id: string;
  offerId: string;
  requestItemId?: string;
  productId?: string;
  productName?: string;
  quantityApproved: number;
  unitPriceApproved: number;
}

// Installment Offer
export interface InstallmentOffer {
  id: string;
  requestId: string;
  sourceType: InstallmentOfferSource;
  supplierId?: string;
  supplierName?: string;
  type: InstallmentOfferType;
  itemsApproved: InstallmentOfferItem[];
  totalApprovedValue: number;
  schedule: InstallmentPaymentSchedule;
  status: InstallmentOfferStatus;
  notes?: string;
  adminNotes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Installment Request
export interface InstallmentRequest {
  id: string;
  customerId: string;
  customerName?: string;
  items: InstallmentRequestItem[];
  totalRequestedValue?: number;
  requestedDurationMonths?: number;
  requestedDurationWeeks?: number;
  paymentFrequency: PaymentFrequency;
  proposedInstallmentAmount?: number;
  downPaymentAmount?: number;
  notes?: string;
  status: InstallmentRequestStatus;
  sinicarDecision: SinicarDecision;
  allowedForSuppliers: boolean;
  forwardedToSupplierIds?: string[];
  acceptedOfferId?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  closedAt?: string;
  closedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Customer Credit Profile
export interface CustomerCreditProfile {
  customerId: string;
  customerName?: string;
  scoreLevel: CreditScoreLevel;
  totalInstallmentRequests: number;
  totalActiveContracts: number;
  totalOverdueInstallments: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  paymentHistoryScore?: number;
  notes?: string;
  lastUpdated: string;
}

// Installment Settings - Controls all behavior
export interface InstallmentSettings {
  enabled: boolean;
  
  // SINI CAR priority behavior
  sinicarHasFirstPriority: boolean;
  allowPartialApprovalBySinicar: boolean;
  allowPartialApprovalBySuppliers: boolean;
  
  // What happens when SINI CAR rejects or partially approves
  autoForwardToSuppliersOnSinicarReject: boolean;
  autoForwardToSuppliersOnSinicarPartialRemainder: boolean;
  
  // Customer decision behavior
  onCustomerRejectsSinicarPartial: 'close_request' | 'forward_to_suppliers';
  onCustomerRejectsSupplierOffer: 'keep_waiting_for_other_suppliers' | 'close_request';
  
  // Duration limits
  maxDurationMonths: number;
  minDurationMonths: number;
  maxDurationWeeks?: number;
  minDurationWeeks?: number;
  
  // Down payment settings
  requireDownPayment: boolean;
  minDownPaymentPercent?: number;
  maxDownPaymentPercent?: number;
  
  // Amount limits
  minRequestAmount?: number;
  maxRequestAmount?: number;
  
  // Credit profile settings
  requireCreditCheck: boolean;
  minCreditScoreForApproval?: CreditScoreLevel;
  autoRejectLowCredit?: boolean;
  
  // Customer eligibility
  allowedCustomerTypes?: string[];
  blockedCustomerIds?: string[];
  
  // Supplier settings
  autoSelectAllSuppliers?: boolean;
  defaultSupplierIds?: string[];
  maxSuppliersPerRequest?: number;
  
  // Admin workflow
  requireAdminApprovalForSinicar?: boolean;
  autoGeneratePaymentSchedule?: boolean;
  defaultPaymentFrequency?: PaymentFrequency;
  
  // Notifications
  notifyCustomerOnNewOffer: boolean;
  notifyCustomerOnStatusChange?: boolean;
  notifyAdminOnNewRequest: boolean;
  notifyAdminOnCustomerDecision?: boolean;
  notifySuppliersOnForward: boolean;
  notifySuppliersOnCustomerDecision?: boolean;
  
  // Display settings
  showInstallmentInSidebar?: boolean;
  showInstallmentInDashboard?: boolean;
  showCreditProfileToCustomer?: boolean;
  showPaymentHistoryToCustomer?: boolean;
  
  // Terms and conditions
  termsAndConditionsAr?: string;
  termsAndConditionsEn?: string;
  requireTermsAcceptance?: boolean;
  
  // Overdue handling
  overdueGracePeriodDays?: number;
  autoMarkOverdue?: boolean;
  notifyOnOverdue?: boolean;
  
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

// Decision payload for SINI CAR
export interface SinicarDecisionPayload {
  decisionType: 'approve_full' | 'approve_partial' | 'reject';
  offer?: Partial<InstallmentOffer>;
  forwardToSuppliers?: boolean;
  supplierIds?: string[];
  adminNotes?: string;
}

// Supplier Offer Payload
export interface SupplierOfferPayload {
  type: InstallmentOfferType;
  itemsApproved: Omit<InstallmentOfferItem, 'id' | 'offerId'>[];
  totalApprovedValue: number;
  schedule: Omit<InstallmentPaymentSchedule, 'installments'>;
  notes?: string;
}

// Installment Stats for Admin Dashboard
export interface InstallmentStats {
  totalRequests: number;
  pendingRequests: number;
  activeContracts: number;
  closedContracts: number;
  totalRequestedValue: number;
  totalApprovedValue: number;
  totalPaidAmount: number;
  totalOverdueAmount: number;
  avgApprovalRate: number;
  avgProcessingDays: number;
  byStatus: { status: InstallmentRequestStatus; count: number }[];
  byMonth: { month: string; count: number; value: number }[];
}
