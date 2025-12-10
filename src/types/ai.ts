// ============================================
// AI TYPES
// ============================================

import type { MultilingualText } from './common';
import type { ExtendedUserRole } from './users';

// AI Provider Types
export type AIProvider = 
  | 'openai'      // OpenAI (GPT-4, GPT-3.5)
  | 'anthropic'   // Anthropic (Claude)
  | 'google'      // Google (Gemini)
  | 'azure'       // Azure OpenAI
  | 'local';      // Local/Custom models

// AI Model Configuration
export interface AIModelConfig {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  maxTokens: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// AI Provider Configuration
export interface AIProviderConfig {
  id: string;
  provider: AIProvider;
  displayName: string;
  apiKey?: string;          // Encrypted in storage
  apiEndpoint?: string;     // Custom endpoint for Azure/Local
  organizationId?: string;  // For OpenAI organization
  isActive: boolean;
  isDefault: boolean;
  models: AIModelConfig[];
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  lastVerifiedAt?: string;
  verificationStatus?: 'VALID' | 'INVALID' | 'UNKNOWN';
}

// AI Feature Configuration
export interface AIFeatureSettings {
  // Customer Chat Assistant
  customerAssistant: {
    enabled: boolean;
    provider: AIProvider;
    model: string;
    welcomeMessage: MultilingualText;
    maxMessagesPerSession: number;
    sessionTimeoutMinutes: number;
  };
  
  // Product Search Enhancement
  productSearch: {
    enabled: boolean;
    provider: AIProvider;
    model: string;
    useSemanticSearch: boolean;
    autoSuggestEnabled: boolean;
  };
  
  // Part Number Matching
  partMatching: {
    enabled: boolean;
    provider: AIProvider;
    model: string;
    confidenceThreshold: number;
    suggestAlternatives: boolean;
  };
  
  // Document Processing (OCR + AI)
  documentProcessing: {
    enabled: boolean;
    provider: AIProvider;
    model: string;
    supportedFormats: string[];
  };
  
  // Price Prediction
  pricePrediction: {
    enabled: boolean;
    provider: AIProvider;
    model: string;
    updateFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

// AI Usage Limits
export interface AIUsageLimits {
  role: ExtendedUserRole;
  dailyQueries: number;
  monthlyQueries: number;
  maxTokensPerQuery: number;
  features: string[];  // List of enabled features for this role
}

// AI Conversation Message
export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokenCount?: number;
}

// AI Conversation Session
export interface AIConversationSession {
  id: string;
  userId: string;
  provider: AIProvider;
  model: string;
  messages: AIConversationMessage[];
  createdAt: string;
  lastMessageAt: string;
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  metadata?: {
    topic?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    resolvedQuery?: boolean;
  };
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

// AI Search Response
export interface AISearchResponse {
  query: string;
  enhancedQuery?: string;
  suggestions: string[];
  relatedTerms: string[];
  confidence: number;
}

// AI Part Match Response
export interface AIPartMatchResponse {
  inputPartNumber: string;
  matches: {
    partNumber: string;
    productId: string;
    productName: string;
    confidence: number;
    matchType: 'EXACT' | 'SIMILAR' | 'ALTERNATIVE' | 'CROSS_REFERENCE';
  }[];
  suggestedAlternatives?: string[];
}
