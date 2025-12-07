import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { permissionService } from '../modules/permissions/permission.service';

export function requirePermission(permissionCode: string, action: 'create' | 'read' | 'update' | 'delete' = 'read') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'لم يتم توفير رمز المصادقة',
      });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    try {
      const hasAccess = await permissionService.hasPermission(
        req.user.id,
        permissionCode,
        action
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'ليس لديك صلاحية لهذا الإجراء',
          permissionRequired: permissionCode,
        });
      }

      next();
    } catch (error: any) {
      console.error('[Permission Middleware] Error checking permission:', error);
      return res.status(500).json({
        success: false,
        error: 'خطأ في التحقق من الصلاحيات',
      });
    }
  };
}

export async function loadUserPermissions(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next();
  }

  try {
    const permissions = await permissionService.getUserPermissions(req.user.id);
    (req as any).permissions = permissions;
    next();
  } catch (error: any) {
    console.error('[Permission Middleware] Error loading permissions:', error);
    next();
  }
}
