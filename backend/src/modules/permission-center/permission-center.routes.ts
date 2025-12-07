import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { permissionService } from '../permissions/permission.service';
import { successResponse, errorResponse } from '../../utils/response';

const router = Router();

async function requireManagePermissions(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const hasAccess = await permissionService.hasPermission(
    req.user.id,
    'MANAGE_PERMISSIONS',
    'update'
  );

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: 'ليس لديك صلاحية إدارة الأذونات',
    });
  }

  next();
}

router.use(authMiddleware);
router.use(requireManagePermissions);

router.get('/roles', async (req: AuthRequest, res: Response) => {
  try {
    const roles = await permissionService.getAllRoles();
    return successResponse(res, roles, 'تم جلب الأدوار بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error fetching roles:', error);
    return errorResponse(res, error.message);
  }
});

router.get('/permissions', async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    return successResponse(res, permissions, 'تم جلب الصلاحيات بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error fetching permissions:', error);
    return errorResponse(res, error.message);
  }
});

router.get('/roles-permissions', async (req: AuthRequest, res: Response) => {
  try {
    const matrix = await permissionService.getRolesPermissionsMatrix();
    return successResponse(res, matrix, 'تم جلب مصفوفة الصلاحيات بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error fetching matrix:', error);
    return errorResponse(res, error.message);
  }
});

const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string()),
});

router.put('/roles/:id/permissions', async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = updateRolePermissionsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صالحة',
        details: parseResult.error.errors,
      });
    }

    const { permissionIds } = parseResult.data;
    const roleId = req.params.id;

    const role = await permissionService.getRoleById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'الدور غير موجود',
      });
    }

    if (role.isSystem && role.code === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'لا يمكن تعديل صلاحيات المدير العام',
      });
    }

    await permissionService.updateRolePermissions(roleId, permissionIds);

    return successResponse(res, { roleId, permissionIds }, 'تم تحديث صلاحيات الدور بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error updating role permissions:', error);
    return errorResponse(res, error.message);
  }
});

export default router;
