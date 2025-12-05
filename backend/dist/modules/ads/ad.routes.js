"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ad_service_1 = require("./ad.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const ad_schema_1 = require("../../schemas/ad.schema");
const router = (0, express_1.Router)();
router.get('/stats', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const stats = await ad_service_1.adService.getStats();
    (0, response_1.successResponse)(res, stats);
}));
router.get('/slots', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const result = await ad_service_1.adService.listSlots(isActive, pagination);
    if (Array.isArray(result)) {
        (0, response_1.successResponse)(res, result);
    }
    else {
        (0, response_1.paginatedResponse)(res, result);
    }
}));
router.get('/slots/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const slot = await ad_service_1.adService.getSlotById(req.params.id);
    (0, response_1.successResponse)(res, slot);
}));
router.post('/slots', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(ad_schema_1.createAdSlotSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const slot = await ad_service_1.adService.createSlot(req.body);
    (0, response_1.createdResponse)(res, slot, 'تم إنشاء موقع الإعلان');
}));
router.put('/slots/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(ad_schema_1.updateAdSlotSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const slot = await ad_service_1.adService.updateSlot(req.params.id, req.body);
    (0, response_1.successResponse)(res, slot, 'تم تحديث موقع الإعلان');
}));
router.delete('/slots/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await ad_service_1.adService.deleteSlot(req.params.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/advertisers', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        status: req.query.status,
        search: req.query.search
    };
    const result = await ad_service_1.adService.listAdvertisers(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/advertisers/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const advertiser = await ad_service_1.adService.getAdvertiserById(req.params.id);
    (0, response_1.successResponse)(res, advertiser);
}));
router.post('/advertisers', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(ad_schema_1.createAdvertiserSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const advertiser = await ad_service_1.adService.createAdvertiser(req.body);
    (0, response_1.createdResponse)(res, advertiser, 'تم إنشاء حساب المعلن');
}));
router.put('/advertisers/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(ad_schema_1.updateAdvertiserSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const advertiser = await ad_service_1.adService.updateAdvertiser(req.params.id, req.body);
    (0, response_1.successResponse)(res, advertiser, 'تم تحديث بيانات المعلن');
}));
router.post('/advertisers/:id/balance', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(ad_schema_1.addBalanceSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const advertiser = await ad_service_1.adService.addBalance(req.params.id, req.body);
    (0, response_1.successResponse)(res, advertiser, 'تم إضافة الرصيد');
}));
router.delete('/advertisers/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await ad_service_1.adService.deleteAdvertiser(req.params.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/campaigns', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        status: req.query.status,
        advertiserId: req.query.advertiserId,
        slotId: req.query.slotId,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate) : undefined
    };
    const result = await ad_service_1.adService.listCampaigns(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/campaigns/my-campaigns', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const result = await ad_service_1.adService.listCampaigns({ advertiserId: req.user.id }, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/campaigns/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const campaign = await ad_service_1.adService.getCampaignById(req.params.id);
    (0, response_1.successResponse)(res, campaign);
}));
router.post('/campaigns', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(ad_schema_1.createCampaignSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const campaign = await ad_service_1.adService.createCampaign(req.body);
    (0, response_1.createdResponse)(res, campaign, 'تم إنشاء الحملة');
}));
router.put('/campaigns/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(ad_schema_1.updateCampaignSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const campaign = await ad_service_1.adService.updateCampaign(req.params.id, req.body);
    (0, response_1.successResponse)(res, campaign, 'تم تحديث الحملة');
}));
router.put('/campaigns/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { status, reason } = req.body;
    let campaign;
    if (status === 'ACTIVE') {
        campaign = await ad_service_1.adService.approveCampaign(req.params.id);
    }
    else if (status === 'REJECTED') {
        campaign = await ad_service_1.adService.rejectCampaign(req.params.id, reason);
    }
    else if (status === 'PAUSED') {
        campaign = await ad_service_1.adService.pauseCampaign(req.params.id);
    }
    else {
        campaign = await ad_service_1.adService.updateCampaign(req.params.id, { status });
    }
    (0, response_1.successResponse)(res, campaign, 'تم تحديث حالة الحملة');
}));
router.put('/campaigns/:id/resume', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const campaign = await ad_service_1.adService.resumeCampaign(req.params.id);
    (0, response_1.successResponse)(res, campaign, 'تم استئناف الحملة');
}));
router.delete('/campaigns/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await ad_service_1.adService.deleteCampaign(req.params.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.post('/campaigns/:id/track-impression', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await ad_service_1.adService.recordImpression(req.params.id);
    (0, response_1.successResponse)(res, null, 'تم تسجيل المشاهدة');
}));
router.post('/campaigns/:id/track-click', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await ad_service_1.adService.recordClick(req.params.id);
    (0, response_1.successResponse)(res, result);
}));
router.get('/slots/:id/active-campaigns', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const campaigns = await ad_service_1.adService.getActiveCampaignsForSlot(req.params.id);
    (0, response_1.successResponse)(res, campaigns);
}));
exports.default = router;
//# sourceMappingURL=ad.routes.js.map