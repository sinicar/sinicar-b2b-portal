import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';

export class ProductController {
  /**
   * GET /products - Get all products with pagination and filtering
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        isActive = 'true'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        isActive: isActive === 'true'
      };

      if (search) {
        where.OR = [
          { partNumber: { contains: String(search), mode: 'insensitive' } },
          { name: { contains: String(search), mode: 'insensitive' } },
          { nameAr: { contains: String(search), mode: 'insensitive' } },
          { nameEn: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.category = String(category);
      }

      if (brand) {
        where.brand = String(brand);
      }

      if (minPrice) {
        where.priceWholesale = { ...where.priceWholesale, gte: Number(minPrice) };
      }

      if (maxPrice) {
        where.priceWholesale = { ...where.priceWholesale, lte: Number(maxPrice) };
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take,
          include: {
            qualityCode: true,
            brandCode: true,
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/search - Search products by part number or name
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit = 50 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد كلمة البحث'
        });
      }

      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { partNumber: { contains: String(q), mode: 'insensitive' } },
            { name: { contains: String(q), mode: 'insensitive' } },
            { nameAr: { contains: String(q), mode: 'insensitive' } },
            { nameEn: { contains: String(q), mode: 'insensitive' } },
          ]
        },
        take: Number(limit),
        include: {
          qualityCode: true,
          brandCode: true,
        },
        orderBy: { priceWholesale: 'asc' }
      });

      res.json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/:id - Get product by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          qualityCode: true,
          brandCode: true,
        }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'المنتج غير موجود'
        });
      }

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/part/:partNumber - Get product by part number
   */
  async getByPartNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { partNumber } = req.params;

      const product = await prisma.product.findUnique({
        where: { partNumber },
        include: {
          qualityCode: true,
          brandCode: true,
        }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'المنتج غير موجود'
        });
      }

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /products - Create new product (Admin only)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // Check if part number exists
      const existing = await prisma.product.findUnique({
        where: { partNumber: data.partNumber }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'رقم القطعة موجود مسبقاً'
        });
      }

      const product = await prisma.product.create({
        data: {
          partNumber: data.partNumber,
          name: data.name,
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          brand: data.brand,
          category: data.category,
          description: data.description,
          imageUrl: data.imageUrl,
          priceRetail: data.priceRetail || 0,
          priceWholesale: data.priceWholesale || 0,
          priceVip: data.priceVip || 0,
          stock: data.stock || 0,
          isActive: data.isActive ?? true,
          qualityCodeId: data.qualityCodeId,
          brandCodeId: data.brandCodeId,
        },
        include: {
          qualityCode: true,
          brandCode: true,
        }
      });

      res.status(201).json({
        success: true,
        message: 'تم إنشاء المنتج بنجاح',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /products/:id - Update product (Admin only)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          brand: data.brand,
          category: data.category,
          description: data.description,
          imageUrl: data.imageUrl,
          priceRetail: data.priceRetail,
          priceWholesale: data.priceWholesale,
          priceVip: data.priceVip,
          stock: data.stock,
          isActive: data.isActive,
          qualityCodeId: data.qualityCodeId,
          brandCodeId: data.brandCodeId,
        },
        include: {
          qualityCode: true,
          brandCode: true,
        }
      });

      res.json({
        success: true,
        message: 'تم تحديث المنتج بنجاح',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /products/:id - Delete product (Admin only)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.product.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'تم حذف المنتج بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/categories - Get all categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.product.findMany({
        where: {
          isActive: true,
          category: { not: null }
        },
        distinct: ['category'],
        select: { category: true }
      });

      res.json({
        success: true,
        data: {
          categories: categories.map(c => c.category).filter(Boolean)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/brands - Get all brands
   */
  async getBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await prisma.product.findMany({
        where: {
          isActive: true,
          brand: { not: null }
        },
        distinct: ['brand'],
        select: { brand: true }
      });

      res.json({
        success: true,
        data: {
          brands: brands.map(b => b.brand).filter(Boolean)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
