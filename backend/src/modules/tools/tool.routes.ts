import { Router } from 'express';
import { toolService } from './tool.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';
import {
  toolConfigSchema,
  updateToolConfigSchema,
  customerToolsOverrideSchema,
  priceComparisonSchema,
  vinExtractionSchema,
  supplierPriceUploadSchema,
  createMarketerSchema,
  updateMarketerSchema
} from '../../schemas/tools.schema';

const router = Router();

router.get('/configs', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const configs = await toolService.getToolConfigs();
  successResponse(res, configs);
}));

router.get('/configs/:toolKey', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const config = await toolService.getToolConfig(req.params.toolKey);
  successResponse(res, config);
}));

router.post('/configs', authMiddleware, adminOnly, validate(toolConfigSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const config = await toolService.createToolConfig(req.body);
  createdResponse(res, config, 'تم إنشاء إعدادات الأداة');
}));

router.put('/configs/:toolKey', authMiddleware, adminOnly, validate(updateToolConfigSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const config = await toolService.updateToolConfig(req.params.toolKey, req.body);
  successResponse(res, config, 'تم تحديث إعدادات الأداة');
}));

router.delete('/configs/:toolKey', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await toolService.deleteToolConfig(req.params.toolKey);
  successResponse(res, result, result.message);
}));

router.get('/customer-overrides/:customerId', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const overrides = await toolService.getCustomerToolOverrides(req.params.customerId);
  successResponse(res, overrides);
}));

router.put('/customer-overrides', authMiddleware, adminOnly, validate(customerToolsOverrideSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const overrides = await toolService.setCustomerToolOverrides(req.body);
  successResponse(res, overrides, 'تم تحديث إعدادات العميل');
}));

router.get('/can-use/:toolKey', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await toolService.canUseTool(req.user!.id, req.params.toolKey);
  successResponse(res, result);
}));

router.post('/usage/log', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const { toolKey, metadata } = req.body;
  const usage = await toolService.recordToolUsage(req.user!.id, toolKey, metadata);
  successResponse(res, usage, 'تم تسجيل الاستخدام');
}));

router.post('/price-comparison', authMiddleware, validate(priceComparisonSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await toolService.comparePrices(req.user!.id, req.body);
  successResponse(res, result);
}));

router.post('/vin-extraction', authMiddleware, validate(vinExtractionSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await toolService.extractVin(req.user!.id, req.body);
  successResponse(res, result);
}));

router.post('/supplier-prices/upload', authMiddleware, validate(supplierPriceUploadSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await toolService.uploadSupplierPrices(req.user!.id, req.body);
  successResponse(res, result, 'تم رفع الأسعار بنجاح');
}));

router.get('/marketer/settings', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await toolService.getMarketerSettings();
  successResponse(res, settings);
}));

router.put('/marketer/settings', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await toolService.updateMarketerSettings(req.body);
  successResponse(res, settings, 'تم تحديث الإعدادات');
}));

router.get('/marketer/stats', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const marketerId = req.user!.role === 'SUPER_ADMIN' ? undefined : req.user!.id;
  const stats = await toolService.getMarketerStats(marketerId);
  successResponse(res, stats);
}));

router.get('/marketers', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    status: req.query.status as any,
    search: req.query.search as string,
    minEarnings: req.query.minEarnings ? Number(req.query.minEarnings) : undefined,
    minReferrals: req.query.minReferrals ? Number(req.query.minReferrals) : undefined
  };
  const result = await toolService.listMarketers(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/marketers/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const marketer = await toolService.getMarketerById(req.params.id);
  successResponse(res, marketer);
}));

router.post('/marketers', authMiddleware, validate(createMarketerSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const marketer = await toolService.createMarketer(req.body);
  createdResponse(res, marketer, 'تم التسجيل كمسوق بنجاح');
}));

router.put('/marketers/:id', authMiddleware, validate(updateMarketerSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const marketer = await toolService.updateMarketer(req.params.id, req.body);
  successResponse(res, marketer, 'تم تحديث البيانات');
}));

router.put('/marketers/:id/approve', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const marketer = await toolService.approveMarketer(req.params.id);
  successResponse(res, marketer, 'تم تفعيل المسوق');
}));

router.put('/marketers/:id/suspend', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const marketer = await toolService.suspendMarketer(req.params.id);
  successResponse(res, marketer, 'تم إيقاف المسوق');
}));

router.delete('/marketers/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await toolService.deleteMarketer(req.params.id);
  successResponse(res, result, result.message);
}));

router.get('/marketers/:id/details', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const marketer = await toolService.getMarketerById(req.params.id);
  successResponse(res, {
    marketer,
    referrals: marketer.referrals,
    commissions: marketer.commissions
  });
}));

router.post('/track-referral', asyncHandler(async (req: any, res: any) => {
  const { referralCode, customerId, customerName } = req.body;
  const referral = await toolService.createReferral(referralCode, customerId, customerName);
  successResponse(res, referral, 'تم تسجيل الإحالة');
}));

router.post('/commissions/:id/approve', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const commission = await toolService.approveCommission(req.params.id);
  successResponse(res, commission, 'تم اعتماد العمولة');
}));

router.post('/commissions/:id/pay', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const commission = await toolService.payCommission(req.params.id);
  successResponse(res, commission, 'تم صرف العمولة');
}));

export default router;
