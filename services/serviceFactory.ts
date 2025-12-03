/**
 * @fileoverview Service Factory Module
 * 
 * This module provides a factory for creating service instances based on the
 * current API mode (mock or REST). It allows seamless switching between
 * localStorage-based mock implementation and real backend REST API.
 * 
 * @example
 * ```typescript
 * import { getAuthService, getOrderService } from './serviceFactory';
 * 
 * // These automatically use the correct implementation based on apiConfig.apiMode
 * const authService = getAuthService();
 * const orderService = getOrderService();
 * 
 * const result = await authService.login('1', '1', 'OWNER');
 * ```
 */

import { apiConfig, isMockMode, debugLog } from './apiConfig';
import { httpClient, ApiResponse } from './httpClient';
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
  Product,
  SiteSettings
} from '../types';
import type {
  LoginRequest,
  LoginResponse,
  SessionResponse,
  CreateOrderRequest,
  CreateQuoteRequest,
  CreateImportRequest,
  UpdateImportStatusRequest,
  CreateMissingPartRequest,
  CreateStaffRequest,
  RecordActivityRequest,
  ProductSearchParams
} from './types';

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Authentication Service Interface
 */
export interface IAuthService {
  login(identifier: string, secret: string, type: 'OWNER' | 'STAFF'): Promise<LoginResponse>;
  logout(): Promise<void>;
  getSession(): Promise<SessionResponse>;
  isAuthenticated(): boolean;
}

/**
 * User Service Interface
 */
export interface IUserService {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getStaffByParentId(parentId: string): Promise<User[]>;
  createStaff(parentId: string, data: CreateStaffRequest): Promise<User>;
  deleteStaff(id: string): Promise<void>;
}

/**
 * Customer Service Interface
 */
export interface ICustomerService {
  getCustomers(): Promise<Array<{ user: User; profile: BusinessProfile }>>;
  getCustomerById(id: string): Promise<{ user: User; profile: BusinessProfile } | null>;
  getProfile(userId: string): Promise<BusinessProfile | null>;
  updateProfile(userId: string, data: Partial<BusinessProfile>): Promise<BusinessProfile>;
  addSearchPoints(userId: string, points: number): Promise<void>;
  suspendCustomer(userId: string, reason?: string): Promise<void>;
  reactivateCustomer(userId: string): Promise<void>;
}

/**
 * Product Service Interface
 */
export interface IProductService {
  searchProducts(params: ProductSearchParams): Promise<Product[]>;
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  uploadProducts(products: Product[]): Promise<{ success: number; failed: number }>;
}

/**
 * Order Service Interface
 */
