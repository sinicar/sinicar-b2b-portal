"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_service_1 = require("./permission.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
router.get('/roles', async (req, res) => {
    try {
        const roles = await permission_service_1.permissionService.getAllRoles();
        return (0, response_1.successResponse)(res, roles, 'Roles retrieved successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/roles/:id', async (req, res) => {
    try {
        const role = await permission_service_1.permissionService.getRoleById(req.params.id);
        if (!role) {
            return (0, response_1.errorResponse)(res, 'Role not found', 404);
        }
        return (0, response_1.successResponse)(res, role, 'Role retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/roles', async (req, res) => {
    try {
        const role = await permission_service_1.permissionService.createRole(req.body);
        return (0, response_1.successResponse)(res, role, 'Role created successfully', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/roles/:id', async (req, res) => {
    try {
        const role = await permission_service_1.permissionService.updateRole(req.params.id, req.body);
        return (0, response_1.successResponse)(res, role, 'Role updated successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/permissions', async (req, res) => {
    try {
        const { module } = req.query;
        const permissions = module
            ? await permission_service_1.permissionService.getPermissionsByModule(module)
            : await permission_service_1.permissionService.getAllPermissions();
        return (0, response_1.successResponse)(res, permissions, 'Permissions retrieved successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/permissions', async (req, res) => {
    try {
        const permission = await permission_service_1.permissionService.createPermission(req.body);
        return (0, response_1.successResponse)(res, permission, 'Permission created successfully', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/roles/:roleId/permissions', async (req, res) => {
    try {
        const permissions = await permission_service_1.permissionService.getRolePermissions(req.params.roleId);
        return (0, response_1.successResponse)(res, permissions, 'Role permissions retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/roles/:roleId/permissions', async (req, res) => {
    try {
        const { roleId } = req.params;
        const rolePermission = await permission_service_1.permissionService.assignPermissionToRole({
            roleId,
            ...req.body
        });
        return (0, response_1.successResponse)(res, rolePermission, 'Permission assigned to role', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/roles/:roleId/permissions/:permissionId', async (req, res) => {
    try {
        const { roleId, permissionId } = req.params;
        await permission_service_1.permissionService.removePermissionFromRole(roleId, permissionId);
        return (0, response_1.successResponse)(res, null, 'Permission removed from role');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/users/:userId/roles', async (req, res) => {
    try {
        const roles = await permission_service_1.permissionService.getUserRoles(req.params.userId);
        return (0, response_1.successResponse)(res, roles, 'User roles retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/users/:userId/roles', async (req, res) => {
    try {
        const { userId } = req.params;
        const assignment = await permission_service_1.permissionService.assignRoleToUser({
            userId,
            ...req.body
        });
        return (0, response_1.successResponse)(res, assignment, 'Role assigned to user', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/users/:userId/roles/:roleId', async (req, res) => {
    try {
        const { userId, roleId } = req.params;
        await permission_service_1.permissionService.removeRoleFromUser(userId, roleId);
        return (0, response_1.successResponse)(res, null, 'Role removed from user');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/users/:userId/permissions', async (req, res) => {
    try {
        const permissions = await permission_service_1.permissionService.getUserPermissions(req.params.userId);
        return (0, response_1.successResponse)(res, permissions, 'User permissions retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/users/:userId/check', async (req, res) => {
    try {
        const { userId } = req.params;
        const { permission, action } = req.query;
        if (!permission) {
            return (0, response_1.errorResponse)(res, 'Permission code is required', 400);
        }
        const hasAccess = await permission_service_1.permissionService.hasPermission(userId, permission, action || 'read');
        return (0, response_1.successResponse)(res, { hasAccess }, 'Permission check completed');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/modules', async (req, res) => {
    try {
        const modules = await permission_service_1.permissionService.getAllModules();
        return (0, response_1.successResponse)(res, modules, 'Modules retrieved successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/modules/:moduleKey', async (req, res) => {
    try {
        const module = await permission_service_1.permissionService.updateModuleAccess(req.params.moduleKey, req.body);
        return (0, response_1.successResponse)(res, module, 'Module access updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/groups', async (req, res) => {
    try {
        const groups = await permission_service_1.permissionService.getAllPermissionGroups();
        return (0, response_1.successResponse)(res, groups, 'Permission groups retrieved successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/groups/:id', async (req, res) => {
    try {
        const group = await permission_service_1.permissionService.getPermissionGroupById(req.params.id);
        if (!group) {
            return (0, response_1.errorResponse)(res, 'Permission group not found', 404);
        }
        return (0, response_1.successResponse)(res, group, 'Permission group retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/groups', async (req, res) => {
    try {
        const group = await permission_service_1.permissionService.createPermissionGroup(req.body);
        return (0, response_1.successResponse)(res, group, 'Permission group created successfully', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/groups/:id', async (req, res) => {
    try {
        const group = await permission_service_1.permissionService.updatePermissionGroup(req.params.id, req.body);
        return (0, response_1.successResponse)(res, group, 'Permission group updated successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/groups/:id', async (req, res) => {
    try {
        await permission_service_1.permissionService.deletePermissionGroup(req.params.id);
        return (0, response_1.successResponse)(res, null, 'Permission group deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/groups/:groupId/permissions', async (req, res) => {
    try {
        const permissions = await permission_service_1.permissionService.getGroupPermissions(req.params.groupId);
        return (0, response_1.successResponse)(res, permissions, 'Group permissions retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/groups/:groupId/permissions', async (req, res) => {
    try {
        const { groupId } = req.params;
        const result = await permission_service_1.permissionService.assignPermissionsToGroup(groupId, req.body.permissionIds);
        return (0, response_1.successResponse)(res, result, 'Permissions assigned to group', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/groups/:groupId/permissions/:permissionId', async (req, res) => {
    try {
        const { groupId, permissionId } = req.params;
        await permission_service_1.permissionService.removePermissionFromGroup(groupId, permissionId);
        return (0, response_1.successResponse)(res, null, 'Permission removed from group');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/users/:userId/overrides', async (req, res) => {
    try {
        const overrides = await permission_service_1.permissionService.getUserPermissionOverrides(req.params.userId);
        return (0, response_1.successResponse)(res, overrides, 'User permission overrides retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/users/:userId/overrides', async (req, res) => {
    try {
        const { userId } = req.params;
        const override = await permission_service_1.permissionService.createUserPermissionOverride({
            userId,
            ...req.body
        });
        return (0, response_1.successResponse)(res, override, 'User permission override created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/users/:userId/overrides/:overrideId', async (req, res) => {
    try {
        const override = await permission_service_1.permissionService.updateUserPermissionOverride(req.params.overrideId, req.body);
        return (0, response_1.successResponse)(res, override, 'User permission override updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/users/:userId/overrides/:overrideId', async (req, res) => {
    try {
        await permission_service_1.permissionService.deleteUserPermissionOverride(req.params.overrideId);
        return (0, response_1.successResponse)(res, null, 'User permission override deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/customer-visibility', async (req, res) => {
    try {
        const visibility = await permission_service_1.permissionService.getAllCustomerFeatureVisibility();
        return (0, response_1.successResponse)(res, visibility, 'Customer feature visibility retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/customer-visibility/:customerId', async (req, res) => {
    try {
        const visibility = await permission_service_1.permissionService.getCustomerFeatureVisibility(req.params.customerId);
        return (0, response_1.successResponse)(res, visibility, 'Customer feature visibility retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/customer-visibility', async (req, res) => {
    try {
        const visibility = await permission_service_1.permissionService.setCustomerFeatureVisibility(req.body);
        return (0, response_1.successResponse)(res, visibility, 'Customer feature visibility set', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/customer-visibility/:id', async (req, res) => {
    try {
        const visibility = await permission_service_1.permissionService.updateCustomerFeatureVisibility(req.params.id, req.body);
        return (0, response_1.successResponse)(res, visibility, 'Customer feature visibility updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/customer-visibility/:id', async (req, res) => {
    try {
        await permission_service_1.permissionService.deleteCustomerFeatureVisibility(req.params.id);
        return (0, response_1.successResponse)(res, null, 'Customer feature visibility deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/suppliers/:supplierId/employees', async (req, res) => {
    try {
        const employees = await permission_service_1.permissionService.getSupplierEmployees(req.params.supplierId);
        return (0, response_1.successResponse)(res, employees, 'Supplier employees retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/suppliers/:supplierId/employees/:employeeId', async (req, res) => {
    try {
        const employee = await permission_service_1.permissionService.getSupplierEmployeeById(req.params.employeeId);
        if (!employee) {
            return (0, response_1.errorResponse)(res, 'Supplier employee not found', 404);
        }
        return (0, response_1.successResponse)(res, employee, 'Supplier employee retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/suppliers/:supplierId/employees', async (req, res) => {
    try {
        const { supplierId } = req.params;
        const employee = await permission_service_1.permissionService.createSupplierEmployee({
            supplierId,
            ...req.body
        });
        return (0, response_1.successResponse)(res, employee, 'Supplier employee created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/suppliers/:supplierId/employees/:employeeId', async (req, res) => {
    try {
        const employee = await permission_service_1.permissionService.updateSupplierEmployee(req.params.employeeId, req.body);
        return (0, response_1.successResponse)(res, employee, 'Supplier employee updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/suppliers/:supplierId/employees/:employeeId', async (req, res) => {
    try {
        await permission_service_1.permissionService.deleteSupplierEmployee(req.params.employeeId);
        return (0, response_1.successResponse)(res, null, 'Supplier employee deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/users/:userId/groups', async (req, res) => {
    try {
        const { userId } = req.params;
        const { groupId } = req.body;
        const result = await permission_service_1.permissionService.assignGroupToUser(userId, groupId);
        return (0, response_1.successResponse)(res, result, 'Permission group assigned to user', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/users/:userId/groups/:groupId', async (req, res) => {
    try {
        const { userId, groupId } = req.params;
        await permission_service_1.permissionService.removeGroupFromUser(userId, groupId);
        return (0, response_1.successResponse)(res, null, 'Permission group removed from user');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/users/:userId/groups', async (req, res) => {
    try {
        const groups = await permission_service_1.permissionService.getUserGroups(req.params.userId);
        return (0, response_1.successResponse)(res, groups, 'User permission groups retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/users/:userId/effective-permissions', async (req, res) => {
    try {
        const effective = await permission_service_1.permissionService.getEffectivePermissions(req.params.userId);
        return (0, response_1.successResponse)(res, effective, 'Effective permissions retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/roles/:id', async (req, res) => {
    try {
        await permission_service_1.permissionService.deleteRole(req.params.id);
        return (0, response_1.successResponse)(res, null, 'Role deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/permissions/:id', async (req, res) => {
    try {
        const permission = await permission_service_1.permissionService.updatePermission(req.params.id, req.body);
        return (0, response_1.successResponse)(res, permission, 'Permission updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/permissions/:id', async (req, res) => {
    try {
        await permission_service_1.permissionService.deletePermission(req.params.id);
        return (0, response_1.successResponse)(res, null, 'Permission deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
exports.default = router;
//# sourceMappingURL=permission.routes.js.map