export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'CUSTOMER_OWNER' // Was ADMIN
  | 'CUSTOMER_STAFF'; // Was EMPLOYEE

export type ExtendedUserRole = 
  | 'SUPER_ADMIN'              // مشرف عام
  | 'ADMIN'                    // مدير النظام
  | 'EMPLOYEE'                 // موظف
  | 'CUSTOMER'                 // عميل
  | 'SUPPLIER_LOCAL'           // مورد محلي
  | 'SUPPLIER_INTERNATIONAL'   // مورد دولي
  | 'MARKETER';                // مسوق

export type UserAccountStatus = 
  | 'PENDING'    // قيد الانتظار
  | 'APPROVED'   // مقبول
  | 'REJECTED'   // مرفوض
  | 'BLOCKED';   // محظور

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

export type CustomerCategory =
  | 'SPARE_PARTS_SHOP'     // محل قطع غيار
  | 'INSURANCE_COMPANY'    // شركة تأمين
  | 'RENTAL_COMPANY'       // شركة تأجير سيارات
  | 'MAINTENANCE_CENTER'   // مركز صيانة
  | 'SALES_REP';           // مندوب مبيعات

export type AccountRequestStatus = 
  | 'NEW'           // طلب جديد
  | 'UNDER_REVIEW'  // قيد المراجعة
  | 'APPROVED'      // تم الموافقة
  | 'REJECTED'      // مرفوض
  | 'ON_HOLD';      // مؤجل

export type PriceLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'SPECIAL';

export type BusinessCustomerType =
  | 'PARTS_SHOP'        // محل قطع غيار
  | 'RENTAL_COMPANY'    // شركة تأجير سيارات
  | 'INSURANCE_COMPANY' // شركة تأمين
  | 'SALES_AGENT'       // مندوب مبيعات
  | 'FLEET_CUSTOMER'    // عميل أسطول سيارات
  | 'OTHER';

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

export type CustomerStatus =
  | 'ACTIVE'          // فعال
  | 'SUSPENDED'       // موقوف مؤقتًا
  | 'BLOCKED'         // محظور نهائيًا
  | 'PENDING'         // قيد التفعيل
  | 'INACTIVE';       // غير نشط (لا يستخدم النظام)

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

  // --- Extended Role/Status System (New) ---
  extendedRole?: ExtendedUserRole; // Extended role type (ADMIN, EMPLOYEE, CUSTOMER, SUPPLIER_*, MARKETER)
  accountStatus?: UserAccountStatus; // Approval workflow status (PENDING, APPROVED, REJECTED, BLOCKED)
  isCustomer?: boolean;              // Flag: User is a customer
  isSupplier?: boolean;              // Flag: User is a supplier (can be both customer + supplier)
  completionPercent?: number;        // Profile completion percentage (0-100)
  whatsapp?: string;                 // WhatsApp contact number
  clientCode?: string;               // Internal client code (optional)
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
  
  // CRM Enhancement Fields (Command 14)
  email?: string;
  whatsapp?: string;
  assignedMarketerId?: string;
  assignedEmployeeId?: string;
  completionPercent?: number;           // Profile completion percentage 0-100
  lastActivityAt?: string;              // From Activity Log
  abandonedCartsCount?: number;
  activeRequestsCount?: number;
  totalSpent?: number;
  totalApprovedOrders?: number;
  totalRejectedOrders?: number;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  text: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export type CustomerActivityLevel = 'ACTIVE_TODAY' | 'ACTIVE_WEEK' | 'INACTIVE_30' | 'ALL';
export type CustomerOrderBehavior = 'HIGH_VOLUME' | 'REJECTED_REQUESTS' | 'ABANDONED_CARTS' | 'ALL';

export interface AdminCustomerFilters {
  search?: string;
  customerType?: CustomerType | 'ALL';
  status?: CustomerStatus | 'ALL';
  assignedMarketerId?: string;
  assignedEmployeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  activityFrom?: string;
  activityTo?: string;
  activityLevel?: CustomerActivityLevel;
  orderBehavior?: CustomerOrderBehavior;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'companyName' | 'lastActivityAt' | 'lastLoginAt' | 'createdAt' | 'totalOrdersCount' | 'totalSearchesCount' | 'city' | 'status' | 'customerType';
  sortDirection?: 'asc' | 'desc';
}

export interface AdminCustomerSummary {
  totalOrders: number;
  totalRequests: number;
  totalApproved: number;
  totalRejected: number;
  totalSpent: number;
  abandonedCartsCount: number;
  activeRequestsCount: number;
}

/**
 * User and Authentication Types Module
 * 
 * This module contains all user, authentication, and customer-related type definitions:
 * - User roles (UserRole, ExtendedUserRole, EmployeeRole)
 * - Account statuses (UserAccountStatus, CustomerStatus, StaffStatus, AccountRequestStatus)
 * - Customer types (CustomerType, CustomerCategory, BusinessCustomerType)
 * - User and profile interfaces (User, BusinessProfile, Branch)
 * - Account opening request types (AccountOpeningRequest, UploadedDocument)
 * - Admin customer management types (AdminCustomerFilters, AdminCustomerSummary, CustomerNote)
 * - Pricing visibility types (PriceLevel, PriceVisibilityType)
 * - Activity tracking types (CustomerActivityLevel, CustomerOrderBehavior)
 */
