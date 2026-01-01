/**
 * HTTP Layer Compatibility Bridge
 * 
 * هذا الملف يوحد الوصول لـ HTTP clients في المشروع.
 * 
 * الملفات الموجودة:
 * - httpClient.ts: HTTP wrapper منخفض المستوى مع retry logic
 * - apiClient.ts: API client عالي المستوى مع modules منظمة
 * 
 * القاعدة: استخدم هذا الملف للاستيراد الموحد
 */

// Re-export httpClient (low-level)
export { httpClient } from './httpClient';
export type { ApiResponse, RequestOptions, ApiError, ApiErrorCode } from './httpClient';
export { getAuthToken, setAuthToken, clearAuthToken } from './httpClient';

// Re-export ApiClient (high-level)
export { ApiClient } from './apiClient';

// Re-export helper functions
export { get, post, put, del } from './apiClient';

// Default export is httpClient for backwards compatibility
export { httpClient as default } from './httpClient';
