import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MockApi } from './mockApi';
import { AdminUser, Role, PermissionResource, PermissionAction } from '../types';

interface PermissionContextType {
    adminUser: AdminUser | null;
    role: Role | null;
    loading: boolean;
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
    const [loading, setLoading] = useState(true);

    const setAdminUser = useCallback((user: AdminUser | null) => {
        setAdminUserState(user);
    }, []);

    const loadRole = useCallback(async (user: AdminUser | null) => {
        if (!user?.roleId) {
            setRole(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const roles = await MockApi.getRoles();
            const userRole = roles.find(r => r.id === user.roleId);
            setRole(userRole || null);
        } catch (e) {
            console.error('Failed to load role:', e);
            setRole(null);
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
        loadRole(adminUser);
    }, [adminUser, loadRole]);

    const isSuperAdmin = useMemo(() => {
        if (!role) return false;
        return role.isSystem && role.name === 'مشرف عام';
    }, [role]);

    const hasPermission = useCallback((resource: PermissionResource, action: PermissionAction): boolean => {
        if (!adminUser || !adminUser.isActive) return false;
        if (!role) return false;

        if (isSuperAdmin) return true;

        const permission = role.permissions.find(p => p.resource === resource);
        if (!permission) return false;

        return permission.actions.includes(action);
    }, [adminUser, role, isSuperAdmin]);

    const canAccess = useCallback((resource: PermissionResource): boolean => {
        return hasPermission(resource, 'view');
    }, [hasPermission]);

    const refreshPermissions = useCallback(async () => {
        setLoading(true);
        await loadRole();
    }, [loadRole]);

    const value: PermissionContextType = {
        adminUser,
        role,
        loading,
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

export function hasPermissionCheck(
    adminUser: AdminUser | null,
    role: Role | null,
    resource: PermissionResource,
    action: PermissionAction
): boolean {
    if (!adminUser || !adminUser.isActive) return false;
    if (!role) return false;

    if (role.isSystem && role.name === 'مشرف عام') return true;

    const permission = role.permissions.find(p => p.resource === resource);
    if (!permission) return false;

    return permission.actions.includes(action);
}
