/**
 * Zustand Store للصلاحيات والمصادقة
 * يحل محل PermissionContext مع الحفاظ على نفس الـ API
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminUser, Role, PermissionResource, PermissionAction } from '../types';

// أنواع الصلاحيات الفعالة
interface EffectivePermission {
    permissionKey: string;
    resource: string;
    action: string;
    source: 'role' | 'group' | 'override';
    effect: 'ALLOW' | 'DENY';
}

// واجهة الـ Store
interface AuthState {
    // الحالة
    adminUser: AdminUser | null;
    role: Role | null;
    effectivePermissions: EffectivePermission[];
    loading: boolean;
    initialized: boolean;

    // الإجراءات
    setAdminUser: (user: AdminUser | null) => void;
    setRole: (role: Role | null) => void;
    setLoading: (loading: boolean) => void;
    loadPermissions: (user: AdminUser | null) => Promise<void>;
    refreshPermissions: () => Promise<void>;
    reset: () => void;

    // فحوصات الصلاحيات
    hasPermission: (resource: PermissionResource, action: PermissionAction) => boolean;
    canAccess: (resource: PermissionResource) => boolean;
    can: (permissionCode: string) => boolean;
}

// الحالة الابتدائية
const initialState = {
    adminUser: null as AdminUser | null,
    role: null as Role | null,
    effectivePermissions: [] as EffectivePermission[],
    loading: true,
    initialized: false,
};

// إنشاء الـ Store
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // الحالة الابتدائية
            ...initialState,

            // تعيين المستخدم
            setAdminUser: (user) => {
                set({ adminUser: user });
                // تحميل الصلاحيات عند تغيير المستخدم
                get().loadPermissions(user);
            },

            // تعيين الدور
            setRole: (role) => set({ role }),

            // تعيين حالة التحميل
            setLoading: (loading) => set({ loading }),

            // تحميل الصلاحيات
            loadPermissions: async (user) => {
                if (!user?.id) {
                    set({
                        role: null,
                        effectivePermissions: [],
                        loading: false,
                        initialized: true
                    });
                    return;
                }

                set({ loading: true });

                try {
                    // التحقق من نوع المستخدم
                    const isAdminType = user.extendedRole === 'ADMIN' ||
                        user.extendedRole === 'SUPER_ADMIN' ||
                        user.isSuperAdmin === true ||
                        user.roleId?.includes('admin') ||
                        user.roleId?.includes('super');

                    if (isAdminType) {
                        const isSuperType = user.extendedRole === 'SUPER_ADMIN' ||
                            user.isSuperAdmin === true ||
                            user.roleId?.includes('super');

                        const adminRole: Role = {
                            id: user.roleId || (isSuperType ? 'role-super-admin' : 'role-admin'),
                            code: isSuperType ? 'SUPER_ADMIN' : 'ADMIN',
                            name: isSuperType ? 'SUPER_ADMIN' : 'ADMIN',
                            nameAr: isSuperType ? 'مشرف عام' : 'مشرف',
                            description: isSuperType ? 'Super Administrator' : 'Administrator',
                            isSystem: true,
                            isActive: true,
                            sortOrder: 0,
                            createdAt: new Date().toISOString(),
                            permissions: []
                        };

                        set({
                            role: adminRole,
                            effectivePermissions: [],
                            loading: false,
                            initialized: true
                        });
                    } else {
                        // للأدوار الأخرى - جلب من الباك اند
                        // TODO: استبدال بـ fetch من API
                        set({
                            role: null,
                            effectivePermissions: [],
                            loading: false,
                            initialized: true
                        });
                    }
                } catch (error) {
                    console.error('Failed to load permissions:', error);
                    set({
                        role: null,
                        effectivePermissions: [],
                        loading: false,
                        initialized: true
                    });
                }
            },

            // تحديث الصلاحيات
            refreshPermissions: async () => {
                const { adminUser } = get();
                await get().loadPermissions(adminUser);
            },

            // إعادة تعيين الـ Store
            reset: () => {
                set(initialState);
                // مسح من localStorage أيضاً
                localStorage.removeItem('sini-auth-store');
            },

            // فحص صلاحية معينة
            hasPermission: (resource, action) => {
                const { adminUser, role, effectivePermissions } = get();

                // لا صلاحيات إذا لم يكن هناك مستخدم نشط
                if (!adminUser || !adminUser.isActive) return false;

                // Super Admin لديه جميع الصلاحيات
                if (role?.isSystem && (role.name === 'مشرف عام' || role.name === 'SUPER_ADMIN')) {
                    return true;
                }

                // البحث في الصلاحيات الفعالة
                const permKey = `${resource}:${action}`;
                const perm = effectivePermissions.find(p =>
                    p.permissionKey === permKey ||
                    (p.resource === resource && p.action === action)
                );

                if (perm) {
                    return perm.effect === 'ALLOW';
                }

                // البحث في صلاحيات الدور
                if (role?.permissions) {
                    const rolePerm = role.permissions.find(p => p.resource === resource);
                    if (rolePerm) {
                        return rolePerm.actions?.includes(action) || false;
                    }
                }

                return false;
            },

            // فحص الوصول للمورد (يعني view)
            canAccess: (resource) => {
                return get().hasPermission(resource, 'view');
            },

            // فحص بكود الصلاحية
            can: (permissionCode) => {
                const { adminUser, role, effectivePermissions } = get();

                if (!adminUser || !adminUser.isActive) return false;

                // Super Admin
                if (role?.isSystem && (role.name === 'مشرف عام' || role.name === 'SUPER_ADMIN')) {
                    return true;
                }

                // البحث في الصلاحيات الفعالة
                const perm = effectivePermissions.find(p =>
                    p.permissionKey === permissionCode ||
                    p.permissionKey.toUpperCase() === permissionCode.toUpperCase()
                );

                if (perm) {
                    return perm.effect === 'ALLOW';
                }

                // البحث في صلاحيات الدور
                if (role?.permissions) {
                    const found = role.permissions.some(p =>
                        `${p.resource}:${p.actions?.[0] || ''}`.toUpperCase() === permissionCode.toUpperCase()
                    );
                    if (found) return true;
                }

                return false;
            }
        }),
        {
            name: 'sini-auth-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // نحفظ فقط ما نحتاجه
                adminUser: state.adminUser,
                role: state.role,
                effectivePermissions: state.effectivePermissions
            })
        }
    )
);

// Selector للتحقق من Super Admin
export const selectIsSuperAdmin = (state: AuthState): boolean => {
    const { role } = state;
    if (!role) return false;
    return role.isSystem && (role.name === 'مشرف عام' || role.name === 'SUPER_ADMIN');
};

// Hook مساعد للقوائم المرئية
export const useMenuVisibility = () => {
    const { canAccess, loading } = useAuthStore();
    const isSuperAdmin = useAuthStore(selectIsSuperAdmin);

    if (loading) return { loading: true, menus: {} };

    if (isSuperAdmin) {
        return {
            loading: false,
            menus: {
                dashboard: true,
                products: true,
                orders: true,
                suppliers: true,
                customers: true,
                users: true,
                roles: true,
                permissions: true,
                reports: true,
                settings: true,
                notifications: true,
                traderTools: true
            }
        };
    }

    return {
        loading: false,
        menus: {
            dashboard: canAccess('dashboard'),
            products: canAccess('products'),
            orders: canAccess('orders'),
            suppliers: canAccess('suppliers'),
            customers: canAccess('customers'),
            users: canAccess('users'),
            roles: canAccess('roles'),
            permissions: canAccess('permissions'),
            reports: canAccess('reports'),
            settings: canAccess('settings'),
            notifications: canAccess('notifications'),
            traderTools: canAccess('trader_tools')
        }
    };
};

// Hook للصلاحيات على مورد معين
export const useResourcePermission = (resource: PermissionResource) => {
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const canAccess = useAuthStore((state) => state.canAccess);

    return {
        canView: hasPermission(resource, 'view'),
        canCreate: hasPermission(resource, 'create'),
        canEdit: hasPermission(resource, 'edit'),
        canDelete: hasPermission(resource, 'delete'),
        canApprove: hasPermission(resource, 'approve'),
        canReject: hasPermission(resource, 'reject'),
        canExport: hasPermission(resource, 'export'),
        canImport: hasPermission(resource, 'import'),
        canConfigure: hasPermission(resource, 'configure'),
        canManageStatus: hasPermission(resource, 'manage_status'),
        canManageUsers: hasPermission(resource, 'manage_users'),
        canManageRoles: hasPermission(resource, 'manage_roles'),
        canRunBackup: hasPermission(resource, 'run_backup'),
        canManageApi: hasPermission(resource, 'manage_api'),
        hasAccess: canAccess(resource)
    };
};

export default useAuthStore;
