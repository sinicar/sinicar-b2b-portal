/**
 * Portal Module Routes
 * وحدة إعدادات البوابة - توفر endpoints لإعدادات النظام والصفحة الرئيسية
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

// جميع المسارات تتطلب تسجيل الدخول
router.use(authMiddleware);

/**
 * GET /portal/settings
 * جلب إعدادات البوابة العامة
 */
router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        languageDefaults: ['ar', 'en', 'zh', 'hi'],
        features: {
          aiAssistant: true,
          darkMode: true,
          notifications: true,
          messaging: true,
          quotes: true,
          imports: true
        },
        ui: {
          theme: 'light',
          primaryColor: '#2563eb',
          rtl: true,
          compactMode: false
        },
        version: '1.0.0',
        maintenance: false
      }
    });
  } catch (error) {
    console.error('Error fetching portal settings:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب إعدادات البوابة'
    });
  }
});

/**
 * GET /portal/homepage/config
 * جلب إعدادات الصفحة الرئيسية
 */
router.get('/homepage/config', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        widgets: [
          { id: 'stats', enabled: true, position: 1 },
          { id: 'orders', enabled: true, position: 2 },
          { id: 'quotes', enabled: true, position: 3 },
          { id: 'activity', enabled: true, position: 4 }
        ],
        announcements: [],
        quickLinks: [
          { id: 'new-order', label: 'طلب جديد', url: '/orders/new', icon: 'plus' },
          { id: 'search', label: 'البحث', url: '/search', icon: 'search' },
          { id: 'quotes', label: 'طلبات التسعير', url: '/quotes', icon: 'file-text' }
        ],
        banners: [],
        showWelcome: true
      }
    });
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب إعدادات الصفحة الرئيسية'
    });
  }
});

export default router;
