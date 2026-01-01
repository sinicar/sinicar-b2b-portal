/**
 * @fileoverview Service Factory Module
 * 
 * This module provides a factory for creating service instances based on the
 * current API mode (mock, REST, or Supabase). It allows seamless switching between
 * localStorage-based mock implementation, real backend REST API, and Supabase.
 * 
 * @example
 * ```typescript
 * import { services, isMockMode, isSupabaseMode } from './serviceFactory';
 * 
 * // Access services through the unified container
 * const result = await services.auth.login('1', '1', 'OWNER');
 * 
 * // Check current mode
 * if (isMockMode()) {
 *   console.log('Using mock API');
 * } else if (isSupabaseMode()) {
 *   console.log('Using Supabase');
 * }
 * ```
 */

import { apiConfig, isMockMode, isRestMode, isSupabaseMode, debugLog } from './apiConfig';
import { httpClient, ApiResponse } from './httpClient';
import { supabase } from './supabaseClient';
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
export { isMockMode, isRestMode, isSupabaseMode };

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
 * Cached Api instance for lazy loading
 */
let _api: typeof import('./api').Api | null = null;

/**
 * Gets the Api instance (lazy loaded) - Now uses Real Backend
 */
async function getApi() {
  if (!_api) {
    const module = await import('./api');
    _api = module.Api;
  }
  return _api;
}

/**
 * Synchronous check for Api availability
 * Use this only when you know Api is already loaded
 */
function getApiSync() {
  if (!_api) {
    throw new Error('Api not loaded. Use async getApi() first.');
  }
  return _api;
}

// ============================================================================
// Supabase Service Singleton
// ============================================================================

/**
 * Cached Supabase Service instance for lazy loading
 */
let _supabaseService: typeof import('./supabaseClient').SupabaseService | null = null;

/**
 * Gets the Supabase Service instance (lazy loaded)
 */
async function getSupabaseService() {
  if (!_supabaseService) {
    const module = await import('./supabaseClient');
    _supabaseService = module.SupabaseService;
  }
  return _supabaseService;
}

// ============================================================================
// Service Implementations
// ============================================================================

/**
 * Creates the auth service
 * Supports both Mock API and Supabase
 */
function createAuthService(): IAuthService {
  return {
    async login(identifier, secret, type) {
      if (isSupabaseMode()) {
        const supabase = await getSupabaseService();
        const userData = await supabase.auth.login(identifier, secret);
        return {
          user: {
            id: userData.id,
            clientId: userData.client_id || userData.customer_number || identifier,
            name: userData.name,
            email: userData.email || '',
            role: userData.role as any,
            isActive: userData.is_active ?? true,
          } as User,
          profile: userData.business_profiles?.[0] as BusinessProfile || null
        };
      }
      const api = await getApi();
      return api.login(identifier, secret, type);
    },
    async logout() {
      if (isSupabaseMode()) {
        const supabase = await getSupabaseService();
        return supabase.auth.logout();
      }
      const api = await getApi();
      return api.logout();
    },
    async getSession() {
      if (isSupabaseMode()) {
        const supabase = await getSupabaseService();
        const userData = supabase.auth.getCurrentUser();
        if (!userData) return null;
        return {
          id: userData.id,
          clientId: userData.client_id || userData.customer_number,
          name: userData.name,
          email: userData.email || '',
          role: userData.role as any,
          isActive: userData.is_active ?? true,
        } as User;
      }
      const api = await getApi();
      return api.getCurrentSession();
    },
    isAuthenticated() {
      if (isSupabaseMode()) {
        return !!localStorage.getItem('sini_car_user');
      }
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
      const api = await getApi();
      return api.getAllUsers();
    },
    async getEmployees(mainUserId) {
      const api = await getApi();
      return api.getEmployees(mainUserId);
    },
    async addEmployee(mainUserId, empData) {
      const api = await getApi();
      return api.addEmployee(mainUserId, empData);
    },
    async deleteEmployee(employeeId) {
      const api = await getApi();
      return api.deleteEmployee(employeeId);
    },
    async toggleEmployeeStatus(employeeId) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getCustomersDatabase();
    },
    async updateCustomerStatus(customerId, status, suspendedUntil) {
      const api = await getApi();
      return api.updateCustomerStatus(customerId, status, suspendedUntil);
    },
    async addCustomerSearchPoints(customerId, points) {
      const api = await getApi();
      return api.addCustomerSearchPoints(customerId, points);
    },
    async updateStaffStatus(staffId, status) {
      const api = await getApi();
      return api.updateStaffStatus(staffId, status);
    },
    async resetFailedLogin(userId) {
      const api = await getApi();
      return api.resetFailedLogin(userId);
    }
  };
}

