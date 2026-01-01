/**
 * API Modules - Health & Auth
 * الوظائف الأساسية للصحة والمصادقة
 */

import httpClient from '../../httpClient';

// ============================================
// Health Check
// ============================================

/**
 * فحص صحة الـ Backend
 */
export async function checkHealth(): Promise<{ status: 'ok' | 'error'; latency: number }> {
  const start = Date.now();
  try {
    await httpClient.get('/health');
    return { status: 'ok', latency: Date.now() - start };
  } catch {
    return { status: 'error', latency: Date.now() - start };
  }
}

// ============================================
// Authentication
// ============================================

/**
 * تسجيل الدخول
 */
export async function login(
  identifier: string,
  secret: string,
  loginType: 'OWNER' | 'STAFF' = 'OWNER'
): Promise<{ user: any; profile: any | null }> {
  const response = await httpClient.post<{ user?: any; profile?: any; data?: { user?: any } }>('/auth/login', {
    identifier,
    secret,
    loginType,
  });
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'فشل تسجيل الدخول');
  }
  
  // Handle different response shapes from API
  const resData = response.data;
  const user = resData.user || resData.data?.user || null;
  const profile = resData.profile || null;
  return { user, profile };
}

/**
 * تسجيل الخروج
 */
export async function logout(): Promise<void> {
  try {
    await httpClient.post('/auth/logout', {});
  } catch {
    // Ignore logout errors
  }
  localStorage.removeItem('b2b_session_sini_v2');
}

/**
 * الحصول على الجلسة الحالية
 */
export async function getCurrentSession(): Promise<any | null> {
  const stored = localStorage.getItem('b2b_session_sini_v2');
  if (!stored) return null;
  
  try {
    const user = JSON.parse(stored);
    // Validate session with backend
    const response = await httpClient.get('/auth/me');
    if (response) {
      // Update local storage with fresh data
      localStorage.setItem('b2b_session_sini_v2', JSON.stringify(response));
      return response;
    }
    return user;
  } catch {
    // Session invalid, clear it
    localStorage.removeItem('b2b_session_sini_v2');
    return null;
  }
}
