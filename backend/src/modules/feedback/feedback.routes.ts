/**
 * Feedback Module Routes
 * وحدة الملاحظات - توفر endpoints لإدارة ملاحظات المستخدمين
 */

import { Router, Response } from 'express';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

// جميع المسارات تتطلب تسجيل الدخول + صلاحيات الأدمن
router.use(authMiddleware);

/**
 * GET /feedback/admin
 * جلب جميع الملاحظات للإدارة
 */
router.get('/admin', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, type, rating } = req.query;
    
    // TODO: تنفيذ جلب الملاحظات من قاعدة البيانات
    // حالياً نرجع بيانات فارغة بالشكل الصحيح
    
    res.json({
      success: true,
      data: {
        items: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin feedback:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب الملاحظات'
    });
  }
});

/**
 * GET /feedback/stats
 * جلب إحصائيات الملاحظات
 */
router.get('/stats', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    // TODO: تنفيذ جلب الإحصائيات من قاعدة البيانات
    // حالياً نرجع بيانات فارغة بالشكل الصحيح
    
    res.json({
      success: true,
      data: {
        open: 0,
        closed: 0,
        inProgress: 0,
        total: 0,
        avgRating: 0,
        byType: {},
        byStatus: {},
        recentTrend: []
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب إحصائيات الملاحظات'
    });
  }
});

/**
 * GET /feedback/export
 * تصدير الملاحظات
 */
router.get('/export', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    // TODO: تنفيذ تصدير الملاحظات
    // حالياً نرجع بيانات فارغة
    
    res.json({
      success: true,
      data: {
        items: [],
        exportedAt: new Date().toISOString(),
        format
      }
    });
  } catch (error) {
    console.error('Error exporting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في تصدير الملاحظات'
    });
  }
});

/**
 * POST /feedback
 * إرسال ملاحظة جديدة (متاح للجميع المسجلين)
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, message, rating, page, metadata } = req.body;
    
    // TODO: حفظ الملاحظة في قاعدة البيانات
    // حالياً نرجع نجاح
    
    res.json({
      success: true,
      data: {
        id: `feedback_${Date.now()}`,
        userId: req.user?.id,
        type,
        title,
        message,
        rating,
        page,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في إرسال الملاحظة'
    });
  }
});

/**
 * PUT /feedback/:id/status
 * تحديث حالة الملاحظة (للأدمن فقط)
 */
router.put('/:id/status', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    
    // TODO: تحديث حالة الملاحظة في قاعدة البيانات
    // حالياً نرجع نجاح
    
    res.json({
      success: true,
      data: {
        id,
        status,
        response,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.id
      }
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في تحديث حالة الملاحظة'
    });
  }
});

/**
 * GET /feedback/settings
 * جلب إعدادات نظام الملاحظات (للأدمن فقط)
 */
router.get('/settings', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        enabled: true,
        allowRating: true,
        types: ['bug', 'suggestion', 'complaint', 'feature', 'other'],
        notifyAdmins: true,
        autoClose: false,
        autoCloseDays: 30,
        requireAuth: true
      }
    });
  } catch (error) {
    console.error('Error fetching feedback settings:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب إعدادات الملاحظات'
    });
  }
});

export default router;