/**
 * Creates the product service
 * Supports both Mock API and Supabase for millions of products
 */
function createProductService(): IProductService {
  return {
    async searchProducts(query) {
      if (isSupabaseMode()) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`part_number.ilike.%${query}%,name.ilike.%${query}%,brand.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(50);

        if (error) {
          console.error('Error searching products:', error);
          return [];
        }
        return (data || []).map(mapSupabaseProductToProduct);
      }
      const api = await getApi();
      return api.searchProducts(query);
    },
    async getProducts() {
      if (isSupabaseMode()) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error getting products:', error);
          return [];
        }
        return (data || []).map(mapSupabaseProductToProduct);
      }
      const api = await getApi();
      return api.getProducts();
    },
    async getFeaturedProducts() {
      if (isSupabaseMode()) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error getting featured products:', error);
          return { newArrivals: [], onSale: [] };
        }
        const products = data || [];
        const newArrivals = products.filter((p: any) => p.is_new_arrival).slice(0, 10);
        const onSale = products.filter((p: any) => p.is_on_sale).slice(0, 10);
        return {
          newArrivals: newArrivals.map(mapSupabaseProductToProduct),
          onSale: onSale.map(mapSupabaseProductToProduct)
        };
      }
      const api = await getApi();
      return api.getFeaturedProducts();
    },
    async addProduct(product) {
      if (isSupabaseMode()) {
        const { data, error } = await supabase
          .from('products')
          .insert([mapProductToSupabase(product)])
          .select()
          .single();

        if (error) {
          console.error('Error adding product:', error);
          throw error;
        }
        return mapSupabaseProductToProduct(data);
      }
      const api = await getApi();
      return api.addProduct(product);
    },
    async updateProduct(id, updates) {
      if (isSupabaseMode()) {
        const { data, error } = await supabase
          .from('products')
          .update(mapProductToSupabase(updates))
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating product:', error);
          throw error;
        }
        return mapSupabaseProductToProduct(data);
      }
      const api = await getApi();
      return api.updateProduct(id, updates);
    },
    async deleteProduct(id) {
      if (isSupabaseMode()) {
        const { error } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', id);

        if (error) console.error('Error deleting product:', error);
        return;
      }
      const api = await getApi();
      return api.deleteProduct(id);
    },
    async importProductsFromOnyxExcel(file) {
      // Import is complex, keep using Api for now
      const api = await getApi();
      return api.importProductsFromOnyxExcel(file);
    }
  };
}

/**
 * Maps Supabase product to frontend Product type
 */
function mapSupabaseProductToProduct(p: any): Product {
  return {
    id: p.id,
    partNumber: p.part_number,
    name: p.name,
    brand: p.brand || '',
    category: p.category || '',
    price: (p.price_level_1 || 0) / 100, // Convert from cents
    priceLevel1: (p.price_level_1 || 0) / 100,
    priceLevel2: (p.price_level_2 || 0) / 100,
    priceLevel3: (p.price_level_3 || 0) / 100,
    priceLevel4: (p.price_level_4 || 0) / 100,
    quantity: p.quantity || 0,
    minOrderQty: p.min_order_qty || 1,
    availabilityType: p.availability_type || 'INSTOCK',
    deliveryHours: p.delivery_hours || 0,
    carMake: p.car_make || '',
    carModel: p.car_model || '',
    imageUrl: p.image_url || '',
    isActive: p.is_active ?? true,
    isFeatured: p.is_featured ?? false,
    createdAt: p.created_at || new Date().toISOString(),
  } as Product;
}

/**
 * Maps frontend Product to Supabase format
 */
function mapProductToSupabase(p: any): any {
  const mapped: any = {};
  if (p.partNumber !== undefined) mapped.part_number = p.partNumber;
  if (p.name !== undefined) mapped.name = p.name;
  if (p.brand !== undefined) mapped.brand = p.brand;
  if (p.category !== undefined) mapped.category = p.category;
  if (p.price !== undefined) mapped.price_level_1 = Math.round(p.price * 100);
  if (p.priceLevel1 !== undefined) mapped.price_level_1 = Math.round(p.priceLevel1 * 100);
  if (p.priceLevel2 !== undefined) mapped.price_level_2 = Math.round(p.priceLevel2 * 100);
  if (p.priceLevel3 !== undefined) mapped.price_level_3 = Math.round(p.priceLevel3 * 100);
  if (p.priceLevel4 !== undefined) mapped.price_level_4 = Math.round(p.priceLevel4 * 100);
  if (p.quantity !== undefined) mapped.quantity = p.quantity;
  if (p.minOrderQty !== undefined) mapped.min_order_qty = p.minOrderQty;
  if (p.availabilityType !== undefined) mapped.availability_type = p.availabilityType;
  if (p.deliveryHours !== undefined) mapped.delivery_hours = p.deliveryHours;
  if (p.carMake !== undefined) mapped.car_make = p.carMake;
  if (p.carModel !== undefined) mapped.car_model = p.carModel;
  if (p.imageUrl !== undefined) mapped.image_url = p.imageUrl;
  if (p.isActive !== undefined) mapped.is_active = p.isActive;
  if (p.isFeatured !== undefined) mapped.is_featured = p.isFeatured;
  return mapped;
}

/**
 * Creates the order service
 */
function createOrderService(): IOrderService {
  // إذا كان وضع Supabase مفعّل، نستخدم Supabase للطلبات
  if (isSupabaseMode()) {
    return {
      async getOrders(userId) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          return [];
        }
        // Map to Order format
        return (data || []).map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          items: [],
          totalAmount: o.total_amount,
          status: o.status as any,
          date: o.created_at
        }));
      },
      async getAllOrders() {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching all orders:', error);
          return [];
        }
        return (data || []).map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          items: [],
          totalAmount: o.total_amount,
          status: o.status as any,
          date: o.created_at
        }));
      },
      async createOrder(order) {
        const orderNumber = `ORD-${Date.now()}`;
        // نحفظ customer_number في notes مؤقتاً لأن user_id يتوقع UUID
        const { data, error } = await supabase
          .from('orders')
          .insert([{
            order_number: orderNumber,
            status: 'PENDING',
            subtotal: order.totalAmount,
            total_amount: order.totalAmount,
            notes: `Customer: ${order.userId}`, // نحفظ رقم العميل هنا
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating order:', error);
          throw error;
        }
        return { ...order, id: data.id, status: 'PENDING' as any, date: new Date().toISOString() };
      },
      async cancelOrder(orderId, cancelledBy) {
        const { data, error } = await supabase
          .from('orders')
          .update({ status: 'CANCELLED', cancelled_by: cancelledBy, cancelled_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          console.error('Error cancelling order:', error);
          throw error;
        }
        return { id: data.id, userId: data.user_id, items: [], totalAmount: data.total_amount, status: data.status as any, date: data.created_at };
      },
      async deleteOrder(orderId) {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) console.error('Error deleting order:', error);
      },
      async adminUpdateOrderStatus(orderId, newStatus, _changedBy) {
        const { data, error } = await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          console.error('Error updating order status:', error);
          throw error;
        }
        return { id: data.id, userId: data.user_id, items: [], totalAmount: data.total_amount, status: data.status as any, date: data.created_at };
      },
      async updateOrderInternalStatus(orderId, newStatus, _changedBy, note) {
        const { data, error } = await supabase
          .from('orders')
          .update({
            internal_status: newStatus,
            notes: note,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          console.error('Error updating internal status:', error);
          throw error;
        }
        return { id: data.id, userId: data.user_id, items: [], totalAmount: data.total_amount, status: data.status as any, date: data.created_at };
      }
    };
  }

  // وضع Mock الأصلي
  return {
    async getOrders(userId) {
      const api = await getApi();
      return api.getOrders(userId);
    },
    async getAllOrders() {
      const api = await getApi();
      const result = await api.getAllOrders();
      // استخراج items من النتيجة الموحّدة {items, total}
      return Array.isArray(result) ? result : (result?.items ?? []);
    },
    async createOrder(order) {
      const api = await getApi();
      return api.createOrder(order);
    },
    async cancelOrder(orderId, cancelledBy) {
      const api = await getApi();
      return api.cancelOrder(orderId, cancelledBy);
    },
    async deleteOrder(orderId) {
      const api = await getApi();
      return api.deleteOrder(orderId);
    },
    async adminUpdateOrderStatus(orderId, newStatus, changedBy) {
      const api = await getApi();
      return api.adminUpdateOrderStatus(orderId, newStatus, changedBy);
    },
    async updateOrderInternalStatus(orderId, newStatus, changedBy, note) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getAllQuoteRequests();
    },
    async createQuoteRequest(request) {
      const api = await getApi();
      return api.createQuoteRequest(request);
    },
    async updateQuoteRequest(updatedReq) {
      const api = await getApi();
      return api.updateQuoteRequest(updatedReq);
    },
    async finalizeQuoteRequest(quoteId, reviewedBy, generalNote) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getImportRequests();
    },
    async createImportRequest(input) {
      const api = await getApi();
      return api.createImportRequest(input);
    },
    async updateImportRequestStatus(requestId, newStatus, options) {
      const api = await getApi();
      return api.updateImportRequestStatus(requestId, newStatus, options);
    },
    async uploadImportRequestExcel(requestId, fileName, userName) {
      const api = await getApi();
      return api.uploadImportRequestExcel(requestId, fileName, userName);
    },
    async completeImportRequestPricing(requestId, data) {
      const api = await getApi();
      return api.completeImportRequestPricing(requestId, data);
    },
    async confirmImportRequestByCustomer(requestId, data) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getMissingProductRequests();
    },
    async logMissingProduct(userId, query, userName, source, quoteRequestId) {
      const api = await getApi();
      return api.logMissingProduct(userId, query, userName, source, quoteRequestId);
    },
    async updateMissingProductStatus(id, status, adminNotes) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getNotificationsForUser(userId);
    },
    async getAllNotifications() {
      const api = await getApi();
      return api.getAllNotifications();
    },
    async createNotification(notifData) {
      const api = await getApi();
      return api.createNotification(notifData);
    },
    async markNotificationsAsRead(userId) {
      const api = await getApi();
      return api.markNotificationsAsRead(userId);
    },
    async markOrdersAsReadForUser(userId) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getActivityLogs();
    },
    async getCustomerActivityLogs(customerId) {
      const api = await getApi();
      return api.getCustomerActivityLogs(customerId);
    },
    async recordActivity(entry) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getAccountOpeningRequests();
    },
    async createAccountOpeningRequest(input) {
      const api = await getApi();
      return api.createAccountOpeningRequest(input);
    },
    async updateAccountOpeningRequestStatus(id, status, options) {
      const api = await getApi();
      return api.updateAccountOpeningRequestStatus(id, status, options);
    },
    async reviewAccountRequest(id, decision) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getSettings();
    },
    async updateSettings(settings) {
      const api = await getApi();
      return api.updateSettings(settings);
    },
    async getBanners() {
      const api = await getApi();
      return api.getBanners();
    },
    async updateBanners(banners) {
      const api = await getApi();
      return api.updateBanners(banners);
    },
    async getNews() {
      const api = await getApi();
      return api.getNews();
    },
    async updateNews(news) {
      const api = await getApi();
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
      const api = await getApi();
      return api.addBranch(mainUserId, branch);
    },
    async deleteBranch(mainUserId, branchId) {
      const api = await getApi();
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
      const api = await getApi();
      return api.getAdminStats();
    },
    async adminGrantPoints(userId, points) {
      const api = await getApi();
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
