/**
 * API Service Layer - Facade Pattern
 * 
 * هذا الملف هو واجهة facade فقط - جميع التنفيذات في ./api/modules/*
 * لا تعدل هذا الملف مباشرة - عدل الـ modules المناسبة بدلاً من ذلك
 * 
 * @see docs/API_CONTRIBUTIONS.md للمزيد من المعلومات
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { ApiClient, get, post, put, del } from './apiClient';

// ============================================
// Import ALL Modules
// ============================================
import * as OrdersModule from './api/modules/orders';
import * as ProductsModule from './api/modules/products';
import * as SuppliersModule from './api/modules/suppliers';
import * as SettingsModule from './api/modules/settings';
import * as NotificationsModule from './api/modules/notifications';
import * as CustomersModule from './api/modules/customers';
import * as AdminUsersModule from './api/modules/adminUsers';
import * as QuotesModule from './api/modules/quotes';
import * as ActivityModule from './api/modules/activity';
import * as InstallmentsModule from './api/modules/installments';
import * as UserManagementModule from './api/modules/userManagement';
import * as AiModule from './api/modules/ai';
import * as ImagesModule from './api/modules/images';
import * as CurrencyModule from './api/modules/currency';
import * as ReportsModule from './api/modules/reports';
import * as DashboardModule from './api/modules/dashboard';

// ============================================
// Production Mode Flag
// ============================================
const USE_REAL_API = true;
console.log('🚀 Using REAL Backend API (100% Production Mode)');

// ============================================
// API Adapter - Facade Pattern
// ============================================
const RealApiAdapter = {
  // ============================================
  // Core Functions (Auth)
  // ============================================
  checkHealth: () => ApiClient.checkHealth(),
  
  async login(identifier: string, secret: string, loginType: 'OWNER' | 'STAFF' = 'OWNER') {
    const result = await ApiClient.auth.login(identifier, secret, loginType.toLowerCase() as 'owner' | 'staff');
    const userData = result.data?.user || result.user;
    const token = result.data?.accessToken || result.token;
    
    if (!userData) {
      throw new Error('فشل تسجيل الدخول: لم يتم استرجاع بيانات المستخدم');
    }
    
    localStorage.setItem('b2b_session_sini_v2', JSON.stringify(userData));
    if (token) ApiClient.setAuthToken(token);
    
    return { user: userData, profile: userData.profile || userData.businessProfile || null, token };
  },
  
  async logout(): Promise<void> {
    try { await ApiClient.auth.logout(); } catch { ApiClient.setAuthToken(null); }
    localStorage.removeItem('b2b_session_sini_v2');
  },
  
  async getCurrentSession() {
    const savedSession = localStorage.getItem('b2b_session_sini_v2');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        try {
          const result = await ApiClient.auth.getCurrentUser();
          if (result.user) {
            localStorage.setItem('b2b_session_sini_v2', JSON.stringify(result.user));
            return result.user;
          }
        } catch { /* use stored */ }
        return user;
      } catch { localStorage.removeItem('b2b_session_sini_v2'); }
    }
    try {
      const result = await ApiClient.auth.getCurrentUser();
      if (result.user) {
        localStorage.setItem('b2b_session_sini_v2', JSON.stringify(result.user));
        return result.user;
      }
    } catch { /* no session */ }
    return null;
  },

  // ============================================
  // Customers Module - Delegated
  // ============================================
  getAllUsers: CustomersModule.getAllUsers,
  getCustomersDatabase: CustomersModule.getCustomersDatabase,
  createCustomerFromAdmin: CustomersModule.createCustomerFromAdmin,
  updateCustomerStatus: CustomersModule.updateCustomerStatus,
  getCustomerById: CustomersModule.getCustomerById,
  updateCustomerProfileAdmin: CustomersModule.updateCustomerProfileAdmin,
  addCustomerSearchPoints: CustomersModule.addCustomerSearchPoints,
  deductCustomerSearchPoints: CustomersModule.deductCustomerSearchPoints,
  updateCustomerPriceVisibility: CustomersModule.updateCustomerPriceVisibility,
  getCustomerStats: CustomersModule.getCustomerStats,
  addCustomerNote: CustomersModule.addCustomerNote,
  getCustomerNotes: CustomersModule.getCustomerNotes,
  getCustomerOrdersSummary: CustomersModule.getCustomerOrdersSummary,
  addBranch: CustomersModule.addBranch,
  deleteBranch: CustomersModule.deleteBranch,
  addEmployee: CustomersModule.addEmployee,
  toggleEmployeeStatus: CustomersModule.toggleEmployeeStatus,
  deleteEmployee: CustomersModule.deleteEmployee,
  updateStaffStatus: CustomersModule.updateStaffStatus,
  resetFailedLogin: CustomersModule.resetFailedLogin,
  getAdminCustomers: CustomersModule.getAdminCustomers,

  // ============================================
  // Orders Module - Delegated
  // ============================================
  getAllOrders: OrdersModule.getAllOrders,
  getOrderById: OrdersModule.getOrderById,
  createOrder: OrdersModule.createOrder,
  updateOrderStatus: OrdersModule.updateOrderStatus,
  cancelOrder: OrdersModule.cancelOrder,
  getMyOrders: OrdersModule.getMyOrders,
  getOrders: OrdersModule.getOrders,
  getOrderStats: OrdersModule.getOrderStats,
  deleteOrder: OrdersModule.deleteOrder,
  getOrderHistory: OrdersModule.getOrderHistory,

  // ============================================
  // Notifications Module - Delegated
  // ============================================
  getNotificationsForUser: NotificationsModule.getNotificationsForUser,
  getAllNotifications: NotificationsModule.getAllNotifications,
  markNotificationAsRead: NotificationsModule.markNotificationAsRead,
  markAllNotificationsAsRead: NotificationsModule.markAllNotificationsAsRead,
  markNotificationsAsRead: NotificationsModule.markNotificationsAsRead,
  clearNotificationsForUser: NotificationsModule.clearNotificationsForUser,
  deleteNotification: NotificationsModule.deleteNotification,
  createNotification: NotificationsModule.createNotification,
  notifyAdmins: NotificationsModule.notifyAdmins,
  getUnreadNotificationCount: NotificationsModule.getUnreadNotificationCount,

  // ============================================
  // Settings Module - Delegated
  // ============================================
  getSettings: SettingsModule.getSettings,
  getSettingByKey: SettingsModule.getSettingByKey,
  updateSetting: SettingsModule.updateSetting,
  updateSettings: SettingsModule.updateSettings,
  getFeatureFlags: SettingsModule.getFeatureFlags,
  updateFeatureFlag: SettingsModule.updateFeatureFlag,
  getQualityCodes: SettingsModule.getQualityCodes,
  createQualityCode: SettingsModule.createQualityCode,
  updateQualityCode: SettingsModule.updateQualityCode,
  getBrandCodes: SettingsModule.getBrandCodes,
  createBrandCode: SettingsModule.createBrandCode,
  updateBrandCode: SettingsModule.updateBrandCode,
  getShippingMethods: SettingsModule.getShippingMethods,
  createShippingMethod: SettingsModule.createShippingMethod,
  updateShippingMethod: SettingsModule.updateShippingMethod,
  getShippingZones: SettingsModule.getShippingZones,
  getBanners: SettingsModule.getBanners,
  updateBanners: SettingsModule.updateBanners,
  getNews: SettingsModule.getNews,
  updateNews: SettingsModule.updateNews,
  getStatusLabels: SettingsModule.getStatusLabels,
  updateStatusLabels: SettingsModule.updateStatusLabels,
  async getExcelTemplates() {
    try { return await get(`/settings/excel-templates`); } catch { return []; }
  },

  // ============================================
  // Activity Module - Delegated
  // ============================================
  recordActivity: ActivityModule.recordActivity,
  getActivityLogs: ActivityModule.getActivityLogs,
  getActivityLogsFiltered: ActivityModule.getActivityLogsFiltered,
  getCustomerActivityLogs: ActivityModule.getCustomerActivityLogs,
  getOnlineUsers: ActivityModule.getOnlineUsers,
  getOnlineUsersGrouped: ActivityModule.getOnlineUsersGrouped,
  recordHeartbeat: ActivityModule.recordHeartbeat,
  updateUserLastActivity: ActivityModule.updateUserLastActivity,
  getActivityStats: ActivityModule.getActivityStats,
  logActivityExtended: ActivityModule.logActivityExtended,

  // ============================================
  // Quotes Module - Delegated
  // ============================================
  getAllQuoteRequests: QuotesModule.getAllQuoteRequests,
  getMyQuoteRequests: QuotesModule.getMyQuoteRequests,
  createQuoteRequest: QuotesModule.createQuoteRequest,
  getQuoteById: QuotesModule.getQuoteById,
  updateQuoteStatus: QuotesModule.updateQuoteStatus,

  // ============================================
  // Products Module - Delegated
  // ============================================
  searchProducts: ProductsModule.searchProducts,
  getProductById: ProductsModule.getProductById,

  // ============================================
  // Admin Users Module - Delegated
  // ============================================
  getAdminUsers: AdminUsersModule.getAdminUsers,
  createAdminUser: AdminUsersModule.createAdminUser,
  updateAdminUser: AdminUsersModule.updateAdminUser,
  deleteAdminUser: AdminUsersModule.deleteAdminUser,
  approveAdminUser: AdminUsersModule.approveAdminUser,
  blockAdminUser: AdminUsersModule.blockAdminUser,
  getRoles: AdminUsersModule.getRoles,
  createRole: AdminUsersModule.createRole,
  updateRole: AdminUsersModule.updateRole,
  deleteRole: AdminUsersModule.deleteRole,
  getPermissions: AdminUsersModule.getPermissions,
  assignRoleToUser: AdminUsersModule.assignRoleToUser,
  removeRoleFromUser: AdminUsersModule.removeRoleFromUser,

  // ============================================
  // Suppliers Module - Delegated
  // ============================================
  getSupplierProducts: SuppliersModule.getSupplierProducts,
  getSupplierStats: SuppliersModule.getSupplierStats,
  getSupplierById: SuppliersModule.getSupplierById,
  updateSupplierProfile: SuppliersModule.updateSupplierProfile,
  addSupplierProduct: SuppliersModule.addSupplierProduct,
  updateSupplierProduct: SuppliersModule.updateSupplierProduct,

  // ============================================
  // Admin Stats
  // ============================================
  async getAdminStats() {
    const result = await ApiClient.admin.getStats();
    return result.stats;
  },

  // ============================================
  // Installments Module - Delegated
  // ============================================
  getInstallmentRequests: InstallmentsModule.getInstallmentRequests,
  createInstallmentRequest: InstallmentsModule.createInstallmentRequest,
  updateInstallmentRequest: InstallmentsModule.updateInstallmentRequest,
  deleteInstallmentRequest: InstallmentsModule.deleteInstallmentRequest,
  getInstallmentRequestById: InstallmentsModule.getInstallmentRequestById,
  getInstallmentRequestsForSupplier: InstallmentsModule.getInstallmentRequestsForSupplier,
  closeInstallmentRequest: InstallmentsModule.closeInstallmentRequest,
  cancelInstallmentRequest: InstallmentsModule.cancelInstallmentRequest,
  createInstallmentOffer: InstallmentsModule.createInstallmentOffer,
  getInstallmentOffers: InstallmentsModule.getInstallmentOffers,
  getInstallmentOfferById: InstallmentsModule.getInstallmentOfferById,
  getOffersByRequestId: InstallmentsModule.getOffersByRequestId,
  updateInstallmentOffer: InstallmentsModule.updateInstallmentOffer,
  customerRespondToOffer: InstallmentsModule.customerRespondToOffer,
  recordSinicarDecision: InstallmentsModule.recordSinicarDecision,
  forwardRequestToSuppliers: InstallmentsModule.forwardRequestToSuppliers,
  supplierSubmitOffer: InstallmentsModule.supplierSubmitOffer,
  markInstallmentAsPaid: InstallmentsModule.markInstallmentAsPaid,
  getInstallmentStats: InstallmentsModule.getInstallmentStats,
  generatePaymentSchedule: InstallmentsModule.generatePaymentSchedule,
  getCustomerCreditProfile: InstallmentsModule.getCustomerCreditProfile,

  // ============================================
  // User Management Module - Delegated
  // ============================================
  getPendingUsers: UserManagementModule.getPendingUsers,
  approveUser: UserManagementModule.approveUser,
  rejectUser: UserManagementModule.rejectUser,
  blockUser: UserManagementModule.blockUser,
  unblockUser: UserManagementModule.unblockUser,
  suspendUser: UserManagementModule.suspendUser,
  updateUserPassword: UserManagementModule.updateUserPassword,

  // ============================================
  // AI Module - Delegated
  // ============================================
  getAiSuggestions: AiModule.getAiSuggestions,
  processAiQuery: AiModule.processAiQuery,

  // ============================================
  // Images Module - Delegated
  // ============================================
  uploadImage: ImagesModule.uploadImage,
  deleteImage: ImagesModule.deleteImage,

  // ============================================
  // Currency Module - Delegated
  // ============================================
  getExchangeRates: CurrencyModule.getExchangeRates,
  updateExchangeRates: CurrencyModule.updateExchangeRates,

  // ============================================
  // Reports Module - Delegated
  // ============================================
  getReports: ReportsModule.getReports,
  generateReport: ReportsModule.generateReport,
  getReportById: ReportsModule.getReportById,

  // ============================================
  // Dashboard Module - Delegated
  // ============================================
  getDashboardStats: DashboardModule.getDashboardStats,
  getSupplierDashboardStats: DashboardModule.getSupplierDashboardStats,
};

// ============================================
// Create Proxy for Undefined Functions
// ============================================
const createApiProxy = () => {
  return new Proxy(RealApiAdapter, {
    get(target: any, prop: string | symbol) {
      if (prop === 'then') return undefined;
      if (typeof prop === 'symbol') {
        if (prop === Symbol.toStringTag) return 'ApiProxy';
        return undefined;
      }
      
      if (prop in target) {
        return target[prop];
      }
      
      console.warn(`⚠️ API function "${String(prop)}" not implemented.`);
      return async (...args: any[]) => {
        console.error(`❌ Called unimplemented API function: ${String(prop)}`, args);
        return null;
      };
    }
  });
};

export const Api = createApiProxy();
export { ApiClient };
export default Api;
