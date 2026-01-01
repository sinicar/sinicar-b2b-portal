import { Router } from 'express';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, errorResponse } from '../../utils/response';
import prisma from '../../lib/prisma';

const router = Router();

// =====================================================
// STUB ENDPOINTS - لمنع أخطاء 404
// =====================================================

// GET /admin/counts - إحصائيات لوحة التحكم
router.get('/counts', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    const [
      pendingOrders,
      pendingAccountRequests,
      newMessages,
      pendingQuotes
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.notification.count({ where: { isRead: false } }).catch(() => 0),
      prisma.quoteRequest.count({ where: { status: 'PENDING' } }).catch(() => 0)
    ]);

    successResponse(res, {
      pendingOrders,
      pendingAccountRequests,
      newMessages,
      pendingQuotes,
      newUsers: 0,
      newOrders: pendingOrders,
      lowStockProducts: 0,
      pendingImportRequests: 0
    });
  } catch (error) {
    successResponse(res, {
      pendingOrders: 0,
      pendingAccountRequests: 0,
      newMessages: 0,
      pendingQuotes: 0,
      newUsers: 0,
      newOrders: 0,
      lowStockProducts: 0,
      pendingImportRequests: 0
    });
  }
}));

// =====================================================
// USER MANAGEMENT ENDPOINTS
// =====================================================

router.put('/users/:id/approve', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return errorResponse(res, 'المستخدم غير موجود', 404);
  }

  await prisma.user.update({
    where: { id },
    data: { status: 'APPROVED' }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      userName: req.user!.clientId,
      role: req.user!.role,
      eventType: 'USER_APPROVED',
      description: `تمت الموافقة على المستخدم: ${user.name}`,
      metadata: JSON.stringify({ targetUserId: id, targetUserName: user.name })
    }
  });

  successResponse(res, { success: true, status: 'APPROVED' }, 'تمت الموافقة على الحساب بنجاح');
}));

router.put('/users/:id/reject', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return errorResponse(res, 'المستخدم غير موجود', 404);
  }

  await prisma.user.update({
    where: { id },
    data: { status: 'REJECTED' }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      userName: req.user!.clientId,
      role: req.user!.role,
      eventType: 'USER_REJECTED',
      description: `تم رفض المستخدم: ${user.name}`,
      metadata: JSON.stringify({ targetUserId: id, targetUserName: user.name })
    }
  });

  successResponse(res, { success: true, status: 'REJECTED' }, 'تم رفض الحساب');
}));

router.put('/users/:id/block', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return errorResponse(res, 'المستخدم غير موجود', 404);
  }

  await prisma.user.update({
    where: { id },
    data: { status: 'BLOCKED' }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      userName: req.user!.clientId,
      role: req.user!.role,
      eventType: 'USER_BLOCKED',
      description: `تم حظر المستخدم: ${user.name}`,
      metadata: JSON.stringify({ targetUserId: id, targetUserName: user.name })
    }
  });

  successResponse(res, { success: true, status: 'BLOCKED' }, 'تم حظر الحساب');
}));

router.get('/users/pending', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pendingUsers = await prisma.user.findMany({
    where: { status: 'PENDING' },
    select: {
      id: true,
      clientId: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      role: true,
      isCustomer: true,
      isSupplier: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  successResponse(res, pendingUsers, 'قائمة الحسابات المعلقة');
}));

// GET /admin/activity-logs
router.get('/activity-logs', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.activityLog.count()
  ]);

  successResponse(res, {
    items: logs,
    total,
    page,
    pageSize
  }, 'سجل النشاطات');
}));

export default router;
