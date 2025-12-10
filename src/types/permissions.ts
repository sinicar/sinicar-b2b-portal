// ============================================
// ROLES & PERMISSIONS TYPES
// ============================================

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

// ===========================================
// EXTENDED PERMISSION SYSTEM TYPES
// ===========================================

export interface RoleExtended {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PermissionExtended {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  module: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  permission?: PermissionExtended;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy?: string;
  isActive: boolean;
  createdAt: string;
  role?: RoleExtended;
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: {
    code: string;
    module: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }[];
  modules: string[];
}

export interface ModuleAccess {
  id: string;
  moduleKey: string;
  moduleName: string;
  moduleNameAr?: string;
  isEnabled: boolean;
  requiredRole?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}
