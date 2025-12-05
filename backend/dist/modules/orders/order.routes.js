"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_service_1 = require("./order.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const order_schema_1 = require("../../schemas/order.schema");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        search: req.query.search,
        status: req.query.status,
        internalStatus: req.query.internalStatus,
        userId: req.query.customerId,
        fromDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        toDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined
    };
    const result = await order_service_1.orderService.list(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/my-orders', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const result = await order_service_1.orderService.getByUser(req.user.id, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/stats', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id;
    const stats = await order_service_1.orderService.getOrderStats(userId);
    (0, response_1.successResponse)(res, stats);
}));
router.get('/quotes', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        status: req.query.status,
        userId: req.user.role === 'SUPER_ADMIN' ? undefined : req.user.id
    };
    const result = await order_service_1.orderService.getQuoteRequests(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/quotes/my-quotes', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const result = await order_service_1.orderService.getQuoteRequests({ userId: req.user.id }, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/quotes/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const quote = await order_service_1.orderService.getQuoteById(req.params.id);
    (0, response_1.successResponse)(res, quote);
}));
router.post('/quotes', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(order_schema_1.createQuoteRequestSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const quote = await order_service_1.orderService.createQuoteRequest(req.user.id, '', // userName
    '', // companyName
    req.body);
    (0, response_1.createdResponse)(res, quote, 'تم إنشاء طلب عرض السعر بنجاح');
}));
router.put('/quotes/:id/process', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const quote = await order_service_1.orderService.processQuote(req.params.id);
    (0, response_1.successResponse)(res, quote, 'تم معالجة طلب عرض السعر');
}));
router.put('/quotes/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const quote = await order_service_1.orderService.updateQuoteStatus(req.params.id, req.body.status);
    (0, response_1.successResponse)(res, quote, 'تم تحديث حالة الطلب');
}));
router.get('/products/search', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const products = await order_service_1.orderService.searchProducts(req.query.q || '', 20);
    (0, response_1.successResponse)(res, products);
}));
router.get('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.orderService.getById(req.params.id);
    (0, response_1.successResponse)(res, order);
}));
router.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(order_schema_1.createOrderSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.orderService.create(req.user.id, req.body);
    (0, response_1.createdResponse)(res, order, 'تم إنشاء الطلب بنجاح');
}));
router.put('/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(order_schema_1.updateOrderStatusSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.orderService.updateStatus(req.params.id, req.user.id, req.body);
    (0, response_1.successResponse)(res, order, 'تم تحديث حالة الطلب');
}));
router.put('/:id/internal-status', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(order_schema_1.updateInternalStatusSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.orderService.updateInternalStatus(req.params.id, req.body.internalStatus, req.body.internalNotes);
    (0, response_1.successResponse)(res, order, 'تم تحديث الحالة الداخلية');
}));
router.post('/:id/cancel', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.orderService.cancel(req.params.id, req.user.id, req.body.reason);
    (0, response_1.successResponse)(res, order, 'تم إلغاء الطلب');
}));
router.delete('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await order_service_1.orderService.delete(req.params.id, req.user.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/:id/history', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.orderService.getById(req.params.id);
    (0, response_1.successResponse)(res, order.statusHistory);
}));
exports.default = router;
//# sourceMappingURL=order.routes.js.map