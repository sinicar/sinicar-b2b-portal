/**
 * API Client للاتصال بـ Backend الحقيقي
 * يستبدل Api بطلبات API فعلية
 */

// Ensure API_BASE_URL is always a string
const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL: string = typeof envApiUrl === 'string' ? envApiUrl : 'http://localhost:3005/api/v1';

// Token management - يُقرأ من localStorage في كل request
const getAuthToken = () => localStorage.getItem('auth_token');

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

// Request helper with authentication
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // قراءة الـ token في كل request من localStorage
  const authToken = getAuthToken();
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
    // Debug: طباعة آخر 10 أحرف من التوكن للتحقق (دون تسريب التوكن كاملاً)
    if (import.meta.env.DEV) {
      console.debug(`[ApiClient] Request to ${endpoint} with token: ...${authToken.slice(-10)}`);
    }
  } else if (import.meta.env.DEV) {
    console.warn(`[ApiClient] Request to ${endpoint} WITHOUT auth token!`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // تضمين status code في رسالة الخطأ للتشخيص
    const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
    if (import.meta.env.DEV) {
      console.error(`[ApiClient] ${endpoint} failed with ${response.status}:`, errorData);
    }
    throw new Error(`[${response.status}] ${errorMessage}`);
  }

  return response.json();
}

// GET request helper
async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

// POST request helper
async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request helper
async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PATCH request helper
async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request helper
async function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// ============================================
// API Client Export
// ============================================

