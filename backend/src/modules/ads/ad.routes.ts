import { Router } from 'express';
import { adService } from './ad.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';
import {
  createAdvertiserSchema,
  updateAdvertiserSchema,
  addBalanceSchema,
  createAdSlotSchema,
  updateAdSlotSchema,
  createCampaignSchema,
  updateCampaignSchema
} from '../../schemas/ad.schema';

const router = Router();

router.get('/stats', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const stats = await adService.getStats();
  successResponse(res, stats);
}));

router.get('/slots', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const pagination = parsePaginationParams(req.query);
  const result = await adService.listSlots(isActive, pagination);
  if (Array.isArray(result)) {
    successResponse(res, result);
  } else {
    paginatedResponse(res, result);
  }
}));

router.get('/slots/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const slot = await adService.getSlotById(req.params.id);
  successResponse(res, slot);
}));

router.post('/slots', authMiddleware, adminOnly, validate(createAdSlotSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const slot = await adService.createSlot(req.body);
  createdResponse(res, slot, 'تم إنشاء موقع الإعلان');
}));

router.put('/slots/:id', authMiddleware, adminOnly, validate(updateAdSlotSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const slot = await adService.updateSlot(req.params.id, req.body);
  successResponse(res, slot, 'تم تحديث موقع الإعلان');
}));

router.delete('/slots/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await adService.deleteSlot(req.params.id);
  successResponse(res, result, result.message);
}));

router.get('/advertisers', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    status: req.query.status as any,
    search: req.query.search as string
  };
  const result = await adService.listAdvertisers(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/advertisers/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const advertiser = await adService.getAdvertiserById(req.params.id);
  successResponse(res, advertiser);
}));

router.post('/advertisers', authMiddleware, validate(createAdvertiserSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const advertiser = await adService.createAdvertiser(req.body);
  createdResponse(res, advertiser, 'تم إنشاء حساب المعلن');
}));

router.put('/advertisers/:id', authMiddleware, validate(updateAdvertiserSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const advertiser = await adService.updateAdvertiser(req.params.id, req.body);
  successResponse(res, advertiser, 'تم تحديث بيانات المعلن');
}));

router.post('/advertisers/:id/balance', authMiddleware, adminOnly, validate(addBalanceSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const advertiser = await adService.addBalance(req.params.id, req.body);
  successResponse(res, advertiser, 'تم إضافة الرصيد');
}));

router.delete('/advertisers/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await adService.deleteAdvertiser(req.params.id);
  successResponse(res, result, result.message);
}));

router.get('/campaigns', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    status: req.query.status as any,
    advertiserId: req.query.advertiserId as string,
    slotId: req.query.slotId as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined
  };
  const result = await adService.listCampaigns(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/campaigns/my-campaigns', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await adService.listCampaigns({ advertiserId: req.user!.id }, pagination);
  paginatedResponse(res, result);
}));

router.get('/campaigns/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const campaign = await adService.getCampaignById(req.params.id);
  successResponse(res, campaign);
}));

router.post('/campaigns', authMiddleware, validate(createCampaignSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const campaign = await adService.createCampaign(req.body);
  createdResponse(res, campaign, 'تم إنشاء الحملة');
}));

router.put('/campaigns/:id', authMiddleware, validate(updateCampaignSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const campaign = await adService.updateCampaign(req.params.id, req.body);
  successResponse(res, campaign, 'تم تحديث الحملة');
}));

router.put('/campaigns/:id/status', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { status, reason } = req.body;
  let campaign;
  
  if (status === 'ACTIVE') {
    campaign = await adService.approveCampaign(req.params.id);
  } else if (status === 'REJECTED') {
    campaign = await adService.rejectCampaign(req.params.id, reason);
  } else if (status === 'PAUSED') {
    campaign = await adService.pauseCampaign(req.params.id);
  } else {
    campaign = await adService.updateCampaign(req.params.id, { status });
  }
  
  successResponse(res, campaign, 'تم تحديث حالة الحملة');
}));

router.put('/campaigns/:id/resume', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const campaign = await adService.resumeCampaign(req.params.id);
  successResponse(res, campaign, 'تم استئناف الحملة');
}));

router.delete('/campaigns/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await adService.deleteCampaign(req.params.id);
  successResponse(res, result, result.message);
}));

router.post('/campaigns/:id/track-impression', asyncHandler(async (req: any, res: any) => {
  await adService.recordImpression(req.params.id);
  successResponse(res, null, 'تم تسجيل المشاهدة');
}));

router.post('/campaigns/:id/track-click', asyncHandler(async (req: any, res: any) => {
  const result = await adService.recordClick(req.params.id);
  successResponse(res, result);
}));

router.get('/slots/:id/active-campaigns', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const campaigns = await adService.getActiveCampaignsForSlot(req.params.id);
  successResponse(res, campaigns);
}));

// Get active campaigns for current user
router.get('/campaigns/active-for-user', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  // Return empty array - no active campaigns for user by default
  successResponse(res, []);
}));

router.get('/campaigns/user/:userId', asyncHandler(async (req: any, res: any) => {
  // Stub - return empty campaigns for user
  res.json({
    success: true,
    data: []
  });
}));

export default router;
