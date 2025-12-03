/**
 * @fileoverview Reusable HTTP Client Module
 * 
 * This module provides a centralized HTTP client with:
 * - Automatic base URL injection from apiConfig
 * - Default headers (JSON, auth token)
 * - Retry mechanism with exponential backoff
 * - Normalized response and error handling
 * - Request/Response logging in debug mode
 * 
 * @example
 * ```typescript
 * import { httpClient } from './httpClient';
 * 
 * // GET request
 * const result = await httpClient.get('/products');
 * if (result.error) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.data);
 * }
 * 
 * // POST request with body
 * const createResult = await httpClient.post('/orders', { items: [...] });
 * ```
 */

import { 
  apiConfig, 
  HttpMethod, 
  debugLog, 
  errorLog,
  getFullUrl 
} from './apiConfig';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Standardized API response shape
 * All HTTP client methods return this shape for consistent handling
 */
export interface ApiResponse<T = unknown> {
  /** The response data (null if error) */
  data: T | null;
  /** Error message (null if success) */
  error: string | null;
  /** HTTP status code */
  status: number;
  /** Whether the request was successful */
  success: boolean;
  /** Response headers */
  headers?: Record<string, string>;
  /** Request metadata for debugging */
  meta?: {
    url: string;
    method: HttpMethod;
    duration: number;
    retries: number;
  };
}

/**
 * Request options for the HTTP client
 */
export interface RequestOptions {
  /** Request headers (merged with defaults) */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts (overrides config) */
  retries?: number;
  /** Whether to include credentials */
  credentials?: RequestCredentials;
  /** Abort signal for request cancellation */
  signal?: AbortSignal;
  /** Whether to skip auth token */
  skipAuth?: boolean;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Error codes for categorizing errors
 */
export type ApiErrorCode = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

/**
 * Structured API error with additional context
 */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
}

// ============================================================================
// Auth Token Management
// ============================================================================

const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Gets the current auth token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Sets the auth token in localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save auth token:', e);
  }
}

/**
 * Removes the auth token from localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear auth token:', e);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Builds query string from params object
 */
function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  
  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
}

/**
 * Calculates delay for retry with exponential backoff
 */
function calculateRetryDelay(attempt: number): number {
  const { baseDelay, maxDelay, exponentialBackoff } = apiConfig.retry;
  
  if (!exponentialBackoff) {
    return baseDelay;
  }
  
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Determines the error code from HTTP status
 */
function getErrorCode(status: number): ApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422 || status === 400) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

/**
 * Gets a user-friendly error message in Arabic
 */
function getLocalizedErrorMessage(code: ApiErrorCode, originalMessage?: string): string {
  const messages: Record<ApiErrorCode, string> = {
    NETWORK_ERROR: 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
    TIMEOUT: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
    UNAUTHORIZED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا المورد.',
    NOT_FOUND: 'المورد المطلوب غير موجود.',
    VALIDATION_ERROR: originalMessage || 'البيانات المدخلة غير صالحة.',
    SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
    UNKNOWN: originalMessage || 'حدث خطأ غير متوقع.'
  };
  
  return messages[code];
}

/**
 * Extracts headers from Response as a plain object
 */
function extractHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, ms);
  });
}

// ============================================================================
// Main Request Function
// ============================================================================

/**
 * Core request function with retry logic
 */
