/**
 * @fileoverview Central API Configuration Module
 * 
 * This module provides a strongly-typed configuration object for the B2B Wholesale Portal.
 * It supports both mock mode (localStorage-based) and REST mode (real backend API).
 * 
 * @example
 * ```typescript
 * import { apiConfig, ApiMode, Environment } from './apiConfig';
 * 
 * // Check current mode
 * if (apiConfig.apiMode === 'mock') {
 *   // Use mockApi
 * } else {
 *   // Use httpClient
 * }
 * ```
 */

declare global {
  interface ImportMeta {
    env: Record<string, string | boolean | undefined>;
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Environment type for the application
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * API mode determines whether to use mock (localStorage), REST (real backend), or Supabase
 */
export type ApiMode = 'mock' | 'rest' | 'supabase';

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Configuration for retry logic
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff: boolean;
}

/**
 * Timeout configuration for different types of requests
 */
export interface TimeoutConfig {
  /** Default timeout for regular requests in milliseconds */
  default: number;
  /** Timeout for file upload requests in milliseconds */
  upload: number;
  /** Timeout for download requests in milliseconds */
  download: number;
}

/**
 * Default headers to be included in all requests
 */
export interface DefaultHeaders {
  'Content-Type': string;
  'Accept': string;
  'Accept-Language': string;
  [key: string]: string;
}

/**
 * API endpoint configuration
 */
export interface EndpointConfig {
  auth: {
    login: string;
    logout: string;
    session: string;
    register: string;
  };
  users: {
    list: string;
    byId: (id: string) => string;
    staff: string;
  };
  customers: {
    list: string;
    byId: (id: string) => string;
    profile: (id: string) => string;
  };
  products: {
    list: string;
    search: string;
    byId: (id: string) => string;
  };
  orders: {
    list: string;
    create: string;
    byId: (id: string) => string;
    cancel: (id: string) => string;
  };
  quotes: {
    list: string;
    create: string;
    byId: (id: string) => string;
  };
  imports: {
    list: string;
    create: string;
    byId: (id: string) => string;
    updateStatus: (id: string) => string;
  };
  missing: {
    list: string;
    create: string;
    byId: (id: string) => string;
  };
  notifications: {
    list: string;
    markRead: (id: string) => string;
    markAllRead: string;
  };
  accountRequests: {
    list: string;
    create: string;
    byId: (id: string) => string;
  };
  settings: {
    get: string;
    update: string;
  };
  activityLogs: {
    list: string;
    create: string;
  };
}

/**
 * Complete API Configuration object type
 */
export interface ApiConfigType {
  /** Current environment */
  env: Environment;
  /** API mode: 'mock' for localStorage, 'rest' for real backend */
  apiMode: ApiMode;
  /** Base URL for the REST API (only used when apiMode is 'rest') */
  baseUrl: string;
  /** API version string */
  version: string;
  /** Timeout configuration */
  timeouts: TimeoutConfig;
  /** Retry configuration */
  retry: RetryConfig;
  /** Default headers for all requests */
  defaultHeaders: DefaultHeaders;
  /** API endpoints configuration */
  endpoints: EndpointConfig;
  /** Whether to enable debug logging */
  debug: boolean;
  /** Storage key prefix for localStorage operations */
  storagePrefix: string;
  /** Whether the configuration has been initialized */
  isInitialized: boolean;
}

// ============================================================================
// Environment Variable Helpers
// ============================================================================

/**
 * Safely reads an environment variable with a fallback value
 * Works with both Vite (import.meta.env) and process.env
 */
function getEnvVar(key: string, fallback: string = ''): string {
  // Try Vite-style env vars first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key}`;
    if (import.meta.env[viteKey] !== undefined) {
      return import.meta.env[viteKey] as string;
    }
  }

  // Try process.env (for SSR or Node.js)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key] !== undefined) {
      return process.env[key] as string;
    }
    const viteKey = `VITE_${key}`;
    if (process.env[viteKey] !== undefined) {
      return process.env[viteKey] as string;
    }
  }

  return fallback;
}

/**
 * Determines the current environment based on various signals
 */
function detectEnvironment(): Environment {
  const envVar = getEnvVar('NODE_ENV', 'development');

  if (envVar === 'production') return 'production';
  if (envVar === 'test') return 'test';

  // Check for Vite dev mode
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return 'development';
  }

  return 'development';
}

/**
 * Determines the API mode based on environment variables
 * Falls back to 'mock' if not specified or if baseUrl is not available
 */
function detectApiMode(): ApiMode {
  // ======================================
  // REST MODE: استخدام Backend الحقيقي
  // ======================================
  return 'rest';

  // === الكود الأصلي للتطوير (معلّق) ===
  /*
  const modeVar = getEnvVar('API_MODE', 'mock');
  const baseUrl = getEnvVar('API_BASE_URL', '');
  const useSupabase = getEnvVar('USE_SUPABASE', 'false');

  // Check if Supabase mode is enabled
  if (useSupabase === 'true' || modeVar === 'supabase') {
    return 'supabase';
  }

  // If explicitly set to 'rest' but no baseUrl, fall back to mock
  if (modeVar === 'rest' && !baseUrl) {
    console.warn('[apiConfig] API_MODE is "rest" but API_BASE_URL is not set. Falling back to mock mode.');
    return 'mock';
  }

  if (modeVar === 'rest' || modeVar === 'mock' || modeVar === 'supabase') {
    return modeVar;
  }

  return 'mock';
  */
}

// ============================================================================
// Configuration Object
// ============================================================================

