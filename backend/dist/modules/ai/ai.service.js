"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const openai_1 = __importDefault(require("openai"));
class AIService {
    openaiClient;
    constructor() {
        this.openaiClient = new openai_1.default({
            baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
            apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
        });
    }
    async chat(messages, options = {}) {
        const { model = 'gpt-4o-mini', maxTokens = 4096, systemPrompt } = options;
        const allMessages = [];
        if (systemPrompt) {
            allMessages.push({ role: 'system', content: systemPrompt });
        }
        allMessages.push(...messages.map(m => ({
            role: m.role,
            content: m.content
        })));
        try {
            const response = await this.openaiClient.chat.completions.create({
                model,
                messages: allMessages,
                max_completion_tokens: maxTokens,
            });
            return {
                content: response.choices[0]?.message?.content || '',
                tokensUsed: response.usage?.total_tokens,
                model,
                provider: 'openai'
            };
        }
        catch (error) {
            console.error('AI Chat Error:', error.message);
            throw new Error(`AI service error: ${error.message}`);
        }
    }
    async simpleChat(prompt, systemPrompt) {
        const result = await this.chat([{ role: 'user', content: prompt }], { systemPrompt });
        return result.content;
    }
    async analyzeProduct(productInfo) {
        const systemPrompt = `أنت مساعد ذكي متخصص في قطع غيار السيارات. قم بتحليل المعلومات المقدمة وقدم نصائح مفيدة باللغة العربية.
You are an intelligent assistant specializing in auto parts. Analyze the provided information and give helpful advice.`;
        return this.simpleChat(productInfo, systemPrompt);
    }
    async translateText(text, targetLang) {
        const langNames = {
            ar: 'Arabic',
            en: 'English',
            hi: 'Hindi',
            zh: 'Chinese'
        };
        const systemPrompt = `You are a professional translator. Translate the text to ${langNames[targetLang] || targetLang}. Only output the translation, nothing else.`;
        return this.simpleChat(text, systemPrompt);
    }
    async matchParts(searchQuery, availableParts) {
        const systemPrompt = `You are an auto parts matching expert. Given a search query and a list of available parts, return the most relevant matches as a JSON array of part names. Only output valid JSON.`;
        const prompt = `Search Query: ${searchQuery}\n\nAvailable Parts:\n${availableParts.join('\n')}\n\nReturn matching parts as JSON array:`;
        try {
            const result = await this.simpleChat(prompt, systemPrompt);
            return JSON.parse(result);
        }
        catch {
            return [];
        }
    }
    async decodeVIN(vin) {
        const systemPrompt = `You are a VIN (Vehicle Identification Number) decoder expert. Decode the provided VIN and return vehicle information as a JSON object with keys: make, model, year, engine, country, bodyStyle. Only output valid JSON.`;
        try {
            const result = await this.simpleChat(`Decode this VIN: ${vin}`, systemPrompt);
            return JSON.parse(result);
        }
        catch {
            return { error: 'Unable to decode VIN' };
        }
    }
    async analyzePricing(productName, currentPrice, marketPrices) {
        const systemPrompt = `أنت محلل أسعار متخصص في سوق قطع غيار السيارات. قدم تحليلاً موجزاً للأسعار مع توصيات.
You are a pricing analyst specializing in the auto parts market. Provide a brief price analysis with recommendations.`;
        const prompt = `Product: ${productName}
Current Price: $${currentPrice}
Market Prices: ${marketPrices.map(p => '$' + p).join(', ')}

Provide analysis:`;
        return this.simpleChat(prompt, systemPrompt);
    }
    async generateProductDescription(productInfo) {
        const systemPrompt = `You are a professional product copywriter for an auto parts B2B platform. Generate compelling product descriptions that are informative and professional. Include key specifications and benefits.`;
        const prompt = `Generate a product description for:
Name: ${productInfo.name}
Brand: ${productInfo.brand || 'N/A'}
Category: ${productInfo.category || 'N/A'}
Specifications: ${JSON.stringify(productInfo.specifications || {})}`;
        return this.simpleChat(prompt, systemPrompt);
    }
    async customerServiceAssistant(customerMessage, context = {}) {
        const { language = 'ar', previousMessages = [], customerName } = context;
        const systemPrompt = language === 'ar'
            ? `أنت مساعد خدمة عملاء ودود ومحترف لمنصة SINI CAR لقطع غيار السيارات B2B. 
ساعد العملاء في استفساراتهم حول المنتجات والطلبات والشحن.
${customerName ? `اسم العميل: ${customerName}` : ''}
كن مختصراً ومفيداً.`
            : `You are a friendly and professional customer service assistant for SINI CAR B2B auto parts platform.
Help customers with their inquiries about products, orders, and shipping.
${customerName ? `Customer name: ${customerName}` : ''}
Be concise and helpful.`;
        const messages = [
            ...previousMessages,
            { role: 'user', content: customerMessage }
        ];
        const result = await this.chat(messages, { systemPrompt });
        return result.content;
    }
}
exports.aiService = new AIService();
exports.default = exports.aiService;
//# sourceMappingURL=ai.service.js.map