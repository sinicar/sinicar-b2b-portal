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
export interface FeatureVisibility {
    featureCode: string;
    visibility: 'SHOW' | 'HIDE' | 'RESTRICTED';
    requiredProfilePercent?: number;
    allowed: boolean;
}
export interface UserPermissionSnapshot {
    userId: string;
    roles: string[];
    permissions: string[];
    features: Record<string, FeatureVisibility>;
}
export declare class PermissionService {
    getAllRoles(): Promise<Role[]>;
    getRoleById(id: string): Promise<Role | null>;
    getRoleByCode(code: string): Promise<Role | null>;
    createRole(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
        isSystem?: boolean;
    }): Promise<Role>;
    updateRole(id: string, data: Partial<{
        name: string;
        nameAr: string;
        nameEn: string;
        description: string;
        isActive: boolean;
    }>): Promise<Role>;
    getAllPermissions(): Promise<Permission[]>;
    getPermissionsByModule(module: string): Promise<Permission[]>;
    createPermission(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        module: string;
        description?: string;
    }): Promise<Permission>;
    getRolePermissions(roleId: string): Promise<RolePermission[]>;
    assignPermissionToRole(data: {
        roleId: string;
        permissionId: string;
        canCreate?: boolean;
        canRead?: boolean;
        canUpdate?: boolean;
        canDelete?: boolean;
    }): Promise<RolePermission>;
    removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;
    getUserRoles(userId: string): Promise<UserRoleAssignment[]>;
    assignRoleToUser(data: {
        userId: string;
        roleId: string;
        assignedBy?: string;
    }): Promise<UserRoleAssignment>;
    removeRoleFromUser(userId: string, roleId: string): Promise<void>;
    getUserPermissions(userId: string): Promise<UserPermissions>;
    hasPermission(userId: string, permissionCode: string, action?: 'create' | 'read' | 'update' | 'delete'): Promise<boolean>;
    getAllModules(): Promise<ModuleAccess[]>;
    updateModuleAccess(moduleKey: string, data: Partial<{
        isEnabled: boolean;
        requiredRole: string;
    }>): Promise<ModuleAccess>;
    canAccessModule(userId: string, moduleKey: string): Promise<boolean>;
    checkFeatureVisibility(userId: string, featureCode: string): Promise<FeatureVisibility>;
    getUserPermissionSnapshot(userId: string): Promise<UserPermissionSnapshot>;
    getPermissionGroups(): Promise<({
        _count: {
            users: number;
            roles: number;
        };
        permissions: ({
            permission: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                code: string;
                sortOrder: number;
                nameEn: string | null;
                nameAr: string | null;
                category: string;
                module: string;
            };
        } & {
            id: string;
            createdAt: Date;
            groupId: string;
            permissionId: string;
            effect: string;
        })[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystemDefault: boolean;
    })[]>;
    getAllPermissionGroups(): Promise<({
        _count: {
            users: number;
            roles: number;
        };
        permissions: ({
            permission: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                code: string;
                sortOrder: number;
                nameEn: string | null;
                nameAr: string | null;
                category: string;
                module: string;
            };
        } & {
            id: string;
            createdAt: Date;
            groupId: string;
            permissionId: string;
            effect: string;
        })[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystemDefault: boolean;
    })[]>;
    getPermissionGroupById(id: string): Promise<({
        permissions: ({
            permission: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                code: string;
                sortOrder: number;
                nameEn: string | null;
                nameAr: string | null;
                category: string;
                module: string;
            };
        } & {
            id: string;
            createdAt: Date;
            groupId: string;
            permissionId: string;
            effect: string;
        })[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystemDefault: boolean;
    }) | null>;
    getGroupPermissions(groupId: string): Promise<({
        permission: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            code: string;
            sortOrder: number;
            nameEn: string | null;
            nameAr: string | null;
            category: string;
            module: string;
        };
    } & {
        id: string;
        createdAt: Date;
        groupId: string;
        permissionId: string;
        effect: string;
    })[]>;
    assignPermissionsToGroup(groupId: string, permissionIds: string[]): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        permissionId: string;
        effect: string;
    }[]>;
    removePermissionFromGroup(groupId: string, permissionId: string): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        permissionId: string;
        effect: string;
    }>;
    createPermissionGroup(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
    }): Promise<PermissionGroup>;
    updatePermissionGroup(id: string, data: {
        name?: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
    }): Promise<PermissionGroup>;
    deletePermissionGroup(id: string): Promise<PermissionGroup>;
    assignGroupPermission(groupId: string, permissionId: string, effect?: string): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        permissionId: string;
        effect: string;
    }>;
    removeGroupPermission(groupId: string, permissionId: string): Promise<{
        id: string;
        createdAt: Date;
        groupId: string;
        permissionId: string;
        effect: string;
    }>;
    getUserPermissionOverrides(userId: string): Promise<({
        permission: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            code: string;
            sortOrder: number;
            nameEn: string | null;
            nameAr: string | null;
            category: string;
            module: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        reason: string | null;
        permissionId: string;
        effect: string;
        assignedBy: string | null;
    })[]>;
    setUserPermissionOverride(userId: string, permissionId: string, effect: string, reason?: string, assignedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        reason: string | null;
        permissionId: string;
        effect: string;
        assignedBy: string | null;
    }>;
    createUserPermissionOverride(data: {
        userId: string;
        permissionId: string;
        effect: string;
        reason?: string;
        assignedBy?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        reason: string | null;
        permissionId: string;
        effect: string;
        assignedBy: string | null;
    }>;
    updateUserPermissionOverride(id: string, data: {
        effect?: string;
        reason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        reason: string | null;
        permissionId: string;
        effect: string;
        assignedBy: string | null;
    }>;
    deleteUserPermissionOverride(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        reason: string | null;
        permissionId: string;
        effect: string;
        assignedBy: string | null;
    }>;
    removeUserPermissionOverride(userId: string, permissionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        reason: string | null;
        permissionId: string;
        effect: string;
        assignedBy: string | null;
    }>;
    getCustomerFeatureVisibility(customerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        visibility: string;
        customerId: string;
        assignedBy: string | null;
        featureCode: string;
        conditionProfilePercent: number | null;
    }[]>;
    getAllCustomerFeatureVisibility(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        visibility: string;
        customerId: string;
        assignedBy: string | null;
        featureCode: string;
        conditionProfilePercent: number | null;
    }[]>;
    setCustomerFeatureVisibility(data: {
        customerId: string;
        featureCode: string;
        visibility: string;
        conditionProfilePercent?: number;
        reason?: string;
        assignedBy?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        visibility: string;
        customerId: string;
        assignedBy: string | null;
        featureCode: string;
        conditionProfilePercent: number | null;
    }>;
    updateCustomerFeatureVisibility(id: string, data: {
        visibility?: string;
        conditionProfilePercent?: number;
        reason?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        visibility: string;
        customerId: string;
        assignedBy: string | null;
        featureCode: string;
        conditionProfilePercent: number | null;
    }>;
    deleteCustomerFeatureVisibility(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        visibility: string;
        customerId: string;
        assignedBy: string | null;
        featureCode: string;
        conditionProfilePercent: number | null;
    }>;
    removeCustomerFeatureVisibility(customerId: string, featureCode: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        visibility: string;
        customerId: string;
        assignedBy: string | null;
        featureCode: string;
        conditionProfilePercent: number | null;
    }>;
    getSupplierEmployees(supplierId: string): Promise<({
        permissions: ({
            permission: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                code: string;
                sortOrder: number;
                nameEn: string | null;
                nameAr: string | null;
                category: string;
                module: string;
            };
        } & {
            id: string;
            createdAt: Date;
            permissionId: string;
            effect: string;
            supplierEmployeeId: string;
        })[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobTitle: string | null;
        department: string | null;
        supplierId: string;
        roleWithinSupplier: string;
    })[]>;
    getSupplierEmployeeById(id: string): Promise<({
        permissions: ({
            permission: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                code: string;
                sortOrder: number;
                nameEn: string | null;
                nameAr: string | null;
                category: string;
                module: string;
            };
        } & {
            id: string;
            createdAt: Date;
            permissionId: string;
            effect: string;
            supplierEmployeeId: string;
        })[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobTitle: string | null;
        department: string | null;
        supplierId: string;
        roleWithinSupplier: string;
    }) | null>;
    createSupplierEmployee(data: {
        supplierId: string;
        userId: string;
        roleWithinSupplier?: string;
        jobTitle?: string;
        department?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobTitle: string | null;
        department: string | null;
        supplierId: string;
        roleWithinSupplier: string;
    }>;
    updateSupplierEmployee(id: string, data: {
        roleWithinSupplier?: string;
        jobTitle?: string;
        department?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobTitle: string | null;
        department: string | null;
        supplierId: string;
        roleWithinSupplier: string;
    }>;
    deleteSupplierEmployee(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        jobTitle: string | null;
        department: string | null;
        supplierId: string;
        roleWithinSupplier: string;
    }>;
    setSupplierEmployeePermission(supplierEmployeeId: string, permissionId: string, effect?: string): Promise<{
        id: string;
        createdAt: Date;
        permissionId: string;
        effect: string;
        supplierEmployeeId: string;
    }>;
    removeSupplierEmployeePermission(supplierEmployeeId: string, permissionId: string): Promise<{
        id: string;
        createdAt: Date;
        permissionId: string;
        effect: string;
        supplierEmployeeId: string;
    }>;
    getRolesWithUserCount(): Promise<({
        _count: {
            users: number;
        };
        permissions: ({
            permission: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                code: string;
                sortOrder: number;
                nameEn: string | null;
                nameAr: string | null;
                category: string;
                module: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
            effect: string;
            canCreate: boolean;
            canRead: boolean;
            canUpdate: boolean;
            canDelete: boolean;
        })[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystem: boolean;
    })[]>;
    getPermissionsByCategory(): Promise<Record<string, Permission[]>>;
    deleteRole(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystem: boolean;
    }>;
    updatePermission(id: string, data: {
        name?: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
        module?: string;
        category?: string;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        category: string;
        module: string;
    }>;
    deletePermission(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        category: string;
        module: string;
    }>;
    assignGroupToUser(userId: string, groupId: string): Promise<any>;
    removeGroupFromUser(userId: string, groupId: string): Promise<any>;
    getUserGroups(userId: string): Promise<any>;
    getEffectivePermissions(userId: string): Promise<{
        userId: string;
        roles: string[];
        groups: any;
        permissions: {
            code: string;
            module: string;
            allowed: boolean;
            source: string;
        }[];
    }>;
}
export declare const permissionService: PermissionService;
//# sourceMappingURL=permission.service.d.ts.map