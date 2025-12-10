import type { BusinessProfile, ExtendedUserRole, UserAccountStatus } from './user';

export interface MultilingualText {
  ar: string;
  en: string;
  hi: string;
  zh: string;
}

export type NotificationChannel = 'toast' | 'popup' | 'banner' | 'bell' | 'email' | 'sms';

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
  
  extendedRole?: ExtendedUserRole;
  accountStatus?: UserAccountStatus;
  completionPercent?: number;
  whatsapp?: string;
  clientCode?: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
}

export interface AdminCustomerResponse {
  items: BusinessProfile[];
  page: number;
  pageSize: number;
  total: number;
}
