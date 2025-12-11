// ===== Supplier Portal Types (Command 15) =====

// Supplier Type (Local, International, or Unregistered)
export type SupplierType = 'LOCAL' | 'INTERNATIONAL' | 'UNREGISTERED';

// Supplier Request Status
export type SupplierRequestStatus = 'NEW' | 'VIEWED' | 'QUOTED' | 'REJECTED' | 'ACCEPTED' | 'EXPIRED';

// Supplier Product - Products that suppliers offer
export interface SupplierProduct {
  id: string;
  supplierId: string;
  sku: string;
  oemNumber: string;
  name: string;
  nameEn?: string;
  category: string;
  brand: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  purchasePrice: number;  // Price supplier sells to SINI CAR
  minOrderQty: number;
  stock: number;
  deliveryTime: number;  // Days
  isActive: boolean;
  description?: string;
  imageUrl?: string;
  mainImageUrl?: string | null;       // Main product image URL
  imageGallery?: string[];            // Array of additional image URLs
  createdAt: string;
  updatedAt: string;
}

// Supplier Product Insert type (for forms)
export interface SupplierProductInsert {
  sku: string;
  oemNumber: string;
  name: string;
  nameEn?: string;
  category: string;
  brand: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  purchasePrice: number;
  minOrderQty: number;
  stock: number;
  deliveryTime: number;
  description?: string;
  imageUrl?: string;
}

// Supplier Request - Requests sent to suppliers for quotes
export interface SupplierRequest {
  id: string;
  requestId: string;  // Links to main PurchaseRequest
  supplierId: string;
  supplierName?: string;
  status: SupplierRequestStatus;
  quotedPrice?: number;
  stockAvailable?: number;
  notes?: string;
  responseDeadline?: string;
  deadline?: string;  // Customer deadline for the request
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Related request details for display
  partNumber?: string;
  partName?: string;
  quantity?: number;
  customerName?: string;  // Obfuscated if needed
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// Supplier Dashboard Stats
export interface SupplierDashboardStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  requestsAssignedToday: number;
  quotesSubmitted: number;
  quotesAccepted: number;
  quotesRejected: number;
  pendingRequests: number;
  averageResponseTime: number;  // Hours
  supplierRating: number;  // 0-5
  totalRevenue?: number;
  thisMonthRevenue?: number;
}

// Supplier Settings
export interface SupplierSettings {
  id: string;
  supplierId: string;
  defaultPriceMarkup: number;  // Percentage
  defaultDeliveryTime: number;  // Days
  autoResponseEnabled: boolean;
  autoResponseMessage?: string;
  notifyOnNewRequest: boolean;
  notifyOnQuoteAccepted: boolean;
  notifyOnDeadlineApproaching: boolean;
  preferredPaymentTerms?: string;
  minOrderValue?: number;
  maxDeliveryRadius?: string;
  workingHours?: string;
  holidays?: string[];
}

// Supplier Profile (Extended from User)
export interface SupplierProfileExtended {
  userId: string;
  supplierType: SupplierType;
  supplierCompanyName: string;
  supplierVat?: string;
  supplierCrNumber?: string;
  supplierCatalogUrl?: string;
  supplierRating: number;
  supplierActiveProductsCount: number;
  supplierTotalQuotesSubmitted: number;
  supplierTotalQuotesAccepted: number;
  supplierJoinedAt: string;
  supplierVerifiedAt?: string;
  supplierStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  supplierCategories?: string[];  // Categories they supply
  supplierBrands?: string[];  // Brands they supply
  supplierRegions?: string[];  // Regions they serve
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
}

// Supplier Product Filters
export interface SupplierProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ALL';
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Supplier Request Filters
export interface SupplierRequestFilters {
  status?: SupplierRequestStatus | 'ALL';
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'createdAt' | 'responseDeadline' | 'quotedPrice';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Supplier Excel Import Result
export interface SupplierExcelImportResult {
  success: boolean;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
}

// Supplier Quote Submission
export interface SupplierQuoteSubmission {
  requestId: string;
  quotedPrice: number;
  stockAvailable: number;
  notes?: string;
  deliveryTime?: number;
  validUntil?: string;
}

// Supplier Activity Log Entry (extends ActivityLogEntry)
export type SupplierActivityType =
  | 'SUPPLIER_PRODUCT_ADDED'
  | 'SUPPLIER_PRODUCT_UPDATED'
  | 'SUPPLIER_PRODUCT_DELETED'
  | 'SUPPLIER_EXCEL_UPLOADED'
  | 'SUPPLIER_QUOTE_SUBMITTED'
  | 'SUPPLIER_REQUEST_REJECTED'
  | 'SUPPLIER_SETTINGS_UPDATED'
  | 'SUPPLIER_PROFILE_UPDATED';

// Supplier Report Data
export interface SupplierReportData {
  period: 'week' | 'month' | 'quarter' | 'year';
  requestsSent: number;
  quotesSubmitted: number;
  quotesAccepted: number;
  quotesRejected: number;
  topRequestedProducts: { productId: string; productName: string; count: number }[];
  revenueGenerated: number;
  averageResponseTime: number;
  ratingTrend: number[];
}

// =====================================================
// INTERNATIONAL SUPPLIER & PRICING ENGINE TYPES
// =====================================================

export interface Currency {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  symbol: string;
  isBase: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExchangeRate {
  id: string;
  currencyId: string;
  rateToBase: number;
  syncPercent: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  syncPercent: number;
}

export interface SupplierGroup {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  defaultMarginPercent: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface QualityCode {
  id: string;
  code: string;
  label: string;
  labelAr?: string;
  labelEn?: string;
  labelHi?: string;
  labelZh?: string;
  description?: string;
  defaultMarginAdjust: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BrandCode {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  logoUrl?: string;
  country?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  baseRate: number;
  perKgRate: number;
  minCharge: number;
  deliveryDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ShippingZone {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  countries: string[];
  extraRatePerKg: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ShippingCostResult {
  shippingMethod: string;
  baseCost: number;
  weightCost: number;
  zoneSurcharge: number;
  totalCost: number;
  currency: string;
  estimatedDays: number;
}

export interface PricingInput {
  supplierId: string;
  supplierCurrency: string;
  supplierPrice: number;
  customerCurrency?: string;
  qualityCodeId?: string;
}

export interface PricingResult {
  supplierPrice: number;
  supplierCurrency: string;
  basePriceInSystemCurrency: number;
  marginPercent: number;
  qualityMarginAdjust: number;
  sellPriceBase: number;
  customerCurrency: string;
  sellPriceCustomer: number;
  exchangeRateUsed: number;
  breakdown: {
    step: string;
    value: number;
    description: string;
  }[];
}

// =====================================================
// SUPPLIER PROFILE (Extended)
// =====================================================

export interface SupplierProfile {
  id: string;
  userId: string;
  supplierType: SupplierType;
  groupId?: string;
  group?: SupplierGroup;
  companyName: string;
  companyNameAr?: string;
  companyNameEn?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  defaultCurrencyCode?: string;
  customMarginPercent?: number | null;
  paymentTerms?: string;
  minOrderValue?: number;
  avgDeliveryDays?: number;
  logoUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SupplierPriceEntry {
  id: string;
  supplierId: string;
  partNumber: string;
  partName?: string;
  partNameAr?: string;
  partNameEn?: string;
  brand?: string;
  qualityCodeId?: string;
  brandCodeId?: string;
  unitPrice: number;
  currencyCode: string;
  moq?: number;
  leadTimeDays?: number;
  weightKg?: number;
  volumeCbm?: number;
  hsCode?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}
