
import { BusinessProfile, User, Product, Order } from '../types';

// هذا الرابط يتغير حسب رابط السيرفر الخاص بنظامك المحاسبي
const API_BASE_URL = 'https://api.your-accounting-system.com/v1';

// دالة مساعدة للاتصال بالسيرفر
async function request(endpoint: string, method: string = 'GET', body?: any) {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  // إذا كان المستخدم مسجل دخول، نرسل التوكن
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'حدث خطأ في الاتصال بالنظام المحاسبي');
  }

  return response.json();
}

export const RealApi = {
  // --- التسجيل والدخول ---
  
  async registerBusiness(userData: any, profileData: any) {
    // إرسال بيانات التسجيل للنظام المحاسبي ليتم إنشاؤه هناك
    return request('/customers/register', 'POST', { ...userData, ...profileData });
  },

  async login(clientId: string, password: string) {
    // التحقق من النظام المحاسبي
    const data = await request('/auth/login', 'POST', { clientId, password });
    
    // حفظ التوكن للطلبات القادمة
    localStorage.setItem('auth_token', data.token);
    
    return {
      user: data.user,
      profile: data.profile
    };
  },

  async getCurrentSession() {
    // التحقق من صحة التوكن الحالي
    try {
        const data = await request('/auth/me');
        return data.user;
    } catch (e) {
        return null;
    }
  },

  async logout() {
    localStorage.removeItem('auth_token');
  },

  // --- المنتجات (مباشرة من المخزون) ---
  
  async searchProducts(query: string): Promise<Product[]> {
    // البحث في مخزون النظام المحاسبي
    return request(`/products?search=${encodeURIComponent(query)}`);
  },

  // --- الطلبات ---

  async createOrder(order: any): Promise<Order> {
    // ترحيل الطلب مباشرة للنظام المحاسبي كأمر بيع أو عرض سعر
    return request('/orders', 'POST', order);
  },

  async getOrders(userId: string): Promise<Order[]> {
    // جلب حالة الطلبات من النظام المحاسبي
    return request(`/orders?userId=${userId}`);
  },

  // --- إدارة الفروع والموظفين ---
  // يتم إرسالها للنظام المحاسبي ليتم تخزينها في بطاقة العميل

  async addBranch(mainUserId: string, branch: any) {
    return request(`/customers/${mainUserId}/branches`, 'POST', branch);
  },

  async addEmployee(mainUserId: string, employeeData: any) {
    return request(`/customers/${mainUserId}/employees`, 'POST', employeeData);
  }
};
