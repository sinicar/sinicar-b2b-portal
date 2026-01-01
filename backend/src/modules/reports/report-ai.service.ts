import OpenAI from 'openai';
import { prisma } from '../../lib/prisma';

// Using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own API key.
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = apiKey && !apiKey.includes('placeholder') ? new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: apiKey
}) : null;

const isAIConfigured = !!openai;

export type AIPromptType = 'SUMMARY' | 'INSIGHTS';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

interface CacheEntry {
  aiText: string;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCacheKey(userId: string, reportCode: string, filtersSummary: string, mode: AIPromptType): string {
  return `${userId}:${reportCode}:${filtersSummary}:${mode}`;
}

function checkRateLimitAllowed(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now >= entry.resetAt) {
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetAt - now };
}

function incrementRateLimit(userId: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count++;
  }
}

function checkCache(cacheKey: string): string | null {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.aiText;
  }
  if (cached) {
    responseCache.delete(cacheKey);
  }
  return null;
}

function setCache(cacheKey: string, aiText: string): void {
  responseCache.set(cacheKey, {
    aiText,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

function prepareCompactSummary(reportData: any): string {
  if (!reportData) return 'No data available';

  const summary: string[] = [];

  if (reportData.summary) {
    const s = reportData.summary;
    if (s.totalOrders !== undefined) summary.push(`Total Orders: ${s.totalOrders}`);
    if (s.totalRevenue !== undefined) summary.push(`Total Revenue: ${s.totalRevenue} SAR`);
    if (s.averageOrderValue !== undefined) summary.push(`Avg Order Value: ${s.averageOrderValue} SAR`);
    if (s.conversionRate !== undefined) summary.push(`Conversion Rate: ${s.conversionRate}%`);
    if (s.totalQuotes !== undefined) summary.push(`Total Quotes: ${s.totalQuotes}`);
    if (s.totalSuppliers !== undefined) summary.push(`Total Suppliers: ${s.totalSuppliers}`);
    if (s.totalProducts !== undefined) summary.push(`Total Products: ${s.totalProducts}`);
    if (s.totalValue !== undefined) summary.push(`Total Value: ${s.totalValue} SAR`);
  }

  if (reportData.breakdown && Array.isArray(reportData.breakdown)) {
    const topItems = reportData.breakdown.slice(0, 5);
    if (topItems.length > 0) {
      summary.push('Top Items:');
      topItems.forEach((item: any) => {
        const label = item.status || item.category || item.type || item.name || 'Item';
        const count = item.count || item.quantity || item.value || 0;
        summary.push(`  - ${label}: ${count}`);
      });
    }
  }

  if (reportData.metadata) {
    if (reportData.metadata.rowCount !== undefined) {
      summary.push(`Total Records: ${reportData.metadata.rowCount}`);
    }
  }

  return summary.length > 0 ? summary.join('\n') : JSON.stringify(reportData).slice(0, 500);
}

function buildPrompt(mode: AIPromptType, reportCode: string, dataSummary: string): string {
  const context = `Report: ${reportCode}\nData Summary:\n${dataSummary}`;

  if (mode === 'SUMMARY') {
    return `أنت محلل بيانات أعمال. قدم ملخصاً موجزاً وواضحاً بالعربية (3-5 جمل) لبيانات التقرير التالي:

${context}

الملخص:`;
  }

  return `أنت محلل بيانات أعمال خبير. قدم 3-5 رؤى تحليلية مهمة بالعربية حول بيانات التقرير التالي. ركز على الاتجاهات والفرص والتوصيات العملية:

${context}

الرؤى التحليلية:`;
}

export class ReportAIService {
  async analyzeReport(
    reportCode: string,
    reportData: any,
    filters: Record<string, any>,
    mode: AIPromptType,
    userId: string
  ): Promise<{ success: boolean; aiText?: string; error?: string; cached?: boolean; rateLimited?: boolean }> {
    const startTime = Date.now();
    const filtersSummary = this.summarizeFilters(filters);
    const cacheKey = getCacheKey(userId, reportCode, filtersSummary, mode);

    const cachedResponse = checkCache(cacheKey);
    if (cachedResponse) {
      return { success: true, aiText: cachedResponse, cached: true };
    }

    const rateLimitCheck = checkRateLimitAllowed(userId);
    if (!rateLimitCheck.allowed) {
      const resetMinutes = Math.ceil(rateLimitCheck.resetIn / 60000);
      return {
        success: false,
        error: `تم تجاوز الحد الأقصى للتحليلات. يرجى المحاولة بعد ${resetMinutes} دقيقة.`,
        rateLimited: true
      };
    }

    incrementRateLimit(userId);

    try {
      if (!openai) {
        return {
          success: false,
          error: 'خدمة التحليل بالذكاء الاصطناعي غير متاحة. يرجى تكوين مفتاح OpenAI API.'
        };
      }

      const dataSummary = prepareCompactSummary(reportData);
      const prompt = buildPrompt(mode, reportCode, dataSummary);

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 1024,
      });

      const aiText = response.choices[0]?.message?.content || 'لم يتم الحصول على نتيجة من التحليل';
      const durationMs = Date.now() - startTime;

      setCache(cacheKey, aiText);

      await this.logAnalysis(reportCode, userId, filtersSummary, mode, aiText, durationMs);

      return { success: true, aiText, cached: false };
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      const durationMs = Date.now() - startTime;

      await this.logAnalysis(reportCode, userId, filtersSummary, mode, null, durationMs);

      return {
        success: false,
        error: error.message || 'فشل في تحليل التقرير'
      };
    }
  }

  private summarizeFilters(filters: Record<string, any>): string {
    const entries = Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '');
    if (entries.length === 0) return 'no_filters';

    const summary = entries.map(([k, v]) => `${k}=${v}`).join(',');
    return summary.length > 200 ? summary.substring(0, 197) + '...' : summary;
  }

  private async logAnalysis(
    reportCode: string,
    userId: string,
    filtersSummary: string,
    aiPromptType: AIPromptType,
    aiResponse: string | null,
    durationMs: number
  ): Promise<void> {
    try {
      await prisma.reportAIAnalysisLog.create({
        data: {
          reportCode,
          userId,
          filtersSummary,
          aiPromptType,
          aiResponse,
          durationMs
        }
      });
    } catch (e) {
      console.error('Failed to log AI analysis:', e);
    }
  }

  async getAnalysisLogs(reportCode?: string, limit: number = 50): Promise<any[]> {
    return prisma.reportAIAnalysisLog.findMany({
      where: reportCode ? { reportCode } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

export const reportAIService = new ReportAIService();
