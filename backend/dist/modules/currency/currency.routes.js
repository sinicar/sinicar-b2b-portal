"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currency_service_1 = require("./currency.service");
const response_1 = require("../../utils/response");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const currencies = await currency_service_1.currencyService.getAllCurrencies();
        return (0, response_1.successResponse)(res, currencies, 'Currencies retrieved successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/exchange-rates', async (req, res) => {
    try {
        const rates = await currency_service_1.currencyService.getAllExchangeRates();
        return (0, response_1.successResponse)(res, rates, 'Exchange rates retrieved successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/base', async (req, res) => {
    try {
        const baseCurrency = await currency_service_1.currencyService.getBaseCurrency();
        if (!baseCurrency) {
            return (0, response_1.errorResponse)(res, 'Base currency not configured', 404);
        }
        return (0, response_1.successResponse)(res, baseCurrency, 'Base currency retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.get('/rate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const rate = await currency_service_1.currencyService.getExchangeRate(code);
        if (!rate) {
            return (0, response_1.errorResponse)(res, `Exchange rate not found for ${code}`, 404);
        }
        return (0, response_1.successResponse)(res, rate, 'Exchange rate retrieved');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.body;
        if (!amount || !from || !to) {
            return (0, response_1.errorResponse)(res, 'Amount, from, and to currencies are required', 400);
        }
        const result = await currency_service_1.currencyService.convert(Number(amount), from, to);
        return (0, response_1.successResponse)(res, result, 'Conversion successful');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.post('/', async (req, res) => {
    try {
        const currency = await currency_service_1.currencyService.createCurrency(req.body);
        return (0, response_1.successResponse)(res, currency, 'Currency created successfully', 201);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
router.put('/rate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { rateToBase, syncPercent, updatedBy } = req.body;
        if (rateToBase === undefined) {
            return (0, response_1.errorResponse)(res, 'rateToBase is required', 400);
        }
        const rate = await currency_service_1.currencyService.updateExchangeRate(code, Number(rateToBase), syncPercent ? Number(syncPercent) : 100, updatedBy);
        return (0, response_1.successResponse)(res, rate, 'Exchange rate updated successfully');
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, error.message);
    }
});
exports.default = router;
//# sourceMappingURL=currency.routes.js.map