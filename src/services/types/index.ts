/**
 * @fileoverview Shared TypeScript Types/DTOs for the B2B Wholesale Portal
 * 
 * This file re-exports all types from the main types.ts file and provides
 * additional DTOs specifically for API operations.
 * 
 * Both mock and REST implementations use these same types to ensure consistency.
 */

export * from '../../types';

// ============================================================================
// API-specific DTOs
// ============================================================================

import type {
  User,
  BusinessProfile,
  Order,
  QuoteRequest,
  ImportRequest,
  Notification,
  AccountOpeningRequest,
  MissingProductRequest,
  ActivityLogEntry,
  Product
} from '../../types';

/**
 * Login request payload
 */
export interface LoginRequest {
  type: 'OWNER' | 'STAFF';
  identifier: string;
  secret: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  profile?: BusinessProfile;
  token?: string;
}

/**
 * Session response
 */
export interface SessionResponse {
  user: User | null;
  profile?: BusinessProfile | null;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * List query parameters
 */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * User list query params
 */
export interface UserListParams extends ListQueryParams {
  role?: string;
  status?: string;
  businessId?: string;
}

/**
 * Order list query params
 */
export interface OrderListParams extends ListQueryParams {
  userId?: string;
  businessId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Quote list query params
 */
export interface QuoteListParams extends ListQueryParams {
  userId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Import request list query params
 */
export interface ImportListParams extends ListQueryParams {
  customerId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Product search params
 */
export interface ProductSearchParams {
  query: string;
  userId?: string;
  brand?: string;
  category?: string;
  limit?: number;
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  branchId?: string;
  notes?: string;
}

/**
 * Create quote request
 */
export interface CreateQuoteRequest {
  items: Array<{
    partNumber: string;
    partName: string;
    requestedQty: number;
  }>;
  priceType?: 'OEM' | 'AFTERMARKET' | 'BOTH';
  notes?: string;
}

/**
 * Create import request
 */
export interface CreateImportRequest {
  targetCarBrands: string[];
  hasImportedBefore: boolean;
  previousImportDetails?: string;
  serviceMode: 'FULL_SERVICE' | 'GOODS_ONLY';
  preferredPorts?: string;
  estimatedAnnualValue?: string;
  paymentPreference?: string;
  notes?: string;
}

/**
 * Update import status request
 */
export interface UpdateImportStatusRequest {
  status: ImportRequest['status'];
  note?: string;
  adminNotes?: string;
}

/**
 * Create missing part request
 */
export interface CreateMissingPartRequest {
  query: string;
  source?: 'QUOTE' | 'SEARCH';
  partNumber?: string;
  name?: string;
  brand?: string;
  carModel?: string;
  quantityRequested?: number;
}

/**
 * Staff creation request
 */
export interface CreateStaffRequest {
  name: string;
  phone: string;
  branchId?: string;
  employeeRole?: 'MANAGER' | 'BUYER';
  searchLimit?: number;
}

/**
 * Notification list params
 */
export interface NotificationListParams {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
}

/**
 * Activity log query params
 */
export interface ActivityLogParams extends ListQueryParams {
  userId?: string;
  eventType?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Record activity request
 */
export interface RecordActivityRequest {
  userId: string;
  userName?: string;
  role?: string;
  eventType: string;
  description?: string;
  page?: string;
  metadata?: Record<string, unknown>;
}
