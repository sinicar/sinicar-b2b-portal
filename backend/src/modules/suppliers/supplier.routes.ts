import { Router } from 'express';
import { supplierService } from './supplier.service';
import { supplierUserService } from './supplier-user.service';
import { authMiddleware, adminOnly, AuthRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse, errorResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';
import {
  createSupplierProfileSchema,
  updateSupplierProfileSchema,
  catalogItemSchema,
  bulkUploadCatalogSchema,
  marketplaceSearchSchema
} from '../../schemas/supplier.schema';
import { z } from 'zod';

const addSubUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  roleCode: z.enum(['SUPPLIER_OWNER', 'SUPPLIER_MANAGER', 'SUPPLIER_STAFF']),
  jobTitle: z.string().optional(),
  password: z.string().min(4).optional()
});

const updateSubUserSchema = z.object({
  roleCode: z.enum(['SUPPLIER_OWNER', 'SUPPLIER_MANAGER', 'SUPPLIER_STAFF']).optional(),
  isActive: z.boolean().optional(),
  jobTitle: z.string().optional()
});

const router = Router();

router.get('/settings', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await supplierService.getSettings();
  successResponse(res, settings);
}));

router.put('/settings', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await supplierService.updateSettings(req.body);
  successResponse(res, settings, 'تم تحديث الإعدادات');
}));

router.get('/stats', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const stats = await supplierService.getStats();
  successResponse(res, stats);
}));

router.get('/marketplace/search', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    partNumber: req.query.partNumber as string,
    partName: req.query.partName as string,
    brand: req.query.brand as string,
    category: req.query.category as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    inStock: req.query.inStock === 'true'
  };
  const result = await supplierService.searchMarketplace(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    search: req.query.search as string,
    status: req.query.status as any,
    category: req.query.category as string,
    region: req.query.region as string,
    minRating: req.query.minRating ? Number(req.query.minRating) : undefined
  };
  const result = await supplierService.list(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/my-profile', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const profile = await supplierService.getByCustomerId(req.user!.id);
  successResponse(res, profile);
}));

router.post('/register', authMiddleware, validate(createSupplierProfileSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const profile = await supplierService.create(req.user!.id, req.body);
  createdResponse(res, profile, 'تم تسجيلك كمورد بنجاح');
}));

router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const supplier = await supplierService.getById(req.params.id);
  successResponse(res, supplier);
}));

router.put('/:id', authMiddleware, validate(updateSupplierProfileSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const supplier = await supplierService.update(req.params.id, req.user!.id, req.body);
  successResponse(res, supplier, 'تم تحديث البيانات');
}));

router.put('/:id/status', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const supplier = await supplierService.updateStatus(req.params.id, req.body.status);
  successResponse(res, supplier, 'تم تحديث الحالة');
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await supplierService.delete(req.params.id, req.user!.id);
  successResponse(res, result, result.message);
}));

router.get('/:id/catalog', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await supplierService.getCatalogItems(req.params.id, pagination);
  paginatedResponse(res, result);
}));

router.post('/:id/catalog', authMiddleware, validate(catalogItemSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const item = await supplierService.addCatalogItem(req.params.id, req.user!.id, req.body);
  createdResponse(res, item, 'تم إضافة المنتج');
}));

router.post('/:id/catalog/bulk', authMiddleware, validate(bulkUploadCatalogSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await supplierService.bulkUploadCatalog(req.params.id, req.user!.id, req.body);
  successResponse(res, result, result.message);
}));

router.put('/:id/catalog/:itemId', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const item = await supplierService.updateCatalogItem(req.params.itemId, req.params.id, req.user!.id, req.body);
  successResponse(res, item, 'تم تحديث المنتج');
}));

router.delete('/:id/catalog/:itemId', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await supplierService.deleteCatalogItem(req.params.itemId, req.params.id, req.user!.id);
  successResponse(res, result, result.message);
}));

// ============ Sub-Users Management (Supplier Portal) ============

router.get('/me/sub-users/roles', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const roles = await supplierUserService.getSupplierRoles();
  successResponse(res, roles);
}));

router.get('/me/sub-users', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const supplierId = await supplierUserService.getSupplierIdForUser(userId);
  
  if (!supplierId) {
    return errorResponse(res, 'لم يتم العثور على ملف المورد', 404);
  }

  const isOwner = await supplierUserService.isUserOwner(userId, supplierId);
  if (!isOwner) {
    return errorResponse(res, 'يجب أن تكون مالك المورد لعرض أعضاء الفريق', 403);
  }

  const pagination = parsePaginationParams(req.query);
  const result = await supplierUserService.listSubUsers(supplierId, pagination);
  paginatedResponse(res, result);
}));

router.post('/me/sub-users', authMiddleware, validate(addSubUserSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const supplierId = await supplierUserService.getSupplierIdForUser(userId);
  
  if (!supplierId) {
    return errorResponse(res, 'لم يتم العثور على ملف المورد', 404);
  }

  const isOwner = await supplierUserService.isUserOwner(userId, supplierId);
  if (!isOwner) {
    return errorResponse(res, 'يجب أن تكون مالك المورد لإضافة أعضاء', 403);
  }

  try {
    const subUser = await supplierUserService.addSubUser(supplierId, userId, req.body);
    createdResponse(res, subUser, 'تم إضافة العضو بنجاح');
  } catch (e: any) {
    errorResponse(res, e.message || 'فشل إضافة العضو', 400);
  }
}));

router.put('/me/sub-users/:id', authMiddleware, validate(updateSubUserSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;
  const supplierId = await supplierUserService.getSupplierIdForUser(userId);
  
  if (!supplierId) {
    return errorResponse(res, 'لم يتم العثور على ملف المورد', 404);
  }

  const isOwner = await supplierUserService.isUserOwner(userId, supplierId);
  if (!isOwner) {
    return errorResponse(res, 'يجب أن تكون مالك المورد لتعديل أعضاء', 403);
  }

  try {
    const subUser = await supplierUserService.updateSubUser(supplierId, req.params.id, req.body);
    successResponse(res, subUser, 'تم تحديث العضو بنجاح');
  } catch (e: any) {
    errorResponse(res, e.message || 'فشل تحديث العضو', 400);
  }
}));

export default router;
