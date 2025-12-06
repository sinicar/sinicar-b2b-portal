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

export default router;
