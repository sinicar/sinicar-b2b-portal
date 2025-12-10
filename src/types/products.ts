// ============================================
// PRODUCT TYPES
// ============================================

// Quality type for products
export type ProductQuality = 'OEM' | 'AFTERMARKET' | 'GENUINE' | 'USED' | 'REFURBISHED';

// Price Level Type
export type PriceLevel = 
  | 'WHOLESALE'           // سعر الجملة
  | 'RETAIL'              // سعر التجزئة
  | 'WHOLE_WHOLESALE'     // سعر جملة الجملة
  | 'ECOMMERCE';          // سعر المتجر الإلكتروني

export interface Product {
  id: string;
  partNumber: string;
  name: string;
  nameEn?: string;
  carName?: string;
  modelYear?: string;
  globalCategory?: string;
  brand?: string;
  description?: string;
  manufacturerPartNumber?: string;
  quality?: ProductQuality;
  
  // Images
  mainImageUrl?: string | null;       // Main product image URL
  imageGallery?: string[];            // Array of additional image URLs
  
  // Quantity Fields
  qtyTotal: number;
  qtyStore103?: number;
  qtyStore105?: number;
  rack103?: string;
  rack105?: string;
  
  // Pricing Levels (Command 22)
  priceWholesale?: number;          // سعر الجملة (القديم "price")
  priceRetail?: number;             // سعر التجزئة
  priceWholeWholesale?: number;     // سعر جملة الجملة (أقل سعر)
  priceEcommerce?: number;          // سعر المتجر الإلكتروني
  
  // Legacy price field (for backward compatibility)
  price?: number;
  
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;

  // Add-ons
  isFavorite?: boolean;
  totalSold?: number;
  lastSoldAt?: string;
}

// Cart Item
export interface CartItem extends Product {
  quantity: number;
  addedAt: string;
  priceAtAddition: number;
  notes?: string;
  customerNotice?: string;
}

// Alternative Part
export interface AlternativePart {
  id: string;
  originalPartNumber: string;
  alternativePartNumber: string;
  brand?: string;
  createdAt: string;
}

// --- Excel Import Column Presets ---

export interface ExcelColumnMapping {
  internalField: string;            // اسم الحقل الداخلي (partNumber, name, etc.)
  excelHeader: string;              // اسم العمود في ملف الإكسل
  isEnabled: boolean;               // هل هذا الحقل مفعل للاستيراد؟
  isRequired: boolean;              // هل هو حقل إجباري؟
  defaultValue?: string | number;   // قيمة افتراضية إذا كان العمود فارغًا
}

export interface ExcelColumnPreset {
  id: string;
  name: string;                     // اسم الإعداد (مثل "Onyx Export", "Supplier A")
  isDefault: boolean;               // هل هو الإعداد الافتراضي؟
  mappings: ExcelColumnMapping[];   // قائمة تعيينات الأعمدة
  createdAt: string;
  updatedAt?: string;
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

// --- Saved Search Types ---

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchQuery: string;
  filters?: Record<string, any>;
  createdAt: string;
}

// --- Product Search Result Types ---

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// --- Product Filters ---

export interface ProductFilters {
  search?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  quality?: ProductQuality;
  sortBy?: 'name' | 'price' | 'quantity' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// --- Saved Price Comparison ---

export interface SavedPriceComparison {
  id: string;
  userId: string;
  name: string;
  description?: string;
  partNumber: string;
  partName: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    price: number;
    currency: string;
    availability: string;
    deliveryTime?: string;
    notes?: string;
  }[];
  bestPrice: number;
  averagePrice: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// --- Saved VIN Extraction ---

export interface SavedVinExtraction {
  id: string;
  userId: string;
  name: string;
  vin: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    engineType?: string;
    transmission?: string;
    bodyType?: string;
    country?: string;
    plantCode?: string;
  };
  extractedParts?: {
    partNumber: string;
    partName: string;
    category: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// --- File Conversion History ---

export interface FileConversionRecord {
  id: string;
  userId: string;
  originalFileName: string;
  originalFileType: string;
  convertedFileType: string;
  fileSize: number;
  rowCount?: number;
  columnCount?: number;
  conversionDate: string;
  downloadUrl?: string;
  expiresAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}
