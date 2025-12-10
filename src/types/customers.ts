// ============================================
// CUSTOMER TYPES
// ============================================

import type { CustomerStatus, PriceVisibilityType, Branch } from './users';
import type { ActorType } from './activity';

// نوع العميل / النشاط التجاري
export type CustomerType =
  | 'SPARE_PARTS_SHOP'    // محل قطع غيار
  | 'MAINTENANCE_CENTER'  // مركز صيانة
  | 'RENTAL_COMPANY'      // شركة تأجير
  | 'INSURANCE_COMPANY'   // شركة تأمين
  | 'GOVERNMENT'          // جهة حكومية
  | 'WHOLESALE_TRADER'    // تاجر جملة
  | 'RETAIL_CUSTOMER'     // عميل تجزئة
  | 'OTHER';              // أخرى

// نوع السجل التجاري أو الوثيقة الرسمية (للتوسع لاحقًا)
export type CommercialRecordType =
  | 'CR_NUMBER'           // رقم سجل تجاري سعودي
  | 'LICENSE_NUMBER'      // رقم ترخيص
  | 'TAX_NUMBER'          // رقم ضريبي
  | 'OTHER';              // أخرى

// Full Company/Entity Profile for B2B (Command 16)
export interface BusinessProfile {
  id: string;
  // Company Info
  companyName: string;
  companyNameEn?: string;
  customerType: CustomerType;
  crNumber?: string;
  vatNumber?: string;
  // Contact Details
  email: string;
  phone: string;
  whatsapp?: string;
  city?: string;
  region?: string;
  country?: string;
  address?: string;
  
  // Linked User & Status
  ownerId: string;           // Linked to the main User
  status: CustomerStatus;    // ACTIVE, SUSPENDED, BLOCKED, PENDING, INACTIVE
  isActive: boolean;         // Overall account active state
  createdAt: string;
  approvedAt?: string;
  lastActiveAt?: string;
  lastLoginAt?: string;
  
  // --- الحقول الإضافية للبحث والتتبع ---
  totalOrdersCount?: number;
  totalSearchesCount?: number;
  lastOrderAt?: string;
  lastSearchAt?: string;
  totalOrdersAmount?: number;
  
  // --- Price Visibility Settings ---
  priceVisibility?: PriceVisibilityType;
  searchLimit?: number;       // حد نقاط البحث إذا كان priceVisibility = HIDDEN
  
  // --- Internal CRM Fields ---
  notes?: string;
  tags?: string[];
  assignedEmployeeId?: string;
  assignedMarketerId?: string;
  
  // Branches
  branches?: Branch[];
}

// --- Account Opening Request Types (Command 6) ---

export type AccountRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MORE_INFO' | 'SUSPENDED';

export interface AccountOpeningRequest {
  id: string;
  // Company Info
  companyName: string;
  companyNameEn?: string;
  customerType: CustomerType;
  crNumber?: string;
  vatNumber?: string;
  
  // Contact Info
  contactName: string;
  phone: string;
  email: string;
  whatsapp?: string;
  
  // Address
  city: string;
  region?: string;
  address?: string;
  
  // Supporting Documents
  crDocument?: string;    // URL to uploaded CR copy
  vatDocument?: string;   // URL to uploaded VAT certificate
  otherDocuments?: string[];
  
  // Status & Workflow
  status: AccountRequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  infoRequestNote?: string;
  
  // After Approval - Linked Account
  createdUserId?: string;      // The User ID created after approval
  createdBusinessId?: string;  // The Business profile ID created after approval
  
  // Referral tracking
  referredBy?: string;
  utmSource?: string;
}

// Customer Note (CRM)
export interface CustomerNote {
  id: string;
  customerId: string;
  text: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// Customer CRM Filter Types
export type CustomerActivityLevel = 'ACTIVE_TODAY' | 'ACTIVE_WEEK' | 'INACTIVE_30' | 'ALL';
export type CustomerOrderBehavior = 'HIGH_VOLUME' | 'REJECTED_REQUESTS' | 'ABANDONED_CARTS' | 'ALL';

export interface AdminCustomerFilters {
  search?: string;
  customerType?: CustomerType | 'ALL';
  status?: CustomerStatus | 'ALL';
  assignedMarketerId?: string;
  assignedEmployeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  activityFrom?: string;
  activityTo?: string;
  activityLevel?: CustomerActivityLevel;
  orderBehavior?: CustomerOrderBehavior;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'companyName' | 'lastActivityAt' | 'lastLoginAt' | 'createdAt' | 'totalOrdersCount' | 'totalSearchesCount' | 'city' | 'status' | 'customerType';
  sortDirection?: 'asc' | 'desc';
}

export interface AdminCustomerSummary {
  totalOrders: number;
  totalRequests: number;
  totalApproved: number;
  totalRejected: number;
  totalSpent: number;
  abandonedCartsCount: number;
  activeRequestsCount: number;
}

export interface AdminCustomerResponse {
  items: BusinessProfile[];
  page: number;
  pageSize: number;
  total: number;
}

// Customer Credit Profile (for Installments)
export type CreditScoreLevel = 'low' | 'medium' | 'high';

export interface CustomerCreditProfile {
  customerId: string;
  customerName?: string;
  scoreLevel: CreditScoreLevel;
  totalInstallmentRequests: number;
  totalActiveContracts: number;
  totalOverdueInstallments: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  paymentHistoryScore?: number;
  notes?: string;
  lastUpdated: string;
}

// Customer Loyalty Record
export interface CustomerLoyalty {
  id: string;
  userId: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentPoints: number;
  currentLevel: string;  // Level ID
  transactions: {
    id: string;
    type: 'earn' | 'redeem' | 'expire' | 'bonus';
    points: number;
    description: string;
    orderId?: string;
    createdAt: string;
  }[];
  memberSince: string;
  lastActivityAt: string;
}

// Customer Referral
export interface CustomerReferral {
  customerId: string;
  marketerId: string;
  referredAt: string;
  attributionExpiresAt: string;
  registrationIp?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  firstOrderId?: string;
  firstOrderDate?: string;
  totalOrdersCount?: number;
  totalOrdersValue?: number;
  isActive: boolean;
}
