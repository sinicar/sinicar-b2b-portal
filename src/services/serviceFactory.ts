/**
 * @fileoverview Service Factory Module
 * 
 * This module provides a factory for creating service instances based on the
 * current API mode (mock or REST). It allows seamless switching between
 * localStorage-based mock implementation and real backend REST API.
 * 
 * Currently uses MockApi as the default implementation. When a real backend
 * is ready, implement REST versions of each service interface.
 * 
 * @example
 * ```typescript
 * import { services, isMockMode } from './serviceFactory';
 * 
 * // Access services through the unified container
 * const result = await services.auth.login('1', '1', 'OWNER');
 * 
 * // Check current mode
 * if (isMockMode()) {
 *   console.log('Using mock API');
 * }
 * ```
 */

import { apiConfig, isMockMode, isRestMode, debugLog } from './apiConfig';
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
  SiteSettings,
  Branch,
  OrderStatus,
  OrderInternalStatus,
  ImportRequestStatus,
  MissingStatus,
  CustomerStatus,
  AccountRequestStatus,
  PriceLevel,
  BusinessCustomerType
} from '../types';

// Re-export utility functions
export { isMockMode, isRestMode };

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Authentication Service Interface
 */
export interface IAuthService {
  login(identifier: string, secret: string, type: 'OWNER' | 'STAFF'): Promise<{ user: User; profile: BusinessProfile | null }>;
  logout(): Promise<void>;
  getSession(): Promise<User | null>;
  isAuthenticated(): boolean;
}

/**
 * User/Staff Service Interface
 */
export interface IUserService {
  getAllUsers(): Promise<Array<{ user: User; profile: BusinessProfile }>>;
  getEmployees(mainUserId: string): Promise<User[]>;
  addEmployee(mainUserId: string, empData: Partial<User>): Promise<{ user: User; activationCode: string }>;
  deleteEmployee(employeeId: string): Promise<void>;
  toggleEmployeeStatus(employeeId: string): Promise<User>;
}

/**
 * Customer Service Interface
 */
export interface ICustomerService {
  getCustomersDatabase(): Promise<BusinessProfile[]>;
  updateCustomerStatus(customerId: string, status: CustomerStatus, suspendedUntil?: string): Promise<void>;
  addCustomerSearchPoints(customerId: string, points: number): Promise<void>;
  updateStaffStatus(staffId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED'): Promise<void>;
  resetFailedLogin(userId: string): Promise<void>;
}

/**
 * Product Service Interface
 */
export interface IProductService {
  searchProducts(query: string): Promise<Product[]>;
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<{ newArrivals: Product[]; onSale: Product[] }>;
  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  importProductsFromOnyxExcel(file: File): Promise<{ imported: number; updated: number; skipped: number; errors: string[] }>;
}

/**
 * Order Service Interface
 */
export interface IOrderService {
  getOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: Omit<Order, 'id' | 'status' | 'date'>): Promise<Order>;
  cancelOrder(orderId: string, cancelledBy: 'CUSTOMER' | 'ADMIN'): Promise<Order>;
  deleteOrder(orderId: string): Promise<void>;
  adminUpdateOrderStatus(orderId: string, newStatus: OrderStatus, changedBy: string): Promise<Order>;
  updateOrderInternalStatus(orderId: string, newStatus: OrderInternalStatus, changedBy: string, note?: string): Promise<Order>;
}

/**
 * Quote Service Interface
 */
export interface IQuoteService {
  getAllQuoteRequests(): Promise<QuoteRequest[]>;
  createQuoteRequest(request: Omit<QuoteRequest, 'id' | 'status' | 'date' | 'totalQuotedAmount' | 'processedDate'>): Promise<QuoteRequest>;
  updateQuoteRequest(updatedReq: QuoteRequest): Promise<void>;
  finalizeQuoteRequest(quoteId: string, reviewedBy: string, generalNote?: string): Promise<QuoteRequest>;
}

