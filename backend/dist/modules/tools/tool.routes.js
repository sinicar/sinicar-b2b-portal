"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tool_service_1 = require("./tool.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const tools_schema_1 = require("../../schemas/tools.schema");
const router = (0, express_1.Router)();
router.get('/configs', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const configs = await tool_service_1.toolService.getToolConfigs();
    (0, response_1.successResponse)(res, configs);
}));
router.get('/configs/:toolKey', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const config = await tool_service_1.toolService.getToolConfig(req.params.toolKey);
    (0, response_1.successResponse)(res, config);
}));
router.post('/configs', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(tools_schema_1.toolConfigSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const config = await tool_service_1.toolService.createToolConfig(req.body);
    (0, response_1.createdResponse)(res, config, 'تم إنشاء إعدادات الأداة');
}));
router.put('/configs/:toolKey', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(tools_schema_1.updateToolConfigSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const config = await tool_service_1.toolService.updateToolConfig(req.params.toolKey, req.body);
    (0, response_1.successResponse)(res, config, 'تم تحديث إعدادات الأداة');
}));
router.delete('/configs/:toolKey', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await tool_service_1.toolService.deleteToolConfig(req.params.toolKey);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/customer-overrides/:customerId', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const overrides = await tool_service_1.toolService.getCustomerToolOverrides(req.params.customerId);
    (0, response_1.successResponse)(res, overrides);
}));
router.put('/customer-overrides', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(tools_schema_1.customerToolsOverrideSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const overrides = await tool_service_1.toolService.setCustomerToolOverrides(req.body);
    (0, response_1.successResponse)(res, overrides, 'تم تحديث إعدادات العميل');
}));
router.get('/can-use/:toolKey', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await tool_service_1.toolService.canUseTool(req.user.id, req.params.toolKey);
    (0, response_1.successResponse)(res, result);
}));
router.post('/usage/log', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { toolKey, metadata } = req.body;
    const usage = await tool_service_1.toolService.recordToolUsage(req.user.id, toolKey, metadata);
    (0, response_1.successResponse)(res, usage, 'تم تسجيل الاستخدام');
}));
router.post('/price-comparison', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(tools_schema_1.priceComparisonSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await tool_service_1.toolService.comparePrices(req.user.id, req.body);
    (0, response_1.successResponse)(res, result);
}));
router.post('/vin-extraction', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(tools_schema_1.vinExtractionSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await tool_service_1.toolService.extractVin(req.user.id, req.body);
    (0, response_1.successResponse)(res, result);
}));
router.post('/supplier-prices/upload', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(tools_schema_1.supplierPriceUploadSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await tool_service_1.toolService.uploadSupplierPrices(req.user.id, req.body);
    (0, response_1.successResponse)(res, result, 'تم رفع الأسعار بنجاح');
}));
router.get('/marketer/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const settings = await tool_service_1.toolService.getMarketerSettings();
    (0, response_1.successResponse)(res, settings);
}));
router.put('/marketer/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const settings = await tool_service_1.toolService.updateMarketerSettings(req.body);
    (0, response_1.successResponse)(res, settings, 'تم تحديث الإعدادات');
}));
router.get('/marketer/stats', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const marketerId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id;
    const stats = await tool_service_1.toolService.getMarketerStats(marketerId);
    (0, response_1.successResponse)(res, stats);
}));
router.get('/marketers', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        status: req.query.status,
        search: req.query.search,
        minEarnings: req.query.minEarnings ? Number(req.query.minEarnings) : undefined,
        minReferrals: req.query.minReferrals ? Number(req.query.minReferrals) : undefined
    };
    const result = await tool_service_1.toolService.listMarketers(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/marketers/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const marketer = await tool_service_1.toolService.getMarketerById(req.params.id);
    (0, response_1.successResponse)(res, marketer);
}));
router.post('/marketers', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(tools_schema_1.createMarketerSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const marketer = await tool_service_1.toolService.createMarketer(req.body);
    (0, response_1.createdResponse)(res, marketer, 'تم التسجيل كمسوق بنجاح');
}));
router.put('/marketers/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(tools_schema_1.updateMarketerSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const marketer = await tool_service_1.toolService.updateMarketer(req.params.id, req.body);
    (0, response_1.successResponse)(res, marketer, 'تم تحديث البيانات');
}));
router.put('/marketers/:id/approve', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const marketer = await tool_service_1.toolService.approveMarketer(req.params.id);
    (0, response_1.successResponse)(res, marketer, 'تم تفعيل المسوق');
}));
router.put('/marketers/:id/suspend', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const marketer = await tool_service_1.toolService.suspendMarketer(req.params.id);
    (0, response_1.successResponse)(res, marketer, 'تم إيقاف المسوق');
}));
router.delete('/marketers/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await tool_service_1.toolService.deleteMarketer(req.params.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/marketers/:id/details', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const marketer = await tool_service_1.toolService.getMarketerById(req.params.id);
    (0, response_1.successResponse)(res, {
        marketer,
        referrals: marketer.referrals,
        commissions: marketer.commissions
    });
}));
router.post('/track-referral', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { referralCode, customerId, customerName } = req.body;
    const referral = await tool_service_1.toolService.createReferral(referralCode, customerId, customerName);
    (0, response_1.successResponse)(res, referral, 'تم تسجيل الإحالة');
}));
router.post('/commissions/:id/approve', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const commission = await tool_service_1.toolService.approveCommission(req.params.id);
    (0, response_1.successResponse)(res, commission, 'تم اعتماد العمولة');
}));
router.post('/commissions/:id/pay', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const commission = await tool_service_1.toolService.payCommission(req.params.id);
    (0, response_1.successResponse)(res, commission, 'تم صرف العمولة');
}));
exports.default = router;
//# sourceMappingURL=tool.routes.js.map