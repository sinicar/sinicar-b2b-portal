/**
 * PermissionContext - Wrapper للتوافق مع الكود القديم
 * يستخدم Zustand Store داخلياً
 */

import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { AccessDenied } from '../components/AccessDenied';
import { AdminUser, Role, PermissionResource, PermissionAction } from '../types';
import { useAuthStore, selectIsSuperAdmin, useMenuVisibility as useZustandMenuVisibility, useResourcePermission as useZustandResourcePermission } from '../stores/useAuthStore';

// Re-export interfaces for backward compatibility
export interface EffectivePermission {
    permissionKey: string;
    resource: string;
    action: string;
    source: 'role' | 'group' | 'override';
    effect: 'ALLOW' | 'DENY';
}

interface PermissionProviderProps {
    children: React.ReactNode;
    initialAdminUser?: AdminUser | null;
}

/**
 * PermissionProvider - الآن wrapper خفيف يستخدم Zustand
 * يحافظ على التوافق الخلفي مع الكود القديم
 */
export const PermissionProvider: React.FC<PermissionProviderProps> = ({
    children,
    initialAdminUser = null
}) => {
    const setAdminUser = useAuthStore((state) => state.setAdminUser);
    const initialized = useAuthStore((state) => state.initialized);

    // تهيئة المستخدم عند تغيير initialAdminUser
    useEffect(() => {
        if (initialAdminUser && !initialized) {
            setAdminUser(initialAdminUser);
        }
    }, [initialAdminUser, setAdminUser, initialized]);

    // لا نحتاج Context Provider بعد الآن - Zustand هو الـ store
    return <>{children}</>;
};

/**
 * usePermission - Hook الرئيسي للصلاحيات
 * يقرأ من Zustand Store مباشرة
 */
export const usePermission = () => {
    const adminUser = useAuthStore((state) => state.adminUser);
    const role = useAuthStore((state) => state.role);
    const loading = useAuthStore((state) => state.loading);
    const effectivePermissions = useAuthStore((state) => state.effectivePermissions);
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const canAccess = useAuthStore((state) => state.canAccess);
    const can = useAuthStore((state) => state.can);
    const refreshPermissions = useAuthStore((state) => state.refreshPermissions);
    const setAdminUser = useAuthStore((state) => state.setAdminUser);
    const isSuperAdmin = useAuthStore(selectIsSuperAdmin);

    return {
        adminUser,
        role,
        loading,
        effectivePermissions,
        hasPermission,
        can,
        canAccess,
        isSuperAdmin,
        refreshPermissions,
        setAdminUser
    };
};

/**
 * useResourcePermission - صلاحيات مورد معين
 */
export const useResourcePermission = useZustandResourcePermission;

/**
 * useMenuVisibility - رؤية القوائم
 */
export const useMenuVisibility = useZustandMenuVisibility;

// ===== COMPONENTS =====

interface PermissionGateProps {
    resource: PermissionResource;
    action?: PermissionAction;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * PermissionGate - إظهار/إخفاء عناصر حسب الصلاحيات
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    resource,
    action = 'view',
    children,
    fallback = null
}) => {
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const loading = useAuthStore((state) => state.loading);

    if (loading) return null;

    if (hasPermission(resource, action)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

interface PermissionGuardProps {
    resource: PermissionResource;
    action?: PermissionAction;
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * PermissionGuard - حماية صفحات كاملة
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    resource,
    action = 'view',
    children,
    redirectTo = '/'
}) => {
    const adminUser = useAuthStore((state) => state.adminUser);
    const hasPermission = useAuthStore((state) => state.hasPermission);
    const loading = useAuthStore((state) => state.loading);
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!loading && !adminUser) {
            setLocation(redirectTo);
        }
    }, [loading, adminUser, redirectTo, setLocation]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!adminUser) {
        return null;
    }

    if (!hasPermission(resource, action)) {
        return <AccessDenied resourceName={resource} onGoHome={() => setLocation('/')} />;
    }

    return <>{children}</>;
};

// ===== UTILITY EXPORTS =====

// تصدير الـ store مباشرة للاستخدام المتقدم
export { useAuthStore } from '../stores/useAuthStore';
export { selectIsSuperAdmin } from '../stores/useAuthStore';
