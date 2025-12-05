/**
 * Shared enum type definitions for the backend
 * These replace @prisma/client enums since the schema uses String types
 */
export type AdvertiserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type CampaignStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED';
export type CustomerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'VIP';
export type PriceLevel = 'PRICE_1' | 'PRICE_2' | 'PRICE_3' | 'PRICE_4' | 'SPECIAL';
export type InstallmentStatus = 'PENDING_SINICAR_REVIEW' | 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR' | 'REJECTED_BY_SINICAR' | 'FORWARDED_TO_SUPPLIERS' | 'WAITING_FOR_SUPPLIER_OFFERS' | 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER' | 'ACTIVE_CONTRACT' | 'CLOSED' | 'CANCELLED' | 'COMPLETED';
export type SinicarDecision = 'FULL_APPROVAL' | 'PARTIAL_APPROVAL' | 'REJECTED' | 'FORWARD_TO_SUPPLIERS' | 'APPROVED_FULL' | 'APPROVED_PARTIAL';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'ACCEPTED_BY_CUSTOMER' | 'REJECTED_BY_CUSTOMER';
export type OfferSource = 'SINICAR' | 'SUPPLIER';
export type OfferType = 'FULL' | 'PARTIAL';
export type PaymentFrequency = 'WEEKLY' | 'MONTHLY';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'REJECTED' | 'CANCELLED';
export type OrderInternalStatus = 'NEW' | 'SENT_TO_WAREHOUSE' | 'WAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'SALES_INVOICE_CREATED' | 'READY_FOR_SHIPMENT' | 'COMPLETED_INTERNAL' | 'CANCELLED_INTERNAL';
export type QuoteStatus = 'NEW' | 'UNDER_REVIEW' | 'COMPLETED' | 'REJECTED' | 'PROCESSED';
export type OrgStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type OrganizationType = 'TRADER' | 'SUPPLIER' | 'MARKETER';
export type OrgUserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'MANAGER' | 'STAFF' | 'READONLY';
export type OrgUserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
export type SupplierStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type MarketerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type ReferralStatus = 'PENDING' | 'REGISTERED' | 'ACTIVE' | 'INACTIVE';
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
//# sourceMappingURL=enums.d.ts.map