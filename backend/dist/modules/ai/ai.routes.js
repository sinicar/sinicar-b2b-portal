"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_service_1 = require("./ai.service");
const router = (0, express_1.Router)();
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory, language, customerName } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const previousMessages = conversationHistory || [];
        const response = await ai_service_1.aiService.customerServiceAssistant(message, {
            language: language || 'ar',
            previousMessages,
            customerName
        });
        res.json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'AI service error'
        });
    }
});
router.post('/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text || !targetLang) {
            return res.status(400).json({ error: 'Text and targetLang are required' });
        }
        const translation = await ai_service_1.aiService.translateText(text, targetLang);
        res.json({
            success: true,
            translation,
            originalText: text,
            targetLang
        });
    }
    catch (error) {
        console.error('Translation Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Translation error'
        });
    }
});
router.post('/decode-vin', async (req, res) => {
    try {
        const { vin } = req.body;
        if (!vin) {
            return res.status(400).json({ error: 'VIN is required' });
        }
        const vehicleInfo = await ai_service_1.aiService.decodeVIN(vin);
        res.json({
            success: true,
            vin,
            vehicleInfo
        });
    }
    catch (error) {
        console.error('VIN Decode Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'VIN decode error'
        });
    }
});
router.post('/analyze-product', async (req, res) => {
    try {
        const { productInfo } = req.body;
        if (!productInfo) {
            return res.status(400).json({ error: 'Product info is required' });
        }
        const analysis = await ai_service_1.aiService.analyzeProduct(productInfo);
        res.json({
            success: true,
            analysis
        });
    }
    catch (error) {
        console.error('Product Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Product analysis error'
        });
    }
});
router.post('/analyze-pricing', async (req, res) => {
    try {
        const { productName, currentPrice, marketPrices } = req.body;
        if (!productName || currentPrice === undefined || !marketPrices) {
            return res.status(400).json({ error: 'Product name, current price, and market prices are required' });
        }
        const analysis = await ai_service_1.aiService.analyzePricing(productName, currentPrice, marketPrices);
        res.json({
            success: true,
            analysis,
            productName,
            currentPrice,
            marketPrices
        });
    }
    catch (error) {
        console.error('Pricing Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Pricing analysis error'
        });
    }
});
router.post('/match-parts', async (req, res) => {
    try {
        const { searchQuery, availableParts } = req.body;
        if (!searchQuery || !availableParts) {
            return res.status(400).json({ error: 'Search query and available parts are required' });
        }
        const matches = await ai_service_1.aiService.matchParts(searchQuery, availableParts);
        res.json({
            success: true,
            searchQuery,
            matches
        });
    }
    catch (error) {
        console.error('Part Matching Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Part matching error'
        });
    }
});
router.post('/generate-description', async (req, res) => {
    try {
        const { name, brand, category, specifications } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Product name is required' });
        }
        const description = await ai_service_1.aiService.generateProductDescription({
            name,
            brand,
            category,
            specifications
        });
        res.json({
            success: true,
            description
        });
    }
    catch (error) {
        console.error('Description Generation Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Description generation error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.routes.js.map