import { CartItem } from './product';
import { ExtendedUserRole } from './user';

export enum OrderStatus {
  PENDING = 'بانتظار الموافقة',
  APPROVED = 'تم الاعتماد',
  REJECTED = 'مرفوض',
  SHIPPED = 'تم الشحن',
  DELIVERED = 'تم التسليم',
  CANCELLED = 'تم الإلغاء' // Added Cancelled
}

// --- Internal Order Logic (Admin Only) ---
export type OrderInternalStatus =
  | 'NEW'                    // طلب جديد – لم يبدأ العمل عليه
  | 'SENT_TO_WAREHOUSE'      // تم إرسال الطلب للمستودع
  | 'WAITING_PAYMENT'        // في انتظار تأكيد تحويل العميل
  | 'PAYMENT_CONFIRMED'      // تم تأكيد التحويل / السداد
  | 'SALES_INVOICE_CREATED'  // تم إصدار فاتورة مبيعات
  | 'READY_FOR_SHIPMENT'     // جاهز للشحن/التسليم
  | 'COMPLETED_INTERNAL'     // مكتمل داخليًا
  | 'CANCELLED_INTERNAL';    // ملغى من قبل الإدارة داخليًا

export interface InternalStatusHistoryItem {
  status: OrderInternalStatus;
  changedAt: string;
  changedBy: string; // Admin Name
}

export interface Order {
  id: string;
  userId: string; // The actual user who made the order (Owner or Staff)
  businessId?: string; // Links order to the Business Profile
  createdByUserId?: string; // Same as userId, redundant but for clarity
  createdByName?: string; // Name of the person who clicked submit

  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string;
  branchId?: string; // Which branch ordered this
  
  // Cancellation Logic
  cancelledBy?: 'CUSTOMER' | 'ADMIN';
  cancelledAt?: string;

  // --- Admin Internal Workflow Fields ---
  internalStatus?: OrderInternalStatus;
  internalNotes?: string;
  internalStatusHistory?: InternalStatusHistoryItem[];
  
  // Badge tracking - for admin unread notification
  isNew?: boolean;
}

// --- Abandoned Cart Tracking ---
export type AbandonedCartStatus = 'ACTIVE' | 'CONVERTED';

export interface AbandonedCart {
  id: string;
  userId: string;
  userName?: string;
  whatsapp?: string;
  phone?: string;
  extendedRole?: ExtendedUserRole;
  items: CartItem[];
  totalAmount: number;
  lastUpdatedAt: string;
  status: AbandonedCartStatus;
  createdAt: string;
}

// --- Purchase Request (from Product Search Page) ---
export type PurchaseRequestStatus = 'NEW' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED';

export interface PurchaseRequestItem {
  id: string;
  productId: string;
  partNumber: string;
  productName: string;
  quantity: number;
  priceAtRequest?: number;
  notes?: string;
}

export interface PurchaseRequest {
  id: string;
  customerId: string;
  customerName?: string;
  companyName?: string;
  createdAt: string;
  updatedAt?: string;
  status: PurchaseRequestStatus;
  source: 'PRODUCT_SEARCH_PAGE';
  items: PurchaseRequestItem[];
  totalItemsCount: number;
  notes?: string;
  createdByUserId: string;
  createdByName?: string;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  adminNote?: string;
  isNew?: boolean;
}
