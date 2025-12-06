import { Router, Request, Response } from 'express';
import { permissionService } from './permission.service';
import { successResponse, errorResponse } from '../../utils/response';

const router = Router();

router.get('/roles', async (req: Request, res: Response) => {
  try {
    const roles = await permissionService.getAllRoles();
    return successResponse(res, roles, 'Roles retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/roles/:id', async (req: Request, res: Response) => {
  try {
    const role = await permissionService.getRoleById(req.params.id);
    if (!role) {
      return errorResponse(res, 'Role not found', 404);
    }
    return successResponse(res, role, 'Role retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/roles', async (req: Request, res: Response) => {
  try {
    const role = await permissionService.createRole(req.body);
    return successResponse(res, role, 'Role created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/roles/:id', async (req: Request, res: Response) => {
  try {
    const role = await permissionService.updateRole(req.params.id, req.body);
    return successResponse(res, role, 'Role updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/permissions', async (req: Request, res: Response) => {
  try {
    const { module } = req.query;
    const permissions = module 
      ? await permissionService.getPermissionsByModule(module as string)
      : await permissionService.getAllPermissions();
    return successResponse(res, permissions, 'Permissions retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/permissions', async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.createPermission(req.body);
    return successResponse(res, permission, 'Permission created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/roles/:roleId/permissions', async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getRolePermissions(req.params.roleId);
    return successResponse(res, permissions, 'Role permissions retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/roles/:roleId/permissions', async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const rolePermission = await permissionService.assignPermissionToRole({
      roleId,
      ...req.body
    });
    return successResponse(res, rolePermission, 'Permission assigned to role', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/roles/:roleId/permissions/:permissionId', async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.params;
    await permissionService.removePermissionFromRole(roleId, permissionId);
    return successResponse(res, null, 'Permission removed from role');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/users/:userId/roles', async (req: Request, res: Response) => {
  try {
    const roles = await permissionService.getUserRoles(req.params.userId);
    return successResponse(res, roles, 'User roles retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/users/:userId/roles', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const assignment = await permissionService.assignRoleToUser({
      userId,
      ...req.body
    });
    return successResponse(res, assignment, 'Role assigned to user', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/users/:userId/roles/:roleId', async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.params;
    await permissionService.removeRoleFromUser(userId, roleId);
    return successResponse(res, null, 'Role removed from user');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/users/:userId/permissions', async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getUserPermissions(req.params.userId);
    return successResponse(res, permissions, 'User permissions retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/users/:userId/check', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { permission, action } = req.query;
    
    if (!permission) {
      return errorResponse(res, 'Permission code is required', 400);
    }

    const hasAccess = await permissionService.hasPermission(
      userId, 
      permission as string, 
      (action as 'create' | 'read' | 'update' | 'delete') || 'read'
    );
    
    return successResponse(res, { hasAccess }, 'Permission check completed');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/modules', async (req: Request, res: Response) => {
  try {
    const modules = await permissionService.getAllModules();
    return successResponse(res, modules, 'Modules retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/modules/:moduleKey', async (req: Request, res: Response) => {
  try {
    const module = await permissionService.updateModuleAccess(req.params.moduleKey, req.body);
    return successResponse(res, module, 'Module access updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/groups', async (req: Request, res: Response) => {
  try {
    const groups = await permissionService.getAllPermissionGroups();
    return successResponse(res, groups, 'Permission groups retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/groups/:id', async (req: Request, res: Response) => {
  try {
    const group = await permissionService.getPermissionGroupById(req.params.id);
    if (!group) {
      return errorResponse(res, 'Permission group not found', 404);
    }
    return successResponse(res, group, 'Permission group retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/groups', async (req: Request, res: Response) => {
  try {
    const group = await permissionService.createPermissionGroup(req.body);
    return successResponse(res, group, 'Permission group created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/groups/:id', async (req: Request, res: Response) => {
  try {
    const group = await permissionService.updatePermissionGroup(req.params.id, req.body);
    return successResponse(res, group, 'Permission group updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/groups/:id', async (req: Request, res: Response) => {
  try {
    await permissionService.deletePermissionGroup(req.params.id);
    return successResponse(res, null, 'Permission group deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/groups/:groupId/permissions', async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getGroupPermissions(req.params.groupId);
    return successResponse(res, permissions, 'Group permissions retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/groups/:groupId/permissions', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const result = await permissionService.assignPermissionsToGroup(groupId, req.body.permissionIds);
    return successResponse(res, result, 'Permissions assigned to group', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/groups/:groupId/permissions/:permissionId', async (req: Request, res: Response) => {
  try {
    const { groupId, permissionId } = req.params;
    await permissionService.removePermissionFromGroup(groupId, permissionId);
    return successResponse(res, null, 'Permission removed from group');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/users/:userId/overrides', async (req: Request, res: Response) => {
  try {
    const overrides = await permissionService.getUserPermissionOverrides(req.params.userId);
    return successResponse(res, overrides, 'User permission overrides retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/users/:userId/overrides', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const override = await permissionService.createUserPermissionOverride({
      userId,
      ...req.body
    });
    return successResponse(res, override, 'User permission override created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/users/:userId/overrides/:overrideId', async (req: Request, res: Response) => {
  try {
    const override = await permissionService.updateUserPermissionOverride(req.params.overrideId, req.body);
    return successResponse(res, override, 'User permission override updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/users/:userId/overrides/:overrideId', async (req: Request, res: Response) => {
  try {
    await permissionService.deleteUserPermissionOverride(req.params.overrideId);
    return successResponse(res, null, 'User permission override deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/customer-visibility', async (req: Request, res: Response) => {
  try {
    const visibility = await permissionService.getAllCustomerFeatureVisibility();
    return successResponse(res, visibility, 'Customer feature visibility retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/customer-visibility/:customerId', async (req: Request, res: Response) => {
  try {
    const visibility = await permissionService.getCustomerFeatureVisibility(req.params.customerId);
    return successResponse(res, visibility, 'Customer feature visibility retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/customer-visibility', async (req: Request, res: Response) => {
  try {
    const visibility = await permissionService.setCustomerFeatureVisibility(req.body);
    return successResponse(res, visibility, 'Customer feature visibility set', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/customer-visibility/:id', async (req: Request, res: Response) => {
  try {
    const visibility = await permissionService.updateCustomerFeatureVisibility(req.params.id, req.body);
    return successResponse(res, visibility, 'Customer feature visibility updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/customer-visibility/:id', async (req: Request, res: Response) => {
  try {
    await permissionService.deleteCustomerFeatureVisibility(req.params.id);
    return successResponse(res, null, 'Customer feature visibility deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/suppliers/:supplierId/employees', async (req: Request, res: Response) => {
  try {
    const employees = await permissionService.getSupplierEmployees(req.params.supplierId);
    return successResponse(res, employees, 'Supplier employees retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/suppliers/:supplierId/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const employee = await permissionService.getSupplierEmployeeById(req.params.employeeId);
    if (!employee) {
      return errorResponse(res, 'Supplier employee not found', 404);
    }
    return successResponse(res, employee, 'Supplier employee retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/suppliers/:supplierId/employees', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const employee = await permissionService.createSupplierEmployee({
      supplierId,
      ...req.body
    });
    return successResponse(res, employee, 'Supplier employee created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/suppliers/:supplierId/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    const employee = await permissionService.updateSupplierEmployee(req.params.employeeId, req.body);
    return successResponse(res, employee, 'Supplier employee updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/suppliers/:supplierId/employees/:employeeId', async (req: Request, res: Response) => {
  try {
    await permissionService.deleteSupplierEmployee(req.params.employeeId);
    return successResponse(res, null, 'Supplier employee deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/users/:userId/groups', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { groupId } = req.body;
    const result = await permissionService.assignGroupToUser(userId, groupId);
    return successResponse(res, result, 'Permission group assigned to user', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/users/:userId/groups/:groupId', async (req: Request, res: Response) => {
  try {
    const { userId, groupId } = req.params;
    await permissionService.removeGroupFromUser(userId, groupId);
    return successResponse(res, null, 'Permission group removed from user');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/users/:userId/groups', async (req: Request, res: Response) => {
  try {
    const groups = await permissionService.getUserGroups(req.params.userId);
    return successResponse(res, groups, 'User permission groups retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/users/:userId/effective-permissions', async (req: Request, res: Response) => {
  try {
    const effective = await permissionService.getEffectivePermissions(req.params.userId);
    return successResponse(res, effective, 'Effective permissions retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/roles/:id', async (req: Request, res: Response) => {
  try {
    await permissionService.deleteRole(req.params.id);
    return successResponse(res, null, 'Role deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/permissions/:id', async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.updatePermission(req.params.id, req.body);
    return successResponse(res, permission, 'Permission updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/permissions/:id', async (req: Request, res: Response) => {
  try {
    await permissionService.deletePermission(req.params.id);
    return successResponse(res, null, 'Permission deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

export default router;
