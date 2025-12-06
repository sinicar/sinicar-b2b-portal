import { Router, Response } from 'express';
import { MessageEvent } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import * as notificationService from './notification.service';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      isRead,
      event,
      category,
      limit,
      offset,
    } = req.query;

    const filters: notificationService.GetNotificationsFilters = {
      userId: req.user.id,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      event: event as MessageEvent | undefined,
      category: category as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : 20,
      offset: offset ? parseInt(offset as string, 10) : 0,
    };

    const result = await notificationService.getNotifications(filters);

    res.json({
      success: true,
      data: {
        notifications: result.notifications,
        total: result.total,
        unreadCount: result.unreadCount,
      },
      message: 'تم جلب الإشعارات بنجاح',
    });
  } catch (error: any) {
    console.error('[Notifications] Error fetching notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const count = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error: any) {
    console.error('[Notifications] Error fetching unread count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const settings = await notificationService.getAllUserNotificationSettings(req.user.id);

    res.json({
      success: true,
      data: settings,
      message: 'تم جلب إعدادات الإشعارات بنجاح',
    });
  } catch (error: any) {
    console.error('[Notifications] Error fetching settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير مصفوفة الإعدادات',
      });
    }

    const results = await notificationService.bulkUpdateUserNotificationSettings(
      req.user.id,
      settings.map((s: any) => ({
        event: s.event as MessageEvent,
        enableInApp: s.enableInApp,
        enableEmail: s.enableEmail,
        enableWhatsApp: s.enableWhatsApp,
        languagePreference: s.languagePreference,
      }))
    );

    res.json({
      success: true,
      data: results,
      message: 'تم تحديث إعدادات الإشعارات بنجاح',
    });
  } catch (error: any) {
    console.error('[Notifications] Error updating settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings/:event', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const event = req.params.event as MessageEvent;
    const { enableInApp, enableEmail, enableWhatsApp, languagePreference } = req.body;

    const result = await notificationService.updateUserNotificationSettings(
      req.user.id,
      event,
      { enableInApp, enableEmail, enableWhatsApp, languagePreference }
    );

    res.json({
      success: true,
      data: result,
      message: 'تم تحديث إعداد الإشعار بنجاح',
    });
  } catch (error: any) {
    console.error('[Notifications] Error updating setting:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notification = await notificationService.getNotificationById(
      req.params.id,
      req.user.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'الإشعار غير موجود',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('[Notifications] Error fetching notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await notificationService.markNotificationAsRead(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء',
    });
  } catch (error: any) {
    console.error('[Notifications] Error marking as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await notificationService.markAllNotificationsAsRead(req.user.id);

    res.json({
      success: true,
      data: { count: result.count },
      message: 'تم تحديد جميع الإشعارات كمقروءة',
    });
  } catch (error: any) {
    console.error('[Notifications] Error marking all as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await notificationService.deleteNotification(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح',
    });
  } catch (error: any) {
    console.error('[Notifications] Error deleting notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/seed-defaults', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await notificationService.seedDefaultSettingsForUser(req.user.id);

    res.json({
      success: true,
      data: result,
      message: 'تم إنشاء الإعدادات الافتراضية بنجاح',
    });
  } catch (error: any) {
    console.error('[Notifications] Error seeding defaults:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/cleanup/expired', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'هذا الإجراء يتطلب صلاحيات المدير',
      });
    }

    const result = await notificationService.cleanupExpiredNotifications();

    res.json({
      success: true,
      data: { deleted: result.count },
      message: 'تم حذف الإشعارات المنتهية الصلاحية',
    });
  } catch (error: any) {
    console.error('[Notifications] Error cleaning up:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
