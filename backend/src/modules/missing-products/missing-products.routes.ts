import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse } from '../../utils/response';

const router = Router();

// GET /missing-products
router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = Number.parseInt(req.query.page as string) || 1;
  const pageSize = Number.parseInt(req.query.pageSize as string) || 20;
  
  // Return empty paginated response to prevent dashboard crash
  successResponse(res, {
    items: [],
    total: 0,
    page,
    pageSize
  }, 'Missing products retrieved');
}));

// POST /missing-products
router.post('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  successResponse(res, {
    id: 'missing-' + Date.now(),
    status: 'REPORTED',
    createdAt: new Date().toISOString()
  }, 'Missing product reported');
}));

// GET /missing-products/stats
router.get('/stats', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  successResponse(res, {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  }, 'Missing products stats');
}));

export default router;
