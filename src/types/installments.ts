// ============================================
// INSTALLMENT PURCHASE REQUEST SYSTEM TYPES
// ============================================

import type { CreditScoreLevel } from './customers';

// Installment Request Status
export type InstallmentRequestStatus =
  | 'PENDING_SINICAR_REVIEW'
  | 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR'
  | 'REJECTED_BY_SINICAR'
  | 'FORWARDED_TO_SUPPLIERS'
  | 'WAITING_FOR_SUPPLIER_OFFERS'
  | 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER'
  | 'ACTIVE_CONTRACT'
  | 'CLOSED'
  | 'CANCELLED';

// SINI CAR Decision
export type SinicarDecision = 'pending' | 'approved_full' | 'approved_partial' | 'rejected';

// Payment Frequency
export type PaymentFrequency = 'weekly' | 'monthly';

// Installment Offer Status
export type InstallmentOfferStatus =
  | 'WAITING_FOR_CUSTOMER'
  | 'ACCEPTED_BY_CUSTOMER'
  | 'REJECTED_BY_CUSTOMER';

// Installment Offer Source
export type InstallmentOfferSource = 'sinicar' | 'supplier';

// Installment Offer Type
export type InstallmentOfferType = 'full' | 'partial';

// Payment Installment Status
export type PaymentInstallmentStatus = 'pending' | 'paid' | 'overdue';

// Installment Request Item
export interface InstallmentRequestItem {
  id: string;
  requestId: string;
  productId?: string;
  productName?: string;
  description?: string;
  quantityRequested: number;
  unitPriceRequested?: number;
}

// Installment Payment Installment (single payment in schedule)
export interface InstallmentPaymentInstallment {
  id: string;
  dueDate: string;
  amount: number;
  status: PaymentInstallmentStatus;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

// Installment Payment Schedule
export interface InstallmentPaymentSchedule {
  frequency: PaymentFrequency;
  numberOfInstallments: number;
  installmentAmount: number;
  startDate: string;
  endDate: string;
  installments: InstallmentPaymentInstallment[];
}

// Installment Offer Item
export interface InstallmentOfferItem {
  id: string;
  offerId: string;
  requestItemId?: string;
  productId?: string;
  productName?: string;
  quantityApproved: number;
  unitPriceApproved: number;
}

// Installment Offer
export interface InstallmentOffer {
  id: string;
  requestId: string;
  sourceType: InstallmentOfferSource;
  supplierId?: string;
  supplierName?: string;
  type: InstallmentOfferType;
  itemsApproved: InstallmentOfferItem[];
  totalApprovedValue: number;
  schedule: InstallmentPaymentSchedule;
  status: InstallmentOfferStatus;
  notes?: string;
  adminNotes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Installment Request
export interface InstallmentRequest {
  id: string;
  customerId: string;
  customerName?: string;
  items: InstallmentRequestItem[];
  totalRequestedValue?: number;
  requestedDurationMonths?: number;
  requestedDurationWeeks?: number;
  paymentFrequency: PaymentFrequency;
  proposedInstallmentAmount?: number;
  downPaymentAmount?: number;
  notes?: string;
  status: InstallmentRequestStatus;
  sinicarDecision: SinicarDecision;
  allowedForSuppliers: boolean;
  forwardedToSupplierIds?: string[];
  acceptedOfferId?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  closedAt?: string;
  closedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Installment Settings - Controls all behavior
export interface InstallmentSettings {
  enabled: boolean;
  
  // SINI CAR priority behavior
  sinicarHasFirstPriority: boolean;
  allowPartialApprovalBySinicar: boolean;
  allowPartialApprovalBySuppliers: boolean;
  
  // What happens when SINI CAR rejects or partially approves
  autoForwardToSuppliersOnSinicarReject: boolean;
  autoForwardToSuppliersOnSinicarPartialRemainder: boolean;
  
  // Customer decision behavior
  onCustomerRejectsSinicarPartial: 'close_request' | 'forward_to_suppliers';
  onCustomerRejectsSupplierOffer: 'keep_waiting_for_other_suppliers' | 'close_request';
  
  // Duration limits
  maxDurationMonths: number;
  minDurationMonths: number;
  maxDurationWeeks?: number;
  minDurationWeeks?: number;
  
  // Down payment settings
  requireDownPayment: boolean;
  minDownPaymentPercent?: number;
  maxDownPaymentPercent?: number;
  
  // Amount limits
  minRequestAmount?: number;
  maxRequestAmount?: number;
  
  // Credit profile settings
  requireCreditCheck: boolean;
  minCreditScoreForApproval?: CreditScoreLevel;
  autoRejectLowCredit?: boolean;
  
  // Customer eligibility
  allowedCustomerTypes?: string[];
  blockedCustomerIds?: string[];
  
  // Supplier settings
  autoSelectAllSuppliers?: boolean;
  defaultSupplierIds?: string[];
  maxSuppliersPerRequest?: number;
  
  // Admin workflow
  requireAdminApprovalForSinicar?: boolean;
  autoGeneratePaymentSchedule?: boolean;
  defaultPaymentFrequency?: PaymentFrequency;
  
  // Notifications
  notifyCustomerOnNewOffer: boolean;
  notifyCustomerOnStatusChange?: boolean;
  notifyAdminOnNewRequest: boolean;
  notifyAdminOnCustomerDecision?: boolean;
  notifySuppliersOnForward: boolean;
  notifySuppliersOnCustomerDecision?: boolean;
  
  // Display settings
  showInstallmentInSidebar?: boolean;
  showInstallmentInDashboard?: boolean;
  showCreditProfileToCustomer?: boolean;
  showPaymentHistoryToCustomer?: boolean;
  
  // Terms and conditions
  termsAndConditionsAr?: string;
  termsAndConditionsEn?: string;
  requireTermsAcceptance?: boolean;
  
  // Overdue handling
  overdueGracePeriodDays?: number;
  autoMarkOverdue?: boolean;
  notifyOnOverdue?: boolean;
  
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

// Decision payload for SINI CAR
export interface SinicarDecisionPayload {
  decisionType: 'approve_full' | 'approve_partial' | 'reject';
  offer?: Partial<InstallmentOffer>;
  forwardToSuppliers?: boolean;
  supplierIds?: string[];
  adminNotes?: string;
}

// Supplier Offer Payload
export interface SupplierOfferPayload {
  type: InstallmentOfferType;
  itemsApproved: Omit<InstallmentOfferItem, 'id' | 'offerId'>[];
  totalApprovedValue: number;
  schedule: Omit<InstallmentPaymentSchedule, 'installments'>;
  notes?: string;
}

// Installment Stats for Admin Dashboard
export interface InstallmentStats {
  totalRequests: number;
  pendingRequests: number;
  activeContracts: number;
  closedContracts: number;
  totalRequestedValue: number;
  totalApprovedValue: number;
  totalPaidAmount: number;
  totalOverdueAmount: number;
  avgApprovalRate: number;
  avgProcessingDays: number;
  byStatus: { status: InstallmentRequestStatus; count: number }[];
  byMonth: { month: string; count: number; value: number }[];
}