/**
 * Import Request Service Interface
 */
export interface IImportService {
  getImportRequests(): Promise<ImportRequest[]>;
  createImportRequest(input: Omit<ImportRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<ImportRequest>;
  updateImportRequestStatus(requestId: string, newStatus: ImportRequestStatus, options?: { note?: string; changedBy: string; actorRole: 'ADMIN' | 'CUSTOMER' }): Promise<ImportRequest>;
  uploadImportRequestExcel(requestId: string, fileName: string, userName: string): Promise<ImportRequest>;
  completeImportRequestPricing(requestId: string, data: { pricingFileName: string; totalAmount: number; adminName: string }): Promise<ImportRequest>;
  confirmImportRequestByCustomer(requestId: string, data: { approvalNote?: string; customerName: string }): Promise<ImportRequest>;
}

/**
 * Missing Parts Service Interface
 */
export interface IMissingPartsService {
  getMissingProductRequests(): Promise<MissingProductRequest[]>;
  logMissingProduct(userId: string, query: string, userName?: string, source?: 'SEARCH' | 'QUOTE', quoteRequestId?: string): Promise<void>;
  updateMissingProductStatus(id: string, status: MissingStatus, adminNotes?: string): Promise<MissingProductRequest>;
}

/**
 * Notification Service Interface
 */
export interface INotificationService {
  getNotificationsForUser(userId: string): Promise<Notification[]>;
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification>;
  markNotificationsAsRead(userId: string): Promise<void>;
  markOrdersAsReadForUser(userId: string): Promise<void>;
}

/**
 * Activity Log Service Interface
 */
export interface IActivityLogService {
  getActivityLogs(): Promise<ActivityLogEntry[]>;
  getCustomerActivityLogs(customerId: string): Promise<ActivityLogEntry[]>;
  recordActivity(entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Promise<void>;
}

/**
 * Account Request Service Interface
 */
export interface IAccountRequestService {
  getAccountOpeningRequests(): Promise<AccountOpeningRequest[]>;
  createAccountOpeningRequest(input: Omit<AccountOpeningRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'allowedSearchPoints'>): Promise<AccountOpeningRequest>;
  updateAccountOpeningRequestStatus(id: string, status: AccountRequestStatus, options?: { allowedSearchPoints?: number; adminNotes?: string }): Promise<AccountOpeningRequest>;
  reviewAccountRequest(id: string, decision: { 
    status: AccountRequestStatus;
    adminNotes?: string;
    assignedPriceLevel?: PriceLevel;
    assignedCustomerType?: BusinessCustomerType;
    searchPointsInitial?: number;
    searchPointsMonthly?: number;
    searchDailyLimit?: number;
    portalAccessStart?: string | null;
    portalAccessEnd?: string | null;
    canCreateStaff?: boolean;
    maxStaffUsers?: number | null;
    reviewedBy: string;
  }): Promise<AccountOpeningRequest>;
}

/**
 * Settings Service Interface
 */
export interface ISettingsService {
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: SiteSettings): Promise<void>;
  getBanners(): Promise<import('../types').Banner[]>;
  updateBanners(banners: import('../types').Banner[]): Promise<void>;
  getNews(): Promise<string[]>;
  updateNews(news: string[]): Promise<void>;
}

/**
 * Branch Service Interface
 */
export interface IBranchService {
  addBranch(mainUserId: string, branch: Omit<Branch, 'id'>): Promise<Branch>;
  deleteBranch(mainUserId: string, branchId: string): Promise<void>;
}

/**
 * Admin Stats Service Interface
 */
export interface IAdminStatsService {
  getAdminStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    pendingQuotes: number;
    newAccountRequests: number;
  }>;
  adminGrantPoints(userId: string, points: number): Promise<void>;
}

// ============================================================================
// Mock API Singleton
// ============================================================================

