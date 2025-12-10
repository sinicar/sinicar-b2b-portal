import type { UserRole } from './user';
import type { MultilingualText } from './common';

// ===========================================
// AI SETTINGS & INTEGRATION TYPES
// ===========================================

// AI Provider Types
export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'custom';

export type AIModelType = 
  | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4' | 'gpt-3.5-turbo'
  | 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-pro'
  | 'claude-sonnet-4-5' | 'claude-opus-4-5' | 'claude-haiku-4-5';

// AI Provider Configuration
export interface AIProviderConfig {
  id: string;
  provider: AIProvider;
  displayName: MultilingualText;
  enabled: boolean;
  isDefault: boolean;
  
  // API Configuration
  apiKey?: string;
  apiEndpoint?: string;
  model: AIModelType | string;
  
  // Rate Limiting
  maxTokens: number;
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
  
  // Features
  supportsChat: boolean;
  supportsImageGeneration: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  
  // Pricing Info
  inputTokenCost?: number;  // Cost per 1000 tokens
  outputTokenCost?: number;
}

// AI Feature Configuration - where AI can be used
export interface AIFeatureSettings {
  // Customer Portal AI Features
  enableAIAssistant: boolean;          // مساعد ذكي للعملاء
  enableAIProductSearch: boolean;      // بحث ذكي عن المنتجات
  enableAIPartMatching: boolean;       // مطابقة القطع بالذكاء الاصطناعي
  enableAIVinDecoding: boolean;        // فك رموز VIN
  enableAIPriceAnalysis: boolean;      // تحليل الأسعار
  enableAITranslation: boolean;        // ترجمة تلقائية
  
  // Admin AI Features
  enableAIOrderAnalysis: boolean;      // تحليل الطلبات
  enableAICustomerInsights: boolean;   // رؤى العملاء
  enableAIReports: boolean;            // تقارير ذكية
  enableAIFraudDetection: boolean;     // كشف الاحتيال
  enableAIInventoryPrediction: boolean;// توقع المخزون
  
  // Marketer/Affiliate AI Features
  enableAIContentGeneration: boolean;  // توليد المحتوى
  enableAICampaignOptimization: boolean; // تحسين الحملات
}

// AI Usage Limits per User Role
export interface AIUsageLimits {
  role: UserRole;
  dailyRequests: number;
  monthlyRequests: number;
  maxTokensPerRequest: number;
  allowedFeatures: string[];  // Feature keys from AIFeatureSettings
}

// AI Chat Message
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  provider?: AIProvider;
  model?: string;
  tokensUsed?: number;
}

// AI Conversation Session
export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIChatMessage[];
  provider: AIProvider;
  model: string;
  createdAt: string;
  updatedAt: string;
  totalTokensUsed: number;
}

// AI Usage Log Entry
export interface AIUsageLog {
  id: string;
  userId: string;
  provider: AIProvider;
  model: string;
  feature: string;  // Which AI feature was used
  inputTokens: number;
  outputTokens: number;
  cost?: number;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

// Complete AI Settings Configuration
export interface AISettings {
  id: string;
  
  // Global Settings
  enabled: boolean;
  defaultProvider: AIProvider;
  
  // Provider Configurations
  providers: AIProviderConfig[];
  
  // Feature Settings
  features: AIFeatureSettings;
  
  // Usage Limits by Role
  usageLimits: AIUsageLimits[];
  
  // System Prompts
  systemPrompts: {
    customerAssistant: MultilingualText;
    productSearch: MultilingualText;
    partMatching: MultilingualText;
  };
  
  // Safety & Moderation
  enableContentModeration: boolean;
  blockedTopics: string[];
  maxConversationLength: number;
  
  // Analytics
  trackUsage: boolean;
  trackCosts: boolean;
  
  // Metadata
  lastModifiedAt: string;
  lastModifiedBy?: string;
}

// ===========================================
// TRADER TOOLS STORAGE TYPES
// ===========================================

// Saved Price Comparison
export interface SavedPriceComparison {
  id: string;
  userId: string;
  name: string;
  description?: string;
  partNumber: string;
  partName: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    price: number;
    currency: string;
    availability: string;
    deliveryTime?: string;
    notes?: string;
  }[];
  bestPrice: number;
  averagePrice: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// Saved VIN Extraction
export interface SavedVinExtraction {
  id: string;
  userId: string;
  name: string;
  vin: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    engineType?: string;
    transmission?: string;
    bodyType?: string;
    country?: string;
    plantCode?: string;
  };
  extractedParts?: {
    partNumber: string;
    partName: string;
    category: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// Saved Quote Form Template
export interface SavedQuoteTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: {
    partNumber: string;
    partName: string;
    quantity: number;
    notes?: string;
  }[];
  defaultSuppliers?: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  usageCount: number;
}

// File Conversion History
export interface FileConversionRecord {
  id: string;
  userId: string;
  originalFileName: string;
  originalFileType: string;
  convertedFileType: string;
  fileSize: number;
  rowCount?: number;
  columnCount?: number;
  conversionDate: string;
  downloadUrl?: string;
  expiresAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}
