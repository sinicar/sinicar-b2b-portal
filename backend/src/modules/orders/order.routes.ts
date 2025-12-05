import { Router } from 'express';
import { orderService } from './order.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateInternalStatusSchema,
  createQuoteRequestSchema
} from '../../schemas/order.schema';

const router = Router();

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    search: req.query.search as string,
    status: req.query.status as any,
    internalStatus: req.query.internalStatus as any,
    userId: req.query.customerId as string,
    fromDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    toDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
    maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined
  };
  const result = await orderService.list(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/my-orders', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await orderService.getByUser(req.user!.id, pagination);
  paginatedResponse(res, result);
}));

router.get('/stats', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.role === 'SUPER_ADMIN' ? undefined : req.user!.id;
  const stats = await orderService.getOrderStats(userId);
  successResponse(res, stats);
}));

router.get('/quotes', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    status: req.query.status as any,
    userId: req.user!.role === 'SUPER_ADMIN' ? undefined : req.user!.id
  };
  const result = await orderService.getQuoteRequests(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/quotes/my-quotes', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await orderService.getQuoteRequests({ userId: req.user!.id }, pagination);
  paginatedResponse(res, result);
}));

router.get('/quotes/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const quote = await orderService.getQuoteById(req.params.id);
  successResponse(res, quote);
}));

router.post('/quotes', authMiddleware, validate(createQuoteRequestSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const quote = await orderService.createQuoteRequest(
    req.user!.id,
    '', // userName
    '', // companyName
    req.body
  );
  createdResponse(res, quote, 'تم إنشاء طلب عرض السعر بنجاح');
}));

router.put('/quotes/:id/process', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const quote = await orderService.processQuote(req.params.id);
  successResponse(res, quote, 'تم معالجة طلب عرض السعر');
}));

router.put('/quotes/:id/status', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const quote = await orderService.updateQuoteStatus(req.params.id, req.body.status);
  successResponse(res, quote, 'تم تحديث حالة الطلب');
}));

router.get('/products/search', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const products = await orderService.searchProducts(req.query.q as string || '', 20);
  successResponse(res, products);
}));

router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const order = await orderService.getById(req.params.id);
  successResponse(res, order);
}));

router.post('/', authMiddleware, validate(createOrderSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const order = await orderService.create(req.user!.id, req.body);
  createdResponse(res, order, 'تم إنشاء الطلب بنجاح');
}));

router.put('/:id/status', authMiddleware, adminOnly, validate(updateOrderStatusSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const order = await orderService.updateStatus(req.params.id, req.user!.id, req.body);
  successResponse(res, order, 'تم تحديث حالة الطلب');
}));

router.put('/:id/internal-status', authMiddleware, adminOnly, validate(updateInternalStatusSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const order = await orderService.updateInternalStatus(req.params.id, req.body.internalStatus, req.body.internalNotes);
  successResponse(res, order, 'تم تحديث الحالة الداخلية');
}));

router.post('/:id/cancel', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const order = await orderService.cancel(req.params.id, req.user!.id, req.body.reason);
  successResponse(res, order, 'تم إلغاء الطلب');
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await orderService.delete(req.params.id, req.user!.id);
  successResponse(res, result, result.message);
}));

router.get('/:id/history', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const order = await orderService.getById(req.params.id);
  successResponse(res, order.statusHistory);
}));

export default router;
