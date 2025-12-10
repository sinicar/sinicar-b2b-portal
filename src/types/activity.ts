import type { UserRole } from './user';

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
  | 'PURCHASE_REQUEST_CREATED' // إنشاء طلب شراء من صفحة البحث
  | 'USER_APPROVED'      // اعتماد مستخدم
  | 'USER_REJECTED'      // رفض مستخدم
  | 'ALTERNATIVES_UPLOADED' // رفع ملف بدائل
  | 'SETTINGS_CHANGED'   // تغيير إعدادات
  | 'FILE_UPLOADED'      // رفع ملف
  | 'OTHER'              // عمليات أخرى عامة
  // Supplier Portal Events
  | 'PRODUCT_ADDED'      // إضافة منتج جديد (مورد)
  | 'PRODUCT_UPDATED'    // تحديث منتج (مورد)
  | 'PRODUCT_DELETED'    // حذف منتج (مورد)
  | 'PRODUCT_IMPORTED'   // استيراد منتجات من Excel (مورد)
  | 'QUOTE_SENT'         // إرسال عرض سعر (مورد)
  | 'QUOTE_REQUEST_REJECTED' // رفض طلب تسعير (مورد)
  | 'SETTINGS_UPDATED';  // تحديث إعدادات (مورد)

export type ActorType = 
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'MARKETER'
  | 'EMPLOYEE'
  | 'ADMIN';

export type EntityType =
  | 'ORDER'
  | 'REQUEST'
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'PRODUCT'
  | 'ALTERNATIVE'
  | 'SETTINGS'
  | 'QUOTE'
  | 'IMPORT'
  | 'USER'
  | 'FILE'
  | 'OTHER';

export interface ActivityLogEntry {
  id: string;            // رقم فريد للنشاط
  userId: string;        // المستخدم الذي قام بالنشاط (actorId)
  userName?: string;     // اسم المستخدم
  role?: UserRole;       // دور المستخدم
  eventType: ActivityEventType;

  // Extended activity tracking fields
  actorType?: ActorType;    // نوع الفاعل (عميل، مورد، مسوق، موظف، إدارة)
  entityType?: EntityType;  // نوع الكيان المتأثر
  entityId?: string;        // معرف الكيان المتأثر

  // تفاصيل إضافية
  description?: string;  // نص وصفي للنشاط بالعربي
  page?: string;         // اسم الصفحة أو المسار
  metadata?: Record<string, any>; // كائن اختياري لوضع تفاصيل إضافية
  
  // Optional tracking
  ipAddress?: string;    // عنوان IP (اختياري)
  userAgent?: string;    // معلومات المتصفح (اختياري)

  createdAt: string;     // التاريخ والوقت الكامل للنشاط
}

export interface OnlineUser {
  id: string;
  name: string;
  actorType: ActorType;
  role?: UserRole;
  lastActivityAt: string;
}

export interface OnlineUsersResponse {
  onlineCustomers: OnlineUser[];
  onlineSuppliers: OnlineUser[];
  onlineMarketers: OnlineUser[];
  onlineEmployees: OnlineUser[];
  onlineAdmins: OnlineUser[];
}

export interface ActivityLogFilters {
  actorType?: ActorType;
  actorId?: string;
  actionType?: ActivityEventType;
  entityType?: EntityType;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityLogResponse {
  items: ActivityLogEntry[];
  page: number;
  pageSize: number;
  total: number;
}
