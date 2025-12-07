import prisma from '../../lib/prisma';
import { Role, Permission, RolePermission, UserRoleAssignment } from '@prisma/client';

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

interface PermissionCache {
  roles: Role[] | null;
  rolesLastUpdated: number;
  permissions: Permission[] | null;
  permissionsLastUpdated: number;
  rolePermissions: Map<string, RolePermission[]>;
  rolePermissionsLastUpdated: Map<string, number>;
}

const CACHE_TTL_MS = 10 * 60 * 1000;

const cache: PermissionCache = {
  roles: null,
  rolesLastUpdated: 0,
  permissions: null,
  permissionsLastUpdated: 0,
  rolePermissions: new Map(),
  rolePermissionsLastUpdated: new Map(),
};

export function invalidatePermissionCache(type?: 'roles' | 'permissions' | 'rolePermissions' | 'all'): void {
  if (!type || type === 'all') {
    cache.roles = null;
    cache.rolesLastUpdated = 0;
    cache.permissions = null;
    cache.permissionsLastUpdated = 0;
    cache.rolePermissions.clear();
    cache.rolePermissionsLastUpdated.clear();
    return;
  }
  if (type === 'roles') {
    cache.roles = null;
    cache.rolesLastUpdated = 0;
  }
  if (type === 'permissions') {
    cache.permissions = null;
    cache.permissionsLastUpdated = 0;
  }
  if (type === 'rolePermissions') {
    cache.rolePermissions.clear();
    cache.rolePermissionsLastUpdated.clear();
  }
}

export class PermissionService {
  async getAllRoles(): Promise<Role[]> {
    const now = Date.now();
    if (cache.roles && now - cache.rolesLastUpdated < CACHE_TTL_MS) {
      return cache.roles;
    }

    const roles = await prisma.role.findMany({
      where: { isActive: true },
      orderBy: [{ isSystem: 'desc' }, { sortOrder: 'asc' }]
    });

    cache.roles = roles;
    cache.rolesLastUpdated = now;
    return roles;
  }

  async getRoleById(id: string): Promise<Role | null> {
    return prisma.role.findUnique({ where: { id } });
  }

  async getRoleByCode(code: string): Promise<Role | null> {
    return prisma.role.findUnique({ where: { code } });
  }

  async createRole(data: {
    code: string;
    name: string;
    nameAr?: string;
    nameEn?: string;
    description?: string;
    isSystem?: boolean;
  }): Promise<Role> {
    return prisma.role.create({ data });
  }

  async updateRole(id: string, data: Partial<{
    name: string;
    nameAr: string;
    nameEn: string;
    description: string;
    isActive: boolean;
  }>): Promise<Role> {
    return prisma.role.update({ where: { id }, data });
  }

