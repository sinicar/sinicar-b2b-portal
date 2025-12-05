"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierService = exports.SupplierService = void 0;
const supplier_repository_1 = require("./supplier.repository");
const errors_1 = require("../../utils/errors");
class SupplierService {
    async list(filters, pagination) {
        return supplier_repository_1.supplierRepository.findMany(filters, pagination);
    }
    async getById(id) {
        const supplier = await supplier_repository_1.supplierRepository.findById(id);
        if (!supplier) {
            throw new errors_1.NotFoundError('المورد غير موجود');
        }
        return supplier;
    }
    async getByCustomerId(customerId) {
        return supplier_repository_1.supplierRepository.findByCustomerId(customerId);
    }
    async create(customerId, input) {
        const existing = await supplier_repository_1.supplierRepository.findByCustomerId(customerId);
        if (existing) {
            throw new errors_1.BadRequestError('لديك ملف مورد بالفعل');
        }
        return supplier_repository_1.supplierRepository.create({
            customerId,
            companyName: input.companyName,
            contactName: input.contactName,
            contactPhone: input.contactPhone,
            contactEmail: input.contactEmail,
            categories: input.categories,
            regions: input.regions
        });
    }
    async update(id, customerId, input) {
        const supplier = await this.getById(id);
        if (supplier.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك تعديل ملف مورد آخر');
        }
        const { categories, regions, ...data } = input;
        return supplier_repository_1.supplierRepository.update(id, {
            ...data,
            ...(categories && { categories: JSON.stringify(categories) }),
            ...(regions && { regions: JSON.stringify(regions) })
        });
    }
    async updateStatus(id, status) {
        await this.getById(id);
        return supplier_repository_1.supplierRepository.update(id, { status });
    }
    async delete(id, customerId) {
        const supplier = await this.getById(id);
        if (supplier.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك حذف ملف مورد آخر');
        }
        await supplier_repository_1.supplierRepository.delete(id);
        return { message: 'تم حذف ملف المورد بنجاح' };
    }
    async addCatalogItem(supplierId, customerId, input) {
        const supplier = await this.getById(supplierId);
        if (supplier.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك إضافة منتجات لمورد آخر');
        }
        if (supplier.status !== 'ACTIVE') {
            throw new errors_1.BadRequestError('يجب تفعيل حساب المورد أولاً');
        }
        return supplier_repository_1.supplierRepository.addCatalogItem(supplierId, input);
    }
    async updateCatalogItem(itemId, supplierId, customerId, data) {
        const supplier = await this.getById(supplierId);
        if (supplier.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك تعديل منتجات مورد آخر');
        }
        return supplier_repository_1.supplierRepository.updateCatalogItem(itemId, data);
    }
    async deleteCatalogItem(itemId, supplierId, customerId) {
        const supplier = await this.getById(supplierId);
        if (supplier.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك حذف منتجات مورد آخر');
        }
        await supplier_repository_1.supplierRepository.deleteCatalogItem(itemId);
        return { message: 'تم حذف المنتج بنجاح' };
    }
    async getCatalogItems(supplierId, pagination) {
        await this.getById(supplierId);
        return supplier_repository_1.supplierRepository.getCatalogItems(supplierId, pagination);
    }
    async bulkUploadCatalog(supplierId, customerId, input) {
        const supplier = await this.getById(supplierId);
        if (supplier.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك تحديث كتالوج مورد آخر');
        }
        if (supplier.status !== 'ACTIVE') {
            throw new errors_1.BadRequestError('يجب تفعيل حساب المورد أولاً');
        }
        await supplier_repository_1.supplierRepository.bulkUpsertCatalog(supplierId, input.items, input.replaceExisting);
        return {
            message: `تم ${input.replaceExisting ? 'استبدال' : 'تحديث'} الكتالوج بنجاح`,
            itemsCount: input.items.length
        };
    }
    async searchMarketplace(filters, pagination) {
        const settings = await supplier_repository_1.supplierRepository.getSettings();
        if (settings && !settings.enableMarketplace) {
            throw new errors_1.BadRequestError('سوق الموردين غير متاح حالياً');
        }
        const results = await supplier_repository_1.supplierRepository.searchMarketplace(filters, pagination);
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
        return supplier_repository_1.supplierRepository.getSettings();
    }
    async updateSettings(data) {
        return supplier_repository_1.supplierRepository.updateSettings(data);
    }
    async getStats() {
        const allSuppliers = await supplier_repository_1.supplierRepository.findMany({}, { page: 1, limit: 1000 });
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
exports.SupplierService = SupplierService;
exports.supplierService = new SupplierService();
//# sourceMappingURL=supplier.service.js.map