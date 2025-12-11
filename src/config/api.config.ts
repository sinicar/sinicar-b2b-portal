/**
 * API Configuration
 * 
 * هذا الملف يتحكم في مصدر البيانات:
 * - USE_MOCK_API = true  → يستخدم بيانات تجريبية (localStorage)
 * - USE_MOCK_API = false → يستخدم API حقيقي (يحتاج BASE_URL)
 * 
 * للربط بـ Backend حقيقي:
 * 1. غيّر USE_MOCK_API إلى false
 * 2. أضف رابط الـ API في BASE_URL
 * 3. تأكد من أن الـ API يُرجع نفس هيكل البيانات
 */

export const API_CONFIG = {
    /**
     * استخدام Mock API (بيانات تجريبية)
     * true = بيانات محلية في localStorage
     * false = API خارجي حقيقي
     */
    USE_MOCK_API: true,

    /**
     * رابط الـ API الأساسي
     * مثال: "https://api.sinicar.com/v1"
     * أو: "https://your-backend.onrender.com/api"
     */
    BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",

    /**
     * مهلة الطلبات (بالميلي ثانية)
     */
    TIMEOUT: 30000,

    /**
     * إعدادات التوثيق
     */
    AUTH: {
        TOKEN_KEY: "sini_car_auth_token",
        REFRESH_TOKEN_KEY: "sini_car_refresh_token",
        TOKEN_EXPIRY_KEY: "sini_car_token_expiry",
    },

    /**
     * Endpoints الأساسية
     * عند الربط بـ Backend حقيقي، تأكد من أن هذه المسارات صحيحة
     */
    ENDPOINTS: {
        // Authentication
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REGISTER: "/auth/register",
        REFRESH_TOKEN: "/auth/refresh",

        // Users
        USERS: "/users",
        CURRENT_USER: "/users/me",

        // Products
        PRODUCTS: "/products",
        PRODUCT_SEARCH: "/products/search",

        // Orders
        ORDERS: "/orders",

        // Quotes
        QUOTES: "/quotes",

        // Import Requests
        IMPORTS: "/imports",

        // Suppliers
        SUPPLIERS: "/suppliers",

        // Notifications
        NOTIFICATIONS: "/notifications",

        // Settings
        SETTINGS: "/settings",
    },
};

/**
 * Helper function to get full API URL
 */
export function getApiUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Check if using mock API
 */
export function isMockMode(): boolean {
    return API_CONFIG.USE_MOCK_API;
}
