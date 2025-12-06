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

export default router;