export interface IOrderService {
  getOrders(userId?: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(userId: string, data: CreateOrderRequest): Promise<Order>;
  updateOrderStatus(id: string, status: Order['status']): Promise<Order>;
  cancelOrder(id: string, cancelledBy: 'CUSTOMER' | 'ADMIN'): Promise<Order>;
}

/**
 * Quote Service Interface
 */
export interface IQuoteService {
  getQuotes(userId?: string): Promise<QuoteRequest[]>;
  getAllQuotes(): Promise<QuoteRequest[]>;
  getQuoteById(id: string): Promise<QuoteRequest | null>;
  createQuote(userId: string, data: CreateQuoteRequest): Promise<QuoteRequest>;
  updateQuote(id: string, data: Partial<QuoteRequest>): Promise<QuoteRequest>;
  processQuote(id: string, adminId: string): Promise<QuoteRequest>;
}

/**
 * Import Request Service Interface
 */
export interface IImportService {
  getImportRequests(customerId?: string): Promise<ImportRequest[]>;
  getAllImportRequests(): Promise<ImportRequest[]>;
  getImportRequestById(id: string): Promise<ImportRequest | null>;
  createImportRequest(customerId: string, data: CreateImportRequest): Promise<ImportRequest>;
  updateImportStatus(id: string, data: UpdateImportStatusRequest): Promise<ImportRequest>;
}

/**
 * Missing Parts Service Interface
 */
export interface IMissingPartsService {
  getMissingParts(): Promise<MissingProductRequest[]>;
  getMissingPartById(id: string): Promise<MissingProductRequest | null>;
  createMissingPart(userId: string, data: CreateMissingPartRequest): Promise<MissingProductRequest>;
  updateMissingPart(id: string, data: Partial<MissingProductRequest>): Promise<MissingProductRequest>;
}

/**
 * Notification Service Interface
 */
export interface INotificationService {
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

/**
 * Activity Log Service Interface
 */
export interface IActivityLogService {
  getLogs(filters?: { userId?: string; eventType?: string }): Promise<ActivityLogEntry[]>;
  recordActivity(data: RecordActivityRequest): Promise<ActivityLogEntry>;
}

/**
 * Account Request Service Interface
 */
export interface IAccountRequestService {
  getRequests(): Promise<AccountOpeningRequest[]>;
  getRequestById(id: string): Promise<AccountOpeningRequest | null>;
  createRequest(data: Omit<AccountOpeningRequest, 'id' | 'createdAt' | 'status'>): Promise<AccountOpeningRequest>;
  updateRequest(id: string, data: Partial<AccountOpeningRequest>): Promise<AccountOpeningRequest>;
  approveRequest(id: string, adminId: string, approvalData: Partial<AccountOpeningRequest>): Promise<AccountOpeningRequest>;
  rejectRequest(id: string, adminId: string, reason: string): Promise<AccountOpeningRequest>;
}

/**
 * Settings Service Interface
 */
export interface ISettingsService {
  getSettings(): Promise<SiteSettings>;
  updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings>;
}

// ============================================================================
// Mock Implementation Wrappers
// ============================================================================

/**
 * Lazy import of MockApi to avoid circular dependencies
 * and allow tree-shaking in production builds
 */
let mockApiModule: typeof import('./mockApi') | null = null;

async function getMockApi() {
  if (!mockApiModule) {
    mockApiModule = await import('./mockApi');
  }
  return mockApiModule.MockApi;
}

/**
 * Creates a mock auth service that delegates to mockApi
 */
function createMockAuthService(): IAuthService {
  return {
    async login(identifier, secret, type) {
      const mockApi = await getMockApi();
      return mockApi.login(identifier, secret, type);
    },
    async logout() {
      const mockApi = await getMockApi();
      return mockApi.logout();
    },
    async getSession() {
      const mockApi = await getMockApi();
      const user = await mockApi.getCurrentSession();
      if (!user) return { user: null, profile: null };
      const profile = await mockApi.getBusinessProfile(user.id);
      return { user, profile };
    },
    isAuthenticated() {
      return !!localStorage.getItem('b2b_session_sini_v2');
    }
  };
}

/**
 * Creates a mock user service that delegates to mockApi
 */
function createMockUserService(): IUserService {
  return {
    async getUsers() {
      const mockApi = await getMockApi();
      return mockApi.getAllUsers?.() ?? [];
    },
    async getUserById(id) {
      const mockApi = await getMockApi();
      const users = await mockApi.getAllUsers?.() ?? [];
      return users.find((u: User) => u.id === id) ?? null;
    },
    async updateUser(id, data) {
      const mockApi = await getMockApi();
      return mockApi.updateUser?.(id, data) ?? data as User;
    },
    async getStaffByParentId(parentId) {
      const mockApi = await getMockApi();
      return mockApi.getStaffForOwner(parentId);
    },
    async createStaff(parentId, data) {
      const mockApi = await getMockApi();
      return mockApi.addEmployee(parentId, data);
    },
    async deleteStaff(id) {
      const mockApi = await getMockApi();
      await mockApi.deleteEmployee(id);
    }
  };
}

/**
 * Creates a mock customer service that delegates to mockApi
 */
function createMockCustomerService(): ICustomerService {
  return {
    async getCustomers() {
      const mockApi = await getMockApi();
      return mockApi.getAllCustomersWithProfiles();
    },
    async getCustomerById(id) {
      const mockApi = await getMockApi();
      const customers = await mockApi.getAllCustomersWithProfiles();
      return customers.find((c: { user: User }) => c.user.id === id) ?? null;
    },
    async getProfile(userId) {
      const mockApi = await getMockApi();
      return mockApi.getBusinessProfile(userId);
    },
    async updateProfile(userId, data) {
      const mockApi = await getMockApi();
      return mockApi.updateBusinessProfile(userId, data);
    },
    async addSearchPoints(userId, points) {
      const mockApi = await getMockApi();
      await mockApi.addSearchPoints(userId, points);
    },
    async suspendCustomer(userId, reason) {
      const mockApi = await getMockApi();
      await mockApi.suspendCustomer?.(userId, reason);
    },
    async reactivateCustomer(userId) {
      const mockApi = await getMockApi();
      await mockApi.reactivateCustomer?.(userId);
    }
  };
}

/**
 * Creates a mock product service that delegates to mockApi
 */
function createMockProductService(): IProductService {
  return {
    async searchProducts(params) {
      const mockApi = await getMockApi();
      return mockApi.searchProducts(params.query, params.userId);
    },
    async getProducts() {
      const mockApi = await getMockApi();
      return mockApi.getProducts();
    },
    async getProductById(id) {
      const mockApi = await getMockApi();
      const products = await mockApi.getProducts();
      return products.find((p: Product) => p.id === id) ?? null;
    },
    async uploadProducts(products) {
      const mockApi = await getMockApi();
      return mockApi.uploadProducts(products);
    }
  };
}

/**
 * Creates a mock order service that delegates to mockApi
 */
function createMockOrderService(): IOrderService {
  return {
    async getOrders(userId) {
      const mockApi = await getMockApi();
      return mockApi.getOrders(userId ?? '');
    },
    async getAllOrders() {
      const mockApi = await getMockApi();
      return mockApi.getAllOrders();
    },
    async getOrderById(id) {
      const mockApi = await getMockApi();
      const orders = await mockApi.getAllOrders();
      return orders.find((o: Order) => o.id === id) ?? null;
    },
    async createOrder(userId, data) {
      const mockApi = await getMockApi();
      return mockApi.createOrder(userId, data as any);
    },
    async updateOrderStatus(id, status) {
      const mockApi = await getMockApi();
      return mockApi.updateOrderStatus(id, status);
    },
    async cancelOrder(id, cancelledBy) {
      const mockApi = await getMockApi();
      return mockApi.cancelOrder(id, cancelledBy);
    }
  };
}

/**
 * Creates a mock quote service that delegates to mockApi
 */
function createMockQuoteService(): IQuoteService {
  return {
    async getQuotes(userId) {
      const mockApi = await getMockApi();
      return mockApi.getQuoteRequests(userId);
    },
    async getAllQuotes() {
      const mockApi = await getMockApi();
      return mockApi.getAllQuoteRequests();
    },
    async getQuoteById(id) {
      const mockApi = await getMockApi();
      const quotes = await mockApi.getAllQuoteRequests();
      return quotes.find((q: QuoteRequest) => q.id === id) ?? null;
    },
    async createQuote(userId, data) {
      const mockApi = await getMockApi();
      return mockApi.submitQuoteRequest(userId, data as any);
    },
    async updateQuote(id, data) {
      const mockApi = await getMockApi();
      return mockApi.updateQuoteRequest(id, data);
    },
    async processQuote(id, adminId) {
      const mockApi = await getMockApi();
      return mockApi.processQuoteRequest(id, adminId);
    }
  };
}

/**
 * Creates a mock import service that delegates to mockApi
 */
function createMockImportService(): IImportService {
  return {
    async getImportRequests(customerId) {
      const mockApi = await getMockApi();
      return mockApi.getImportRequests(customerId);
    },
    async getAllImportRequests() {
      const mockApi = await getMockApi();
      return mockApi.getAllImportRequests();
    },
    async getImportRequestById(id) {
      const mockApi = await getMockApi();
      const requests = await mockApi.getAllImportRequests();
      return requests.find((r: ImportRequest) => r.id === id) ?? null;
    },
    async createImportRequest(customerId, data) {
      const mockApi = await getMockApi();
      return mockApi.submitImportRequest(customerId, data as any);
    },
    async updateImportStatus(id, data) {
      const mockApi = await getMockApi();
      return mockApi.updateImportRequestStatus(id, data.status, data.note, data.adminNotes);
    }
  };
}

/**
 * Creates a mock missing parts service that delegates to mockApi
 */
function createMockMissingPartsService(): IMissingPartsService {
  return {
    async getMissingParts() {
      const mockApi = await getMockApi();
      return mockApi.getMissingRequests();
    },
    async getMissingPartById(id) {
      const mockApi = await getMockApi();
      const parts = await mockApi.getMissingRequests();
      return parts.find((p: MissingProductRequest) => p.id === id) ?? null;
    },
    async createMissingPart(userId, data) {
      const mockApi = await getMockApi();
      return mockApi.submitMissingRequest({
        userId,
        ...data
      });
    },
    async updateMissingPart(id, data) {
      const mockApi = await getMockApi();
      return mockApi.updateMissingRequest(id, data);
    }
  };
}

/**
 * Creates a mock notification service that delegates to mockApi
 */
function createMockNotificationService(): INotificationService {
  return {
    async getNotifications(userId) {
      const mockApi = await getMockApi();
      return mockApi.getNotifications(userId);
    },
    async createNotification(notification) {
      const mockApi = await getMockApi();
      return mockApi.createNotification(notification);
    },
    async markAsRead(id) {
      const mockApi = await getMockApi();
      await mockApi.markNotificationRead(id);
    },
    async markAllAsRead(userId) {
      const mockApi = await getMockApi();
      await mockApi.markAllNotificationsRead(userId);
    },
    async getUnreadCount(userId) {
      const mockApi = await getMockApi();
      const notifications = await mockApi.getNotifications(userId);
      return notifications.filter((n: Notification) => !n.isRead).length;
    }
  };
}

/**
 * Creates a mock activity log service that delegates to mockApi
 */
function createMockActivityLogService(): IActivityLogService {
  return {
    async getLogs(filters) {
      const mockApi = await getMockApi();
      return mockApi.getActivityLogs(filters);
    },
    async recordActivity(data) {
      const mockApi = await getMockApi();
      return mockApi.recordActivity(data as any);
    }
  };
}

/**
 * Creates a mock account request service that delegates to mockApi
 */
function createMockAccountRequestService(): IAccountRequestService {
  return {
    async getRequests() {
      const mockApi = await getMockApi();
      return mockApi.getAccountRequests();
    },
    async getRequestById(id) {
      const mockApi = await getMockApi();
      const requests = await mockApi.getAccountRequests();
      return requests.find((r: AccountOpeningRequest) => r.id === id) ?? null;
    },
    async createRequest(data) {
      const mockApi = await getMockApi();
      return mockApi.submitAccountOpeningRequest(data as any);
    },
    async updateRequest(id, data) {
      const mockApi = await getMockApi();
      return mockApi.updateAccountRequest(id, data);
    },
    async approveRequest(id, adminId, approvalData) {
      const mockApi = await getMockApi();
      return mockApi.approveAccountRequest(id, adminId, approvalData);
    },
    async rejectRequest(id, adminId, reason) {
      const mockApi = await getMockApi();
      return mockApi.rejectAccountRequest(id, adminId, reason);
    }
  };
}

/**
 * Creates a mock settings service that delegates to mockApi
 */
function createMockSettingsService(): ISettingsService {
  return {
    async getSettings() {
      const mockApi = await getMockApi();
      return mockApi.getSettings();
    },
    async updateSettings(data) {
      const mockApi = await getMockApi();
      return mockApi.updateSettings(data);
    }
  };
}

// ============================================================================
// REST Implementation Stubs
// ============================================================================

/**
 * Creates a REST auth service (TODO: implement when backend is ready)
 */
function createRestAuthService(): IAuthService {
  debugLog('service', 'Using REST auth service');
  return {
    async login(identifier, secret, type) {
      const response = await httpClient.post<LoginResponse>(
        apiConfig.endpoints.auth.login,
        { identifier, secret, type }
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }
      return response.data;
    },
    async logout() {
      await httpClient.post(apiConfig.endpoints.auth.logout);
    },
    async getSession() {
      const response = await httpClient.get<SessionResponse>(apiConfig.endpoints.auth.session);
      return response.data ?? { user: null, profile: null };
    },
    isAuthenticated() {
      return !!localStorage.getItem('auth_token');
    }
  };
}

// TODO: Implement REST versions of other services when backend is ready
// For now, they fall back to mock implementations

// ============================================================================
// Service Factory Functions
// ============================================================================

/**
 * Gets the auth service based on current API mode
 */
export function getAuthService(): IAuthService {
  if (isMockMode()) {
    return createMockAuthService();
  }
  return createRestAuthService();
}

/**
 * Gets the user service based on current API mode
 */
export function getUserService(): IUserService {
  // TODO: Implement REST version
  return createMockUserService();
}

/**
 * Gets the customer service based on current API mode
 */
export function getCustomerService(): ICustomerService {
  // TODO: Implement REST version
  return createMockCustomerService();
}

/**
 * Gets the product service based on current API mode
 */
export function getProductService(): IProductService {
  // TODO: Implement REST version
  return createMockProductService();
}

/**
 * Gets the order service based on current API mode
 */
export function getOrderService(): IOrderService {
  // TODO: Implement REST version
  return createMockOrderService();
}

/**
 * Gets the quote service based on current API mode
 */
export function getQuoteService(): IQuoteService {
  // TODO: Implement REST version
  return createMockQuoteService();
}

/**
 * Gets the import service based on current API mode
 */
export function getImportService(): IImportService {
  // TODO: Implement REST version
  return createMockImportService();
}

/**
 * Gets the missing parts service based on current API mode
 */
export function getMissingPartsService(): IMissingPartsService {
  // TODO: Implement REST version
  return createMockMissingPartsService();
}

/**
 * Gets the notification service based on current API mode
 */
export function getNotificationService(): INotificationService {
  // TODO: Implement REST version
  return createMockNotificationService();
}

/**
 * Gets the activity log service based on current API mode
 */
export function getActivityLogService(): IActivityLogService {
  // TODO: Implement REST version
  return createMockActivityLogService();
}

/**
 * Gets the account request service based on current API mode
 */
export function getAccountRequestService(): IAccountRequestService {
  // TODO: Implement REST version
  return createMockAccountRequestService();
}

/**
 * Gets the settings service based on current API mode
 */
export function getSettingsService(): ISettingsService {
  // TODO: Implement REST version
  return createMockSettingsService();
}

// ============================================================================
// Unified Service Container
// ============================================================================

/**
 * All services in a single container
 * Useful for dependency injection or when you need access to all services
 */
export const services = {
  get auth() { return getAuthService(); },
  get users() { return getUserService(); },
  get customers() { return getCustomerService(); },
  get products() { return getProductService(); },
  get orders() { return getOrderService(); },
  get quotes() { return getQuoteService(); },
  get imports() { return getImportService(); },
  get missingParts() { return getMissingPartsService(); },
  get notifications() { return getNotificationService(); },
  get activityLogs() { return getActivityLogService(); },
  get accountRequests() { return getAccountRequestService(); },
  get settings() { return getSettingsService(); }
};

export default services;
