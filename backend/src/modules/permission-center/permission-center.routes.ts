import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { permissionService } from '../permissions/permission.service';
import { successResponse, errorResponse } from '../../utils/response';
import prisma from '../../lib/prisma';

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

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const roleFilter = req.query.role as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { clientId: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (roleFilter) {
      where.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          clientId: true,
          name: true,
          email: true,
          role: true,
          status: true,
          isActive: true,
          createdAt: true,
          roleAssignments: {
            where: { isActive: true },
            include: { role: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const formatted = users.map(u => ({
      id: u.id,
      clientId: u.clientId,
      name: u.name,
      email: u.email,
      primaryRole: u.role,
      roles: [u.role, ...u.roleAssignments.map(ra => ra.role.code)].filter((v, i, a) => a.indexOf(v) === i),
      status: u.status,
      isActive: u.isActive,
      createdAt: u.createdAt
    }));

    return successResponse(res, {
      users: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 'تم جلب المستخدمين بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error fetching users:', error);
    return errorResponse(res, error.message);
  }
});

router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        clientId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }

    const resolved = await permissionService.resolveUserPermissions(userId);
    const overrides = await permissionService.getUserOverrides(userId);

    return successResponse(res, {
      user: {
        id: user.id,
        clientId: user.clientId,
        name: user.name,
        email: user.email,
        primaryRole: user.role,
        status: user.status,
        isActive: user.isActive
      },
      roles: resolved.roles,
      rolePermissions: resolved.rolePermissions,
      overrides,
      effectivePermissions: resolved.effectivePermissions
    }, 'تم جلب تفاصيل المستخدم بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error fetching user details:', error);
    return errorResponse(res, error.message);
  }
});

const updateOverridesSchema = z.object({
  overrides: z.array(z.object({
    permissionCode: z.string(),
    effect: z.enum(['ALLOW', 'DENY'])
  }))
});

router.put('/users/:id/overrides', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'لا يمكن تعديل صلاحيات المدير العام'
      });
    }

    const parseResult = updateOverridesSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صالحة',
        details: parseResult.error.errors
      });
    }

    const { overrides } = parseResult.data;
    await permissionService.setUserOverrides(userId, overrides, req.user?.id);

    const resolved = await permissionService.resolveUserPermissions(userId);
    const updatedOverrides = await permissionService.getUserOverrides(userId);

    return successResponse(res, {
      overrides: updatedOverrides,
      effectivePermissions: resolved.effectivePermissions
    }, 'تم تحديث استثناءات الصلاحيات بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error updating user overrides:', error);
    return errorResponse(res, error.message);
  }
});

// ============ Feature Flags ============

router.get('/features', async (req: AuthRequest, res: Response) => {
  try {
    const features = await permissionService.getFeatures();
    return successResponse(res, features, 'تم جلب المميزات بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error fetching features:', error);
    return errorResponse(res, error.message);
  }
});

const featureAccessQuerySchema = z.object({
  ownerType: z.enum(['CUSTOMER', 'SUPPLIER']),
  ownerId: z.string().min(1)
});

router.get('/features/access', async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = featureAccessQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تحديد نوع المالك والمعرف',
        details: parseResult.error.errors
      });
    }

    const { ownerType, ownerId } = parseResult.data;
    const access = await permissionService.getFeatureAccess(ownerType, ownerId);
    
    return successResponse(res, {
      ownerType,
      ownerId,
      features: access
    }, 'تم جلب صلاحيات المميزات بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error fetching feature access:', error);
    return errorResponse(res, error.message);
  }
});

const updateFeatureAccessSchema = z.object({
  ownerType: z.enum(['CUSTOMER', 'SUPPLIER']),
  ownerId: z.string().min(1),
  features: z.array(z.object({
    featureCode: z.string(),
    isEnabled: z.boolean()
  }))
});

router.put('/features/access', async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = updateFeatureAccessSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صالحة',
        details: parseResult.error.errors
      });
    }

    const { ownerType, ownerId, features } = parseResult.data;
    const updated = await permissionService.updateFeatureAccess(ownerType, ownerId, features);

    return successResponse(res, {
      ownerType,
      ownerId,
      features: updated
    }, 'تم تحديث صلاحيات المميزات بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error updating feature access:', error);
    return errorResponse(res, error.message);
  }
});

router.get('/features/check', async (req: AuthRequest, res: Response) => {
  try {
    const ownerType = req.query.ownerType as 'CUSTOMER' | 'SUPPLIER';
    const ownerId = req.query.ownerId as string;
    const featureCode = req.query.featureCode as string;

    if (!ownerType || !ownerId || !featureCode) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تحديد جميع المعاملات'
      });
    }

    const isEnabled = await permissionService.isFeatureEnabled(ownerType, ownerId, featureCode);
    
    return successResponse(res, {
      ownerType,
      ownerId,
      featureCode,
      isEnabled
    }, 'تم التحقق من الميزة بنجاح');
  } catch (error: any) {
    console.error('[Permission Center] Error checking feature:', error);
    return errorResponse(res, error.message);
  }
});

export default router;