  async getAllPermissions(): Promise<Permission[]> {
    const now = Date.now();
    if (cache.permissions && now - cache.permissionsLastUpdated < CACHE_TTL_MS) {
      return cache.permissions;
    }

    const permissions = await prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [{ module: 'asc' }, { sortOrder: 'asc' }]
    });

    cache.permissions = permissions;
    cache.permissionsLastUpdated = now;
    return permissions;
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return prisma.permission.findMany({
      where: { module, isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createPermission(data: {
    code: string;
    name: string;
    nameAr?: string;
    nameEn?: string;
    module: string;
    description?: string;
  }): Promise<Permission> {
    return prisma.permission.create({ data });
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });
  }

  async assignPermissionToRole(data: {
    roleId: string;
    permissionId: string;
    canCreate?: boolean;
    canRead?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  }): Promise<RolePermission> {
    return prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: data.roleId,
          permissionId: data.permissionId
        }
      },
      update: {
        canCreate: data.canCreate ?? false,
        canRead: data.canRead ?? true,
        canUpdate: data.canUpdate ?? false,
        canDelete: data.canDelete ?? false
      },
      create: {
        roleId: data.roleId,
        permissionId: data.permissionId,
        canCreate: data.canCreate ?? false,
        canRead: data.canRead ?? true,
        canUpdate: data.canUpdate ?? false,
        canDelete: data.canDelete ?? false
      }
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId }
      }
    });
    invalidatePermissionCache('rolePermissions');
  }

  async getRolesPermissionsMatrix(): Promise<{
    roles: Role[];
    permissions: Permission[];
    matrix: Record<string, string[]>;
  }> {
    const [roles, permissions] = await Promise.all([
      this.getAllRoles(),
      this.getAllPermissions(),
    ]);

    const allRolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roles.map(r => r.id) } },
      select: { roleId: true, permissionId: true },
    });

    const matrix: Record<string, string[]> = {};
    for (const role of roles) {
      matrix[role.id] = allRolePermissions
        .filter(rp => rp.roleId === role.id)
        .map(rp => rp.permissionId);
    }

    return { roles, permissions, matrix };
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
          })),
        });
      }
    });
    
    invalidatePermissionCache('rolePermissions');
  }

  async getUserRoles(userId: string): Promise<UserRoleAssignment[]> {
    return prisma.userRoleAssignment.findMany({
      where: { userId, isActive: true },
      include: { role: true }
    });
  }

  async assignRoleToUser(data: {
    userId: string;
    roleId: string;
    assignedBy?: string;
  }): Promise<UserRoleAssignment> {
    return prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: data.userId,
          roleId: data.roleId
        }
      },
      update: { isActive: true },
      create: {
        userId: data.userId,
        roleId: data.roleId,
        assignedBy: data.assignedBy
      }
    });
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await prisma.userRoleAssignment.update({
      where: {
        userId_roleId: { userId, roleId }
      },
      data: { isActive: false }
    });
  }

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const userRoles = await this.getUserRoles(userId);
    const roleIds = userRoles.map(ur => ur.roleId);

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true }
    });

    const permissionMap = new Map<string, {
      code: string;
      module: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>();

    for (const rp of rolePermissions) {
      const existing = permissionMap.get(rp.permission.code);
      if (existing) {
        existing.canCreate = existing.canCreate || rp.canCreate;
        existing.canRead = existing.canRead || rp.canRead;
        existing.canUpdate = existing.canUpdate || rp.canUpdate;
        existing.canDelete = existing.canDelete || rp.canDelete;
      } else {
        permissionMap.set(rp.permission.code, {
          code: rp.permission.code,
          module: rp.permission.module,
          canCreate: rp.canCreate,
          canRead: rp.canRead,
          canUpdate: rp.canUpdate,
          canDelete: rp.canDelete
        });
      }
    }

    const modules = [...new Set(Array.from(permissionMap.values()).map(p => p.module))];

    return {
      userId,
      roles: userRoles.map(ur => ur.role.code),
      permissions: Array.from(permissionMap.values()),
      modules
    };
  }

  async hasPermission(userIdOrClientId: string, permissionCode: string, action: 'create' | 'read' | 'update' | 'delete' = 'read'): Promise<boolean> {
    let user = await prisma.user.findUnique({
      where: { id: userIdOrClientId },
      select: { id: true, role: true }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { clientId: userIdOrClientId },
        select: { id: true, role: true }
      });
    }

    if (!user) return false;

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const role = user.role ? await prisma.role.findUnique({ where: { code: user.role } }) : null;
    if (role) {
      const rolePermission = await prisma.rolePermission.findFirst({
        where: { roleId: role.id, permission: { code: permissionCode } },
        include: { permission: true }
      });
      
      if (rolePermission) {
        switch (action) {
          case 'create': return rolePermission.canCreate;
          case 'read': return rolePermission.canRead;
          case 'update': return rolePermission.canUpdate;
          case 'delete': return rolePermission.canDelete;
        }
      }
    }

    const userPermissions = await this.getUserPermissionsById(user.id);
    const permission = userPermissions.permissions.find(p => p.code === permissionCode);
    
    if (!permission) return false;

    switch (action) {
      case 'create': return permission.canCreate;
      case 'read': return permission.canRead;
      case 'update': return permission.canUpdate;
      case 'delete': return permission.canDelete;
      default: return false;
    }
  }

  async getUserPermissionsById(userId: string): Promise<UserPermissions> {
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: { userId, isActive: true },
      include: { role: true }
    });
    const roleIds = userRoles.map(ur => ur.roleId);

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true }
    });

    const permissionMap = new Map<string, {
      code: string;
      module: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>();

    for (const rp of rolePermissions) {
      const existing = permissionMap.get(rp.permission.code);
      if (existing) {
        existing.canCreate = existing.canCreate || rp.canCreate;
        existing.canRead = existing.canRead || rp.canRead;
        existing.canUpdate = existing.canUpdate || rp.canUpdate;
        existing.canDelete = existing.canDelete || rp.canDelete;
      } else {
        permissionMap.set(rp.permission.code, {
          code: rp.permission.code,
          module: rp.permission.module,
          canCreate: rp.canCreate,
          canRead: rp.canRead,
          canUpdate: rp.canUpdate,
          canDelete: rp.canDelete
        });
      }
    }

    const modules = [...new Set(Array.from(permissionMap.values()).map(p => p.module))];

    return {
      userId,
      roles: userRoles.map(ur => ur.role.code),
      permissions: Array.from(permissionMap.values()),
      modules
    };
  }

  async resolveUserPermissions(userIdOrClientId: string): Promise<{
    userId: string;
    roles: string[];
    rolePermissions: {
      code: string;
      module: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }[];
    overrides: {
      permissionCode: string;
      effect: 'ALLOW' | 'DENY';
    }[];
    effectivePermissions: {
      code: string;
      module: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }[];
  }> {
    let user = await prisma.user.findUnique({
      where: { id: userIdOrClientId },
      select: { id: true, role: true }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { clientId: userIdOrClientId },
        select: { id: true, role: true }
      });
    }

    if (!user) {
      return { userId: userIdOrClientId, roles: [], rolePermissions: [], overrides: [], effectivePermissions: [] };
    }

    const userRoles = await prisma.userRoleAssignment.findMany({
      where: { userId: user.id, isActive: true },
      include: { role: true }
    });

    let roleIds = userRoles.map(ur => ur.roleId);

    if (user.role) {
      const primaryRole = await prisma.role.findUnique({ where: { code: user.role } });
      if (primaryRole && !roleIds.includes(primaryRole.id)) {
        roleIds.push(primaryRole.id);
      }
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true }
    });

    const rolePermissionMap = new Map<string, {
      code: string;
      module: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>();

    for (const rp of rolePermissions) {
      const existing = rolePermissionMap.get(rp.permission.code);
      if (existing) {
        existing.canCreate = existing.canCreate || rp.canCreate;
        existing.canRead = existing.canRead || rp.canRead;
        existing.canUpdate = existing.canUpdate || rp.canUpdate;
        existing.canDelete = existing.canDelete || rp.canDelete;
      } else {
        rolePermissionMap.set(rp.permission.code, {
          code: rp.permission.code,
          module: rp.permission.module,
          canCreate: rp.canCreate,
          canRead: rp.canRead,
          canUpdate: rp.canUpdate,
          canDelete: rp.canDelete
        });
      }
    }

    const userOverrides = await prisma.userPermissionOverride.findMany({
      where: { userId: user.id },
      include: { permission: true }
    });

    const overrides = userOverrides.map(o => ({
      permissionCode: o.permission.code,
      effect: o.effect as 'ALLOW' | 'DENY'
    }));

    const effectiveMap = new Map(rolePermissionMap);

    for (const override of userOverrides) {
      if (override.effect === 'DENY') {
        effectiveMap.delete(override.permission.code);
      } else if (override.effect === 'ALLOW') {
        if (!effectiveMap.has(override.permission.code)) {
          effectiveMap.set(override.permission.code, {
            code: override.permission.code,
            module: override.permission.module,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true
          });
        }
      }
    }

    const allRoles = [
      ...userRoles.map(ur => ur.role.code),
      ...(user.role ? [user.role] : [])
    ];

    return {
      userId: user.id,
      roles: [...new Set(allRoles)],
      rolePermissions: Array.from(rolePermissionMap.values()),
      overrides,
      effectivePermissions: Array.from(effectiveMap.values())
    };
  }

  async hasPermissionWithOverrides(userIdOrClientId: string, permissionCode: string, action: 'create' | 'read' | 'update' | 'delete' = 'read'): Promise<boolean> {
    let user = await prisma.user.findUnique({
      where: { id: userIdOrClientId },
      select: { id: true, role: true }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { clientId: userIdOrClientId },
        select: { id: true, role: true }
      });
    }

    if (!user) return false;

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const resolved = await this.resolveUserPermissions(user.id);
    const perm = resolved.effectivePermissions.find(p => p.code === permissionCode);

    if (!perm) return false;

    switch (action) {
      case 'create': return perm.canCreate;
      case 'read': return perm.canRead;
      case 'update': return perm.canUpdate;
      case 'delete': return perm.canDelete;
      default: return false;
    }
  }

  async getUserOverrides(userId: string): Promise<{
    id: string;
    permissionCode: string;
    permissionName: string;
    module: string;
    effect: string;
    reason?: string;
  }[]> {
    const overrides = await prisma.userPermissionOverride.findMany({
      where: { userId },
      include: { permission: true }
    });

    return overrides.map(o => ({
      id: o.id,
      permissionCode: o.permission.code,
      permissionName: o.permission.name,
      module: o.permission.module,
      effect: o.effect,
      reason: o.reason || undefined
    }));
  }

  async setUserOverrides(userId: string, overrides: { permissionCode: string; effect: 'ALLOW' | 'DENY' }[], assignedBy?: string): Promise<void> {
    await prisma.userPermissionOverride.deleteMany({ where: { userId } });

    for (const override of overrides) {
      const permission = await prisma.permission.findUnique({ where: { code: override.permissionCode } });
      if (permission) {
        await prisma.userPermissionOverride.create({
          data: {
            userId,
            permissionId: permission.id,
            effect: override.effect,
            assignedBy
          }
        });
      }
    }
  }

  async getAllModules(): Promise<ModuleAccess[]> {
    return prisma.moduleAccess.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async updateModuleAccess(moduleKey: string, data: Partial<{
    isEnabled: boolean;
    requiredRole: string;
  }>): Promise<ModuleAccess> {
    return prisma.moduleAccess.update({
      where: { moduleKey },
      data
    });
  }

  async canAccessModule(userId: string, moduleKey: string): Promise<boolean> {
    const module = await prisma.moduleAccess.findUnique({
      where: { moduleKey }
    });

    if (!module || !module.isEnabled) return false;
    if (!module.requiredRole) return true;

    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.roles.includes(module.requiredRole);
  }

  async checkFeatureVisibility(userId: string, featureCode: string): Promise<FeatureVisibility> {
    const visibility = await prisma.customerFeatureVisibility.findUnique({
      where: {
        customerId_featureCode: {
          customerId: userId,
          featureCode
        }
      }
    });

    if (!visibility) {
      return { featureCode, visibility: 'SHOW', allowed: true };
    }

    if (visibility.visibility === 'HIDE') {
      return { featureCode, visibility: 'HIDE', allowed: false };
    }

    if (visibility.visibility === 'RESTRICTED' && visibility.conditionProfilePercent) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { completionPercent: true }
      });
      const profilePercent = user?.completionPercent || 0;
      return {
        featureCode,
        visibility: 'RESTRICTED',
        requiredProfilePercent: visibility.conditionProfilePercent,
        allowed: profilePercent >= visibility.conditionProfilePercent
      };
    }

    return { featureCode, visibility: 'SHOW', allowed: true };
  }

  async getUserPermissionSnapshot(userId: string): Promise<UserPermissionSnapshot> {
    const userPermissions = await this.getUserPermissions(userId);
    const featureCodes = ['TRADER_TOOLS', 'INTERNATIONAL_PURCHASES', 'AI_TOOLS', 'CUSTOMER_SERVICES'];
    const features: Record<string, FeatureVisibility> = {};

    for (const featureCode of featureCodes) {
      features[featureCode] = await this.checkFeatureVisibility(userId, featureCode);
    }

    return {
      userId,
      roles: userPermissions.roles,
      permissions: userPermissions.permissions.map(p => p.code),
      features
    };
  }

  async getPermissionGroups() {
    return prisma.permissionGroup.findMany({
      where: { isActive: true },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { roles: true, users: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getAllPermissionGroups() {
    return this.getPermissionGroups();
  }

  async getPermissionGroupById(id: string) {
    return prisma.permissionGroup.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } }
      }
    });
  }

  async getGroupPermissions(groupId: string) {
    return prisma.permissionGroupPermission.findMany({
      where: { groupId },
      include: { permission: true }
    });
  }

  async assignPermissionsToGroup(groupId: string, permissionIds: string[]) {
    const results = [];
    for (const permissionId of permissionIds) {
      const result = await this.assignGroupPermission(groupId, permissionId);
      results.push(result);
    }
    return results;
  }

  async removePermissionFromGroup(groupId: string, permissionId: string) {
    return this.removeGroupPermission(groupId, permissionId);
  }

  async createPermissionGroup(data: { code: string; name: string; nameAr?: string; nameEn?: string; description?: string }): Promise<PermissionGroup> {
    return prisma.permissionGroup.create({ data });
  }

  async updatePermissionGroup(id: string, data: { name?: string; nameAr?: string; nameEn?: string; description?: string }): Promise<PermissionGroup> {
    return prisma.permissionGroup.update({ where: { id }, data });
  }

  async deletePermissionGroup(id: string): Promise<PermissionGroup> {
    const group = await prisma.permissionGroup.findUnique({ where: { id } });
    if (group?.isSystemDefault) {
      throw new Error('Cannot delete system default groups');
    }
    return prisma.permissionGroup.update({ where: { id }, data: { isActive: false } });
  }

  async assignGroupPermission(groupId: string, permissionId: string, effect: string = 'ALLOW') {
    return prisma.permissionGroupPermission.upsert({
      where: { groupId_permissionId: { groupId, permissionId } },
      create: { groupId, permissionId, effect },
      update: { effect }
    });
  }

  async removeGroupPermission(groupId: string, permissionId: string) {
    return prisma.permissionGroupPermission.delete({
      where: { groupId_permissionId: { groupId, permissionId } }
    });
  }

  async getUserPermissionOverrides(userId: string) {
    return prisma.userPermissionOverride.findMany({
      where: { userId },
      include: { permission: true }
    });
  }

  async setUserPermissionOverride(userId: string, permissionId: string, effect: string, reason?: string, assignedBy?: string) {
    return prisma.userPermissionOverride.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      create: { userId, permissionId, effect, reason, assignedBy },
      update: { effect, reason, assignedBy }
    });
  }

  async createUserPermissionOverride(data: { userId: string; permissionId: string; effect: string; reason?: string; assignedBy?: string }) {
    return this.setUserPermissionOverride(data.userId, data.permissionId, data.effect, data.reason, data.assignedBy);
  }

  async updateUserPermissionOverride(id: string, data: { effect?: string; reason?: string }) {
    return prisma.userPermissionOverride.update({ where: { id }, data });
  }

  async deleteUserPermissionOverride(id: string) {
    return prisma.userPermissionOverride.delete({ where: { id } });
  }

  async removeUserPermissionOverride(userId: string, permissionId: string) {
    return prisma.userPermissionOverride.delete({
      where: { userId_permissionId: { userId, permissionId } }
    });
  }

  async getCustomerFeatureVisibility(customerId: string) {
    return prisma.customerFeatureVisibility.findMany({ where: { customerId } });
  }

  async getAllCustomerFeatureVisibility() {
    return prisma.customerFeatureVisibility.findMany({
      orderBy: [{ customerId: 'asc' }, { featureCode: 'asc' }]
    });
  }

  async setCustomerFeatureVisibility(data: {
    customerId: string;
    featureCode: string;
    visibility: string;
    conditionProfilePercent?: number;
    reason?: string;
    assignedBy?: string;
  }) {
    return prisma.customerFeatureVisibility.upsert({
      where: { customerId_featureCode: { customerId: data.customerId, featureCode: data.featureCode } },
      create: data,
      update: { visibility: data.visibility, conditionProfilePercent: data.conditionProfilePercent, reason: data.reason, assignedBy: data.assignedBy }
    });
  }

  async updateCustomerFeatureVisibility(id: string, data: { visibility?: string; conditionProfilePercent?: number; reason?: string }) {
    return prisma.customerFeatureVisibility.update({ where: { id }, data });
  }

  async deleteCustomerFeatureVisibility(id: string) {
    return prisma.customerFeatureVisibility.delete({ where: { id } });
  }

  async removeCustomerFeatureVisibility(customerId: string, featureCode: string) {
    return prisma.customerFeatureVisibility.delete({
      where: { customerId_featureCode: { customerId, featureCode } }
    });
  }

  async getSupplierEmployees(supplierId: string) {
    return prisma.supplierEmployee.findMany({
      where: { supplierId, isActive: true },
      include: { permissions: { include: { permission: true } } }
    });
  }

  async getSupplierEmployeeById(id: string) {
    return prisma.supplierEmployee.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } }
    });
  }

  async createSupplierEmployee(data: {
    supplierId: string;
    userId: string;
    roleWithinSupplier?: string;
    jobTitle?: string;
    department?: string;
  }) {
    return prisma.supplierEmployee.create({ data });
  }

  async updateSupplierEmployee(id: string, data: { roleWithinSupplier?: string; jobTitle?: string; department?: string; isActive?: boolean }) {
    return prisma.supplierEmployee.update({ where: { id }, data });
  }

  async deleteSupplierEmployee(id: string) {
    return prisma.supplierEmployee.update({ where: { id }, data: { isActive: false } });
  }

  async setSupplierEmployeePermission(supplierEmployeeId: string, permissionId: string, effect: string = 'ALLOW') {
    return prisma.supplierEmployeePermission.upsert({
      where: { supplierEmployeeId_permissionId: { supplierEmployeeId, permissionId } },
      create: { supplierEmployeeId, permissionId, effect },
      update: { effect }
    });
  }

  async removeSupplierEmployeePermission(supplierEmployeeId: string, permissionId: string) {
    return prisma.supplierEmployeePermission.delete({
      where: { supplierEmployeeId_permissionId: { supplierEmployeeId, permissionId } }
    });
  }

  async getRolesWithUserCount() {
    return prisma.role.findMany({
      where: { isActive: true },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } }
      },
      orderBy: [{ isSystem: 'desc' }, { sortOrder: 'asc' }]
    });
  }

  async getPermissionsByCategory() {
    const permissions = await this.getAllPermissions();
    const grouped: Record<string, Permission[]> = {};
    for (const permission of permissions) {
      const category = permission.category || 'GENERAL';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(permission);
    }
    return grouped;
  }

  async deleteRole(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.isSystem) {
      throw new Error('Cannot delete system roles');
    }
    return prisma.role.update({ where: { id }, data: { isActive: false } });
  }

  async updatePermission(id: string, data: { name?: string; nameAr?: string; nameEn?: string; description?: string; module?: string; category?: string }) {
    return prisma.permission.update({ where: { id }, data });
  }

  async deletePermission(id: string) {
    return prisma.permission.update({ where: { id }, data: { isActive: false } });
  }

  async assignGroupToUser(userId: string, groupId: string) {
    return prisma.userPermissionGroupAssignment.upsert({
      where: { userId_groupId: { userId, groupId } },
      create: { userId, groupId },
      update: {}
    });
  }

  async removeGroupFromUser(userId: string, groupId: string) {
    return prisma.userPermissionGroupAssignment.delete({
      where: { userId_groupId: { userId, groupId } }
    });
  }

  async getUserGroups(userId: string) {
    return prisma.userPermissionGroupAssignment.findMany({
      where: { userId },
      include: { group: true }
    });
  }

  async getEffectivePermissions(userId: string) {
    const userPermissions = await this.getUserPermissions(userId);
    const userOverrides = await this.getUserPermissionOverrides(userId);
    const userGroups = await this.getUserGroups(userId);
    
    const effectivePermissions: Record<string, { code: string; module: string; allowed: boolean; source: string }> = {};
    
    for (const perm of userPermissions.permissions) {
      effectivePermissions[perm.code] = {
        code: perm.code,
        module: perm.module,
        allowed: perm.canRead || perm.canCreate || perm.canUpdate || perm.canDelete,
        source: 'role'
      };
    }
    
    for (const group of userGroups) {
      const groupPerms = await this.getGroupPermissions(group.groupId);
      for (const gp of groupPerms) {
        const code = gp.permission?.code;
        if (code) {
          effectivePermissions[code] = {
            code,
            module: gp.permission?.module || '',
            allowed: gp.effect === 'ALLOW',
            source: 'group'
          };
        }
      }
    }
    
    for (const override of userOverrides) {
      const code = override.permission?.code;
      if (code) {
        effectivePermissions[code] = {
          code,
          module: override.permission?.module || '',
          allowed: override.effect === 'ALLOW',
          source: 'override'
        };
      }
    }
    
    return {
      userId,
      roles: userPermissions.roles,
      groups: userGroups.map(ug => ug.group?.code).filter(Boolean),
      permissions: Object.values(effectivePermissions)
    };
  }

  // ============ Feature Flags ============

  private featureCache = new Map<string, { data: any; timestamp: number }>();
  private FEATURE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  async getFeatures() {
    const cacheKey = 'all_features';
    const cached = this.featureCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.FEATURE_CACHE_TTL) {
      return cached.data;
    }

    const features = await prisma.featureFlag.findMany({
      orderBy: { name: 'asc' }
    });
    
    this.featureCache.set(cacheKey, { data: features, timestamp: Date.now() });
    return features;
  }

  async getFeatureAccess(ownerType: 'CUSTOMER' | 'SUPPLIER', ownerId: string) {
    const cacheKey = `access_${ownerType}_${ownerId}`;
    const cached = this.featureCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.FEATURE_CACHE_TTL) {
      return cached.data;
    }

    const features = await this.getFeatures();
    const access = await prisma.featureAccess.findMany({
      where: { ownerType, ownerId }
    });

    const accessMap = new Map(access.map(a => [a.featureCode, a.isEnabled]));
    
    const result = features.map((f: any) => ({
      featureCode: f.key,
      featureName: f.name,
      featureNameAr: f.nameAr,
      description: f.description,
      globalEnabled: f.isEnabled,
      isEnabled: accessMap.has(f.key) ? accessMap.get(f.key) : f.isEnabled
    }));

    this.featureCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  async updateFeatureAccess(ownerType: 'CUSTOMER' | 'SUPPLIER', ownerId: string, features: { featureCode: string; isEnabled: boolean }[]) {
    const cacheKey = `access_${ownerType}_${ownerId}`;
    this.featureCache.delete(cacheKey);

    await prisma.$transaction(async (tx) => {
      await tx.featureAccess.deleteMany({
        where: { ownerType, ownerId }
      });

      if (features.length > 0) {
        await tx.featureAccess.createMany({
          data: features.map(f => ({
            ownerType,
            ownerId,
            featureCode: f.featureCode,
            isEnabled: f.isEnabled
          }))
        });
      }
    });

    return this.getFeatureAccess(ownerType, ownerId);
  }

  async isFeatureEnabled(ownerType: 'CUSTOMER' | 'SUPPLIER', ownerId: string, featureCode: string): Promise<boolean> {
    const access = await this.getFeatureAccess(ownerType, ownerId);
    const feature = access.find((f: any) => f.featureCode === featureCode);
    return feature ? feature.isEnabled : false;
  }

  invalidateFeatureCache(ownerType?: string, ownerId?: string) {
    if (ownerType && ownerId) {
      this.featureCache.delete(`access_${ownerType}_${ownerId}`);
    } else {
      this.featureCache.clear();
    }
  }
}

export const permissionService = new PermissionService();
