"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricing_service_1 = require("./pricing.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
router.post('/calculate', async (req, res) => {
    try {
        const { supplierId, supplierCurrency, supplierPrice, customerCurrency, qualityCodeId } = req.body;
        if (!supplierId || !supplierCurrency || supplierPrice === undefined) {
            return (0, response_1.errorResponse)(res, 'supplierId, supplierCurrency, and supplierPrice are required', 400);
        }
        const result = await pricing_service_1.pricingService.calculateSellPrice({
            supplierId,
            supplierCurrency,
            supplierPrice: Number(supplierPrice),
            customerCurrency,
            qualityCodeId
        });
        return (0, response_1.successResponse)(res, result, 'Price calculated successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/shipping', async (req, res) => {
    try {
        const { shippingMethodCode, weightKg, destinationCountry, currency } = req.body;
        if (!shippingMethodCode || weightKg === undefined || !destinationCountry) {
            return (0, response_1.errorResponse)(res, 'shippingMethodCode, weightKg, and destinationCountry are required', 400);
        }
        const result = await pricing_service_1.pricingService.calculateShippingCost({
            shippingMethodCode,
            weightKg: Number(weightKg),
            destinationCountry,
            currency
        });
        return (0, response_1.successResponse)(res, result, 'Shipping cost calculated successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/supplier-groups', async (req, res) => {
    try {
        const groups = await pricing_service_1.pricingService.getSupplierGroups();
        return (0, response_1.successResponse)(res, groups, 'Supplier groups retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/supplier-groups', async (req, res) => {
    try {
        const group = await pricing_service_1.pricingService.createSupplierGroup(req.body);
        return (0, response_1.successResponse)(res, group, 'Supplier group created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/supplier-groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const group = await pricing_service_1.pricingService.updateSupplierGroup(id, req.body);
        return (0, response_1.successResponse)(res, group, 'Supplier group updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/supplier-groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pricing_service_1.pricingService.deleteSupplierGroup(id);
        return (0, response_1.successResponse)(res, null, 'Supplier group deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/quality-codes', async (req, res) => {
    try {
        const codes = await pricing_service_1.pricingService.getQualityCodes();
        return (0, response_1.successResponse)(res, codes, 'Quality codes retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/quality-codes', async (req, res) => {
    try {
        const code = await pricing_service_1.pricingService.createQualityCode(req.body);
        return (0, response_1.successResponse)(res, code, 'Quality code created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/quality-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const code = await pricing_service_1.pricingService.updateQualityCode(id, req.body);
        return (0, response_1.successResponse)(res, code, 'Quality code updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/quality-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pricing_service_1.pricingService.deleteQualityCode(id);
        return (0, response_1.successResponse)(res, null, 'Quality code deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/brand-codes', async (req, res) => {
    try {
        const codes = await pricing_service_1.pricingService.getBrandCodes();
        return (0, response_1.successResponse)(res, codes, 'Brand codes retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/brand-codes', async (req, res) => {
    try {
        const code = await pricing_service_1.pricingService.createBrandCode(req.body);
        return (0, response_1.successResponse)(res, code, 'Brand code created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/brand-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const code = await pricing_service_1.pricingService.updateBrandCode(id, req.body);
        return (0, response_1.successResponse)(res, code, 'Brand code updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/brand-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pricing_service_1.pricingService.deleteBrandCode(id);
        return (0, response_1.successResponse)(res, null, 'Brand code deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/shipping-methods', async (req, res) => {
    try {
        const methods = await pricing_service_1.pricingService.getShippingMethods();
        return (0, response_1.successResponse)(res, methods, 'Shipping methods retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/shipping-methods', async (req, res) => {
    try {
        const method = await pricing_service_1.pricingService.createShippingMethod(req.body);
        return (0, response_1.successResponse)(res, method, 'Shipping method created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/shipping-methods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const method = await pricing_service_1.pricingService.updateShippingMethod(id, req.body);
        return (0, response_1.successResponse)(res, method, 'Shipping method updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/shipping-methods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pricing_service_1.pricingService.deleteShippingMethod(id);
        return (0, response_1.successResponse)(res, null, 'Shipping method deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/shipping-zones', async (req, res) => {
    try {
        const zones = await pricing_service_1.pricingService.getShippingZones();
        return (0, response_1.successResponse)(res, zones, 'Shipping zones retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/shipping-zones', async (req, res) => {
    try {
        const zone = await pricing_service_1.pricingService.createShippingZone(req.body);
        return (0, response_1.successResponse)(res, zone, 'Shipping zone created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/shipping-zones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const zone = await pricing_service_1.pricingService.updateShippingZone(id, req.body);
        return (0, response_1.successResponse)(res, zone, 'Shipping zone updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/shipping-zones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pricing_service_1.pricingService.deleteShippingZone(id);
        return (0, response_1.successResponse)(res, null, 'Shipping zone deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/roles', async (req, res) => {
    try {
        const roles = await pricing_service_1.pricingService.getRoles();
        return (0, response_1.successResponse)(res, roles, 'Roles retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/roles', async (req, res) => {
    try {
        const role = await pricing_service_1.pricingService.createRole(req.body);
        return (0, response_1.successResponse)(res, role, 'Role created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const role = await pricing_service_1.pricingService.updateRole(id, req.body);
        return (0, response_1.successResponse)(res, role, 'Role updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.delete('/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pricing_service_1.pricingService.deleteRole(id);
        return (0, response_1.successResponse)(res, null, 'Role deleted');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
exports.default = router;
//# sourceMappingURL=pricing.routes.js.map