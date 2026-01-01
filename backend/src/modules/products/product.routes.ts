import { Router } from 'express';
import { productService } from './product.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';

const router = Router();

// Get all products with pagination
router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    search: req.query.search as string,
    category: req.query.category as string,
    brand: req.query.brand as string,
    isActive: req.query.isActive !== 'false'
  };
  const result = await productService.list(filters, pagination);
  paginatedResponse(res, result);
}));

// Search products
router.get('/search', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const products = await productService.search(req.query.q as string, Number(req.query.limit) || 50);
  successResponse(res, { products });
}));

// Get categories
router.get('/categories', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const categories = await productService.getCategories();
  successResponse(res, { categories });
}));

// Get brands
router.get('/brands', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const brands = await productService.getBrands();
  successResponse(res, { brands });
}));

// Get product by part number
router.get('/part/:partNumber', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const product = await productService.getByPartNumber(req.params.partNumber);
  successResponse(res, { product });
}));

// Get product by ID
router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const product = await productService.getById(req.params.id);
  successResponse(res, { product });
}));

// Create product (Admin only)
router.post('/', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const product = await productService.create(req.body);
  createdResponse(res, { product }, 'تم إنشاء المنتج بنجاح');
}));

// Update product (Admin only)
router.put('/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const product = await productService.update(req.params.id, req.body);
  successResponse(res, { product }, 'تم تحديث المنتج بنجاح');
}));

// Delete product (Admin only)
router.delete('/:id', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  await productService.delete(req.params.id);
  successResponse(res, null, 'تم حذف المنتج بنجاح');
}));

export default router;
