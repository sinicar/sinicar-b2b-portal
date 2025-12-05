"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_service_1 = require("./customer.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const customer_schema_1 = require("../../schemas/customer.schema");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        search: req.query.search,
        status: req.query.status,
        customerType: req.query.customerType,
        priceLevel: req.query.priceLevel,
        isApproved: req.query.isApproved === 'true' ? true : req.query.isApproved === 'false' ? false : undefined,
        region: req.query.region,
        city: req.query.city
    };
    const result = await customer_service_1.customerService.list(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const customer = await customer_service_1.customerService.getById(req.params.id);
    (0, response_1.successResponse)(res, customer);
}));
router.post('/', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(customer_schema_1.createCustomerSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const customer = await customer_service_1.customerService.create(req.body);
    (0, response_1.createdResponse)(res, customer, 'تم إنشاء العميل بنجاح');
}));
router.put('/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(customer_schema_1.updateCustomerSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const customer = await customer_service_1.customerService.update(req.params.id, req.body);
    (0, response_1.successResponse)(res, customer, 'تم تحديث العميل بنجاح');
}));
router.put('/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { status, suspendedUntil, reason } = req.body;
    let customer;
    if (status === 'SUSPENDED') {
        customer = await customer_service_1.customerService.suspend(req.params.id, suspendedUntil ? new Date(suspendedUntil) : undefined, reason);
    }
    else if (status === 'ACTIVE') {
        customer = await customer_service_1.customerService.activate(req.params.id);
    }
    else {
        customer = await customer_service_1.customerService.update(req.params.id, { status });
    }
    (0, response_1.successResponse)(res, customer, 'تم تحديث حالة العميل');
}));
router.put('/:id/approve', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { priceLevel, searchPoints } = req.body;
    const customer = await customer_service_1.customerService.approve(req.params.id, priceLevel, searchPoints);
    (0, response_1.successResponse)(res, customer, 'تم الموافقة على العميل');
}));
router.put('/:id/price-visibility', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { visibility } = req.body;
    const customer = await customer_service_1.customerService.update(req.params.id, {
        profile: { priceVisibility: visibility }
    });
    (0, response_1.successResponse)(res, customer, 'تم تحديث إظهار الأسعار');
}));
router.put('/:id/price-level', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { priceLevel } = req.body;
    const customer = await customer_service_1.customerService.update(req.params.id, {
        profile: { assignedPriceLevel: priceLevel }
    });
    (0, response_1.successResponse)(res, customer, 'تم تحديث مستوى السعر');
}));
router.put('/:id/search-points', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { points, operation } = req.body;
    const customer = await customer_service_1.customerService.updateSearchPoints(req.params.id, points, operation);
    (0, response_1.successResponse)(res, customer, 'تم تحديث نقاط البحث');
}));
router.get('/:id/branches', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const customer = await customer_service_1.customerService.getById(req.params.id);
    (0, response_1.successResponse)(res, customer.profile?.branches || []);
}));
router.post('/:id/branches', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const branch = await customer_service_1.customerService.addBranch(req.params.id, req.body);
    (0, response_1.createdResponse)(res, branch, 'تم إضافة الفرع بنجاح');
}));
router.put('/:id/branches/:branchId', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const branch = await customer_service_1.customerService.updateBranch(req.params.branchId, req.body);
    (0, response_1.successResponse)(res, branch, 'تم تحديث الفرع');
}));
router.delete('/:id/branches/:branchId', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await customer_service_1.customerService.deleteBranch(req.params.branchId);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/:id/staff', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const staff = await customer_service_1.customerService.getStaff(req.params.id);
    (0, response_1.successResponse)(res, staff);
}));
router.post('/:id/staff', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const staff = await customer_service_1.customerService.addStaff(req.params.id, req.body);
    (0, response_1.createdResponse)(res, staff, 'تم إضافة الموظف بنجاح');
}));
router.put('/:id/staff/:staffId', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const staff = await customer_service_1.customerService.updateStaff(req.params.staffId, req.body);
    (0, response_1.successResponse)(res, staff, 'تم تحديث بيانات الموظف');
}));
router.delete('/:id/staff/:staffId', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await customer_service_1.customerService.deleteStaff(req.params.staffId);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/account-requests', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const result = await customer_service_1.customerService.getAccountOpeningRequests(pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.post('/account-requests', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const request = await customer_service_1.customerService.createAccountOpeningRequest(req.body);
    (0, response_1.createdResponse)(res, request, 'تم تقديم طلب فتح الحساب بنجاح');
}));
router.put('/account-requests/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { status, adminNotes, allowedSearchPoints } = req.body;
    const decision = status === 'APPROVED' ? 'approve' : 'reject';
    const result = await customer_service_1.customerService.reviewAccountOpeningRequest(req.params.id, decision, req.user.id, adminNotes);
    (0, response_1.successResponse)(res, result, 'تم تحديث حالة الطلب');
}));
router.delete('/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await customer_service_1.customerService.softDelete(req.params.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
exports.default = router;
//# sourceMappingURL=customer.routes.js.map