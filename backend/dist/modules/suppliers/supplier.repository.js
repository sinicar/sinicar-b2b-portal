"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRepository = exports.SupplierRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const pagination_1 = require("../../utils/pagination");
class SupplierRepository {
    async findMany(filters, pagination) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.minRating)
            where.rating = { gte: filters.minRating };
        if (filters.search) {
            where.OR = [
                { companyName: { contains: filters.search } },
                { contactName: { contains: filters.search } }
            ];
        }
        if (filters.category) {
            where.categories = { contains: filters.category };
        }
        if (filters.region) {
            where.regions = { contains: filters.region };
        }
        const [data, total] = await Promise.all([
            prisma_1.default.supplierProfile.findMany({
                where,
                include: {
                    _count: { select: { catalogItems: true } }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.supplierProfile.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        return prisma_1.default.supplierProfile.findUnique({
            where: { id },
            include: {
                catalogItems: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    async findByCustomerId(customerId) {
        return prisma_1.default.supplierProfile.findFirst({
            where: { customerId },
            include: {
                catalogItems: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    async create(data) {
        return prisma_1.default.supplierProfile.create({
            data: {
                customerId: data.customerId,
                companyName: data.companyName,
                contactName: data.contactName,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail,
                categories: data.categories ? JSON.stringify(data.categories) : null,
                regions: data.regions ? JSON.stringify(data.regions) : null,
                status: 'PENDING'
            }
        });
    }
    async update(id, data) {
        return prisma_1.default.supplierProfile.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return prisma_1.default.supplierProfile.delete({ where: { id } });
    }
    async addCatalogItem(supplierId, data) {
        return prisma_1.default.supplierCatalogItem.create({
            data: {
                supplierId,
                partNumber: data.partNumber,
                partName: data.partName,
                brand: data.brand,
                price: data.price,
                stock: data.stock ?? 0,
                leadTimeDays: data.leadTimeDays ?? 7,
                isActive: true
            }
        });
    }
    async updateCatalogItem(id, data) {
        return prisma_1.default.supplierCatalogItem.update({
            where: { id },
            data
        });
    }
    async deleteCatalogItem(id) {
        return prisma_1.default.supplierCatalogItem.delete({ where: { id } });
    }
    async getCatalogItems(supplierId, pagination) {
        const where = { supplierId };
        const [data, total] = await Promise.all([
            prisma_1.default.supplierCatalogItem.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.supplierCatalogItem.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async bulkUpsertCatalog(supplierId, items, replaceExisting = false) {
        if (replaceExisting) {
            await prisma_1.default.supplierCatalogItem.deleteMany({ where: { supplierId } });
        }
        const operations = items.map(item => prisma_1.default.supplierCatalogItem.upsert({
            where: {
                id: `${supplierId}-${item.partNumber}`
            },
            update: {
                partName: item.partName,
                brand: item.brand,
                price: item.price,
                stock: item.stock ?? 0,
                leadTimeDays: item.leadTimeDays ?? 7
            },
            create: {
                supplierId,
                partNumber: item.partNumber,
                partName: item.partName,
                brand: item.brand,
                price: item.price,
                stock: item.stock ?? 0,
                leadTimeDays: item.leadTimeDays ?? 7,
                isActive: true
            }
        }));
        return prisma_1.default.$transaction(operations);
    }
    async searchMarketplace(filters, pagination) {
        const where = {
            isActive: true,
            supplier: { status: 'ACTIVE' }
        };
        if (filters.partNumber)
            where.partNumber = { contains: filters.partNumber };
        if (filters.partName)
            where.partName = { contains: filters.partName };
        if (filters.brand)
            where.brand = { contains: filters.brand };
        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice)
                where.price.gte = filters.minPrice;
            if (filters.maxPrice)
                where.price.lte = filters.maxPrice;
        }
        if (filters.inStock)
            where.stock = { gt: 0 };
        const [data, total] = await Promise.all([
            prisma_1.default.supplierCatalogItem.findMany({
                where,
                include: {
                    supplier: {
                        select: { id: true, companyName: true, rating: true }
                    }
                },
                orderBy: { price: 'asc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.supplierCatalogItem.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async getSettings() {
        return prisma_1.default.supplierMarketplaceSettings.findFirst({
            where: { key: 'global' }
        });
    }
    async updateSettings(data) {
        return prisma_1.default.supplierMarketplaceSettings.upsert({
            where: { key: 'global' },
            update: data,
            create: {
                key: 'global',
                ...data
            }
        });
    }
}
exports.SupplierRepository = SupplierRepository;
exports.supplierRepository = new SupplierRepository();
//# sourceMappingURL=supplier.repository.js.map