async function request<T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  const maxRetries = options.retries ?? apiConfig.retry.maxRetries;
  const timeout = options.timeout ?? apiConfig.timeouts.default;
  
  let lastError: ApiError | null = null;
  let attempts = 0;
  
  // Build full URL with query params
  const queryString = options.params ? buildQueryString(options.params) : '';
  const fullUrl = getFullUrl(endpoint) + queryString;
  
  // Build headers
  const headers: Record<string, string> = {
    ...apiConfig.defaultHeaders,
    ...options.headers
  };
  
  // Add auth token if available and not skipped
  if (!options.skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Prepare request config
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: options.credentials ?? 'same-origin',
    signal: options.signal
  };
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }
  
  // Retry loop
  while (attempts <= maxRetries) {
    try {
      debugLog('http', `${method} ${endpoint}`, { attempt: attempts + 1, body });
      
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(fullUrl, fetchOptions),
        createTimeoutPromise(timeout)
      ]) as Response;
      
      const duration = Date.now() - startTime;
      const responseHeaders = extractHeaders(response);
      
      // Try to parse response as JSON
      let data: T | null = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          debugLog('http', 'Failed to parse JSON response', parseError);
        }
      }
      
      // Handle non-success responses
      if (!response.ok) {
        const errorCode = getErrorCode(response.status);
        const errorMessage = (data as any)?.message || response.statusText;
        
        lastError = {
          code: errorCode,
          message: getLocalizedErrorMessage(errorCode, errorMessage),
          status: response.status,
          details: data
        };
        
        // Don't retry on client errors (4xx) except for 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          break;
        }
        
        // Retry on server errors
        if (attempts < maxRetries) {
          const delay = calculateRetryDelay(attempts);
          debugLog('http', `Retry ${attempts + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempts++;
          continue;
        }
        
        break;
      }
      
      // Success response
      debugLog('http', `${method} ${endpoint} completed`, { status: response.status, duration });
      
      return {
        data,
        error: null,
        status: response.status,
        success: true,
        headers: responseHeaders,
        meta: {
          url: fullUrl,
          method,
          duration,
          retries: attempts
        }
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Handle timeout
      if (error instanceof Error && error.message === 'Request timeout') {
        lastError = {
          code: 'TIMEOUT',
          message: getLocalizedErrorMessage('TIMEOUT'),
          status: 0,
          details: { timeout }
        };
      } 
      // Handle abort
      else if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          data: null,
          error: 'تم إلغاء الطلب',
          status: 0,
          success: false,
          meta: {
            url: fullUrl,
            method,
            duration,
            retries: attempts
          }
        };
      }
      // Handle network error
      else {
        lastError = {
          code: 'NETWORK_ERROR',
          message: getLocalizedErrorMessage('NETWORK_ERROR'),
          status: 0,
          details: error
        };
      }
      
      errorLog('http', `${method} ${endpoint} failed`, error, {
        url: fullUrl,
        attempt: attempts + 1,
        duration
      });
      
      // Retry on network errors
      if (attempts < maxRetries) {
        const delay = calculateRetryDelay(attempts);
        debugLog('http', `Retry ${attempts + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
        continue;
      }
      
      break;
    }
  }
  
  // Return error response after all retries exhausted
  return {
    data: null,
    error: lastError?.message || 'حدث خطأ غير متوقع',
    status: lastError?.status ?? 0,
    success: false,
    meta: {
      url: fullUrl,
      method,
      duration: Date.now() - startTime,
      retries: attempts
    }
  };
}

// ============================================================================
// HTTP Client API
// ============================================================================

/**
 * HTTP Client with methods for each HTTP verb
 * 
 * All methods return a standardized ApiResponse object with:
 * - data: The response data (null if error)
 * - error: Error message (null if success)
 * - status: HTTP status code
 * - success: Boolean indicating success/failure
 * 
 * @example
 * ```typescript
 * // GET request
 * const { data, error, success } = await httpClient.get<Product[]>('/products');
 * 
 * // POST request
 * const result = await httpClient.post<Order>('/orders', { items: [...] });
 * 
 * // With options
 * const result = await httpClient.get('/products', { 
 *   params: { search: 'filter' },
 *   timeout: 5000 
 * });
 * ```
 */
export const httpClient = {
  /**
   * Performs a GET request
   * @param endpoint - API endpoint path
   * @param options - Request options
   */
  get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>('GET', endpoint, undefined, options);
  },
  
  /**
   * Performs a POST request
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Request options
   */
  post<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>('POST', endpoint, body, options);
  },
  
  /**
   * Performs a PUT request
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Request options
   */
  put<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>('PUT', endpoint, body, options);
  },
  
  /**
   * Performs a PATCH request
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Request options
   */
  patch<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>('PATCH', endpoint, body, options);
  },
  
  /**
   * Performs a DELETE request
   * @param endpoint - API endpoint path
   * @param options - Request options
   */
  delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>('DELETE', endpoint, undefined, options);
  }
};

export default httpClient;
