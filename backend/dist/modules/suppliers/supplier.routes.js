"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supplier_service_1 = require("./supplier.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const supplier_schema_1 = require("../../schemas/supplier.schema");
const router = (0, express_1.Router)();
router.get('/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const settings = await supplier_service_1.supplierService.getSettings();
    (0, response_1.successResponse)(res, settings);
}));
router.put('/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const settings = await supplier_service_1.supplierService.updateSettings(req.body);
    (0, response_1.successResponse)(res, settings, 'تم تحديث الإعدادات');
}));
router.get('/stats', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const stats = await supplier_service_1.supplierService.getStats();
    (0, response_1.successResponse)(res, stats);
}));
router.get('/marketplace/search', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        partNumber: req.query.partNumber,
        partName: req.query.partName,
        brand: req.query.brand,
        category: req.query.category,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        inStock: req.query.inStock === 'true'
    };
    const result = await supplier_service_1.supplierService.searchMarketplace(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        search: req.query.search,
        status: req.query.status,
        category: req.query.category,
        region: req.query.region,
        minRating: req.query.minRating ? Number(req.query.minRating) : undefined
    };
    const result = await supplier_service_1.supplierService.list(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/my-profile', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const profile = await supplier_service_1.supplierService.getByCustomerId(req.user.id);
    (0, response_1.successResponse)(res, profile);
}));
router.post('/register', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(supplier_schema_1.createSupplierProfileSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const profile = await supplier_service_1.supplierService.create(req.user.id, req.body);
    (0, response_1.createdResponse)(res, profile, 'تم تسجيلك كمورد بنجاح');
}));
router.get('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const supplier = await supplier_service_1.supplierService.getById(req.params.id);
    (0, response_1.successResponse)(res, supplier);
}));
router.put('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(supplier_schema_1.updateSupplierProfileSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const supplier = await supplier_service_1.supplierService.update(req.params.id, req.user.id, req.body);
    (0, response_1.successResponse)(res, supplier, 'تم تحديث البيانات');
}));
router.put('/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const supplier = await supplier_service_1.supplierService.updateStatus(req.params.id, req.body.status);
    (0, response_1.successResponse)(res, supplier, 'تم تحديث الحالة');
}));
router.delete('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await supplier_service_1.supplierService.delete(req.params.id, req.user.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/:id/catalog', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const result = await supplier_service_1.supplierService.getCatalogItems(req.params.id, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.post('/:id/catalog', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(supplier_schema_1.catalogItemSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const item = await supplier_service_1.supplierService.addCatalogItem(req.params.id, req.user.id, req.body);
    (0, response_1.createdResponse)(res, item, 'تم إضافة المنتج');
}));
router.post('/:id/catalog/bulk', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(supplier_schema_1.bulkUploadCatalogSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await supplier_service_1.supplierService.bulkUploadCatalog(req.params.id, req.user.id, req.body);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.put('/:id/catalog/:itemId', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const item = await supplier_service_1.supplierService.updateCatalogItem(req.params.itemId, req.params.id, req.user.id, req.body);
    (0, response_1.successResponse)(res, item, 'تم تحديث المنتج');
}));
router.delete('/:id/catalog/:itemId', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await supplier_service_1.supplierService.deleteCatalogItem(req.params.itemId, req.params.id, req.user.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
exports.default = router;
//# sourceMappingURL=supplier.routes.js.map