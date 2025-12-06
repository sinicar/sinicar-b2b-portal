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

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/installments', installmentRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/ads', adRoutes);
router.use('/trader-tools', toolRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

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
      '/admin'
    ]
  });
});

export default router;
