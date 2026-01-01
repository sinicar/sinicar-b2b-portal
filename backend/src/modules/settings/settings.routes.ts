import { Router, Request, Response } from 'express';
import { settingsService } from './settings.service';
import { successResponse, errorResponse } from '../../utils/response';

const router = Router();

// ✅ New: Get SiteSettings format (compatible with Frontend)
router.get('/site-settings', async (req: Request, res: Response) => {
  try {
    const siteSettings = await settingsService.getSiteSettings();
    return successResponse(res, siteSettings, 'Site settings retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// ✅ Banners endpoint (returns empty array for now - can be extended)
router.get('/banners', async (req: Request, res: Response) => {
  try {
    // TODO: Implement proper banners storage in database
    // For now, return empty array to prevent frontend errors
    return successResponse(res, [], 'Banners retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

// ✅ News endpoint (returns empty array for now)
router.get('/news', async (req: Request, res: Response) => {
  try {
    return successResponse(res, [], 'News retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const settings = await settingsService.getAllSettings(category as string);
    return successResponse(res, settings, 'Settings retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/:key', async (req: Request, res: Response) => {
  try {
    const setting = await settingsService.getSetting(req.params.key);
    if (!setting) {
      return errorResponse(res, 'Setting not found', 404);
    }
    return successResponse(res, setting, 'Setting retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/:key', async (req: Request, res: Response) => {
  try {
    const { value, updatedBy } = req.body;
    if (value === undefined) {
      return errorResponse(res, 'Value is required', 400);
    }
    const setting = await settingsService.setSetting(req.params.key, String(value), updatedBy);
    return successResponse(res, setting, 'Setting updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const setting = await settingsService.createSetting(req.body);
    return successResponse(res, setting, 'Setting created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/bulk/update', async (req: Request, res: Response) => {
  try {
    const { settings, updatedBy } = req.body;
    if (!Array.isArray(settings)) {
      return errorResponse(res, 'Settings must be an array', 400);
    }
    await settingsService.setSettingBulk(settings, updatedBy);
    return successResponse(res, null, 'Settings updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/features/flags', async (req: Request, res: Response) => {
  try {
    const flags = await settingsService.getAllFeatureFlags();
    return successResponse(res, flags, 'Feature flags retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/features/flags/:key', async (req: Request, res: Response) => {
  try {
    const flag = await settingsService.getFeatureFlag(req.params.key);
    if (!flag) {
      return errorResponse(res, 'Feature flag not found', 404);
    }
    return successResponse(res, flag, 'Feature flag retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/features/flags/:key', async (req: Request, res: Response) => {
  try {
    const { isEnabled, enabledFor } = req.body;
    const flag = await settingsService.setFeatureFlag(req.params.key, isEnabled, enabledFor);
    return successResponse(res, flag, 'Feature flag updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/quality-codes', async (req: Request, res: Response) => {
  try {
    const codes = await settingsService.getAllQualityCodes();
    return successResponse(res, codes, 'Quality codes retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/quality-codes', async (req: Request, res: Response) => {
  try {
    const code = await settingsService.createQualityCode(req.body);
    return successResponse(res, code, 'Quality code created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/quality-codes/:id', async (req: Request, res: Response) => {
  try {
    const code = await settingsService.updateQualityCode(req.params.id, req.body);
    return successResponse(res, code, 'Quality code updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/brand-codes', async (req: Request, res: Response) => {
  try {
    const codes = await settingsService.getAllBrandCodes();
    return successResponse(res, codes, 'Brand codes retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/brand-codes', async (req: Request, res: Response) => {
  try {
    const code = await settingsService.createBrandCode(req.body);
    return successResponse(res, code, 'Brand code created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/brand-codes/:id', async (req: Request, res: Response) => {
  try {
    const code = await settingsService.updateBrandCode(req.params.id, req.body);
    return successResponse(res, code, 'Brand code updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/shipping/methods', async (req: Request, res: Response) => {
  try {
    const methods = await settingsService.getAllShippingMethods();
    return successResponse(res, methods, 'Shipping methods retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/shipping/methods', async (req: Request, res: Response) => {
  try {
    const method = await settingsService.createShippingMethod(req.body);
    return successResponse(res, method, 'Shipping method created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/shipping/methods/:id', async (req: Request, res: Response) => {
  try {
    const method = await settingsService.updateShippingMethod(req.params.id, req.body);
    return successResponse(res, method, 'Shipping method updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/shipping/zones', async (req: Request, res: Response) => {
  try {
    const zones = await settingsService.getAllShippingZones();
    return successResponse(res, zones, 'Shipping zones retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/shipping/zones', async (req: Request, res: Response) => {
  try {
    const zone = await settingsService.createShippingZone(req.body);
    return successResponse(res, zone, 'Shipping zone created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/shipping/zones/:id', async (req: Request, res: Response) => {
  try {
    const zone = await settingsService.updateShippingZone(req.params.id, req.body);
    return successResponse(res, zone, 'Shipping zone updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/excel-templates', async (req: Request, res: Response) => {
  try {
    const templates = await settingsService.getAllExcelTemplates();
    return successResponse(res, templates, 'Excel templates retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/excel-templates/:id', async (req: Request, res: Response) => {
  try {
    const template = await settingsService.getExcelTemplate(req.params.id);
    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }
    return successResponse(res, template, 'Excel template retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/excel-templates', async (req: Request, res: Response) => {
  try {
    const template = await settingsService.createExcelTemplate(req.body);
    return successResponse(res, template, 'Excel template created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

export default router;
