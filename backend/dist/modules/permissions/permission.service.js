"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionService = exports.PermissionService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class PermissionService {
    async getAllRoles() {
        return prisma_1.default.role.findMany({
            where: { isActive: true },
            orderBy: [{ isSystem: 'desc' }, { sortOrder: 'asc' }]
        });
    }
    async getRoleById(id) {
        return prisma_1.default.role.findUnique({ where: { id } });
    }
    async getRoleByCode(code) {
        return prisma_1.default.role.findUnique({ where: { code } });
    }
    async createRole(data) {
        return prisma_1.default.role.create({ data });
    }
    async updateRole(id, data) {
        return prisma_1.default.role.update({ where: { id }, data });
    }
    async getAllPermissions() {
        return prisma_1.default.permission.findMany({
            where: { isActive: true },
            orderBy: [{ module: 'asc' }, { sortOrder: 'asc' }]
        });
    }
    async getPermissionsByModule(module) {
        return prisma_1.default.permission.findMany({
            where: { module, isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async createPermission(data) {
        return prisma_1.default.permission.create({ data });
    }
    async getRolePermissions(roleId) {
        return prisma_1.default.rolePermission.findMany({
            where: { roleId },
            include: { permission: true }
        });
    }
    async assignPermissionToRole(data) {
        return prisma_1.default.rolePermission.upsert({
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
    async removePermissionFromRole(roleId, permissionId) {
        await prisma_1.default.rolePermission.delete({
            where: {
                roleId_permissionId: { roleId, permissionId }
            }
        });
    }
    async getUserRoles(userId) {
        return prisma_1.default.userRoleAssignment.findMany({
            where: { userId, isActive: true },
            include: { role: true }
        });
    }
    async assignRoleToUser(data) {
        return prisma_1.default.userRoleAssignment.upsert({
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
    async removeRoleFromUser(userId, roleId) {
        await prisma_1.default.userRoleAssignment.update({
            where: {
                userId_roleId: { userId, roleId }
            },
            data: { isActive: false }
        });
    }
    async getUserPermissions(userId) {
        const userRoles = await this.getUserRoles(userId);
        const roleIds = userRoles.map(ur => ur.roleId);
        const rolePermissions = await prisma_1.default.rolePermission.findMany({
            where: { roleId: { in: roleIds } },
            include: { permission: true }
        });
        const permissionMap = new Map();
        for (const rp of rolePermissions) {
            const existing = permissionMap.get(rp.permission.code);
            if (existing) {
                existing.canCreate = existing.canCreate || rp.canCreate;
                existing.canRead = existing.canRead || rp.canRead;
                existing.canUpdate = existing.canUpdate || rp.canUpdate;
                existing.canDelete = existing.canDelete || rp.canDelete;
            }
            else {
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
    async hasPermission(userId, permissionCode, action = 'read') {
        const userPermissions = await this.getUserPermissions(userId);
        const permission = userPermissions.permissions.find(p => p.code === permissionCode);
        if (!permission)
            return false;
        switch (action) {
            case 'create': return permission.canCreate;
            case 'read': return permission.canRead;
            case 'update': return permission.canUpdate;
            case 'delete': return permission.canDelete;
            default: return false;
        }
    }
    async getAllModules() {
        return prisma_1.default.moduleAccess.findMany({
            where: { isEnabled: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async updateModuleAccess(moduleKey, data) {
        return prisma_1.default.moduleAccess.update({
            where: { moduleKey },
            data
        });
    }
    async canAccessModule(userId, moduleKey) {
        const module = await prisma_1.default.moduleAccess.findUnique({
            where: { moduleKey }
        });
        if (!module || !module.isEnabled)
            return false;
        if (!module.requiredRole)
            return true;
        const userPermissions = await this.getUserPermissions(userId);
        return userPermissions.roles.includes(module.requiredRole);
    }
    async checkFeatureVisibility(userId, featureCode) {
        const visibility = await prisma_1.default.customerFeatureVisibility.findUnique({
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
            const user = await prisma_1.default.user.findUnique({
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
    async getUserPermissionSnapshot(userId) {
        const userPermissions = await this.getUserPermissions(userId);
        const featureCodes = ['TRADER_TOOLS', 'INTERNATIONAL_PURCHASES', 'AI_TOOLS', 'CUSTOMER_SERVICES'];
        const features = {};
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
        return prisma_1.default.permissionGroup.findMany({
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
    async getPermissionGroupById(id) {
        return prisma_1.default.permissionGroup.findUnique({
            where: { id },
            include: {
                permissions: { include: { permission: true } }
            }
        });
    }
    async getGroupPermissions(groupId) {
        return prisma_1.default.permissionGroupPermission.findMany({
            where: { groupId },
            include: { permission: true }
        });
    }
    async assignPermissionsToGroup(groupId, permissionIds) {
        const results = [];
        for (const permissionId of permissionIds) {
            const result = await this.assignGroupPermission(groupId, permissionId);
            results.push(result);
        }
        return results;
    }
    async removePermissionFromGroup(groupId, permissionId) {
        return this.removeGroupPermission(groupId, permissionId);
    }
    async createPermissionGroup(data) {
        return prisma_1.default.permissionGroup.create({ data });
    }
    async updatePermissionGroup(id, data) {
        return prisma_1.default.permissionGroup.update({ where: { id }, data });
    }
    async deletePermissionGroup(id) {
        const group = await prisma_1.default.permissionGroup.findUnique({ where: { id } });
        if (group?.isSystemDefault) {
            throw new Error('Cannot delete system default groups');
        }
        return prisma_1.default.permissionGroup.update({ where: { id }, data: { isActive: false } });
    }
    async assignGroupPermission(groupId, permissionId, effect = 'ALLOW') {
        return prisma_1.default.permissionGroupPermission.upsert({
            where: { groupId_permissionId: { groupId, permissionId } },
            create: { groupId, permissionId, effect },
            update: { effect }
        });
    }
    async removeGroupPermission(groupId, permissionId) {
        return prisma_1.default.permissionGroupPermission.delete({
            where: { groupId_permissionId: { groupId, permissionId } }
        });
    }
    async getUserPermissionOverrides(userId) {
        return prisma_1.default.userPermissionOverride.findMany({
            where: { userId },
            include: { permission: true }
        });
    }
    async setUserPermissionOverride(userId, permissionId, effect, reason, assignedBy) {
        return prisma_1.default.userPermissionOverride.upsert({
            where: { userId_permissionId: { userId, permissionId } },
            create: { userId, permissionId, effect, reason, assignedBy },
            update: { effect, reason, assignedBy }
        });
    }
    async createUserPermissionOverride(data) {
        return this.setUserPermissionOverride(data.userId, data.permissionId, data.effect, data.reason, data.assignedBy);
    }
    async updateUserPermissionOverride(id, data) {
        return prisma_1.default.userPermissionOverride.update({ where: { id }, data });
    }
    async deleteUserPermissionOverride(id) {
        return prisma_1.default.userPermissionOverride.delete({ where: { id } });
    }
    async removeUserPermissionOverride(userId, permissionId) {
        return prisma_1.default.userPermissionOverride.delete({
            where: { userId_permissionId: { userId, permissionId } }
        });
    }
    async getCustomerFeatureVisibility(customerId) {
        return prisma_1.default.customerFeatureVisibility.findMany({ where: { customerId } });
    }
    async getAllCustomerFeatureVisibility() {
        return prisma_1.default.customerFeatureVisibility.findMany({
            orderBy: [{ customerId: 'asc' }, { featureCode: 'asc' }]
        });
    }
    async setCustomerFeatureVisibility(data) {
        return prisma_1.default.customerFeatureVisibility.upsert({
            where: { customerId_featureCode: { customerId: data.customerId, featureCode: data.featureCode } },
            create: data,
            update: { visibility: data.visibility, conditionProfilePercent: data.conditionProfilePercent, reason: data.reason, assignedBy: data.assignedBy }
        });
    }
    async updateCustomerFeatureVisibility(id, data) {
        return prisma_1.default.customerFeatureVisibility.update({ where: { id }, data });
    }
    async deleteCustomerFeatureVisibility(id) {
        return prisma_1.default.customerFeatureVisibility.delete({ where: { id } });
    }
    async removeCustomerFeatureVisibility(customerId, featureCode) {
        return prisma_1.default.customerFeatureVisibility.delete({
            where: { customerId_featureCode: { customerId, featureCode } }
        });
    }
    async getSupplierEmployees(supplierId) {
        return prisma_1.default.supplierEmployee.findMany({
            where: { supplierId, isActive: true },
            include: { permissions: { include: { permission: true } } }
        });
    }
    async getSupplierEmployeeById(id) {
        return prisma_1.default.supplierEmployee.findUnique({
            where: { id },
            include: { permissions: { include: { permission: true } } }
        });
    }
    async createSupplierEmployee(data) {
        return prisma_1.default.supplierEmployee.create({ data });
    }
    async updateSupplierEmployee(id, data) {
        return prisma_1.default.supplierEmployee.update({ where: { id }, data });
    }
    async deleteSupplierEmployee(id) {
        return prisma_1.default.supplierEmployee.update({ where: { id }, data: { isActive: false } });
    }
    async setSupplierEmployeePermission(supplierEmployeeId, permissionId, effect = 'ALLOW') {
        return prisma_1.default.supplierEmployeePermission.upsert({
            where: { supplierEmployeeId_permissionId: { supplierEmployeeId, permissionId } },
            create: { supplierEmployeeId, permissionId, effect },
            update: { effect }
        });
    }
    async removeSupplierEmployeePermission(supplierEmployeeId, permissionId) {
        return prisma_1.default.supplierEmployeePermission.delete({
            where: { supplierEmployeeId_permissionId: { supplierEmployeeId, permissionId } }
        });
    }
    async getRolesWithUserCount() {
        return prisma_1.default.role.findMany({
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
        const grouped = {};
        for (const permission of permissions) {
            const category = permission.category || 'GENERAL';
            if (!grouped[category])
                grouped[category] = [];
            grouped[category].push(permission);
        }
        return grouped;
    }
    async deleteRole(id) {
        const role = await prisma_1.default.role.findUnique({ where: { id } });
        if (role?.isSystem) {
            throw new Error('Cannot delete system roles');
        }
        return prisma_1.default.role.update({ where: { id }, data: { isActive: false } });
    }
    async updatePermission(id, data) {
        return prisma_1.default.permission.update({ where: { id }, data });
    }
    async deletePermission(id) {
        return prisma_1.default.permission.update({ where: { id }, data: { isActive: false } });
    }
    async assignGroupToUser(userId, groupId) {
        return prisma_1.default.userPermissionGroupAssignment.upsert({
            where: { userId_groupId: { userId, groupId } },
            create: { userId, groupId },
            update: {}
        });
    }
    async removeGroupFromUser(userId, groupId) {
        return prisma_1.default.userPermissionGroupAssignment.delete({
            where: { userId_groupId: { userId, groupId } }
        });
    }
    async getUserGroups(userId) {
        return prisma_1.default.userPermissionGroupAssignment.findMany({
            where: { userId },
            include: { group: true }
        });
    }
    async getEffectivePermissions(userId) {
        const userPermissions = await this.getUserPermissions(userId);
        const userOverrides = await this.getUserPermissionOverrides(userId);
        const userGroups = await this.getUserGroups(userId);
        const effectivePermissions = {};
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
}
exports.PermissionService = PermissionService;
exports.permissionService = new PermissionService();
//# sourceMappingURL=permission.service.js.map