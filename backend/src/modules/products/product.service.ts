import { productRepository, ProductFilters } from './product.repository';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';

export class ProductService {
  async list(filters: ProductFilters, pagination: PaginationParams) {
    return productRepository.findMany(filters, pagination);
  }

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('المنتج غير موجود');
    }
    return product;
  }

  async getByPartNumber(partNumber: string) {
    const product = await productRepository.findByPartNumber(partNumber);
    if (!product) {
      throw new NotFoundError('المنتج غير موجود');
    }
    return product;
  }

  async search(query: string, limit: number = 50) {
    if (!query) {
      throw new BadRequestError('يجب تحديد كلمة البحث');
    }
    return productRepository.search(query, limit);
  }

  async create(data: any) {
    // Check if part number exists
    const existing = await productRepository.findByPartNumber(data.partNumber);
    if (existing) {
      throw new BadRequestError('رقم القطعة موجود مسبقاً');
    }
    return productRepository.create(data);
  }

  async update(id: string, data: any) {
    await this.getById(id); // Verify exists
    return productRepository.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id); // Verify exists
    return productRepository.delete(id);
  }

  async getCategories() {
    return productRepository.getDistinctCategories();
  }

  async getBrands() {
    return productRepository.getDistinctBrands();
  }
}

export const productService = new ProductService();