/**
 * Cached MockApi instance for lazy loading
 */
let _mockApi: typeof import('./mockApi').MockApi | null = null;

/**
 * Gets the MockApi instance (lazy loaded)
 */
async function getMockApi() {
  if (!_mockApi) {
    const module = await import('./mockApi');
    _mockApi = module.MockApi;
  }
  return _mockApi;
}

/**
 * Synchronous check for MockApi availability
 * Use this only when you know MockApi is already loaded
 */
function getMockApiSync() {
  if (!_mockApi) {
    throw new Error('MockApi not loaded. Use async getMockApi() first.');
  }
  return _mockApi;
}

// ============================================================================
// Service Implementations
// ============================================================================

/**
 * Creates the auth service
 */
function createAuthService(): IAuthService {
  return {
    async login(identifier, secret, type) {
      const api = await getMockApi();
      return api.login(identifier, secret, type);
    },
    async logout() {
      const api = await getMockApi();
      return api.logout();
    },
    async getSession() {
      const api = await getMockApi();
      return api.getCurrentSession();
    },
    isAuthenticated() {
      return !!localStorage.getItem('b2b_session_sini_v2');
    }
  };
}

/**
 * Creates the user service
 */
function createUserService(): IUserService {
  return {
    async getAllUsers() {
      const api = await getMockApi();
      return api.getAllUsers();
    },
    async getEmployees(mainUserId) {
      const api = await getMockApi();
      return api.getEmployees(mainUserId);
    },
    async addEmployee(mainUserId, empData) {
      const api = await getMockApi();
      return api.addEmployee(mainUserId, empData);
    },
    async deleteEmployee(employeeId) {
      const api = await getMockApi();
      return api.deleteEmployee(employeeId);
    },
    async toggleEmployeeStatus(employeeId) {
      const api = await getMockApi();
      return api.toggleEmployeeStatus(employeeId);
    }
  };
}

/**
 * Creates the customer service
 */
function createCustomerService(): ICustomerService {
  return {
    async getCustomersDatabase() {
      const api = await getMockApi();
      return api.getCustomersDatabase();
    },
    async updateCustomerStatus(customerId, status, suspendedUntil) {
      const api = await getMockApi();
      return api.updateCustomerStatus(customerId, status, suspendedUntil);
    },
    async addCustomerSearchPoints(customerId, points) {
      const api = await getMockApi();
      return api.addCustomerSearchPoints(customerId, points);
    },
    async updateStaffStatus(staffId, status) {
      const api = await getMockApi();
      return api.updateStaffStatus(staffId, status);
    },
    async resetFailedLogin(userId) {
      const api = await getMockApi();
      return api.resetFailedLogin(userId);
    }
  };
}

/**
 * Creates the product service
 */
function createProductService(): IProductService {
  return {
    async searchProducts(query) {
      const api = await getMockApi();
      return api.searchProducts(query);
    },
    async getProducts() {
      const api = await getMockApi();
      return api.getProducts();
    },
    async getFeaturedProducts() {
      const api = await getMockApi();
      return api.getFeaturedProducts();
    },
    async addProduct(product) {
      const api = await getMockApi();
      return api.addProduct(product);
    },
    async updateProduct(id, updates) {
      const api = await getMockApi();
      return api.updateProduct(id, updates);
    },
    async deleteProduct(id) {
      const api = await getMockApi();
      return api.deleteProduct(id);
    },
    async importProductsFromOnyxExcel(file) {
      const api = await getMockApi();
      return api.importProductsFromOnyxExcel(file);
    }
  };
}

/**
 * Creates the order service
 */
