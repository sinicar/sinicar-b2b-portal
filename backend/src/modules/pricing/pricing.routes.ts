import { Router, Request, Response } from 'express';
import { pricingService } from './pricing.service';
import { successResponse, errorResponse } from '../../utils/response';

const router = Router();

router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { supplierId, supplierCurrency, supplierPrice, customerCurrency, qualityCodeId } = req.body;
    
    if (!supplierId || !supplierCurrency || supplierPrice === undefined) {
      return errorResponse(res, 'supplierId, supplierCurrency, and supplierPrice are required', 400);
    }

    const result = await pricingService.calculateSellPrice({
      supplierId,
      supplierCurrency,
      supplierPrice: Number(supplierPrice),
      customerCurrency,
      qualityCodeId
    });

    return successResponse(res, result, 'Price calculated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/shipping', async (req: Request, res: Response) => {
  try {
    const { shippingMethodCode, weightKg, destinationCountry, currency } = req.body;
    
    if (!shippingMethodCode || weightKg === undefined || !destinationCountry) {
      return errorResponse(res, 'shippingMethodCode, weightKg, and destinationCountry are required', 400);
    }

    const result = await pricingService.calculateShippingCost({
      shippingMethodCode,
      weightKg: Number(weightKg),
      destinationCountry,
      currency
    });

    return successResponse(res, result, 'Shipping cost calculated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/supplier-groups', async (req: Request, res: Response) => {
  try {
    const groups = await pricingService.getSupplierGroups();
    return successResponse(res, groups, 'Supplier groups retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/supplier-groups', async (req: Request, res: Response) => {
  try {
    const group = await pricingService.createSupplierGroup(req.body);
    return successResponse(res, group, 'Supplier group created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/supplier-groups/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await pricingService.updateSupplierGroup(id, req.body);
    return successResponse(res, group, 'Supplier group updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/supplier-groups/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pricingService.deleteSupplierGroup(id);
    return successResponse(res, null, 'Supplier group deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/quality-codes', async (req: Request, res: Response) => {
  try {
    const codes = await pricingService.getQualityCodes();
    return successResponse(res, codes, 'Quality codes retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/quality-codes', async (req: Request, res: Response) => {
  try {
    const code = await pricingService.createQualityCode(req.body);
    return successResponse(res, code, 'Quality code created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/quality-codes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const code = await pricingService.updateQualityCode(id, req.body);
    return successResponse(res, code, 'Quality code updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/quality-codes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pricingService.deleteQualityCode(id);
    return successResponse(res, null, 'Quality code deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/brand-codes', async (req: Request, res: Response) => {
  try {
    const codes = await pricingService.getBrandCodes();
    return successResponse(res, codes, 'Brand codes retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/brand-codes', async (req: Request, res: Response) => {
  try {
    const code = await pricingService.createBrandCode(req.body);
    return successResponse(res, code, 'Brand code created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/brand-codes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const code = await pricingService.updateBrandCode(id, req.body);
    return successResponse(res, code, 'Brand code updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/brand-codes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pricingService.deleteBrandCode(id);
    return successResponse(res, null, 'Brand code deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/shipping-methods', async (req: Request, res: Response) => {
  try {
    const methods = await pricingService.getShippingMethods();
    return successResponse(res, methods, 'Shipping methods retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/shipping-methods', async (req: Request, res: Response) => {
  try {
    const method = await pricingService.createShippingMethod(req.body);
    return successResponse(res, method, 'Shipping method created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/shipping-methods/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const method = await pricingService.updateShippingMethod(id, req.body);
    return successResponse(res, method, 'Shipping method updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/shipping-methods/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pricingService.deleteShippingMethod(id);
    return successResponse(res, null, 'Shipping method deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/shipping-zones', async (req: Request, res: Response) => {
  try {
    const zones = await pricingService.getShippingZones();
    return successResponse(res, zones, 'Shipping zones retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/shipping-zones', async (req: Request, res: Response) => {
  try {
    const zone = await pricingService.createShippingZone(req.body);
    return successResponse(res, zone, 'Shipping zone created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/shipping-zones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const zone = await pricingService.updateShippingZone(id, req.body);
    return successResponse(res, zone, 'Shipping zone updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/shipping-zones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pricingService.deleteShippingZone(id);
    return successResponse(res, null, 'Shipping zone deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/roles', async (req: Request, res: Response) => {
  try {
    const roles = await pricingService.getRoles();
    return successResponse(res, roles, 'Roles retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/roles', async (req: Request, res: Response) => {
  try {
    const role = await pricingService.createRole(req.body);
    return successResponse(res, role, 'Role created', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await pricingService.updateRole(id, req.body);
    return successResponse(res, role, 'Role updated');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.delete('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pricingService.deleteRole(id);
    return successResponse(res, null, 'Role deleted');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

export default router;
