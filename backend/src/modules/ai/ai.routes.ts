import { Router, Request, Response } from 'express';
import { aiService, AIMessage } from './ai.service';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, language, customerName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const previousMessages: AIMessage[] = conversationHistory || [];

    const response = await aiService.customerServiceAssistant(message, {
      language: language || 'ar',
      previousMessages,
      customerName
    });

    res.json({ 
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'AI service error' 
    });
  }
});

router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Text and targetLang are required' });
    }

    const translation = await aiService.translateText(text, targetLang);

    res.json({ 
      success: true,
      translation,
      originalText: text,
      targetLang
    });
  } catch (error: any) {
    console.error('Translation Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Translation error' 
    });
  }
});

router.post('/decode-vin', async (req: Request, res: Response) => {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({ error: 'VIN is required' });
    }

    const vehicleInfo = await aiService.decodeVIN(vin);

    res.json({ 
      success: true,
      vin,
      vehicleInfo
    });
  } catch (error: any) {
    console.error('VIN Decode Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'VIN decode error' 
    });
  }
});

router.post('/analyze-product', async (req: Request, res: Response) => {
  try {
    const { productInfo } = req.body;

    if (!productInfo) {
      return res.status(400).json({ error: 'Product info is required' });
    }

    const analysis = await aiService.analyzeProduct(productInfo);

    res.json({ 
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Product Analysis Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Product analysis error' 
    });
  }
});

router.post('/analyze-pricing', async (req: Request, res: Response) => {
  try {
    const { productName, currentPrice, marketPrices } = req.body;

    if (!productName || currentPrice === undefined || !marketPrices) {
      return res.status(400).json({ error: 'Product name, current price, and market prices are required' });
    }

    const analysis = await aiService.analyzePricing(productName, currentPrice, marketPrices);

    res.json({ 
      success: true,
      analysis,
      productName,
      currentPrice,
      marketPrices
    });
  } catch (error: any) {
    console.error('Pricing Analysis Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Pricing analysis error' 
    });
  }
});

router.post('/match-parts', async (req: Request, res: Response) => {
  try {
    const { searchQuery, availableParts } = req.body;

    if (!searchQuery || !availableParts) {
      return res.status(400).json({ error: 'Search query and available parts are required' });
    }

    const matches = await aiService.matchParts(searchQuery, availableParts);

    res.json({ 
      success: true,
      searchQuery,
      matches
    });
  } catch (error: any) {
    console.error('Part Matching Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Part matching error' 
    });
  }
});

router.post('/generate-description', async (req: Request, res: Response) => {
  try {
    const { name, brand, category, specifications } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const description = await aiService.generateProductDescription({
      name,
      brand,
      category,
      specifications
    });

    res.json({ 
      success: true,
      description
    });
  } catch (error: any) {
    console.error('Description Generation Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Description generation error' 
    });
  }
});

export default router;