function createOrderService(): IOrderService {
  return {
    async getOrders(userId) {
      const api = await getMockApi();
      return api.getOrders(userId);
    },
    async getAllOrders() {
      const api = await getMockApi();
      return api.getAllOrders();
    },
    async createOrder(order) {
      const api = await getMockApi();
      return api.createOrder(order);
    },
    async cancelOrder(orderId, cancelledBy) {
      const api = await getMockApi();
      return api.cancelOrder(orderId, cancelledBy);
    },
    async deleteOrder(orderId) {
      const api = await getMockApi();
      return api.deleteOrder(orderId);
    },
    async adminUpdateOrderStatus(orderId, newStatus, changedBy) {
      const api = await getMockApi();
      return api.adminUpdateOrderStatus(orderId, newStatus, changedBy);
    },
    async updateOrderInternalStatus(orderId, newStatus, changedBy, note) {
      const api = await getMockApi();
      return api.updateOrderInternalStatus(orderId, newStatus, changedBy, note);
    }
  };
}

/**
 * Creates the quote service
 */
function createQuoteService(): IQuoteService {
  return {
    async getAllQuoteRequests() {
      const api = await getMockApi();
      return api.getAllQuoteRequests();
    },
    async createQuoteRequest(request) {
      const api = await getMockApi();
      return api.createQuoteRequest(request);
    },
    async updateQuoteRequest(updatedReq) {
      const api = await getMockApi();
      return api.updateQuoteRequest(updatedReq);
    },
    async finalizeQuoteRequest(quoteId, reviewedBy, generalNote) {
      const api = await getMockApi();
      return api.finalizeQuoteRequest(quoteId, reviewedBy, generalNote);
    }
  };
}

/**
 * Creates the import service
 */
function createImportService(): IImportService {
  return {
    async getImportRequests() {
      const api = await getMockApi();
      return api.getImportRequests();
    },
    async createImportRequest(input) {
      const api = await getMockApi();
      return api.createImportRequest(input);
    },
    async updateImportRequestStatus(requestId, newStatus, options) {
      const api = await getMockApi();
      return api.updateImportRequestStatus(requestId, newStatus, options);
    },
    async uploadImportRequestExcel(requestId, fileName, userName) {
      const api = await getMockApi();
      return api.uploadImportRequestExcel(requestId, fileName, userName);
    },
    async completeImportRequestPricing(requestId, data) {
      const api = await getMockApi();
      return api.completeImportRequestPricing(requestId, data);
    },
    async confirmImportRequestByCustomer(requestId, data) {
      const api = await getMockApi();
      return api.confirmImportRequestByCustomer(requestId, data);
    }
  };
}

/**
 * Creates the missing parts service
 */
function createMissingPartsService(): IMissingPartsService {
  return {
    async getMissingProductRequests() {
      const api = await getMockApi();
      return api.getMissingProductRequests();
    },
    async logMissingProduct(userId, query, userName, source, quoteRequestId) {
      const api = await getMockApi();
      return api.logMissingProduct(userId, query, userName, source, quoteRequestId);
    },
    async updateMissingProductStatus(id, status, adminNotes) {
      const api = await getMockApi();
      return api.updateMissingProductStatus(id, status, adminNotes);
    }
  };
}

/**
 * Creates the notification service
 */
function createNotificationService(): INotificationService {
  return {
    async getNotificationsForUser(userId) {
      const api = await getMockApi();
      return api.getNotificationsForUser(userId);
    },
    async getAllNotifications() {
      const api = await getMockApi();
      return api.getAllNotifications();
    },
    async createNotification(notifData) {
      const api = await getMockApi();
      return api.createNotification(notifData);
    },
    async markNotificationsAsRead(userId) {
      const api = await getMockApi();
      return api.markNotificationsAsRead(userId);
    },
    async markOrdersAsReadForUser(userId) {
      const api = await getMockApi();
      return api.markOrdersAsReadForUser(userId);
    }
  };
}

/**
 * Creates the activity log service
 */
function createActivityLogService(): IActivityLogService {
  return {
    async getActivityLogs() {
      const api = await getMockApi();
      return api.getActivityLogs();
    },
    async getCustomerActivityLogs(customerId) {
      const api = await getMockApi();
      return api.getCustomerActivityLogs(customerId);
    },
    async recordActivity(entry) {
      const api = await getMockApi();
      return api.recordActivity(entry);
    }
  };
}

