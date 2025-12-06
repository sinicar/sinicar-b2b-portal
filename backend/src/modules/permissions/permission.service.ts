import prisma from '../../lib/prisma';
import { Role, Permission, RolePermission, UserRoleAssignment, ModuleAccess } from '@prisma/client';

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
}

export const permissionService = new PermissionService();
