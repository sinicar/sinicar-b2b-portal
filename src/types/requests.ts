// ============================================
// REQUEST TYPES (Purchase, Quote, Import, Missing)
// ============================================

// --- Purchase Request Types (Command 13) ---

export type PurchaseRequestStatus =
  | 'PENDING'         // قيد المراجعة
  | 'APPROVED'        // موافق عليه
  | 'REJECTED'        // مرفوض
  | 'CANCELLED'       // ملغي
  | 'FULFILLED'       // تم التنفيذ
  | 'SOURCING';       // جاري البحث عن المنتج

export interface PurchaseRequestItem {
  id: string;
  partNumber: string;
  partName?: string;
  quantity: number;
  notes?: string;
  status?: 'PENDING' | 'FOUND' | 'NOT_FOUND';
  quotedPrice?: number;
  foundProductId?: string;
}

export interface PurchaseRequest {
  id: string;
  customerId: string;
  customerName?: string;
  companyName?: string;
  
  items: PurchaseRequestItem[];
  
  status: PurchaseRequestStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  customerNotes?: string;
  adminNotes?: string;
  
  totalQuotedPrice?: number;
  quotedAt?: string;
  quotedBy?: string;
  
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  
  createdAt: string;
  updatedAt?: string;
  
  // Source tracking
  source?: 'SEARCH_PAGE' | 'EXCEL_UPLOAD' | 'MANUAL' | 'MOBILE';
  uploadedFileUrl?: string;
}

// --- Quote Request Types ---

export type QuoteRequestStatus =
  | 'PENDING'         // قيد المراجعة
  | 'PROCESSING'      // جاري التسعير
  | 'QUOTED'          // تم التسعير
  | 'APPROVED'        // موافق عليه
  | 'REJECTED'        // مرفوض
  | 'EXPIRED'         // منتهي الصلاحية
  | 'CANCELLED';      // ملغي

export type QuoteItemStatus =
  | 'PENDING'         // قيد المراجعة
  | 'FOUND'           // متوفر
  | 'NOT_FOUND'       // غير متوفر
  | 'ALTERNATIVE'     // متوفر بديل
  | 'OUT_OF_STOCK';   // نفد من المخزون

export interface QuoteRequestItem {
  id: string;
  partNumber: string;
  partName?: string;
  quantity: number;
  notes?: string;
  status: QuoteItemStatus;
  quotedPrice?: number;
  alternativePartNumber?: string;
  alternativePartName?: string;
  alternativePrice?: number;
}

export interface QuoteRequest {
  id: string;
  customerId: string;
  customerName?: string;
  companyName?: string;
  
  items: QuoteRequestItem[];
  
  status: QuoteRequestStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  customerNotes?: string;
  adminNotes?: string;
  
  totalQuotedPrice?: number;
  quotedAt?: string;
  quotedBy?: string;
  validUntil?: string;
  
  createdAt: string;
  updatedAt?: string;
  
  // Source tracking
  source?: 'EXCEL_UPLOAD' | 'MANUAL_INPUT' | 'MOBILE';
  uploadedFileUrl?: string;
  
  // Linked order
  convertedToOrderId?: string;
  convertedAt?: string;
}

// --- Import Request Types (China Import) ---

export type ImportRequestStatus =
  | 'PENDING'             // قيد المراجعة
  | 'CONFIRMED'           // مؤكد
  | 'PAYMENT_PENDING'     // انتظار الدفع
  | 'PAID'                // تم الدفع
  | 'SOURCING'            // جاري الشراء من الصين
  | 'SHIPPING'            // جاري الشحن
  | 'CUSTOMS'             // في الجمارك
  | 'DELIVERED'           // تم التسليم
  | 'CANCELLED'           // ملغي
  | 'REJECTED';           // مرفوض

export interface ImportRequestItem {
  id: string;
  partNumber: string;
  partName?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  status?: 'PENDING' | 'SOURCED' | 'NOT_AVAILABLE';
  alternativePartNumber?: string;
}

export interface ImportRequest {
  id: string;
  customerId: string;
  customerName?: string;
  companyName?: string;
  
  items: ImportRequestItem[];
  
  status: ImportRequestStatus;
  
  customerNotes?: string;
  adminNotes?: string;
  
  // Pricing
  subtotal?: number;
  shippingCost?: number;
  customsFee?: number;
  serviceFee?: number;
  total?: number;
  
  // Payment
  paidAmount?: number;
  paidAt?: string;
  paymentMethod?: string;
  
  // Tracking
  trackingNumber?: string;
  shippingCompany?: string;
  estimatedArrival?: string;
  
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Source tracking
  uploadedFileUrl?: string;
}

// --- Missing Product Request Types ---

export type MissingProductStatus =
  | 'PENDING'         // قيد البحث
  | 'FOUND'           // تم العثور عليه
  | 'NOT_FOUND'       // غير متوفر
  | 'SOURCING'        // جاري التوريد
  | 'AVAILABLE'       // متوفر الآن
  | 'CLOSED';         // مغلق

export interface MissingProductRequest {
  id: string;
  customerId: string;
  customerName?: string;
  
  partNumber: string;
  partName?: string;
  brand?: string;
  carModel?: string;
  yearFrom?: number;
  yearTo?: number;
  quantity?: number;
  
  description?: string;
  customerNotes?: string;
  adminNotes?: string;
  
  status: MissingProductStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Resolution
  foundProductId?: string;
  foundPrice?: number;
  notifiedCustomer?: boolean;
  notifiedAt?: string;
  
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

// --- Request Filters ---

export interface RequestFilters {
  status?: string | 'ALL';
  customerId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  priority?: string;
  sortBy?: 'createdAt' | 'status' | 'priority';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// --- Request List Response ---

export interface RequestListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// --- Saved Quote Template ---

export interface SavedQuoteTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: {
    partNumber: string;
    partName: string;
    quantity: number;
    notes?: string;
  }[];
  defaultSuppliers?: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  usageCount: number;
}
