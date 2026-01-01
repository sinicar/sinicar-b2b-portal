import { supplierRepository, SupplierFilters, MarketplaceFilters } from './supplier.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';
import {
  CreateSupplierProfileInput,
  UpdateSupplierProfileInput,
  CatalogItemInput,
  BulkUploadCatalogInput
} from '../../schemas/supplier.schema';

export class SupplierService {
  async list(filters: SupplierFilters, pagination: PaginationParams) {
    return supplierRepository.findMany(filters, pagination);
  }

  async getById(id: string) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('المورد غير موجود');
    }
    return supplier;
  }

  async getByCustomerId(customerId: string) {
    return supplierRepository.findByCustomerId(customerId);
  }

  async create(customerId: string, input: CreateSupplierProfileInput) {
    const existing = await supplierRepository.findByCustomerId(customerId);
    if (existing) {
      throw new BadRequestError('لديك ملف مورد بالفعل');
    }

    return supplierRepository.create({
      customerId,
      companyName: input.companyName,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      categories: input.categories,
      regions: input.regions
    });
  }

  async update(id: string, customerId: string, input: UpdateSupplierProfileInput) {
    const supplier = await this.getById(id);

    if (supplier.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك تعديل ملف مورد آخر');
    }

    const { categories, regions, ...data } = input;

    return supplierRepository.update(id, {
      ...data,
      ...(categories && { categories: JSON.stringify(categories) }),
      ...(regions && { regions: JSON.stringify(regions) })
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED') {
    await this.getById(id);
    return supplierRepository.update(id, { status });
  }

  async delete(id: string, customerId: string) {
    const supplier = await this.getById(id);

    if (supplier.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك حذف ملف مورد آخر');
    }

    await supplierRepository.delete(id);
    return { message: 'تم حذف ملف المورد بنجاح' };
  }

  async addCatalogItem(supplierId: string, customerId: string, input: CatalogItemInput) {
    const supplier = await this.getById(supplierId);

    if (supplier.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك إضافة منتجات لمورد آخر');
    }

    if (supplier.status !== 'ACTIVE') {
      throw new BadRequestError('يجب تفعيل حساب المورد أولاً');
    }

    return supplierRepository.addCatalogItem(supplierId, input);
  }

  async updateCatalogItem(itemId: string, supplierId: string, customerId: string, data: any) {
    const supplier = await this.getById(supplierId);

    if (supplier.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك تعديل منتجات مورد آخر');
    }

    return supplierRepository.updateCatalogItem(itemId, data);
  }

  async deleteCatalogItem(itemId: string, supplierId: string, customerId: string) {
    const supplier = await this.getById(supplierId);

    if (supplier.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك حذف منتجات مورد آخر');
    }

    await supplierRepository.deleteCatalogItem(itemId);
    return { message: 'تم حذف المنتج بنجاح' };
  }

  async getCatalogItems(supplierId: string, pagination: PaginationParams) {
    await this.getById(supplierId);
    return supplierRepository.getCatalogItems(supplierId, pagination);
  }

  async bulkUploadCatalog(supplierId: string, customerId: string, input: BulkUploadCatalogInput) {
    const supplier = await this.getById(supplierId);

    if (supplier.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك تحديث كتالوج مورد آخر');
    }

    if (supplier.status !== 'ACTIVE') {
      throw new BadRequestError('يجب تفعيل حساب المورد أولاً');
    }

    await supplierRepository.bulkUpsertCatalog(supplierId, input.items, input.replaceExisting);

    return {
      message: `تم ${input.replaceExisting ? 'استبدال' : 'تحديث'} الكتالوج بنجاح`,
      itemsCount: input.items.length
    };
  }

  async searchMarketplace(filters: MarketplaceFilters, pagination: PaginationParams) {
    const settings = await supplierRepository.getSettings();
    
    if (settings && !settings.enableMarketplace) {
      throw new BadRequestError('سوق الموردين غير متاح حالياً');
    }

    const results = await supplierRepository.searchMarketplace(filters, pagination);

    if (settings?.hideRealSupplierFromCustomer) {
      results.data = results.data.map(item => ({
        ...item,
        supplier: {
          id: item.supplier.id,
          companyName: 'مورد معتمد',
          rating: item.supplier.rating
        }
      }));
    }

    if (settings?.markupPercentage && settings.markupPercentage > 0) {
      results.data = results.data.map(item => ({
        ...item,
        price: item.price * (1 + settings.markupPercentage / 100)
      }));
    }

    return results;
  }

  async getSettings() {
    return supplierRepository.getSettings();
  }

  async updateSettings(data: any) {
    return supplierRepository.updateSettings(data);
  }

  async getStats() {
    const allSuppliers = await supplierRepository.findMany({}, { page: 1, limit: 1000 });

    const stats = {
      total: allSuppliers.pagination.total,
      active: 0,
      pending: 0,
      suspended: 0,
      totalProducts: 0,
      totalRevenue: 0
    };

    allSuppliers.data.forEach(supplier => {
      switch (supplier.status) {
        case 'ACTIVE':
          stats.active++;
          break;
        case 'PENDING':
          stats.pending++;
          break;
        case 'SUSPENDED':
          stats.suspended++;
          break;
      }
      stats.totalProducts += supplier._count.catalogItems;
      stats.totalRevenue += supplier.totalRevenue;
    });

    return stats;
  }

  // ============ Supplier Portal Endpoints (SECURE) ============

  // Helper: Get supplierId for current user OR throw 403
  async getMySupplierIdOrThrow(currentUserId: string): Promise<string> {
    const supplierUser = await supplierRepository.getSupplierUserByUserId(currentUserId);
    if (!supplierUser) {
      throw new ForbiddenError('لا يوجد لديك صلاحية كمورد');
    }
    return supplierUser.supplierId;
  }

  // Helper: Validate supplier access - checks if user belongs to supplier
  private async validateSupplierAccess(supplierId: string, currentUserId: string, currentUserRole: string): Promise<void> {
    // Admin can access any supplier
    if (currentUserRole === 'SUPER_ADMIN') {
      return;
    }
    
    // For supplier users, check SupplierUser table
    const userSupplierId = await this.getMySupplierIdOrThrow(currentUserId);
    if (userSupplierId !== supplierId) {
      throw new ForbiddenError('لا يمكنك الوصول لبيانات مورد آخر');
    }
  }

  // ===== /me endpoints (derive supplierId from token) =====

  // A) Dashboard for current user's supplier
  async getMyDashboard(currentUserId: string) {
    const supplierId = await this.getMySupplierIdOrThrow(currentUserId);
    return supplierRepository.getDashboard(supplierId);
  }

  // B) Products for current user's supplier
  async getMyProducts(currentUserId: string, pagination: PaginationParams, search?: string) {
    const supplierId = await this.getMySupplierIdOrThrow(currentUserId);
    return supplierRepository.getProducts(supplierId, pagination, search);
  }

  // C) Requests for current user's supplier
  async getMyRequests(currentUserId: string, pagination: PaginationParams) {
    const supplierId = await this.getMySupplierIdOrThrow(currentUserId);
    return supplierRepository.getRequests(supplierId, pagination);
  }

  // D) Settings for current user's supplier
  async getMySettings(currentUserId: string) {
    const supplierId = await this.getMySupplierIdOrThrow(currentUserId);
    return supplierRepository.getSupplierSettings(supplierId);
  }

  // E) Update settings for current user's supplier
  async updateMySettings(currentUserId: string, data: any) {
    const supplierId = await this.getMySupplierIdOrThrow(currentUserId);
    return supplierRepository.updateSupplierSettings(supplierId, data);
  }

  // ===== /:id endpoints (for admin OR validated supplier access) =====

  // A) Dashboard by ID (admin or owner)
  async getDashboard(supplierId: string, currentUserId: string, currentUserRole: string) {
    await this.validateSupplierAccess(supplierId, currentUserId, currentUserRole);
    return supplierRepository.getDashboard(supplierId);
  }

  // B) Products by ID (admin or owner)
  async getProducts(supplierId: string, currentUserId: string, currentUserRole: string, pagination: PaginationParams, search?: string) {
    await this.validateSupplierAccess(supplierId, currentUserId, currentUserRole);
    return supplierRepository.getProducts(supplierId, pagination, search);
  }

  // C) Requests by ID (admin or owner)
  async getRequests(supplierId: string, currentUserId: string, currentUserRole: string, pagination: PaginationParams) {
    await this.validateSupplierAccess(supplierId, currentUserId, currentUserRole);
    return supplierRepository.getRequests(supplierId, pagination);
  }

  // D) Supplier settings by ID (admin or owner)
  async getSupplierSettings(supplierId: string, currentUserId: string, currentUserRole: string) {
    await this.validateSupplierAccess(supplierId, currentUserId, currentUserRole);
    return supplierRepository.getSupplierSettings(supplierId);
  }

  // E) Update supplier settings by ID (admin or owner)
  async updateSupplierSettings(supplierId: string, currentUserId: string, currentUserRole: string, data: any) {
    await this.validateSupplierAccess(supplierId, currentUserId, currentUserRole);
    return supplierRepository.updateSupplierSettings(supplierId, data);
  }

  // ===== Assignment Management (Admin only) =====

  async createAssignment(data: {
    supplierId: string;
    requestType: string;
    requestId: string;
    priority?: string;
    supplierNotes?: string;
    createdByAdminId?: string;
  }) {
    return supplierRepository.createAssignment(data);
  }

  async getAssignments(filters: { supplierId?: string; requestType?: string; status?: string }, pagination: PaginationParams) {
    return supplierRepository.getAssignments(filters, pagination);
  }

  async updateAssignmentStatus(assignmentId: string, status: string, notes?: string) {
    return supplierRepository.updateAssignmentStatus(assignmentId, status, notes);
  }

  // ===== Supplier-facing Assignment Status Update =====

  // Valid transitions for supplier
  private static SUPPLIER_TRANSITIONS: Record<string, string[]> = {
    'NEW': ['ACCEPTED', 'REJECTED'],
    'ACCEPTED': ['IN_PROGRESS'],
    'IN_PROGRESS': ['SHIPPED'],
    'SHIPPED': [], // Terminal state for supplier
    'REJECTED': [], // Terminal state
    'CANCELLED': [] // Cannot be changed by supplier
  };

  // Supplier can update their own assignment status
  async updateMyAssignmentStatus(
    currentUserId: string,
    assignmentId: string,
    newStatus: string,
    notes?: string
  ) {
    // 1. Get supplier ID for current user
    const supplierId = await this.getMySupplierIdOrThrow(currentUserId);

    // 2. Get assignment
    const assignment = await supplierRepository.getAssignmentById(assignmentId);
    if (!assignment) {
      throw new NotFoundError('التخصيص غير موجود');
    }

    // 3. Validate ownership (IDOR prevention)
    if (assignment.supplierId !== supplierId) {
      throw new ForbiddenError('لا يمكنك تحديث تخصيص مورد آخر');
    }

    // 4. Validate transition
    const allowedTransitions = SupplierService.SUPPLIER_TRANSITIONS[assignment.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(
        `لا يمكن الانتقال من "${assignment.status}" إلى "${newStatus}". التحولات المسموحة: ${allowedTransitions.join(', ') || 'لا يوجد'}`
      );
    }

    // 5. Supplier cannot set CANCELLED
    if (newStatus === 'CANCELLED') {
      throw new ForbiddenError('الإلغاء متاح للمدير فقط');
    }

    // 6. Update with audit log
    return supplierRepository.updateSupplierAssignmentStatus(
      assignmentId,
      assignment.status,
      newStatus,
      currentUserId,
      'SUPPLIER',
      notes
    );
  }

  // Get audit logs for an assignment (supplier can only view their own)
  async getMyAssignmentAuditLogs(currentUserId: string, assignmentId: string) {
    const supplierId = await this.getMySupplierIdOrThrow(currentUserId);
    const assignment = await supplierRepository.getAssignmentById(assignmentId);
    
    if (!assignment || assignment.supplierId !== supplierId) {
      throw new ForbiddenError('لا يمكنك عرض سجلات تخصيص مورد آخر');
    }

    return supplierRepository.getAssignmentAuditLogs(assignmentId);
  }
}

export const supplierService = new SupplierService();




