export interface Product {
  id: string;
  partNumber: string;         // رقم الصنف من عمود "رقم الصنف"
  name: string;               // اسم الصنف من عمود "اسم الصنف"
  
  // Legacy fields (kept for backward compatibility)
  brand?: string;             // Changan, MG - now optional
  price?: number;             // Legacy price field - optional
  stock?: number;             // Legacy stock - optional
  image?: string;
  
  // Marketing fields
  oldPrice?: number;
  isOnSale?: boolean;
  isNew?: boolean;
  description?: string;       // من " المواصفات"
  category?: string;
  
  // مستويات التسعير من نظام أونيكس برو:
  priceRetail?: number | null;        // من "سعر التجزئة"
  priceWholesale?: number | null;     // من "سعر الجملة"
  priceWholeWholesale?: number | null;// من "سعر جملة الجملة"
  priceEcommerce?: number | null;     // من "سعر المتجر الالكتروني"

  // الكميات:
  qtyStore103?: number | null;        // من "  كمية المخزن 103"
  qtyStore105?: number | null;        // من "  كمية المخزن 105"
  qtyTotal?: number | null;           // من "الإجمالي"

  // حقول إضافية (اختيارية):
  manufacturerPartNumber?: string | null; // من "رقم التصنيع"
  carName?: string | null;              // من " اسم السيارة"
  globalCategory?: string | null;       // من " التصنيف العالمي"
  modelYear?: string | null;            // من " سنة الصنع"
  quality?: string | null;              // من "الجودة"

  // مواقع الرفوف (اختيارية):
  rack103?: string | null;             // من "رف المخزن 103"
  rack105?: string | null;             // من "رف المخزن 105"

  // حقول نظامية:
  createdAt?: string;
  updatedAt?: string;
  
  // Search Indexing Fields (Optional)
  normalizedPart?: string;
  numericPartCore?: string;
  
  // قواعد رؤية الكمية للعملاء
  useVisibilityRuleForQty?: boolean;  // إذا true: تطبق قاعدة إخفاء الكمية على هذا المنتج
  
  // Product Images (Command 19)
  mainImageUrl?: string | null;       // Main product image URL
  imageGallery?: string[];            // Array of additional image URLs
}

export interface CartItem extends Product {
  quantity: number;
}

// --- Alternative Parts (Cross References) ---
export type AlternativeSourceType = 'CUSTOMER_UPLOAD' | 'SYSTEM';

export interface AlternativePart {
  id: string;
  mainPartNumber: string;
  altPartNumber: string;
  description?: string;
  brand?: string;
  sourceType: AlternativeSourceType;
  sourceUserId?: string;
  sourceUserName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlternativeUploadResult {
  success: boolean;
  rowsProcessed: number;
  rowsInserted: number;
  rowsSkipped: number;
  errors?: string[];
}

// الحقول الداخلية المتاحة للتعيين
export const INTERNAL_PRODUCT_FIELDS = [
  { key: 'partNumber', label: 'رقم الصنف', required: true },
  { key: 'name', label: 'اسم المنتج', required: true },
  { key: 'brand', label: 'الماركة', required: false },
  { key: 'qtyTotal', label: 'الكمية', required: true },
  { key: 'priceWholesale', label: 'سعر الجملة', required: false },
  { key: 'priceRetail', label: 'سعر التجزئة', required: false },
  { key: 'priceWholeWholesale', label: 'سعر جملة الجملة', required: false },
  { key: 'priceEcommerce', label: 'سعر المتجر الالكتروني', required: false },
  { key: 'qtyStore103', label: 'كمية المخزن 103', required: false },
  { key: 'qtyStore105', label: 'كمية المخزن 105', required: false },
  { key: 'rack103', label: 'رف المخزن 103', required: false },
  { key: 'rack105', label: 'رف المخزن 105', required: false },
  { key: 'carName', label: 'اسم السيارة', required: false },
  { key: 'description', label: 'المواصفات', required: false },
  { key: 'manufacturerPartNumber', label: 'رقم التصنيع', required: false },
  { key: 'globalCategory', label: 'التصنيف العالمي', required: false },
  { key: 'modelYear', label: 'سنة الصنع', required: false },
  { key: 'quality', label: 'الجودة', required: false },
] as const;
