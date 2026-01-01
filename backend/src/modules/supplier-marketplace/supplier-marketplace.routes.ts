import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse } from '../../utils/response';

const router = Router();

// GET /supplier-marketplace/settings
router.get('/settings', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  // Return default settings to prevent dashboard crash
  const defaultSettings = {
    isEnabled: true,
    commissionRate: 5,
    minOrderValue: 100,
    maxOrderValue: 50000,
    allowedCategories: [],
    featuredSuppliers: [],
    searchFilters: {
      enablePriceFilter: true,
      enableBrandFilter: true,
      enableCategoryFilter: true,
      enableRatingFilter: true
    },
    displaySettings: {
      showPrices: true,
      showStock: true,
      showRatings: true,
      itemsPerPage: 20
    }
  };
  
  successResponse(res, defaultSettings, 'Supplier marketplace settings retrieved');
}));

// GET /supplier-marketplace/suppliers
router.get('/suppliers', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  // Return empty array to prevent crash
  successResponse(res, [], 'Suppliers list retrieved');
}));

// GET /supplier-marketplace/products
router.get('/products', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  // Return empty paginated response
  successResponse(res, {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20
  }, 'Products retrieved');
}));

export default router;
