/**
 * Auth Types - أنواع المصادقة
 * 
 * هذا الملف يجمع الأنواع المتعلقة بالمصادقة في مكان واحد
 * مع الحفاظ على التوافق عبر re-exports
 */

// Re-export من user.ts
export type {
  UserRole,
  ExtendedUserRole,
  UserAccountStatus,
  User,
} from './user';

// Re-export من admin.ts
export type {
  ActiveSession,
  UserRoleAssignment,
  UserPermissions,
} from './admin';

// أنواع المصادقة الإضافية
export type LoginType = 'OWNER' | 'STAFF';

export interface AuthState {
  isAuthenticated: boolean;
  user: import('./user').User | null;
  profile: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  identifier: string;
  secret: string;
  loginType: LoginType;
}

export interface LoginResponse {
  user: import('./user').User;
  profile: any | null;
  token?: string;
}
