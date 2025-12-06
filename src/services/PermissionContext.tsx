import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { AccessDenied } from '../components/AccessDenied';
import { AdminUser, Role, PermissionResource, PermissionAction } from '../types';

interface EffectivePermission {
    permissionKey: string;
    resource: string;
    action: string;
    source: 'role' | 'group' | 'override';
    effect: 'ALLOW' | 'DENY';
}

interface PermissionContextType {
    adminUser: AdminUser | null;
    role: Role | null;
    loading: boolean;
    effectivePermissions: EffectivePermission[];
    hasPermission: (resource: PermissionResource, action: PermissionAction) => boolean;
    canAccess: (resource: PermissionResource) => boolean;
    isSuperAdmin: boolean;
    refreshPermissions: () => Promise<void>;
    setAdminUser: (user: AdminUser | null) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
    children: React.ReactNode;
    initialAdminUser?: AdminUser | null;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ 
    children, 
    initialAdminUser = null 
}) => {
    const [adminUser, setAdminUserState] = useState<AdminUser | null>(initialAdminUser);
    const [role, setRole] = useState<Role | null>(null);
    const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);
    const [loading, setLoading] = useState(true);

    const setAdminUser = useCallback((user: AdminUser | null) => {
        setAdminUserState(user);
    }, []);

    const loadPermissions = useCallback(async (user: AdminUser | null) => {
        if (!user?.id) {
            setRole(null);
            setEffectivePermissions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // For testing/development: Provide default permissions for admin users
            // In production, this would fetch from backend API
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
                setRole(adminRole);
                setEffectivePermissions([]);
            } else {
                // For other roles, provide empty/basic permissions
                setRole(null);
                setEffectivePermissions([]);
            }
        } catch (e) {
            console.error('Failed to load permissions:', e);
            setRole(null);
            setEffectivePermissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialAdminUser) {
            setAdminUserState(initialAdminUser);
        }
    }, [initialAdminUser]);

    useEffect(() => {
        loadPermissions(adminUser);
    }, [adminUser, loadPermissions]);

    const isSuperAdmin = useMemo(() => {
        if (!role) return false;
        return role.isSystem && (role.name === 'مشرف عام' || role.name === 'SUPER_ADMIN');
    }, [role]);

    const hasPermission = useCallback((resource: PermissionResource, action: PermissionAction): boolean => {
        if (!adminUser || !adminUser.isActive) return false;
        if (isSuperAdmin) return true;

        const permKey = `${resource}:${action}`;
        const perm = effectivePermissions.find(p => 
            p.permissionKey === permKey || 
            (p.resource === resource && p.action === action)
        );
        
        if (perm) {
            return perm.effect === 'ALLOW';
        }

        if (role?.permissions) {
            const rolePerm = role.permissions.find(p => p.resource === resource);
            if (rolePerm) {
                return rolePerm.actions.includes(action);
            }
        }

        return false;
    }, [adminUser, role, isSuperAdmin, effectivePermissions]);

    const canAccess = useCallback((resource: PermissionResource): boolean => {
        return hasPermission(resource, 'view');
    }, [hasPermission]);

    const refreshPermissions = useCallback(async () => {
        await loadPermissions(adminUser);
    }, [loadPermissions, adminUser]);

    const value: PermissionContextType = {
        adminUser,
        role,
        loading,
        effectivePermissions,
        hasPermission,
        canAccess,
        isSuperAdmin,
        refreshPermissions,
        setAdminUser
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};

export const useResourcePermission = (resource: PermissionResource) => {
    const { hasPermission, canAccess } = usePermission();
    
    return useMemo(() => ({
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
    }), [resource, hasPermission, canAccess]);
};

// Helper function (not exported to avoid Fast Refresh issues)
function hasPermissionCheck(
    adminUser: AdminUser | null,
    role: Role | null,
    resource: PermissionResource,
    action: PermissionAction
): boolean {
    if (!adminUser || !adminUser.isActive) return false;
    if (!role) return false;

    if (role.isSystem && (role.name === 'مشرف عام' || role.name === 'SUPER_ADMIN')) return true;

    const permission = role.permissions?.find(p => p.resource === resource);
    if (!permission) return false;

    return permission.actions?.includes(action) || false;
}

interface PermissionGateProps {
    resource: PermissionResource;
    action?: PermissionAction;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
    resource,
    action = 'view',
    children,
    fallback = null
}) => {
    const { hasPermission, loading } = usePermission();
    
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

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    resource,
    action = 'view',
    children,
    redirectTo = '/'
}) => {
    const { hasPermission, loading, adminUser } = usePermission();
    const [, setLocation] = useLocation();
    const [redirected, setRedirected] = useState(false);
    
    useEffect(() => {
        if (!loading && !adminUser && !redirected) {
            setRedirected(true);
            setLocation(redirectTo);
        }
        if (adminUser) {
            setRedirected(false);
        }
    }, [loading, adminUser, redirectTo, setLocation, redirected]);
    
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

export const useMenuVisibility = () => {
    const { canAccess, isSuperAdmin, loading } = usePermission();
    
    return useMemo(() => {
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
    }, [canAccess, isSuperAdmin, loading]);
};
