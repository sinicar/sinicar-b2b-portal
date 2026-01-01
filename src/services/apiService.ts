/**
 * API Service - طبقة موحدة للتعامل مع API
 * 
 * هذا الملف يوفر interface موحد يعمل مع:
 * - Mock API (بيانات تجريبية)
 * - Real API (backend حقيقي)
 * 
 * التبديل يتم تلقائياً حسب إعدادات api.config.ts
 */

import { API_CONFIG, getApiUrl, isMockMode } from '../config/api.config';
import { Api } from './api';

/**
 * HTTP Client للتعامل مع API الحقيقي
 */
class HttpClient {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(getApiUrl(endpoint), {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async post<T>(endpoint: string, data: unknown): Promise<T> {
        const response = await fetch(getApiUrl(endpoint), {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async put<T>(endpoint: string, data: unknown): Promise<T> {
        const response = await fetch(getApiUrl(endpoint), {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(getApiUrl(endpoint), {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
}

const httpClient = new HttpClient();

/**
 * API Service - الواجهة الموحدة
 * 
 * استخدم هذا بدلاً من Api مباشرة:
 * 
 * import { ApiService } from './apiService';
 * const user = await ApiService.auth.login(id, password, type);
 */
export const ApiService = {
    /**
     * Authentication
     */
    auth: {
        async login(identifier: string, password: string, type: 'OWNER' | 'STAFF') {
            if (isMockMode()) {
                return Api.login(identifier, password, type);
            }
            return httpClient.post(API_CONFIG.ENDPOINTS.LOGIN, { identifier, password, type });
        },

        async logout() {
            if (isMockMode()) {
                return Api.logout();
            }
            localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
            return httpClient.post(API_CONFIG.ENDPOINTS.LOGOUT, {});
        },

        async getCurrentSession() {
            if (isMockMode()) {
                return Api.getCurrentSession();
            }
            return httpClient.get(API_CONFIG.ENDPOINTS.CURRENT_USER);
        },
    },

    /**
     * Products
     */
    products: {
        async search(query: string) {
            if (isMockMode()) {
                return Api.searchProducts(query);
            }
            return httpClient.get(`${API_CONFIG.ENDPOINTS.PRODUCT_SEARCH}?q=${encodeURIComponent(query)}`);
        },

        async getAll(filters?: any) {
            if (isMockMode()) {
                return Api.getProducts();
            }
            const params = new URLSearchParams(filters).toString();
            return httpClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}?${params}`);
        },

        async getById(id: string) {
            if (isMockMode()) {
                return Api.getProducts().then(products => products.find(p => p.id === id));
            }
            return httpClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
        },
    },

    /**
     * Orders
     */
    orders: {
        async getAll() {
            if (isMockMode()) {
                return Api.getAllOrders();
            }
            return httpClient.get(API_CONFIG.ENDPOINTS.ORDERS);
        },

        async getByUser(userId: string) {
            if (isMockMode()) {
                return Api.getOrdersByUser(userId);
            }
            return httpClient.get(`${API_CONFIG.ENDPOINTS.ORDERS}?userId=${userId}`);
        },

        async create(orderData: any) {
            if (isMockMode()) {
                return Api.createOrder(orderData);
            }
            return httpClient.post(API_CONFIG.ENDPOINTS.ORDERS, orderData);
        },

        async updateStatus(orderId: string, status: string) {
            if (isMockMode()) {
                return Api.updateOrderStatus(orderId, status as any);
            }
            return httpClient.put(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/status`, { status });
        },
    },

    /**
     * Users
     */
    users: {
        async getAll() {
            if (isMockMode()) {
                return Api.getAllUsers();
            }
            return httpClient.get(API_CONFIG.ENDPOINTS.USERS);
        },

        async getById(id: string) {
            if (isMockMode()) {
                return Api.getUserById(id);
            }
            return httpClient.get(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
        },
    },

    /**
     * Notifications
     */
    notifications: {
        async getByUser(userId: string) {
            if (isMockMode()) {
                return Api.getNotifications(userId);
            }
            return httpClient.get(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}?userId=${userId}`);
        },

        async markAsRead(notificationId: string) {
            if (isMockMode()) {
                return Api.markNotificationRead(notificationId);
            }
            return httpClient.put(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`, {});
        },
    },

    /**
     * Settings
     */
    settings: {
        async get() {
            if (isMockMode()) {
                return Api.getSettings();
            }
            return httpClient.get(API_CONFIG.ENDPOINTS.SETTINGS);
        },

        async update(settings: any) {
            if (isMockMode()) {
                return Api.updateSettings(settings);
            }
            return httpClient.put(API_CONFIG.ENDPOINTS.SETTINGS, settings);
        },
    },

    /**
     * Raw access to Api for functions not yet abstracted
     * يُستخدم مؤقتاً للدوال التي لم يتم تجريدها بعد
     */
    mock: Api,
};

export default ApiService;
