export type AIProvider = 'openai' | 'gemini' | 'anthropic';
export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface AICompletionOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
}
export interface AICompletionResult {
    content: string;
    tokensUsed?: number;
    model: string;
    provider: AIProvider;
}
declare class AIService {
    private openaiClient;
    constructor();
    chat(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResult>;
    simpleChat(prompt: string, systemPrompt?: string): Promise<string>;
    analyzeProduct(productInfo: string): Promise<string>;
    translateText(text: string, targetLang: string): Promise<string>;
    matchParts(searchQuery: string, availableParts: string[]): Promise<string[]>;
    decodeVIN(vin: string): Promise<Record<string, string>>;
    analyzePricing(productName: string, currentPrice: number, marketPrices: number[]): Promise<string>;
    generateProductDescription(productInfo: {
        name: string;
        brand?: string;
        category?: string;
        specifications?: Record<string, string>;
    }): Promise<string>;
    customerServiceAssistant(customerMessage: string, context?: {
        language?: string;
        previousMessages?: AIMessage[];
        customerName?: string;
    }): Promise<string>;
}
export declare const aiService: AIService;
export default aiService;
//# sourceMappingURL=ai.service.d.ts.map