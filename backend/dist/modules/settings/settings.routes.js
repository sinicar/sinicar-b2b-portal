"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_service_1 = require("./settings.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const settings = await settings_service_1.settingsService.getAllSettings(category);
        return (0, response_1.successResponse)(res, settings, 'Settings retrieved successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/:key', async (req, res) => {
    try {
        const setting = await settings_service_1.settingsService.getSetting(req.params.key);
        if (!setting) {
            return (0, response_1.errorResponse)(res, 'Setting not found', 404);
        }
        return (0, response_1.successResponse)(res, setting, 'Setting retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/:key', async (req, res) => {
    try {
        const { value, updatedBy } = req.body;
        if (value === undefined) {
            return (0, response_1.errorResponse)(res, 'Value is required', 400);
        }
        const setting = await settings_service_1.settingsService.setSetting(req.params.key, String(value), updatedBy);
        return (0, response_1.successResponse)(res, setting, 'Setting updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/', async (req, res) => {
    try {
        const setting = await settings_service_1.settingsService.createSetting(req.body);
        return (0, response_1.successResponse)(res, setting, 'Setting created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/bulk/update', async (req, res) => {
    try {
        const { settings, updatedBy } = req.body;
        if (!Array.isArray(settings)) {
            return (0, response_1.errorResponse)(res, 'Settings must be an array', 400);
        }
        await settings_service_1.settingsService.setSettingBulk(settings, updatedBy);
        return (0, response_1.successResponse)(res, null, 'Settings updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/features/flags', async (req, res) => {
    try {
        const flags = await settings_service_1.settingsService.getAllFeatureFlags();
        return (0, response_1.successResponse)(res, flags, 'Feature flags retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/features/flags/:key', async (req, res) => {
    try {
        const flag = await settings_service_1.settingsService.getFeatureFlag(req.params.key);
        if (!flag) {
            return (0, response_1.errorResponse)(res, 'Feature flag not found', 404);
        }
        return (0, response_1.successResponse)(res, flag, 'Feature flag retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/features/flags/:key', async (req, res) => {
    try {
        const { isEnabled, enabledFor } = req.body;
        const flag = await settings_service_1.settingsService.setFeatureFlag(req.params.key, isEnabled, enabledFor);
        return (0, response_1.successResponse)(res, flag, 'Feature flag updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/quality-codes', async (req, res) => {
    try {
        const codes = await settings_service_1.settingsService.getAllQualityCodes();
        return (0, response_1.successResponse)(res, codes, 'Quality codes retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/quality-codes', async (req, res) => {
    try {
        const code = await settings_service_1.settingsService.createQualityCode(req.body);
        return (0, response_1.successResponse)(res, code, 'Quality code created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/quality-codes/:id', async (req, res) => {
    try {
        const code = await settings_service_1.settingsService.updateQualityCode(req.params.id, req.body);
        return (0, response_1.successResponse)(res, code, 'Quality code updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/brand-codes', async (req, res) => {
    try {
        const codes = await settings_service_1.settingsService.getAllBrandCodes();
        return (0, response_1.successResponse)(res, codes, 'Brand codes retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/brand-codes', async (req, res) => {
    try {
        const code = await settings_service_1.settingsService.createBrandCode(req.body);
        return (0, response_1.successResponse)(res, code, 'Brand code created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/brand-codes/:id', async (req, res) => {
    try {
        const code = await settings_service_1.settingsService.updateBrandCode(req.params.id, req.body);
        return (0, response_1.successResponse)(res, code, 'Brand code updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/shipping/methods', async (req, res) => {
    try {
        const methods = await settings_service_1.settingsService.getAllShippingMethods();
        return (0, response_1.successResponse)(res, methods, 'Shipping methods retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/shipping/methods', async (req, res) => {
    try {
        const method = await settings_service_1.settingsService.createShippingMethod(req.body);
        return (0, response_1.successResponse)(res, method, 'Shipping method created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/shipping/methods/:id', async (req, res) => {
    try {
        const method = await settings_service_1.settingsService.updateShippingMethod(req.params.id, req.body);
        return (0, response_1.successResponse)(res, method, 'Shipping method updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/shipping/zones', async (req, res) => {
    try {
        const zones = await settings_service_1.settingsService.getAllShippingZones();
        return (0, response_1.successResponse)(res, zones, 'Shipping zones retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/shipping/zones', async (req, res) => {
    try {
        const zone = await settings_service_1.settingsService.createShippingZone(req.body);
        return (0, response_1.successResponse)(res, zone, 'Shipping zone created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/shipping/zones/:id', async (req, res) => {
    try {
        const zone = await settings_service_1.settingsService.updateShippingZone(req.params.id, req.body);
        return (0, response_1.successResponse)(res, zone, 'Shipping zone updated');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/excel-templates', async (req, res) => {
    try {
        const templates = await settings_service_1.settingsService.getAllExcelTemplates();
        return (0, response_1.successResponse)(res, templates, 'Excel templates retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/excel-templates/:id', async (req, res) => {
    try {
        const template = await settings_service_1.settingsService.getExcelTemplate(req.params.id);
        if (!template) {
            return (0, response_1.errorResponse)(res, 'Template not found', 404);
        }
        return (0, response_1.successResponse)(res, template, 'Excel template retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/excel-templates', async (req, res) => {
    try {
        const template = await settings_service_1.settingsService.createExcelTemplate(req.body);
        return (0, response_1.successResponse)(res, template, 'Excel template created', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
exports.default = router;
//# sourceMappingURL=settings.routes.js.map