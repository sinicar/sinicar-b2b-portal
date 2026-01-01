import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import organizationRoutes from '../modules/organizations/organization.routes';
import customerRoutes from '../modules/customers/customer.routes';
import orderRoutes from '../modules/orders/order.routes';
import installmentRoutes from '../modules/installments/installment.routes';
import supplierRoutes from '../modules/suppliers/supplier.routes';
import adRoutes from '../modules/ads/ad.routes';
import toolRoutes from '../modules/tools/tool.routes';
import aiRoutes from '../modules/ai/ai.routes';
import adminRoutes from '../modules/admin/admin.routes';
import currencyRoutes from '../modules/currency/currency.routes';
import pricingRoutes from '../modules/pricing/pricing.routes';
import permissionRoutes from '../modules/permissions/permission.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import messagingRoutes from '../modules/messaging/messaging.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import permissionCenterRoutes from '../modules/permission-center/permission-center.routes';
import reportRoutes from '../modules/reports/report.routes';
import productRoutes from '../modules/products/product.routes';
import userRoutes from '../modules/users/user.routes';
// New routes for dashboard fix
import supplierMarketplaceRoutes from '../modules/supplier-marketplace/supplier-marketplace.routes';
import importRequestsRoutes from '../modules/import-requests/import-requests.routes';
import missingProductsRoutes from '../modules/missing-products/missing-products.routes';
// Activity module for admin panel
import activityRoutes from '../modules/activity/activity.routes';
// Feedback module for admin panel
import feedbackRoutes from '../modules/feedback/feedback.routes';
// Marketers module for admin panel
import marketersRoutes from '../modules/marketers/marketers.routes';
// Alternatives module for admin panel
import alternativesRoutes from '../modules/alternatives/alternatives.routes';
// Carts module for abandoned carts
import cartsRoutes from '../modules/carts/carts.routes';
// Partner Requests module for admin panel
import partnerRequestsRoutes from '../modules/partners/partner-requests.routes';
// Portal module for settings and homepage
import portalRoutes from '../modules/portal/portal.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/installments', installmentRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/ads', adRoutes);
router.use('/trader-tools', toolRoutes);
router.use('/tools', toolRoutes); // Alias لتوافق Frontend
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/currencies', currencyRoutes);
router.use('/pricing', pricingRoutes);
router.use('/permissions', permissionRoutes);
router.use('/settings', settingsRoutes);
router.use('/messaging', messagingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/permission-center', permissionCenterRoutes);
router.use('/reports', reportRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
// New routes for dashboard fix
router.use('/supplier-marketplace', supplierMarketplaceRoutes);
router.use('/import-requests', importRequestsRoutes);
router.use('/missing-products', missingProductsRoutes);
// Activity module for admin panel
router.use('/activity', activityRoutes);
// Feedback module for admin panel
router.use('/feedback', feedbackRoutes);
// Marketers module for admin panel
router.use('/marketers', marketersRoutes);
// Alternatives module for admin panel
router.use('/alternatives', alternativesRoutes);
// Carts module for abandoned carts
router.use('/carts', cartsRoutes);
// Partner Requests module for admin panel
router.use('/partner-requests', partnerRequestsRoutes);
// Portal module for settings and homepage
router.use('/portal', portalRoutes);
// Homepage config (alias for convenience)
router.use('/homepage', portalRoutes);

// Stub routes for missing endpoints
router.get('/order-shortages/stats', (req: any, res: any) => {
  res.json({
    success: true,
    data: {
      total: 0,
      pending: 0,
      resolved: 0,
      cancelled: 0
    }
  });
});

router.get('/order-shortages', (req: any, res: any) => {
  res.json({
    success: true,
    data: [],
    count: 0
  });
});

router.get('/', (req: any, res: any) => {
  res.json({
    message: 'SINI CAR B2B API',
    version: 'v1',
    endpoints: [
      '/auth',
      '/organizations',
      '/customers',
      '/orders',
      '/installments',
      '/suppliers',
      '/ads',
      '/trader-tools',
      '/ai',
      '/admin',
      '/currencies',
      '/pricing',
      '/permissions',
      '/settings',
      '/messaging',
      '/notifications',
      '/permission-center',
      '/reports',
      '/products',
      '/users'
    ]
  });
});

export default router;
