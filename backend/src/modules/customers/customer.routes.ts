import { Router } from 'express';
import { customerService } from './customer.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerFilterSchema
} from '../../schemas/customer.schema';

const router = Router();

// IMPORTANT: Static routes MUST come before dynamic /:id routes
// Account Opening Requests - Static routes first
router.get('/account-requests', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await customerService.getAccountOpeningRequests(pagination);
  paginatedResponse(res, result);
}));

router.post('/account-requests', asyncHandler(async (req: any, res: any) => {
  const request = await customerService.createAccountOpeningRequest(req.body);
  createdResponse(res, request, 'تم تقديم طلب فتح الحساب بنجاح');
}));

router.put('/account-requests/:id/status', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { status, adminNotes, allowedSearchPoints } = req.body;
  const decision = status === 'APPROVED' ? 'approve' : 'reject';
  const result = await customerService.reviewAccountOpeningRequest(req.params.id, decision, req.user!.id, adminNotes);
  successResponse(res, result, 'تم تحديث حالة الطلب');
}));

// Admin customers list - reuses the same logic as GET /
router.get('/admin', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    search: req.query.search as string,
    status: req.query.status as any,
    customerType: req.query.customerType as any,
    priceLevel: req.query.priceLevel as any,
    isApproved: req.query.isApproved === 'true' ? true : req.query.isApproved === 'false' ? false : undefined,
    region: req.query.region as string,
    city: req.query.city as string
  };
  const result = await customerService.list(filters, pagination);
  paginatedResponse(res, result);
}));

// Customer statistics for admin dashboard
router.get('/stats', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  try {
    // Get customer counts using the list function
    const allResult = await customerService.list({}, { page: 1, limit: 1 }) as any;
    const activeResult = await customerService.list({ status: 'ACTIVE' }, { page: 1, limit: 1 }) as any;
    const pendingResult = await customerService.list({ status: 'PENDING' }, { page: 1, limit: 1 }) as any;
    
    successResponse(res, {
      total: allResult?.total ?? allResult?.pagination?.total ?? 0,
      active: activeResult?.total ?? activeResult?.pagination?.total ?? 0,
      pending: pendingResult?.total ?? pendingResult?.pagination?.total ?? 0,
      suspended: 0,
      newThisMonth: 0
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    // Fallback to stub data if service fails
    successResponse(res, {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
      newThisMonth: 0
    });
  }
}));

// Dynamic routes with :id parameter
router.get('/', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    search: req.query.search as string,
    status: req.query.status as any,
    customerType: req.query.customerType as any,
    priceLevel: req.query.priceLevel as any,
    isApproved: req.query.isApproved === 'true' ? true : req.query.isApproved === 'false' ? false : undefined,
    region: req.query.region as string,
    city: req.query.city as string
  };
  const result = await customerService.list(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const customer = await customerService.getById(req.params.id);
  successResponse(res, customer);
}));

router.post('/', authMiddleware, adminOnly, validate(createCustomerSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const customer = await customerService.create(req.body);
  createdResponse(res, customer, 'تم إنشاء العميل بنجاح');
}));

router.put('/:id', authMiddleware, adminOnly, validate(updateCustomerSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const customer = await customerService.update(req.params.id, req.body);
  successResponse(res, customer, 'تم تحديث العميل بنجاح');
}));

router.put('/:id/status', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { status, suspendedUntil, reason } = req.body;
  let customer;
  
  if (status === 'SUSPENDED') {
    customer = await customerService.suspend(req.params.id, suspendedUntil ? new Date(suspendedUntil) : undefined, reason);
  } else if (status === 'ACTIVE') {
    customer = await customerService.activate(req.params.id);
  } else {
    customer = await customerService.update(req.params.id, { status });
  }
  
  successResponse(res, customer, 'تم تحديث حالة العميل');
}));

router.put('/:id/approve', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { priceLevel, searchPoints } = req.body;
  const customer = await customerService.approve(req.params.id, priceLevel, searchPoints);
  successResponse(res, customer, 'تم الموافقة على العميل');
}));

router.put('/:id/price-visibility', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { visibility } = req.body;
  const customer = await customerService.update(req.params.id, {
    profile: { priceVisibility: visibility }
  });
  successResponse(res, customer, 'تم تحديث إظهار الأسعار');
}));

router.put('/:id/price-level', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { priceLevel } = req.body;
  const customer = await customerService.update(req.params.id, {
    profile: { assignedPriceLevel: priceLevel }
  });
  successResponse(res, customer, 'تم تحديث مستوى السعر');
}));

router.put('/:id/search-points', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { points, operation } = req.body;
  const customer = await customerService.updateSearchPoints(req.params.id, points, operation);
  successResponse(res, customer, 'تم تحديث نقاط البحث');
}));

router.get('/:id/branches', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const customer = await customerService.getById(req.params.id);
  successResponse(res, customer.profile?.branches || []);
}));

router.post('/:id/branches', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const branch = await customerService.addBranch(req.params.id, req.body);
  createdResponse(res, branch, 'تم إضافة الفرع بنجاح');
}));

router.put('/:id/branches/:branchId', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const branch = await customerService.updateBranch(req.params.branchId, req.body);
  successResponse(res, branch, 'تم تحديث الفرع');
}));

router.delete('/:id/branches/:branchId', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await customerService.deleteBranch(req.params.branchId);
  successResponse(res, result, result.message);
}));

router.get('/:id/staff', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const staff = await customerService.getStaff(req.params.id);
  successResponse(res, staff);
}));

router.post('/:id/staff', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const staff = await customerService.addStaff(req.params.id, req.body);
  createdResponse(res, staff, 'تم إضافة الموظف بنجاح');
}));

router.put('/:id/staff/:staffId', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const staff = await customerService.updateStaff(req.params.staffId, req.body);
  successResponse(res, staff, 'تم تحديث بيانات الموظف');
}));

router.delete('/:id/staff/:staffId', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await customerService.deleteStaff(req.params.staffId);
  successResponse(res, result, result.message);
}));

router.delete('/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await customerService.softDelete(req.params.id);
  successResponse(res, result, result.message);
}));

export default router;
