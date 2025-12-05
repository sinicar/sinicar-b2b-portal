"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const installment_service_1 = require("./installment.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const installment_schema_1 = require("../../schemas/installment.schema");
const router = (0, express_1.Router)();
router.get('/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const settings = await installment_service_1.installmentService.getSettings();
    (0, response_1.successResponse)(res, settings);
}));
router.put('/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const settings = await installment_service_1.installmentService.updateSettings(req.body);
    (0, response_1.successResponse)(res, settings, 'تم تحديث الإعدادات');
}));
router.get('/stats', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const customerId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id;
    const stats = await installment_service_1.installmentService.getStats(customerId);
    (0, response_1.successResponse)(res, stats);
}));
router.get('/', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        status: req.query.status,
        customerId: req.query.customerId,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate) : undefined,
        minValue: req.query.minValue ? Number(req.query.minValue) : undefined,
        maxValue: req.query.maxValue ? Number(req.query.maxValue) : undefined
    };
    const result = await installment_service_1.installmentService.list(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/my-requests', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const result = await installment_service_1.installmentService.getByCustomer(req.user.id, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.getById(req.params.id);
    (0, response_1.successResponse)(res, request);
}));
router.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(installment_schema_1.createInstallmentRequestSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.create(req.user.id, req.user.clientId, req.body);
    (0, response_1.createdResponse)(res, request, 'تم إنشاء طلب التقسيط بنجاح');
}));
router.put('/:id/sinicar-decision', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(installment_schema_1.adminReviewSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.adminReview(req.params.id, req.user.id, req.body);
    (0, response_1.successResponse)(res, request, 'تم تحديث القرار');
}));
router.put('/:id/forward-to-suppliers', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(installment_schema_1.forwardToSuppliersSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.forwardToSuppliers(req.params.id, req.body);
    (0, response_1.successResponse)(res, request, 'تم تحويل الطلب للموردين');
}));
router.get('/:id/offers', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.getById(req.params.id);
    (0, response_1.successResponse)(res, request.offers);
}));
router.post('/:id/offers', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(installment_schema_1.createOfferSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const offer = await installment_service_1.installmentService.createOffer(req.params.id, req.user.id, req.body);
    (0, response_1.createdResponse)(res, offer, 'تم إنشاء العرض بنجاح');
}));
router.put('/:id/offers/:offerId/customer-response', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(installment_schema_1.offerResponseSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await installment_service_1.installmentService.customerOfferResponse(req.params.offerId, req.user.id, req.body);
    (0, response_1.successResponse)(res, result, req.body.action === 'accept' ? 'تم قبول العرض' : 'تم رفض العرض');
}));
router.put('/:id/cancel', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.cancel(req.params.id, req.user.id, req.body.reason);
    (0, response_1.successResponse)(res, request, 'تم إلغاء الطلب');
}));
router.put('/:id/close', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.close(req.params.id, req.body.reason);
    (0, response_1.successResponse)(res, request, 'تم إغلاق الطلب');
}));
router.put('/:id/complete', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await installment_service_1.installmentService.complete(req.params.id);
    (0, response_1.successResponse)(res, request, 'تم إكمال العقد');
}));
exports.default = router;
//# sourceMappingURL=installment.routes.js.map