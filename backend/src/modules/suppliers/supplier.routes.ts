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

// Debug log - remove after verification
console.log('[Supplier Routes] Registering supplier routes including: /:id/dashboard, /:id/products, /:id/requests, /:id/settings');

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

// ============ SECURE /me Endpoints (derive supplierId from token) ============
// These are the RECOMMENDED endpoints for supplier portal - no IDOR possible

// A) My Dashboard
router.get('/me/dashboard', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const dashboard = await supplierService.getMyDashboard(req.user!.id);
  successResponse(res, dashboard);
}));

// B) My Products
router.get('/me/products', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const search = req.query.q as string | undefined;
  const result = await supplierService.getMyProducts(req.user!.id, pagination, search);
  paginatedResponse(res, result);
}));

// C) My Requests
router.get('/me/requests', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await supplierService.getMyRequests(req.user!.id, pagination);
  paginatedResponse(res, result);
}));

// D) My Settings - GET
router.get('/me/settings', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await supplierService.getMySettings(req.user!.id);
  successResponse(res, settings);
}));

// E) My Settings - PUT
router.put('/me/settings', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await supplierService.updateMySettings(req.user!.id, req.body);
  successResponse(res, settings, 'تم تحديث الإعدادات');
}));

// F) Update My Assignment Status - PATCH (Supplier can only update their own)
// Status flow: NEW -> ACCEPTED -> IN_PROGRESS -> SHIPPED (or REJECTED from NEW)
const updateMyAssignmentStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'SHIPPED', 'REJECTED']),
  notes: z.string().optional()
});

router.patch('/me/assignments/:id/status', authMiddleware, validate(updateMyAssignmentStatusSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const { status, notes } = req.body;
  const updatedAssignment = await supplierService.updateMyAssignmentStatus(
    req.user!.id,
    req.params.id,
    status,
    notes
  );
  successResponse(res, updatedAssignment, 'تم تحديث حالة التخصيص');
}));

// G) Get My Assignment Audit Logs - GET
router.get('/me/assignments/:id/audit', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const logs = await supplierService.getMyAssignmentAuditLogs(req.user!.id, req.params.id);
  successResponse(res, logs);
}));


// ============ /:id Endpoints (Admin OR validated supplier access) ============
// These validate that the logged-in user has access to the requested supplierId

// A) Dashboard by ID (admin or owner)
router.get('/:id/dashboard', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const dashboard = await supplierService.getDashboard(req.params.id, req.user!.id, req.user!.role);
  successResponse(res, dashboard);
}));

// B) Products by ID (admin or owner)
router.get('/:id/products', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const search = req.query.q as string | undefined;
  const result = await supplierService.getProducts(req.params.id, req.user!.id, req.user!.role, pagination, search);
  paginatedResponse(res, result);
}));

// C) Requests by ID (admin or owner)
router.get('/:id/requests', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const result = await supplierService.getRequests(req.params.id, req.user!.id, req.user!.role, pagination);
  paginatedResponse(res, result);
}));

// D) Supplier Settings by ID - GET (admin or owner)
router.get('/:id/settings', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await supplierService.getSupplierSettings(req.params.id, req.user!.id, req.user!.role);
  successResponse(res, settings);
}));

// E) Supplier Settings by ID - PUT (admin or owner)
router.put('/:id/settings', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await supplierService.updateSupplierSettings(req.params.id, req.user!.id, req.user!.role, req.body);
  successResponse(res, settings, 'تم تحديث الإعدادات');
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

// ============ Admin: Supplier Request Assignments ============

// Schema for creating assignment
const createAssignmentSchema = z.object({
  supplierId: z.string().uuid(),
  requestType: z.enum(['QUOTE', 'ORDER', 'IMPORT', 'MISSING', 'INSTALLMENT']),
  requestId: z.string().uuid(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  supplierNotes: z.string().optional()
});

// POST /suppliers/assignments - Create assignment (Admin only)
router.post('/assignments', authMiddleware, adminOnly, validate(createAssignmentSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const assignment = await supplierService.createAssignment({
    ...req.body,
    createdByAdminId: req.user!.id
  });
  createdResponse(res, assignment, 'تم إنشاء التخصيص بنجاح');
}));

// GET /suppliers/assignments - List assignments (Admin only)
router.get('/assignments', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    supplierId: req.query.supplierId as string | undefined,
    requestType: req.query.requestType as string | undefined,
    status: req.query.status as string | undefined
  };
  const result = await supplierService.getAssignments(filters, pagination);
  paginatedResponse(res, result);
}));

// PATCH /suppliers/assignments/:id/status - Update assignment status (Admin only)
router.patch('/assignments/:id/status', authMiddleware, adminOnly, asyncHandler(async (req: AuthRequest, res: any) => {
  const { status, notes } = req.body;
  const assignment = await supplierService.updateAssignmentStatus(req.params.id, status, notes);
  successResponse(res, assignment, 'تم تحديث حالة التخصيص');
}));

export default router;

