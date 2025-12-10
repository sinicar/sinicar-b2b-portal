// ============================================
// ORDER TYPES
// ============================================

import type { CartItem } from './products';

// Order Status (External - Customer Facing)
export type OrderStatus =
  | 'PENDING'           // قيد المراجعة
  | 'PROCESSING'        // جاري التجهيز
  | 'READY'             // جاهز للاستلام
  | 'SHIPPED'           // تم الشحن
  | 'DELIVERED'         // تم التسليم
  | 'CANCELLED'         // ملغي
  | 'REJECTED';         // مرفوض

// Internal Status (Admin Only)
export type OrderInternalStatus =
  | 'NEW'               // جديد
  | 'CONFIRMED'         // مؤكد
  | 'WAREHOUSE_PREP'    // قيد التجهيز بالمستودع
  | 'QUALITY_CHECK'     // فحص الجودة
  | 'PACKING'           // التغليف
  | 'WAITING_PAYMENT'   // انتظار الدفع
  | 'PAID'              // تم الدفع
  | 'HANDED_TO_SHIPPING' // تم التسليم للشحن
  | 'COMPLETED'         // مكتمل
  | 'RETURNED'          // مرتجع
  | 'CANCELLED';        // ملغي

// Order Interface
export interface Order {
  id: string;
  userId: string;
  businessId?: string;    // For company orders
  userName?: string;      // Cached for display
  companyName?: string;   // Cached for display
  
  // Items
  items: CartItem[];
  
  // Pricing
  subtotal: number;
  discount?: number;
  discountCode?: string;
  vat?: number;
  vatAmount?: number;
  shippingCost?: number;
  total: number;
  
  // Status
  status: OrderStatus;
  internalStatus?: OrderInternalStatus;
  
  // Notes
  customerNotes?: string;
  adminNotes?: string;
  
  // Tracking
  trackingNumber?: string;
  shippingCompany?: string;
  estimatedDelivery?: string;
  
  // Payment
  paymentMethod?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  
  // Cancellation
  cancellationReason?: string;
  cancelledBy?: string;
  
  // Source tracking
  source?: 'WEB' | 'MOBILE' | 'API' | 'ADMIN';
  
  // Referral tracking
  referredBy?: string;
  marketerId?: string;
}

// Order Create Input
export interface OrderCreateInput {
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
  customerNotes?: string;
  discountCode?: string;
  paymentMethod?: string;
  shippingAddressId?: string;
}

// Order Update Input
export interface OrderUpdateInput {
  status?: OrderStatus;
  internalStatus?: OrderInternalStatus;
  adminNotes?: string;
  trackingNumber?: string;
  shippingCompany?: string;
  estimatedDelivery?: string;
}

// Order Filters
export interface OrderFilters {
  status?: OrderStatus | 'ALL';
  internalStatus?: OrderInternalStatus | 'ALL';
  userId?: string;
  businessId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Order List Response
export interface OrderListResponse {
  items: Order[];
  page: number;
  pageSize: number;
  total: number;
}

// Abandoned Cart
export interface AbandonedCart {
  id: string;
  userId: string;
  userName?: string;
  companyName?: string;
  items: CartItem[];
  subtotal: number;
  lastActivityAt: string;
  reminderSentAt?: string;
  reminderCount?: number;
  recoveredAt?: string;
  recoveredOrderId?: string;
  createdAt: string;
}

// Abandoned Cart Filters
export interface AbandonedCartFilters {
  search?: string;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
  recovered?: boolean;
  page?: number;
  pageSize?: number;
}

// Abandoned Cart Response
export interface AbandonedCartResponse {
  items: AbandonedCart[];
  page: number;
  pageSize: number;
  total: number;
}

// Order Stats
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
}
