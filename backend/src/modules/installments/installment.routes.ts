import { Router } from 'express';
import { installmentService } from './installment.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';
import {
  createInstallmentRequestSchema,
  adminReviewSchema,
  forwardToSuppliersSchema,
  createOfferSchema,
  offerResponseSchema
} from '../../schemas/installment.schema';

const router = Router();

router.get('/settings', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await installmentService.getSettings();
  successResponse(res, settings);
}));

router.put('/settings', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await installmentService.updateSettings(req.body);
  successResponse(res, settings, 'تم تحديث الإعدادات');
}));

router.get('/stats', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const customerId = req.user!.role === 'SUPER_ADMIN' ? undefined : req.user!.id;
  const stats = await installmentService.getStats(customerId);
  successResponse(res, stats);
}));

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    status: req.query.status as any,
    customerId: req.query.customerId as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
    minValue: req.query.minValue ? Number(req.query.minValue) : undefined,
    maxValue: req.query.maxValue ? Number(req.query.maxValue) : undefined
  };
  const result = await installmentService.list(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/my-requests', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await installmentService.getByCustomer(req.user!.id, pagination);
  paginatedResponse(res, result);
}));

router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.getById(req.params.id);
  successResponse(res, request);
}));

router.post('/', authMiddleware, validate(createInstallmentRequestSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.create(req.user!.id, req.user!.clientId, req.body);
  createdResponse(res, request, 'تم إنشاء طلب التقسيط بنجاح');
}));

router.put('/:id/sinicar-decision', authMiddleware, adminOnly, validate(adminReviewSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.adminReview(req.params.id, req.user!.id, req.body);
  successResponse(res, request, 'تم تحديث القرار');
}));

router.put('/:id/forward-to-suppliers', authMiddleware, adminOnly, validate(forwardToSuppliersSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.forwardToSuppliers(req.params.id, req.body);
  successResponse(res, request, 'تم تحويل الطلب للموردين');
}));

router.get('/:id/offers', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.getById(req.params.id);
  successResponse(res, request.offers);
}));

router.post('/:id/offers', authMiddleware, validate(createOfferSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const offer = await installmentService.createOffer(req.params.id, req.user!.id, req.body);
  createdResponse(res, offer, 'تم إنشاء العرض بنجاح');
}));

router.put('/:id/offers/:offerId/customer-response', authMiddleware, validate(offerResponseSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await installmentService.customerOfferResponse(req.params.offerId, req.user!.id, req.body);
  successResponse(res, result, req.body.action === 'accept' ? 'تم قبول العرض' : 'تم رفض العرض');
}));

router.put('/:id/cancel', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.cancel(req.params.id, req.user!.id, req.body.reason);
  successResponse(res, request, 'تم إلغاء الطلب');
}));

router.put('/:id/close', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.close(req.params.id, req.body.reason);
  successResponse(res, request, 'تم إغلاق الطلب');
}));

router.put('/:id/complete', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const request = await installmentService.complete(req.params.id);
  successResponse(res, request, 'تم إكمال العقد');
}));

export default router;
