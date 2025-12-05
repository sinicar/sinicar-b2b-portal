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
}

export const supplierService = new SupplierService();