/**
 * Central API configuration object
 * 
 * This configuration is used throughout the application to determine:
 * - Whether to use mock (localStorage) or REST (real backend) mode
 * - API endpoints and their URLs
 * - Request timeouts and retry logic
 * - Default headers for all requests
 * 
 * @example
 * ```typescript
 * import { apiConfig } from './apiConfig';
 * 
 * if (apiConfig.apiMode === 'mock') {
 *   // Use mockApi functions
 * } else {
 *   // Use httpClient with real endpoints
 * }
 * ```
 */
export const apiConfig: ApiConfigType = {
  env: detectEnvironment(),
  apiMode: detectApiMode(),
  baseUrl: getEnvVar('API_BASE_URL', '/api/v1'),
  version: '2.0.0',

  timeouts: {
    default: 30000,   // 30 seconds
    upload: 120000,   // 2 minutes
    download: 60000   // 1 minute
  },

  retry: {
    maxRetries: 3,
    baseDelay: 1000,    // 1 second
    maxDelay: 10000,    // 10 seconds
    exponentialBackoff: true
  },

  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ar'
  },

  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      session: '/auth/me',
      register: '/auth/register'
    },
    users: {
      list: '/users',
      byId: (id: string) => `/users/${id}`,
      staff: '/users/staff'
    },
    customers: {
      list: '/customers',
      byId: (id: string) => `/customers/${id}`,
      profile: (id: string) => `/customers/${id}/profile`
    },
    products: {
      list: '/products',
      search: '/products/search',
      byId: (id: string) => `/products/${id}`
    },
    orders: {
      list: '/orders',
      create: '/orders',
      byId: (id: string) => `/orders/${id}`,
      cancel: (id: string) => `/orders/${id}/cancel`
    },
    quotes: {
      list: '/quotes',
      create: '/quotes',
      byId: (id: string) => `/quotes/${id}`
    },
    imports: {
      list: '/imports',
      create: '/imports',
      byId: (id: string) => `/imports/${id}`,
      updateStatus: (id: string) => `/imports/${id}/status`
    },
    missing: {
      list: '/missing-parts',
      create: '/missing-parts',
      byId: (id: string) => `/missing-parts/${id}`
    },
    notifications: {
      list: '/notifications',
      markRead: (id: string) => `/notifications/${id}/read`,
      markAllRead: '/notifications/read-all'
    },
    accountRequests: {
      list: '/account-requests',
      create: '/account-requests',
      byId: (id: string) => `/account-requests/${id}`
    },
    settings: {
      get: '/settings',
      update: '/settings'
    },
    activityLogs: {
      list: '/activity-logs',
      create: '/activity-logs'
    }
  },

  debug: detectEnvironment() === 'development',
  storagePrefix: 'b2b_',
  isInitialized: true
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if the application is running in mock mode
 */
export function isMockMode(): boolean {
  return apiConfig.apiMode === 'mock';
}

/**
 * Checks if the application is running in REST mode
 */
export function isRestMode(): boolean {
  return apiConfig.apiMode === 'rest';
}

/**
 * Checks if the application is running in Supabase mode
 */
export function isSupabaseMode(): boolean {
  return apiConfig.apiMode === 'supabase';
}

/**
 * Checks if the application is in development environment
 */
export function isDevelopment(): boolean {
  return apiConfig.env === 'development';
}

/**
 * Checks if the application is in production environment
 */
export function isProduction(): boolean {
  return apiConfig.env === 'production';
}

/**
 * Checks if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  return apiConfig.debug;
}

/**
 * Gets the full URL for an API endpoint
 * @param endpoint - The endpoint path
 * @returns The full URL including the base URL
 */
export function getFullUrl(endpoint: string): string {
  return `${apiConfig.baseUrl}${endpoint}`;
}

/**
 * Logs a debug message if debug mode is enabled
 * @param category - Category of the log (e.g., 'http', 'auth')
 * @param message - The log message
 * @param data - Optional additional data
 */
export function debugLog(category: string, message: string, data?: any): void {
  if (apiConfig.debug) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${category}] ${message}`, data ?? '');
  }
}

/**
 * Logs an error with context
 * @param category - Category of the error
 * @param message - The error message
 * @param error - The error object
 * @param context - Optional additional context
 */
export function errorLog(
  category: string,
  message: string,
  error: unknown,
  context?: Record<string, any>
): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${category}] ${message}`, {
    error,
    context,
    apiMode: apiConfig.apiMode,
    env: apiConfig.env
  });
}

// ============================================================================
// Storage Keys (for mock mode compatibility)
// ============================================================================

/**
 * Storage keys used by the mock API
 * These are exported to maintain compatibility with existing code
 */
export const STORAGE_KEYS = {
  USERS: 'b2b_users_sini_v2',
  PROFILES: 'b2b_profiles_sini_v2',
  ORDERS: 'b2b_orders_sini_v2',
  QUOTE_REQUESTS: 'b2b_quotes_sini_v2',
  SESSION: 'b2b_session_sini_v2',
  SETTINGS: 'b2b_settings_sini_v2',
  PRODUCTS: 'b2b_products_sini_v2',
  BANNERS: 'b2b_banners_sini_v2',
  NEWS: 'b2b_news_sini_v2',
  LOGS: 'b2b_logs_sini_v2',
  SEARCH_HISTORY: 'b2b_search_history_sini_v2',
  MISSING_REQUESTS: 'b2b_missing_requests_sini_v2',
  IMPORT_REQUESTS: 'b2b_import_requests_sini_v2',
  ACCOUNT_REQUESTS: 'siniCar_account_opening_requests',
  NOTIFICATIONS: 'siniCar_notifications_v2',
  ACTIVITY_LOGS: 'siniCar_activity_logs'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export default apiConfig;
