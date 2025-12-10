import type { Product } from './product';

export type QuoteRequestStatus =
  | 'NEW'               // جديد – لم يفتح من الأدمن
  | 'UNDER_REVIEW'      // قيد المراجعة في لوحة التحكم
  | 'PARTIALLY_APPROVED'// جزء من الأصناف معتمد وجزء ناقص
  | 'APPROVED'          // تم التسعير الكامل
  | 'QUOTED'            // Legacy compatible
  | 'PROCESSED'         // Legacy compatible
  | 'REJECTED';         // تم رفض الطلب بالكامل

export type PriceType = 'OEM' | 'AFTERMARKET' | 'BOTH';

// Updated Item Statuses: PENDING (New), APPROVED (Matched), MISSING (Not Found), REJECTED (Admin rejected)
export type QuoteItemApprovalStatus = 'PENDING' | 'APPROVED' | 'MISSING' | 'REJECTED';

// Legacy: MATCHED, NOT_FOUND, APPROVED, REJECTED kept for compatibility with old data
export type QuoteItemStatus = 'PENDING' | 'MATCHED' | 'NOT_FOUND' | 'APPROVED' | 'REJECTED' | 'MISSING';

export interface QuoteItem {
  partNumber: string;
  partName: string; // Name from excel
  requestedQty: number;
  
  // New Admin Review Fields
  approvalStatus?: QuoteItemApprovalStatus;
  adminNote?: string; // Reason for rejection or note
  rowIndex?: number; // Row index in original excel

  // Fields populated after matching
  matchedProductId?: string;
  matchedProductName?: string;
  matchedPrice?: number;
  isAvailable?: boolean;
  totalPrice?: number; // Calculated after approval
  
  // Legacy fields
  status?: QuoteItemStatus; 
  notes?: string; 
}

export interface QuoteRequest {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  date: string;
  
  status: QuoteRequestStatus; // NEW, UNDER_REVIEW, APPROVED, PARTIALLY_APPROVED...
  
  items: QuoteItem[];
  totalQuotedAmount?: number;
  priceType?: PriceType; // Selected price type
  processedDate?: string; // When admin finalized it

  // Admin Review Metadata
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  adminGeneralNote?: string;
  
  approvedItemsCount?: number;
  missingItemsCount?: number;
  resultReady?: boolean; // Is ready for customer download
  
  // Admin Badge Tracking
  isNew?: boolean;                        // For admin sidebar badge - true when unseen by admin
}

// --- Missing Parts (Nawaqis) ---

export type MissingSource = 'QUOTE' | 'SEARCH';

// حالة التوفر عند البحث
export type MissingAvailabilityStatus = 'not_found' | 'out_of_stock';

// مصدر البحث
export type SearchSourceType = 'heroSearch' | 'catalogSearch' | 'quoteRequest';

export type MissingStatus =
  | 'NEW'            // نقص جديد لم يُعالَج بعد
  | 'UNDER_REVIEW'   // تحت الدراسة
  | 'ORDER_PLANNED'  // تم جدولة طلب استيراد
  | 'ORDERED'        // تم طلبه من المورد/الصين
  | 'ADDED_TO_STOCK' // تم إضافته كمنتج في النظام
  | 'IGNORED';       // تم تجاهله أو لا جدوى منه

export interface MissingProductRequest {
  id: string;
  userId: string; // Initiator
  source?: MissingSource; // 'QUOTE' or 'SEARCH'
  query: string;     // Part number or text searched
  createdAt: string;
  
  // Identity info
  userName?: string; 
  branchId?: string;
  
  // New fields for structured tracking (Optional for compatibility)
  partNumber?: string;
  normalizedPartNumber?: string;
  name?: string;
  brand?: string;
  carModel?: string;
  quantityRequested?: number;

  // If from QUOTE
  quoteRequestId?: string;
  quoteItemId?: string;

  // Aggregation & Stats
  totalRequestsCount?: number;      // How many times this item was requested
  uniqueCustomersCount?: number;    // How many unique customers
  customerIds?: string[];           // List of user IDs who requested this
  lastRequestedAt?: string;         // Most recent request date
  
  // Search Pipeline Fields (New)
  availabilityStatus?: MissingAvailabilityStatus;  // 'not_found' or 'out_of_stock'
  searchSource?: SearchSourceType;                  // 'heroSearch', 'catalogSearch', etc.
  searchCount?: number;                             // عدد مرات البحث عن نفس القطعة (للتجميع)
  lastSearchDate?: string;                          // آخر تاريخ بحث (YYYY-MM-DD)
  productId?: string;                               // معرف المنتج إذا كان موجودًا لكن نفذت الكمية

  // Management
  status?: MissingStatus;
  adminNotes?: string;
  importRequestId?: string;         // Link to future import request
  
  // Admin Badge Tracking
  isNew?: boolean;                        // For admin sidebar badge - true when unseen by admin
}

// --- Search Service Types ---

export type SearchResultType = 'NOT_FOUND' | 'FOUND_OUT_OF_STOCK' | 'FOUND_AVAILABLE';

export interface SearchResult {
  type: SearchResultType;
  product?: Product;           // المنتج إذا تم العثور عليه
  normalizedQuery?: string;    // الاستعلام بعد التطبيع
}

// --- New Features Interfaces ---

export interface SearchHistoryItem {
  id: string;
  userId: string;
  productId: string;
  partNumber: string;
  productName: string;
  viewedAt: string;      // ISO date
  priceSnapshot: number; // السعر وقت العرض
}
