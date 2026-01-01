/**
 * Mock API Compatibility Shim
 * 
 * هذا الملف يوفر توافقية مع الكود القديم الذي يستورد من mock-api
 * يُعيد توجيه الطلبات إلى ApiClient الحقيقي
 */

import { ApiClient } from './apiClient';

/**
 * Auth API Shim - يحول طلبات mock-api إلى ApiClient
 */
export const authApi = {
  /**
   * Login by phone (staff login)
   */
  async loginByPhone(phone: string, activationCode: string): Promise<{ success: boolean; user?: any; profile?: any; message?: string }> {
    try {
      const result = await ApiClient.auth.login(phone, activationCode, 'staff');
      const user = result.user || result.data?.user;
      if (user) {
        return { success: true, user, profile: null };
      }
      return { success: false, message: 'بيانات الدخول غير صحيحة' };
    } catch (error: any) {
      return { success: false, message: error.message || 'فشل تسجيل الدخول' };
    }
  },

  /**
   * Login (owner/traditional login)
   */
  async login(identifier: string, password: string, _loginType?: string): Promise<{ user?: any; profile?: any }> {
    const result = await ApiClient.auth.login(identifier, password, 'owner');
    const user = result.user || result.data?.user;
    if (user) {
      return { user, profile: null };
    }
    throw new Error('بيانات الدخول غير صحيحة');
  }
};

export default authApi;
