import { Router } from 'express';
import { userService } from './user.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';

const router = Router();

// Get all users with pagination and filtering
router.get('/', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    search: req.query.search as string,
    role: req.query.role as string,
    status: req.query.status as string,
    isCustomer: req.query.isCustomer === 'true' ? true : req.query.isCustomer === 'false' ? false : undefined,
    isSupplier: req.query.isSupplier === 'true' ? true : req.query.isSupplier === 'false' ? false : undefined
  };
  const result = await userService.list(filters, pagination);
  paginatedResponse(res, result);
}));

// Get user stats
router.get('/stats', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const stats = await userService.getStats();
  successResponse(res, { stats });
}));

// Get available roles
router.get('/roles', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const roles = await userService.getRoles();
  successResponse(res, { roles });
}));

// Get available statuses
router.get('/statuses', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const statuses = await userService.getStatuses();
  successResponse(res, { statuses });
}));

// Get current user profile
router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await userService.getById(req.user!.id);
  successResponse(res, { user });
}));

// Get user by client ID
router.get('/client/:clientId', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await userService.getByClientId(req.params.clientId);
  successResponse(res, { user });
}));

// Get admin users list - MUST be before /:id route
router.get('/admin', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  // Return list of admin users
  const pagination = parsePaginationParams(req.query);
  const result = await userService.list({ role: 'ADMIN' }, pagination);
  successResponse(res, result, 'Admin users retrieved');
}));

// Get user by ID
router.get('/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await userService.getById(req.params.id);
  successResponse(res, { user });
}));

// Create user (Admin only)
router.post('/', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await userService.create(req.body);
  createdResponse(res, { user }, 'تم إنشاء المستخدم بنجاح');
}));

// Update user (Admin only)
router.put('/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await userService.update(req.params.id, req.body);
  successResponse(res, { user }, 'تم تحديث المستخدم بنجاح');
}));

// Update user status (Admin only)
router.patch('/:id/status', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await userService.updateStatus(req.params.id, req.body.status);
  successResponse(res, { user }, 'تم تحديث حالة المستخدم بنجاح');
}));

// Delete user (Admin only)
router.delete('/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  await userService.delete(req.params.id);
  successResponse(res, null, 'تم حذف المستخدم بنجاح');
}));

export default router;