export const ApiClient = {
  // Token management
  setAuthToken,
  getAuthToken,

  // ============================================
  // Health Check
  // ============================================
  async checkHealth(): Promise<{ status: 'ok' | 'error'; latency: number }> {
    const start = performance.now();
    try {
      await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      const end = performance.now();
      return { status: 'ok', latency: Math.round(end - start) };
    } catch {
      const end = performance.now();
      return { status: 'error', latency: Math.round(end - start) };
    }
  },

  // ============================================
  // Authentication
  // ============================================
  auth: {
    async login(clientId: string, password: string, loginType: 'owner' | 'staff' = 'owner') {
      const result = await post<{ 
        success?: boolean;
        message?: string;
        user?: any; 
        token?: string; 
        data?: { 
          user?: any;
          accessToken?: string;
          refreshToken?: string;
        } 
      }>('/auth/login', {
        identifier: clientId,
        password,
        loginType,
      });
      // Handle both old format (token) and new format (data.accessToken)
      const token = result.token || result.data?.accessToken;
      if (token) {
        setAuthToken(token);
      }
      return result;
    },

    async logout() {
      try {
        await post('/auth/logout');
      } finally {
        setAuthToken(null);
      }
    },

    async register(data: {
      name: string;
      email?: string;
      phone: string;
      whatsapp?: string;
      password: string;
      companyName?: string;
    }) {
      return post<{ user: any; token: string }>('/auth/register', data);
    },

    async getCurrentUser() {
      return get<{ user: any }>('/auth/me');
    },

    async resetPassword(email: string) {
      return post('/auth/reset-password', { email });
    },

    async validateSession() {
      try {
        await get('/auth/me');
        return true;
      } catch {
        return false;
      }
    },
  },

  // ============================================
  // Customers
  // ============================================
  customers: {
    async getAll(params?: { page?: number; limit?: number; search?: string; status?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.search) queryParams.set('search', params.search);
      if (params?.status) queryParams.set('status', params.status);
      const query = queryParams.toString();
      return get<{ customers: any[]; total: number }>(`/customers${query ? `?${query}` : ''}`);
    },

    async getById(id: string) {
      return get<{ customer: any }>(`/customers/${id}`);
    },

    async create(data: any) {
      return post<{ customer: any }>('/customers', data);
    },

    async update(id: string, data: any) {
      return put<{ customer: any }>(`/customers/${id}`, data);
    },

    async updateStatus(id: string, status: string) {
      return patch<{ customer: any }>(`/customers/${id}/status`, { status });
    },

    async delete(id: string) {
      return del(`/customers/${id}`);
    },

    async getOrders(customerId: string) {
      return get<{ orders: any[] }>(`/customers/${customerId}/orders`);
    },

    async getQuotes(customerId: string) {
      return get<{ quotes: any[] }>(`/customers/${customerId}/quotes`);
    },

    async addSearchPoints(customerId: string, points: number, reason?: string) {
      return post(`/customers/${customerId}/search-points`, { points, reason });
    },

    async deductSearchPoints(customerId: string, points: number, reason?: string) {
      return post(`/customers/${customerId}/search-points/deduct`, { points, reason });
    },

    // Account Opening Requests
    async getAccountRequests(params?: { page?: number; limit?: number }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const query = queryParams.toString();
      return get<{ requests: any[]; total: number }>(`/customers/account-requests${query ? `?${query}` : ''}`);
    },

    async createAccountRequest(data: any) {
      return post<{ request: any }>('/customers/account-requests', data);
    },

    async updateAccountRequestStatus(id: string, status: string, adminNotes?: string) {
      return put<{ request: any }>(`/customers/account-requests/${id}/status`, { status, adminNotes });
    },
  },

  // ============================================
  // Orders
  // ============================================
  orders: {
    async getAll(params?: { page?: number; limit?: number; status?: string; customerId?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status) queryParams.set('status', params.status);
      if (params?.customerId) queryParams.set('customerId', params.customerId);
      const query = queryParams.toString();
      return get<{ orders: any[]; total: number }>(`/orders${query ? `?${query}` : ''}`);
    },

    async getById(id: string) {
      return get<{ order: any }>(`/orders/${id}`);
    },

    async create(data: any) {
      return post<{ order: any }>('/orders', data);
    },

    async updateStatus(id: string, status: string) {
      return patch<{ order: any }>(`/orders/${id}/status`, { status });
    },

    async updateInternalStatus(id: string, internalStatus: string) {
      return patch<{ order: any }>(`/orders/${id}/internal-status`, { internalStatus });
    },

    async cancel(id: string, reason?: string) {
      return post<{ order: any }>(`/orders/${id}/cancel`, { reason });
    },

    async addNote(id: string, note: string) {
      return post(`/orders/${id}/notes`, { note });
    },

    // Products search (available within orders module)
    async searchProducts(query: string, limit?: number) {
      const queryParams = new URLSearchParams();
      if (query) queryParams.set('q', query);
      if (limit) queryParams.set('limit', String(limit));
      const queryStr = queryParams.toString();
      return get<{ products: any[] }>(`/orders/products/search${queryStr ? `?${queryStr}` : ''}`);
    },

    // Get current user's orders
    async getMyOrders(params?: { page?: number; limit?: number }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const query = queryParams.toString();
      return get<{ orders: any[]; total: number }>(`/orders/my-orders${query ? `?${query}` : ''}`);
    },

    // Get order statistics
    async getStats() {
      return get<any>('/orders/stats');
    },

    // Delete order
    async delete(id: string) {
      return del<{ message: string }>(`/orders/${id}`);
    },

    // Get order history
    async getHistory(id: string) {
      return get<any[]>(`/orders/${id}/history`);
    },
  },

  // ============================================
  // Quote Requests
  // ============================================
  quotes: {
    async getAll(params?: { page?: number; limit?: number; status?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status) queryParams.set('status', params.status);
      const query = queryParams.toString();
      return get<{ quotes: any[]; total: number }>(`/orders/quotes${query ? `?${query}` : ''}`);
    },

    async getById(id: string) {
      return get<{ quote: any }>(`/orders/quotes/${id}`);
    },

    async create(data: any) {
      return post<{ quote: any }>('/orders/quotes', data);
    },

    async updateStatus(id: string, status: string) {
      return patch<{ quote: any }>(`/orders/quotes/${id}/status`, { status });
    },

    async submitPricing(id: string, items: any[]) {
      return post<{ quote: any }>(`/orders/quotes/${id}/pricing`, { items });
    },

    async convertToOrder(id: string) {
      return post<{ order: any }>(`/orders/quotes/${id}/convert`);
    },

    // Get current user's quotes
    async getMyQuotes(params?: { page?: number; limit?: number }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const query = queryParams.toString();
      return get<{ quotes: any[]; total: number }>(`/orders/quotes/my-quotes${query ? `?${query}` : ''}`);
    },
  },

  // ============================================
  // Suppliers
  // ============================================
  suppliers: {
    async getAll(params?: { page?: number; limit?: number; status?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status) queryParams.set('status', params.status);
      const query = queryParams.toString();
      return get<{ suppliers: any[]; total: number }>(`/suppliers${query ? `?${query}` : ''}`);
    },

    async getById(id: string) {
      return get<{ supplier: any }>(`/suppliers/${id}`);
    },

    async getProducts(supplierId: string) {
      return get<{ products: any[] }>(`/suppliers/${supplierId}/products`);
    },

    async update(supplierId: string, data: any) {
      return put<{ supplier: any }>(`/suppliers/${supplierId}`, data);
    },

    async addProduct(supplierId: string, data: any) {
      return post<{ product: any }>(`/suppliers/${supplierId}/products`, data);
    },

    async updateProduct(supplierId: string, productId: string, data: any) {
      return put<{ product: any }>(`/suppliers/${supplierId}/products/${productId}`, data);
    },

    async deleteProduct(supplierId: string, productId: string) {
      return del(`/suppliers/${supplierId}/products/${productId}`);
    },

    async getRequests(supplierId: string) {
      return get<{ requests: any[] }>(`/suppliers/${supplierId}/requests`);
    },

    async respondToRequest(supplierId: string, requestId: string, response: any) {
      return post(`/suppliers/${supplierId}/requests/${requestId}/respond`, response);
    },

    async getStats(supplierId: string) {
      return get<{ stats: any }>(`/suppliers/${supplierId}/stats`);
    },

    async importFromExcel(supplierId: string, file: File) {
      const formData = new FormData();
      formData.append('file', file);
      
      // جلب token للـ request
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/products/import`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to import products');
      }
      
      return response.json();
    },

    // ============================================
    // Secure /me/ endpoints for Supplier Portal
    // These derive supplierId from the authenticated user's token
    // ============================================

    async getMyDashboard() {
      return get<any>('/suppliers/me/dashboard');
    },

    async getMyProducts(params?: { page?: number; limit?: number; q?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.q) queryParams.set('q', params.q);
      const query = queryParams.toString();
      return get<{ data: any[]; pagination: any }>(`/suppliers/me/products${query ? `?${query}` : ''}`);
    },

    async getMyRequests(params?: { page?: number; limit?: number }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const query = queryParams.toString();
      return get<{ data: any[]; pagination: any }>(`/suppliers/me/requests${query ? `?${query}` : ''}`);
    },

    async getMySettings() {
      return get<any>('/suppliers/me/settings');
    },

    async updateMySettings(data: any) {
      return put<any>('/suppliers/me/settings', data);
    },

    async getMyProfile() {
      return get<any>('/suppliers/my-profile');
    },
  },
  // ============================================
  // Installments
  // ============================================
  installments: {
    async getSettings() {
      return get<any>('/installments/settings');
    },

    async updateSettings(data: any) {
      return put<any>('/installments/settings', data);
    },

    async getStats(customerId?: string) {
      const query = customerId ? `?customerId=${customerId}` : '';
      return get<any>(`/installments/stats${query}`);
    },

    async getRequests(params?: { page?: number; limit?: number; status?: string; customerId?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.status) queryParams.set('status', params.status);
      if (params?.customerId) queryParams.set('customerId', params.customerId);
      const query = queryParams.toString();
      return get<{ requests: any[]; total: number }>(`/installments${query ? `?${query}` : ''}`);
    },

    async getMyRequests(params?: { page?: number; limit?: number }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const query = queryParams.toString();
      return get<{ requests: any[]; total: number }>(`/installments/my-requests${query ? `?${query}` : ''}`);
    },

    async createRequest(data: any) {
      return post<any>('/installments', data);
    },

    async getById(id: string) {
      return get<any>(`/installments/${id}`);
    },

    async adminReview(id: string, data: any) {
      return put<any>(`/installments/${id}/sinicar-decision`, data);
    },

    async forwardToSuppliers(id: string, data: any) {
      return put<any>(`/installments/${id}/forward-to-suppliers`, data);
    },

    async getOffers(requestId: string) {
      return get<any[]>(`/installments/${requestId}/offers`);
    },

    async createOffer(requestId: string, data: any) {
      return post<any>(`/installments/${requestId}/offers`, data);
    },

    async respondToOffer(requestId: string, offerId: string, action: 'accept' | 'reject') {
      return put<any>(`/installments/${requestId}/offers/${offerId}/customer-response`, { action });
    },

    async cancel(id: string, reason?: string) {
      return put<any>(`/installments/${id}/cancel`, { reason });
    },

    async close(id: string, reason?: string) {
      return put<any>(`/installments/${id}/close`, { reason });
    },

    async complete(id: string) {
      return put<any>(`/installments/${id}/complete`, {});
    },
  },

  // ============================================
  // Notifications
  // ============================================
  notifications: {
    async getAll(params?: { page?: number; limit?: number; isRead?: boolean; event?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('offset', String((params.page - 1) * (params.limit || 20)));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.isRead !== undefined) queryParams.set('isRead', String(params.isRead));
      if (params?.event) queryParams.set('event', params.event);
      const query = queryParams.toString();
      return get<{ notifications: any[]; total: number; unreadCount: number }>(`/notifications${query ? `?${query}` : ''}`);
    },

    async getById(id: string) {
      return get<any>(`/notifications/${id}`);
    },

    async getUnreadCount() {
      return get<{ unreadCount: number }>('/notifications/unread-count');
    },

    async markAsRead(id: string) {
      return put<{ success: boolean }>(`/notifications/${id}/read`, {});
    },

    async markAllAsRead() {
      return put<{ count: number }>('/notifications/read-all', {});
    },

    async create(data: { userId?: string; event: string; title: string; body: string; link?: string; priority?: string }) {
      return post<any>('/notifications', data);
    },

    async delete(id: string) {
      return del<{ success: boolean }>(`/notifications/${id}`);
    },

    // Notification Settings
    async getSettings() {
      return get<any[]>('/notifications/settings');
    },

    async updateSettings(settings: any[]) {
      return put<any[]>('/notifications/settings', { settings });
    },

    async updateSettingForEvent(event: string, data: any) {
      return put<any>(`/notifications/settings/${event}`, data);
    },
  },

  // ============================================
  // Settings
  // ============================================
  settings: {
    async getAll(category?: string) {
      const query = category ? `?category=${category}` : '';
      return get<{ settings: any }>(`/settings${query}`);
    },

    async getSetting(key: string) {
      return get<any>(`/settings/${key}`);
    },

    async update(key: string, value: any) {
      return put<any>(`/settings/${key}`, { value });
    },

    async getStatusLabels() {
      return get<{ labels: any }>('/settings/status-labels');
    },

    async updateStatusLabels(labels: any) {
      return put('/settings/status-labels', labels);
    },

    // Feature Flags
    async getFeatureFlags() {
      return get<any[]>('/settings/features/flags');
    },

    async getFeatureFlag(key: string) {
      return get<any>(`/settings/features/flags/${key}`);
    },

    async updateFeatureFlag(key: string, data: { isEnabled: boolean; enabledFor?: string[] }) {
      return put<any>(`/settings/features/flags/${key}`, data);
    },

    // Quality Codes
    async getQualityCodes() {
      return get<any[]>('/settings/quality-codes');
    },

    async createQualityCode(data: any) {
      return post<any>('/settings/quality-codes', data);
    },

    async updateQualityCode(id: string, data: any) {
      return put<any>(`/settings/quality-codes/${id}`, data);
    },

    // Brand Codes
    async getBrandCodes() {
      return get<any[]>('/settings/brand-codes');
    },

    async createBrandCode(data: any) {
      return post<any>('/settings/brand-codes', data);
    },

    async updateBrandCode(id: string, data: any) {
      return put<any>(`/settings/brand-codes/${id}`, data);
    },

    // Shipping Methods
    async getShippingMethods() {
      return get<any[]>('/settings/shipping/methods');
    },

    async createShippingMethod(data: any) {
      return post<any>('/settings/shipping/methods', data);
    },

    async updateShippingMethod(id: string, data: any) {
      return put<any>(`/settings/shipping/methods/${id}`, data);
    },

    // Shipping Zones
    async getShippingZones() {
      return get<any[]>('/settings/shipping/zones');
    },

    async createShippingZone(data: any) {
      return post<any>('/settings/shipping/zones', data);
    },

    async updateShippingZone(id: string, data: any) {
      return put<any>(`/settings/shipping/zones/${id}`, data);
    },

    // Excel Templates
    async getExcelTemplates() {
      return get<any[]>('/settings/excel-templates');
    },

    async getExcelTemplate(id: string) {
      return get<any>(`/settings/excel-templates/${id}`);
    },

    async createExcelTemplate(data: any) {
      return post<any>('/settings/excel-templates', data);
    },
  },

  // ============================================
  // Admin
  // ============================================
  admin: {
    async getStats() {
      return get<{ stats: any }>('/admin/stats');
    },

    async getDashboard() {
      return get<{ dashboard: any }>('/admin/dashboard');
    },

    async getActivityLogs(params?: { page?: number; limit?: number; userId?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.userId) queryParams.set('userId', params.userId);
      const query = queryParams.toString();
      return get<{ logs: any[]; total: number }>(`/admin/activity-logs${query ? `?${query}` : ''}`);
    },

    async getOnlineUsers() {
      return get<{ users: any[] }>('/admin/online-users');
    },

    // User Management
    async getPendingUsers() {
      return get<any[]>('/admin/users/pending');
    },

    async approveUser(userId: string) {
      return put<{ success: boolean; status: string }>(`/admin/users/${userId}/approve`, {});
    },

    async rejectUser(userId: string) {
      return put<{ success: boolean; status: string }>(`/admin/users/${userId}/reject`, {});
    },

    async blockUser(userId: string) {
      return put<{ success: boolean; status: string }>(`/admin/users/${userId}/block`, {});
    },
  },

  // ============================================
  // Permissions
  // ============================================
  permissions: {
    async getRoles() {
      return get<{ roles: any[] }>('/permissions/roles');
    },

    async getPermissions() {
      return get<{ permissions: any[] }>('/permissions');
    },

    async assignRole(userId: string, roleId: string) {
      return post(`/permissions/assign-role`, { userId, roleId });
    },

    async revokeRole(userId: string, roleId: string) {
      return post(`/permissions/revoke-role`, { userId, roleId });
    },
  },

  // ============================================
  // Currencies
  // ============================================
  currencies: {
    async getAll() {
      return get<any[]>('/currencies');
    },

    async getExchangeRates() {
      return get<any[]>('/currencies/exchange-rates');
    },

    async getBaseCurrency() {
      return get<any>('/currencies/base');
    },

    async getRate(code: string) {
      return get<any>(`/currencies/rate/${code}`);
    },

    async convert(amount: number, from: string, to: string) {
      return post<any>('/currencies/convert', { amount, from, to });
    },

    async updateRate(code: string, rateToBase: number, syncPercent?: number) {
      return put<any>(`/currencies/rate/${code}`, { rateToBase, syncPercent });
    },
  },

  // ============================================
  // Reports
  // ============================================
  reports: {
    async getDefinitions() {
      return get<{ reports: any[] }>('/reports/definitions');
    },

    async run(reportCode: string, filters: any) {
      return post<{ data: any }>(`/reports/${reportCode}/run`, { filters });
    },

    async export(reportCode: string, filters: any, format: 'excel' | 'pdf') {
      return post<{ url: string }>(`/reports/${reportCode}/export`, { filters, format });
    },

    async analyzeWithAI(reportCode: string, data: any, mode: 'SUMMARY' | 'INSIGHTS') {
      return post<{ analysis: string }>(`/reports/${reportCode}/ai-analyze`, { data, mode });
    },
  },

  // ============================================
  // Messaging
  // ============================================
  messaging: {
    async getTemplates() {
      return get<{ templates: any[] }>('/messaging/templates');
    },

    async updateTemplate(id: string, data: any) {
      return put<{ template: any }>(`/messaging/templates/${id}`, data);
    },

    async sendMessage(data: { recipientId: string; channel: string; templateId?: string; body?: string }) {
      return post('/messaging/send', data);
    },

    async getLogs(params?: { page?: number; limit?: number }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const query = queryParams.toString();
      return get<{ logs: any[]; total: number }>(`/messaging/logs${query ? `?${query}` : ''}`);
    },
  },

  // ============================================
  // AI
  // ============================================
  ai: {
    async chat(message: string, context?: { conversationHistory?: any[]; language?: string; customerName?: string }) {
      return post<{ success: boolean; response: string }>('/ai/chat', { message, ...context });
    },

    async parseCommand(command: string, language?: string) {
      return post<{ success: boolean; parsedCommand: any }>('/ai/parse-command', { command, language });
    },

    async translateText(text: string, targetLang: string) {
      return post<{ success: boolean; translation: string }>('/ai/translate', { text, targetLang });
    },

    async decodeVIN(vin: string) {
      return post<{ success: boolean; vehicleInfo: any }>('/ai/decode-vin', { vin });
    },

    async analyzeProduct(productInfo: any) {
      return post<{ success: boolean; analysis: any }>('/ai/analyze-product', { productInfo });
    },

    async analyzePricing(productName: string, currentPrice: number, marketPrices: any[]) {
      return post<{ success: boolean; analysis: any }>('/ai/analyze-pricing', { productName, currentPrice, marketPrices });
    },

    async matchParts(searchQuery: string, availableParts: any[]) {
      return post<{ success: boolean; matches: any[] }>('/ai/match-parts', { searchQuery, availableParts });
    },

    async generateDescription(data: { name: string; brand?: string; category?: string; specifications?: any }) {
      return post<{ success: boolean; description: string }>('/ai/generate-description', data);
    },
  },

  // ============================================
  // Trader Tools
  // ============================================
  traderTools: {
    async compareprices(partNumbers: string[], supplierIds?: string[]) {
      return post<{ results: any[] }>('/trader-tools/compare-prices', { partNumbers, supplierIds });
    },

    async extractVin(vin: string) {
      return post<{ data: any }>('/trader-tools/extract-vin', { vin });
    },

    async getUsage() {
      return get<{ usage: any }>('/trader-tools/usage');
    },
  },

  // ============================================
  // Ads
  // ============================================
  ads: {
    async getCampaigns() {
      return get<{ campaigns: any[] }>('/ads/campaigns');
    },

    async createCampaign(data: any) {
      return post<{ campaign: any }>('/ads/campaigns', data);
    },

    async updateCampaign(id: string, data: any) {
      return put<{ campaign: any }>(`/ads/campaigns/${id}`, data);
    },

    async getSlots() {
      return get<{ slots: any[] }>('/ads/slots');
    },

    async getStats() {
      return get<{ stats: any }>('/ads/stats');
    },
  },

  // ============================================
  // Organizations
  // ============================================
  organizations: {
    async getAll(params?: { page?: number; limit?: number; type?: string; status?: string }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.type) queryParams.set('type', params.type);
      if (params?.status) queryParams.set('status', params.status);
      const query = queryParams.toString();
      return get<{ organizations: any[]; total: number }>(`/organizations${query ? `?${query}` : ''}`);
    },

    async getMyOrganization() {
      return get<any>('/organizations/my');
    },

    async getById(id: string) {
      return get<any>(`/organizations/${id}`);
    },

    async create(data: any) {
      return post<any>('/organizations', data);
    },

    async update(id: string, data: any) {
      return put<any>(`/organizations/${id}`, data);
    },

    async delete(id: string) {
      return del<{ message: string }>(`/organizations/${id}`);
    },

    async getMembers(id: string) {
      return get<any[]>(`/organizations/${id}/users`);
    },

    async addMember(orgId: string, data: any) {
      return post<any>(`/organizations/${orgId}/users`, data);
    },

    async updateMember(orgId: string, userId: string, data: any) {
      return put<any>(`/organizations/${orgId}/users/${userId}`, data);
    },

    async removeMember(orgId: string, userId: string) {
      return del<{ message: string }>(`/organizations/${orgId}/users/${userId}`);
    },

    async createInvitation(orgId: string, data: any) {
      return post<any>(`/organizations/${orgId}/invitations`, data);
    },

    async getInvitations(orgId: string) {
      return get<any[]>(`/organizations/${orgId}/invitations`);
    },

    async acceptInvitation(inviteCode: string) {
      return post<any>('/organizations/accept-invitation', { inviteCode });
    },
  },


  // ============================================
  // Tools (Marketers, Config, etc.)
  // ============================================
  tools: {
    async getConfigs() {
      return get<any[]>('/tools/configs');
    },

    async getConfig(toolKey: string) {
      return get<any>(`/tools/configs/${toolKey}`);
    },

    async updateConfig(toolKey: string, data: any) {
      return put<any>(`/tools/configs/${toolKey}`, data);
    },

    async getMarketers(params?: { page?: number; limit?: number }) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', String(params.page));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      const query = queryParams.toString();
      return get<{ marketers: any[]; total: number }>(`/tools/marketers${query ? `?${query}` : ''}`);
    },

    async getMarketerById(id: string) {
      return get<any>(`/tools/marketers/${id}`);
    },

    async createMarketer(data: any) {
      return post<any>('/tools/marketers', data);
    },

    async updateMarketer(id: string, data: any) {
      return put<any>(`/tools/marketers/${id}`, data);
    },

    async approveMarketer(id: string) {
      return put<any>(`/tools/marketers/${id}/approve`, {});
    },

    async suspendMarketer(id: string) {
      return put<any>(`/tools/marketers/${id}/suspend`, {});
    },

    async deleteMarketer(id: string) {
      return del<{ message: string }>(`/tools/marketers/${id}`);
    },

    async getMarketerStats(marketerId?: string) {
      return get<any>('/tools/marketer/stats');
    },

    async comparePrices(data: any) {
      return post<any>('/tools/price-comparison', data);
    },

    async extractVin(data: any) {
      return post<any>('/tools/vin-extraction', data);
    },
  },
};

export default ApiClient;

// Export HTTP helper functions for direct use
export { get, post, put, del, patch };
