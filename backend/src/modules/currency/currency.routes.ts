import { Router, Request, Response } from 'express';
import { currencyService } from './currency.service';
import { successResponse, errorResponse } from '../../utils/response';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const currencies = await currencyService.getAllCurrencies();
    return successResponse(res, currencies, 'Currencies retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/base', async (req: Request, res: Response) => {
  try {
    const baseCurrency = await currencyService.getBaseCurrency();
    if (!baseCurrency) {
      return errorResponse(res, 'Base currency not configured', 404);
    }
    return successResponse(res, baseCurrency, 'Base currency retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.get('/rate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const rate = await currencyService.getExchangeRate(code);
    if (!rate) {
      return errorResponse(res, `Exchange rate not found for ${code}`, 404);
    }
    return successResponse(res, rate, 'Exchange rate retrieved');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.body;
    if (!amount || !from || !to) {
      return errorResponse(res, 'Amount, from, and to currencies are required', 400);
    }
    const result = await currencyService.convert(Number(amount), from, to);
    return successResponse(res, result, 'Conversion successful');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const currency = await currencyService.createCurrency(req.body);
    return successResponse(res, currency, 'Currency created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

router.put('/rate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { rateToBase, syncPercent, updatedBy } = req.body;
    
    if (rateToBase === undefined) {
      return errorResponse(res, 'rateToBase is required', 400);
    }
    
    const rate = await currencyService.updateExchangeRate(
      code, 
      Number(rateToBase), 
      syncPercent ? Number(syncPercent) : 100,
      updatedBy
    );
    return successResponse(res, rate, 'Exchange rate updated successfully');
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
});

export default router;
