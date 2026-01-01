/**
 * AI SEO Service for SINI CAR B2B Portal
 * Ready for API integration - just add your API key
 * 
 * Supports: OpenAI, Google Gemini, or custom API
 */

import { STORAGE_KEYS } from './storage-keys';

// ============================================================================
// Types
// ============================================================================

export type AIProvider = 'openai' | 'gemini' | 'custom' | 'mock';

export interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    model: string;
    baseUrl?: string; // For custom API
    enabled: boolean;
}

export interface AIGenerationRequest {
    type: 'title' | 'description' | 'keywords' | 'og_text' | 'schema';
    context: {
        pageType?: string;
        businessName?: string;
        industry?: string;
        language?: 'ar' | 'en';
        currentContent?: string;
    };
}

export interface AIGenerationResponse {
    success: boolean;
    result?: string;
    suggestions?: string[];
    error?: string;
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_AI_CONFIG: AIConfig = {
    provider: 'mock',
    apiKey: '',
    model: 'gpt-4',
    enabled: false
};

// ============================================================================
// Storage Key for AI Config
// ============================================================================

const AI_SEO_CONFIG_KEY = 'sini_ai_seo_config';

// ============================================================================
// AI SEO Service
// ============================================================================

export const AISEOService = {
    // ==========================================================================
    // Configuration
    // ==========================================================================

    /**
     * Get AI configuration
     */
    getConfig(): AIConfig {
        const stored = localStorage.getItem(AI_SEO_CONFIG_KEY);
        if (stored) {
            try {
                return { ...DEFAULT_AI_CONFIG, ...JSON.parse(stored) };
            } catch {
                return DEFAULT_AI_CONFIG;
            }
        }
        return DEFAULT_AI_CONFIG;
    },

    /**
     * Save AI configuration
     */
    saveConfig(config: Partial<AIConfig>): AIConfig {
        const current = this.getConfig();
        const updated = { ...current, ...config };
        localStorage.setItem(AI_SEO_CONFIG_KEY, JSON.stringify(updated));
        return updated;
    },

    /**
     * Check if AI is configured and ready
     */
    isReady(): boolean {
        const config = this.getConfig();
        return config.enabled && config.apiKey.length > 0;
    },

    // ==========================================================================
    // Generation Methods
    // ==========================================================================

    /**
     * Generate SEO title using AI
     */
    async generateTitle(context: AIGenerationRequest['context']): Promise<AIGenerationResponse> {
        const prompt = this.buildTitlePrompt(context);
        return this.callAI(prompt, 'title');
    },

    /**
     * Generate SEO description using AI
     */
    async generateDescription(context: AIGenerationRequest['context']): Promise<AIGenerationResponse> {
        const prompt = this.buildDescriptionPrompt(context);
        return this.callAI(prompt, 'description');
    },

    /**
     * Generate keywords using AI
     */
    async generateKeywords(context: AIGenerationRequest['context']): Promise<AIGenerationResponse> {
        const prompt = this.buildKeywordsPrompt(context);
        return this.callAI(prompt, 'keywords');
    },

    /**
     * Generate Open Graph text using AI
     */
    async generateOGText(context: AIGenerationRequest['context']): Promise<AIGenerationResponse> {
        const prompt = this.buildOGPrompt(context);
        return this.callAI(prompt, 'og_text');
    },

    /**
     * Generate Schema.org JSON-LD using AI
     */
    async generateSchema(context: AIGenerationRequest['context']): Promise<AIGenerationResponse> {
        const prompt = this.buildSchemaPrompt(context);
        return this.callAI(prompt, 'schema');
    },

    // ==========================================================================
    // Prompt Builders
    // ==========================================================================

    buildTitlePrompt(context: AIGenerationRequest['context']): string {
        const lang = context.language === 'ar' ? 'Arabic' : 'English';
        return `Generate an SEO-optimized title for a ${context.pageType || 'business'} page.
Business: ${context.businessName || 'SINI CAR'}
Industry: ${context.industry || 'Auto Parts Wholesale'}
Language: ${lang}
Current content: ${context.currentContent || 'N/A'}

Requirements:
- Maximum 60 characters
- Include primary keyword
- Be compelling and clickable
- ${lang === 'Arabic' ? 'Write in Arabic' : 'Write in English'}

Return only the title, no explanation.`;
    },

    buildDescriptionPrompt(context: AIGenerationRequest['context']): string {
        const lang = context.language === 'ar' ? 'Arabic' : 'English';
        return `Generate an SEO-optimized meta description for a ${context.pageType || 'business'} page.
Business: ${context.businessName || 'SINI CAR'}
Industry: ${context.industry || 'Auto Parts Wholesale'}
Language: ${lang}
Current content: ${context.currentContent || 'N/A'}

Requirements:
- Maximum 160 characters
- Include call-to-action
- Be informative and compelling
- ${lang === 'Arabic' ? 'Write in Arabic' : 'Write in English'}

Return only the description, no explanation.`;
    },

    buildKeywordsPrompt(context: AIGenerationRequest['context']): string {
        const lang = context.language === 'ar' ? 'Arabic' : 'English';
        return `Generate SEO keywords for a ${context.pageType || 'business'} page.
Business: ${context.businessName || 'SINI CAR'}
Industry: ${context.industry || 'Auto Parts Wholesale'}
Language: ${lang}

Requirements:
- Return 10-15 relevant keywords
- Mix of short-tail and long-tail keywords
- Include location-based keywords if applicable
- ${lang === 'Arabic' ? 'Write in Arabic' : 'Write in English'}
- Separate keywords with commas

Return only the keywords, no explanation.`;
    },

    buildOGPrompt(context: AIGenerationRequest['context']): string {
        const lang = context.language === 'ar' ? 'Arabic' : 'English';
        return `Generate Open Graph text for social media sharing.
Business: ${context.businessName || 'SINI CAR'}
Industry: ${context.industry || 'Auto Parts Wholesale'}
Language: ${lang}

Requirements:
- OG Title: max 60 chars, catchy for social media
- OG Description: max 200 chars, engaging

Format:
TITLE: [your title]
DESCRIPTION: [your description]`;
    },

    buildSchemaPrompt(context: AIGenerationRequest['context']): string {
        return `Generate a valid Schema.org JSON-LD for an Organization.
Business: ${context.businessName || 'SINI CAR'}
Industry: ${context.industry || 'Auto Parts Wholesale'}

Return only valid JSON-LD, no explanation.
Include: name, description, url, logo, contactPoint, address.`;
    },

    // ==========================================================================
    // API Caller
    // ==========================================================================

    async callAI(prompt: string, type: string): Promise<AIGenerationResponse> {
        const config = this.getConfig();

        // If not configured, return mock response
        if (!config.enabled || !config.apiKey) {
            return this.getMockResponse(type);
        }

        try {
            switch (config.provider) {
                case 'openai':
                    return await this.callOpenAI(prompt, config);
                case 'gemini':
                    return await this.callGemini(prompt, config);
                case 'custom':
                    return await this.callCustomAPI(prompt, config);
                default:
                    return this.getMockResponse(type);
            }
        } catch (error) {
            console.error('[AISEOService] API call failed:', error);
            return {
                success: false,
                error: `فشل الاتصال بـ AI: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    },

    // ==========================================================================
    // Provider-Specific Callers
    // ==========================================================================

    async callOpenAI(prompt: string, config: AIConfig): Promise<AIGenerationResponse> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model || 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are an SEO expert. Provide concise, optimized content.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content?.trim();

        return {
            success: true,
            result
        };
    },

    async callGemini(prompt: string, config: AIConfig): Promise<AIGenerationResponse> {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${config.model || 'gemini-pro'}:generateContent?key=${config.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API error');
        }

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        return {
            success: true,
            result
        };
    },

    async callCustomAPI(prompt: string, config: AIConfig): Promise<AIGenerationResponse> {
        if (!config.baseUrl) {
            throw new Error('Custom API URL not configured');
        }

        const response = await fetch(config.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Custom API error');
        }

        const data = await response.json();
        return {
            success: true,
            result: data.result || data.text || data.content
        };
    },

    // ==========================================================================
    // Mock Responses (for testing without API)
    // ==========================================================================

    getMockResponse(type: string): AIGenerationResponse {
        const mockResponses: Record<string, string> = {
            title: 'صيني كار - أكبر منصة لقطع غيار السيارات بالجملة في المملكة',
            description: 'اكتشف أوسع تشكيلة من قطع غيار السيارات الأصلية والبديلة بأسعار الجملة. توصيل سريع لجميع مناطق المملكة. تسجيل مجاني للتجار.',
            keywords: 'قطع غيار سيارات, جملة, تاجر, قطع غيار أصلية, قطع غيار صينية, توصيل سريع, أسعار منافسة, صيني كار, السعودية',
            og_text: 'TITLE: صيني كار | قطع غيار السيارات بأسعار الجملة\nDESCRIPTION: انضم لآلاف التجار واحصل على أفضل الأسعار لقطع غيار السيارات. توصيل سريع وضمان الجودة.',
            schema: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "SINI CAR",
                "url": "https://sinicar.com",
                "logo": "https://sinicar.com/logo.png",
                "description": "منصة قطع غيار السيارات بالجملة"
            }, null, 2)
        };

        return {
            success: true,
            result: mockResponses[type] || 'Content generated by AI',
            suggestions: [
                'اقتراح بديل 1',
                'اقتراح بديل 2',
                'اقتراح بديل 3'
            ]
        };
    }
};

export default AISEOService;