/**
 * Creates the account request service
 */
function createAccountRequestService(): IAccountRequestService {
  return {
    async getAccountOpeningRequests() {
      const api = await getMockApi();
      return api.getAccountOpeningRequests();
    },
    async createAccountOpeningRequest(input) {
      const api = await getMockApi();
      return api.createAccountOpeningRequest(input);
    },
    async updateAccountOpeningRequestStatus(id, status, options) {
      const api = await getMockApi();
      return api.updateAccountOpeningRequestStatus(id, status, options);
    },
    async reviewAccountRequest(id, decision) {
      const api = await getMockApi();
      return api.reviewAccountRequest(id, decision);
    }
  };
}

/**
 * Creates the settings service
 */
function createSettingsService(): ISettingsService {
  return {
    async getSettings() {
      const api = await getMockApi();
      return api.getSettings();
    },
    async updateSettings(settings) {
      const api = await getMockApi();
      return api.updateSettings(settings);
    },
    async getBanners() {
      const api = await getMockApi();
      return api.getBanners();
    },
    async updateBanners(banners) {
      const api = await getMockApi();
      return api.updateBanners(banners);
    },
    async getNews() {
      const api = await getMockApi();
      return api.getNews();
    },
    async updateNews(news) {
      const api = await getMockApi();
      return api.updateNews(news);
    }
  };
}

/**
 * Creates the branch service
 */
function createBranchService(): IBranchService {
  return {
    async addBranch(mainUserId, branch) {
      const api = await getMockApi();
      return api.addBranch(mainUserId, branch);
    },
    async deleteBranch(mainUserId, branchId) {
      const api = await getMockApi();
      return api.deleteBranch(mainUserId, branchId);
    }
  };
}

/**
 * Creates the admin stats service
 */
function createAdminStatsService(): IAdminStatsService {
  return {
    async getAdminStats() {
      const api = await getMockApi();
      return api.getAdminStats();
    },
    async adminGrantPoints(userId, points) {
      const api = await getMockApi();
      return api.adminGrantPoints(userId, points);
    }
  };
}

// ============================================================================
// Service Getters
// ============================================================================

export function getAuthService(): IAuthService {
  return createAuthService();
}

export function getUserService(): IUserService {
  return createUserService();
}

export function getCustomerService(): ICustomerService {
  return createCustomerService();
}

export function getProductService(): IProductService {
  return createProductService();
}

export function getOrderService(): IOrderService {
  return createOrderService();
}

export function getQuoteService(): IQuoteService {
  return createQuoteService();
}

export function getImportService(): IImportService {
  return createImportService();
}

export function getMissingPartsService(): IMissingPartsService {
  return createMissingPartsService();
}

export function getNotificationService(): INotificationService {
  return createNotificationService();
}

export function getActivityLogService(): IActivityLogService {
  return createActivityLogService();
}

export function getAccountRequestService(): IAccountRequestService {
  return createAccountRequestService();
}

export function getSettingsService(): ISettingsService {
  return createSettingsService();
}

export function getBranchService(): IBranchService {
  return createBranchService();
}

export function getAdminStatsService(): IAdminStatsService {
  return createAdminStatsService();
}

// ============================================================================
// Unified Service Container
// ============================================================================

/**
 * All services in a single container
 * Provides convenient access to all services through a single import
 * 
 * @example
 * ```typescript
 * import { services } from './serviceFactory';
 * 
 * const result = await services.auth.login('1', '1', 'OWNER');
 * const orders = await services.orders.getAllOrders();
 * ```
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
  get settings() { return getSettingsService(); },
  get branches() { return getBranchService(); },
  get adminStats() { return getAdminStatsService(); }
};

export default services;
