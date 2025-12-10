// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'CUSTOMER_OWNER' // Was ADMIN
  | 'CUSTOMER_STAFF'; // Was EMPLOYEE

// Extended User Role for multi-role system (ADMIN, EMPLOYEE, CUSTOMER, SUPPLIER, MARKETER)
export type ExtendedUserRole = 
  | 'SUPER_ADMIN'              // مشرف عام
  | 'ADMIN'                    // مدير النظام
  | 'EMPLOYEE'                 // موظف
  | 'CUSTOMER'                 // عميل
  | 'SUPPLIER_LOCAL'           // مورد محلي
  | 'SUPPLIER_INTERNATIONAL'   // مورد دولي
  | 'MARKETER';                // مسوق

// User Account Status for approval workflow
export type UserAccountStatus = 
  | 'PENDING'    // قيد الانتظار
  | 'APPROVED'   // مقبول
  | 'REJECTED'   // مرفوض
  | 'BLOCKED';   // محظور

export enum EmployeeRole {
  MANAGER = 'MANAGER', // Can view prices, order, manage
  BUYER = 'BUYER' // Can browse, add to cart (needs approval)
}

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

// --- Admin Users Management Types ---

export interface AdminUser {
  id: string;
  fullName: string;       // الاسم الكامل
  username: string;       // اسم المستخدم
  phone?: string;         // رقم الجوال (اختياري)
  email?: string;         // البريد الإلكتروني (اختياري)
  password?: string;      // كلمة المرور (مشفرة في الإنتاج)
  roleId: string;         // معرف الدور المرتبط
  isActive: boolean;      // نشط / موقوف
  isSuperAdmin?: boolean; // هل هو مشرف عام
  lastLoginAt?: string;   // آخر تسجيل دخول
  createdAt: string;      // تاريخ الإنشاء
  createdBy?: string;     // أنشئ بواسطة
  
  // Extended fields for multi-role system
  extendedRole?: ExtendedUserRole;      // نوع الدور الموسع
  accountStatus?: UserAccountStatus;     // حالة الحساب (PENDING, APPROVED, REJECTED, BLOCKED)
  completionPercent?: number;            // نسبة اكتمال الملف الشخصي
  whatsapp?: string;                     // رقم الواتساب
  clientCode?: string;                   // كود العميل الداخلي
  isCustomer?: boolean;                  // هل هو عميل
  isSupplier?: boolean;                  // هل هو مورد
}
