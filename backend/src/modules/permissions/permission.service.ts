import prisma from '../../lib/prisma';

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

export class PermissionService {
  async getAllRoles(): Promise<Role[]> {
    return prisma.role.findMany({
      where: { isActive: true },
      orderBy: [{ isSystem: 'desc' }, { sortOrder: 'asc' }]
    });
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
    return prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [{ module: 'asc' }, { sortOrder: 'asc' }]
    });
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

  async hasPermission(userId: string, permissionCode: string, action: 'create' | 'read' | 'update' | 'delete' = 'read'): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
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

  async getPermissionGroups(): Promise<PermissionGroup[]> {
    return prisma.permissionGroup.findMany({
      where: { isActive: true },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { roles: true, users: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getPermissionGroupById(id: string) {
    return prisma.permissionGroup.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } }
      }
    });
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

  async removeUserPermissionOverride(userId: string, permissionId: string) {
    return prisma.userPermissionOverride.delete({
      where: { userId_permissionId: { userId, permissionId } }
    });
  }

  async getCustomerFeatureVisibility(customerId: string): Promise<CustomerFeatureVisibility[]> {
    return prisma.customerFeatureVisibility.findMany({ where: { customerId } });
  }

  async setCustomerFeatureVisibility(
    customerId: string,
    featureCode: string,
    visibility: string,
    conditionProfilePercent?: number,
    reason?: string,
    assignedBy?: string
  ): Promise<CustomerFeatureVisibility> {
    return prisma.customerFeatureVisibility.upsert({
      where: { customerId_featureCode: { customerId, featureCode } },
      create: { customerId, featureCode, visibility, conditionProfilePercent, reason, assignedBy },
      update: { visibility, conditionProfilePercent, reason, assignedBy }
    });
  }

  async removeCustomerFeatureVisibility(customerId: string, featureCode: string) {
    return prisma.customerFeatureVisibility.delete({
      where: { customerId_featureCode: { customerId, featureCode } }
    });
  }

  async getSupplierEmployees(supplierId: string): Promise<SupplierEmployee[]> {
    return prisma.supplierEmployee.findMany({
      where: { supplierId, isActive: true },
      include: { permissions: { include: { permission: true } } }
    });
  }

  async createSupplierEmployee(data: {
    supplierId: string;
    userId: string;
    roleWithinSupplier?: string;
    jobTitle?: string;
    department?: string;
  }): Promise<SupplierEmployee> {
    return prisma.supplierEmployee.create({ data });
  }

  async updateSupplierEmployee(id: string, data: { roleWithinSupplier?: string; jobTitle?: string; department?: string; isActive?: boolean }): Promise<SupplierEmployee> {
    return prisma.supplierEmployee.update({ where: { id }, data });
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

  async deleteRole(id: string): Promise<Role> {
    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.isSystem) {
      throw new Error('Cannot delete system roles');
    }
    return prisma.role.update({ where: { id }, data: { isActive: false } });
  }
}

export const permissionService = new PermissionService();
