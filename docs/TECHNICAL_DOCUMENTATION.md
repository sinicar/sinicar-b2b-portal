# SINI CAR B2B Portal - Technical Documentation
# التوثيق التقني الشامل لبوابة صيني كار B2B

**Version**: 1.0  
**Last Updated**: December 2024  
**Target Audience**: Backend Developers  

---

## Table of Contents / جدول المحتويات

1. [Project Overview / نظرة عامة على المشروع](#1-project-overview)
2. [File Map / خريطة الملفات](#2-file-map)
3. [Data Models / نماذج البيانات](#3-data-models)
4. [Workflows / سير العمل](#4-workflows)
5. [API Contracts / عقود الـ API](#5-api-contracts)
6. [localStorage Keys / مفاتيح التخزين المحلي](#6-localstorage-keys)
7. [Backend Handoff / تسليم الـ Backend](#7-backend-handoff)

---

## 1. Project Overview

### 1.1 Project Description

**SINI CAR B2B Portal** is a comprehensive wholesale auto parts trading platform for Chinese vehicle spare parts. The platform serves business customers including:
- Auto parts stores (محلات قطع الغيار)
- Insurance companies (شركات التأمين)
- Car rental companies (شركات تأجير السيارات)
- Sales representatives (مندوبين مبيعات)
- Maintenance centers (مراكز الصيانة)

### 1.2 Core Systems

The platform consists of **5 main configurable systems**:

| System | Description | Key Features |
|--------|-------------|--------------|
| **1. Trader Tools Hub** | Advanced tools for traders | VIN Extractor, Price Comparison, PDF to Excel |
| **2. Supplier Marketplace** | Marketplace connecting suppliers | Supplier profiles, Product listings, Forward requests |
| **3. Marketer/Affiliate System** | Affiliate marketing management | Referral links, Commission tracking, Analytics |
| **4. Advertising Management** | Ad campaign management | Ad slots, Campaigns, Targeting, Analytics |
| **5. Installment Purchase System** | Wholesale installment purchases | Credit profiles, Offers, Payment schedules |

### 1.3 User Types & Roles

```typescript
// Primary User Roles
type UserRole = 'SUPER_ADMIN' | 'CUSTOMER_OWNER' | 'CUSTOMER_STAFF';

// Employee Roles (for staff)
enum EmployeeRole {
  MANAGER = 'MANAGER',  // Full access
  BUYER = 'BUYER'       // Limited access
}

// Organization Types
type OrganizationType = 'customer' | 'supplier' | 'advertiser' | 'affiliate';

// Organization User Roles
type OrganizationUserRole = 'owner' | 'manager' | 'staff' | 'readonly';
```

### 1.4 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19.2, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| State Management | React Context API, Hooks |
| Data Persistence | localStorage (Mock Backend) |
| Charts | Recharts |
| PDF Generation | jspdf, jspdf-autotable |
| Excel Processing | xlsx |
| Icons | lucide-react |
| Internationalization | react-i18next (4 languages) |

### 1.5 Supported Languages

| Code | Language | Direction |
|------|----------|-----------|
| `ar` | Arabic (العربية) | RTL |
| `en` | English | LTR |
| `hi` | Hindi (हिंदी) | LTR |
| `zh` | Chinese (中文) | LTR |

---

## 2. File Map

### 2.1 Project Structure

```
src/
├── components/           # React Components (43 files)
│   ├── AboutPage.tsx
│   ├── AccessDenied.tsx
│   ├── AdminAccountRequests.tsx
│   ├── AdminAdvertisingPage.tsx
│   ├── AdminApiSettings.tsx
│   ├── AdminCustomersPage.tsx
│   ├── AdminDashboard.tsx           # Main admin control panel
│   ├── AdminImportManager.tsx
│   ├── AdminInstallmentsPage.tsx
│   ├── AdminMarketersPage.tsx
│   ├── AdminMarketingCenter.tsx
│   ├── AdminMissingParts.tsx
│   ├── AdminOrdersManager.tsx
│   ├── AdminOrganizationSettings.tsx
│   ├── AdminPricingCenter.tsx
│   ├── AdminProductsPage.tsx
│   ├── AdminQuoteManager.tsx
│   ├── AdminSecurityCenter.tsx
│   ├── AdminSettings.tsx
│   ├── AdminSupplierMarketplaceSettings.tsx
│   ├── AdminTraderToolsSettings.tsx
│   ├── AdminUsersPage.tsx
│   ├── CustomerInstallmentPage.tsx
│   ├── Dashboard.tsx                # Main customer portal
│   ├── FilterBar.tsx
│   ├── ImportFromChinaPage.tsx
│   ├── LanguageSwitcher.tsx
│   ├── MarketingDisplay.tsx
│   ├── Modal.tsx
│   ├── NewArrivalsPage.tsx
│   ├── NotificationBell.tsx
│   ├── OrdersPage.tsx
│   ├── OrganizationPage.tsx
│   ├── PdfToExcelTool.tsx
│   ├── PriceComparisonTool.tsx
│   ├── ProductCard.tsx
│   ├── QuoteRequestPage.tsx
│   ├── Register.tsx
│   ├── SupplierInstallmentPage.tsx
│   ├── TeamManagementPage.tsx       # Team/Sub-user management
│   ├── Toast.tsx
│   ├── TraderToolsHub.tsx
│   ├── UsageIntroModal.tsx
│   └── VinExtractorTool.tsx
│
├── services/             # Business Logic & API Layer
│   ├── types/
│   │   └── index.ts
│   ├── AdminBadgesContext.tsx       # Admin notification badges
│   ├── apiConfig.ts
│   ├── httpClient.ts
│   ├── i18n.ts                      # Internationalization config
│   ├── indexingFilterEngine.ts
│   ├── LanguageContext.tsx          # Language management
│   ├── mockApi.ts                   # *** MAIN MOCK BACKEND (6486 lines) ***
│   ├── OrganizationContext.tsx      # Organization/Team state
│   ├── PermissionContext.tsx        # Admin permissions
│   ├── pricingEngine.ts             # Price calculation engine
│   ├── realApi.ts                   # Placeholder for real API
│   ├── searchService.ts             # Product search logic
│   ├── serviceFactory.ts
│   ├── ToastContext.tsx             # Toast notifications
│   └── toolsAccess.ts               # Trader tools access control
│
├── utils/                # Utility Functions
│   ├── arabicSearch.ts              # Arabic text search
│   ├── dateUtils.ts                 # Date formatting
│   └── partNumberUtils.ts           # Part number normalization
│
├── locales/              # Translation Files
│   ├── ar.json           # Arabic (1915 lines)
│   ├── en.json           # English (1915 lines)
│   ├── hi.json           # Hindi
│   └── zh.json           # Chinese
│
├── App.tsx               # Main entry point
├── index.css             # Global styles
├── index.tsx             # React DOM render
└── types.ts              # *** TYPE DEFINITIONS (2401 lines) ***
```

### 2.2 Key Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| `types.ts` | 2401 | All TypeScript interfaces and types |
| `mockApi.ts` | 6486 | Complete mock backend simulation |
| `Dashboard.tsx` | 2243 | Customer portal main component |
| `AdminDashboard.tsx` | 931 | Admin control panel |
| `TeamManagementPage.tsx` | ~800 | Team/Sub-user management |
| `OrganizationContext.tsx` | 403 | Organization state management |
| `en.json` / `ar.json` | 1915 each | Translation files |

---

## 3. Data Models

### 3.1 Core Entity: User

```typescript
interface User {
  id: string;
  clientId: string;          // Login ID for owners, Phone for staff
  name: string;
  email: string;
  password?: string;         // For owners only
  role: UserRole;
  
  // Relationships
  parentId?: string;         // Staff → Owner relationship
  businessId?: string;       // Company/Entity ID
  branchId?: string;         // Branch assignment
  
  // Status & Permissions
  isActive?: boolean;
  employeeRole?: EmployeeRole;
  phone?: string;
  activationCode?: string;   // Staff login code
  
  // Search Credits System
  searchLimit?: number;
  searchUsed?: number;
  lastSearchDate?: string;
  
  // Status Tracking
  status?: CustomerStatus;
  lastLoginAt?: string | null;
  failedLoginAttempts?: number;
  riskyLoginFlag?: boolean;
  lastActiveAt?: string;
  isGuest?: boolean;
}
```

### 3.2 Core Entity: BusinessProfile

```typescript
interface BusinessProfile {
  userId: string;
  companyName: string;
  phone: string;
  region: string;
  city: string;
  crNumber: string;          // Commercial Registration
  taxNumber: string;
  nationalAddress: string;
  customerType: CustomerType;
  deviceFingerprint: string;
  branches: Branch[];
  isApproved: boolean;
  
  // Enhanced Fields
  businessCustomerType?: BusinessCustomerType;
  assignedPriceLevel?: PriceLevel;
  status?: CustomerStatus;
  priceVisibility?: PriceVisibilityType;
  
  // Access Control
  portalAccessStart?: string | null;
  portalAccessEnd?: string | null;
  suspendedUntil?: string | null;
  
  // Search Points Wallet
  searchPointsTotal?: number;
  searchPointsRemaining?: number;
  staffLimit?: number | null;
  
  // Supplier Marketplace Integration
  canActAsSupplier?: boolean;
  supplierProfileId?: string;
  
  // Marketer Integration
  referredByMarketerId?: string;
  referredAt?: string;
  
  // Documents
  documents?: UploadedDocument[];
  segments?: string[];
  tags?: string[];
}
```

### 3.3 Core Entity: Product

```typescript
interface Product {
  id: string;
  partNumber: string;
  name: string;
  
  // Legacy fields
  brand?: string;
  price?: number;
  stock?: number;
  image?: string;
  
  // Marketing
  oldPrice?: number;
  isOnSale?: boolean;
  isNew?: boolean;
  description?: string;
  category?: string;
  
  // Pricing Levels (Onyx Pro)
  priceRetail?: number | null;
  priceWholesale?: number | null;
  priceWholeWholesale?: number | null;
  priceEcommerce?: number | null;
  
  // Inventory
  qtyStore103?: number | null;
  qtyStore105?: number | null;
  qtyTotal?: number | null;
  
  // Additional Fields
  manufacturerPartNumber?: string | null;
  carName?: string | null;
  globalCategory?: string | null;
  modelYear?: string | null;
  quality?: string | null;
  rack103?: string | null;
  rack105?: string | null;
  
  // Search Indexing
  normalizedPart?: string;
  numericPartCore?: string;
  useVisibilityRuleForQty?: boolean;
}
```

### 3.4 Core Entity: Order

```typescript
interface Order {
  id: string;
  userId: string;
  businessId?: string;
  createdByUserId?: string;
  createdByName?: string;
  
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  date: string;
  branchId?: string;
  
  // Cancellation
  cancelledBy?: 'CUSTOMER' | 'ADMIN';
  cancelledAt?: string;
  
  // Internal Workflow
  internalStatus?: OrderInternalStatus;
  internalNotes?: string;
  internalStatusHistory?: InternalStatusHistoryItem[];
  isNew?: boolean;
}

enum OrderStatus {
  PENDING = 'بانتظار الموافقة',
  APPROVED = 'تم الاعتماد',
  REJECTED = 'مرفوض',
  SHIPPED = 'تم الشحن',
  DELIVERED = 'تم التسليم',
  CANCELLED = 'تم الإلغاء'
}

type OrderInternalStatus =
  | 'NEW'
  | 'SENT_TO_WAREHOUSE'
  | 'WAITING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'SALES_INVOICE_CREATED'
  | 'READY_FOR_SHIPMENT'
  | 'COMPLETED_INTERNAL'
  | 'CANCELLED_INTERNAL';
```

### 3.5 Organization & Team System

```typescript
// Organization (Company/Entity)
interface Organization {
  id: string;
  type: OrganizationType;
  name: string;
  ownerUserId: string;
  status: 'active' | 'suspended' | 'pending';
  maxEmployees: number;
  defaultPermissions: ScopedPermissionKey[];
  allowCustomPermissions: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

// Organization User (Team Member)
interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationUserRole;
  permissions: ScopedPermissionKey[];
  status: 'active' | 'inactive' | 'pending';
  jobTitle?: string;
  department?: string;
  joinedAt: string;
  lastActiveAt?: string;
  invitedBy?: string;
}

// Scoped Permissions per Organization Type
type ScopedPermissionKey =
  // Customer Permissions
  | 'cust_view_orders' | 'cust_create_orders' | 'cust_view_prices'
  | 'cust_manage_cart' | 'cust_use_trader_tools'
  | 'cust_create_installment_requests' | 'cust_manage_installment_requests'
  | 'cust_view_team_activity'
  // Supplier Permissions
  | 'sup_view_forwarded_requests' | 'sup_submit_offers'
  | 'sup_view_team_activity' | 'sup_manage_products' | 'sup_view_analytics'
  // Advertiser Permissions
  | 'adv_view_campaigns' | 'adv_manage_campaigns'
  | 'adv_manage_slots' | 'adv_view_reports'
  // Affiliate Permissions
  | 'aff_view_links' | 'aff_manage_links'
  | 'aff_view_commissions' | 'aff_withdraw_commissions' | 'aff_view_analytics'
  // Organization Permissions
  | 'org_manage_team' | 'org_view_logs' | 'org_view_settings' | 'org_edit_profile';
```

### 3.6 Installment System

```typescript
// Installment Request
interface InstallmentRequest {
  id: string;
  customerId: string;
  customerName?: string;
  status: InstallmentRequestStatus;
  sinicarDecision: 'pending' | 'approved_full' | 'approved_partial' | 'rejected';
  
  items: InstallmentRequestItem[];
  totalRequestedValue: number;
  paymentFrequency: PaymentFrequency;
  requestedDurationMonths: number;
  
  // Forward to Suppliers
  allowedForSuppliers: boolean;
  forwardedToSupplierIds?: string[];
  acceptedOfferId?: string;
  
  // Timestamps
  createdAt: string;
  reviewedAt?: string;
  closedAt?: string;
  closedReason?: string;
  adminNotes?: string;
}

type InstallmentRequestStatus =
  | 'PENDING_SINICAR_REVIEW'
  | 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR'
  | 'REJECTED_BY_SINICAR'
  | 'FORWARDED_TO_SUPPLIERS'
  | 'WAITING_FOR_SUPPLIER_OFFERS'
  | 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER'
  | 'ACTIVE_CONTRACT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CLOSED';

// Installment Offer
interface InstallmentOffer {
  id: string;
  requestId: string;
  sourceType: 'sinicar' | 'supplier';
  supplierId?: string;
  supplierName?: string;
  type: 'full' | 'partial';
  itemsApproved: OfferItem[];
  totalApprovedValue: number;
  schedule: InstallmentPaymentSchedule;
  status: 'WAITING_FOR_CUSTOMER' | 'ACCEPTED_BY_CUSTOMER' | 'REJECTED_BY_CUSTOMER' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}
```

### 3.7 Marketing & Advertising

```typescript
// Marketing Campaign
interface MarketingCampaign {
  id: string;
  name: string;
  type: 'banner' | 'popup' | 'bell_notification';
  status: 'draft' | 'active' | 'paused' | 'ended';
  
  // Scheduling
  startDate: string;
  endDate?: string;
  
  // Targeting
  targeting: {
    customerTypes?: CustomerCategory[];
    priceLevels?: PriceLevel[];
    regions?: string[];
    segments?: string[];
    allCustomers?: boolean;
  };
  
  // Content
  content: {
    title: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    colorScheme?: string;
  };
  
  // Analytics
  impressions: number;
  clicks: number;
  dismissals: number;
}

// Ad Slot
interface AdSlot {
  id: string;
  name: string;
  location: 'home_banner' | 'sidebar' | 'product_page' | 'cart' | 'checkout';
  dimensions: { width: number; height: number };
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  isActive: boolean;
  currentCampaignId?: string;
}

// Ad Campaign
interface AdCampaign {
  id: string;
  advertiserId: string;
  advertiserName: string;
  slotId: string;
  title: string;
  imageUrl?: string;
  targetUrl?: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
  startDate: string;
  endDate: string;
  createdAt: string;
}
```

### 3.8 Affiliate/Marketer System

```typescript
interface MarketerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  commissionRate: number;
  paymentMethod: 'bank_transfer' | 'wallet';
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    iban: string;
  };
  totalEarnings: number;
  pendingPayouts: number;
  paidAmount: number;
  referralCount: number;
  referralLinks: MarketerReferralLink[];
  createdAt: string;
  approvedAt?: string;
}

interface MarketerReferralLink {
  id visionary: string;
  code: string;
  url: string;
  campaignName?: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
  isActive: boolean;
  createdAt: string;
}

interface MarketerCommission {
  id: string;
  marketerId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}
```

---

## 4. Workflows

### 4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐     ┌──────────────┐                      │
│  │ Owner Login  │     │ Staff Login  │                      │
│  │ clientId +   │     │ phone +      │                      │
│  │ password     │     │ activationCode│                      │
│  └──────┬───────┘     └──────┬───────┘                      │
│         │                    │                               │
│         ▼                    ▼                               │
│  ┌──────────────────────────────────────────┐               │
│  │         MockApi.login(credentials)        │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                        │
│         ┌───────────┴───────────┐                           │
│         ▼                       ▼                            │
│  ┌──────────┐            ┌──────────┐                       │
│  │ Success  │            │  Failed  │                       │
│  └────┬─────┘            └────┬─────┘                       │
│       │                       │                              │
│       ▼                       ▼                              │
│  Store session            Log failed                         │
│  in localStorage          attempt                            │
│       │                                                      │
│       ▼                                                      │
│  Load Organization                                           │
│  Context if applicable                                       │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────────────────────────────┐               │
│  │  Redirect to Dashboard/AdminDashboard    │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Order Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                      Order Workflow                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customer Portal                     Admin Dashboard         │
│  ──────────────                     ───────────────          │
│                                                              │
│  1. Browse Products                                          │
│       │                                                      │
│       ▼                                                      │
│  2. Add to Cart                                              │
│       │                                                      │
│       ▼                                                      │
│  3. Submit Order ─────────────────► 4. Receive Order        │
│     (status: PENDING)                  (isNew: true)         │
│                                          │                   │
│                                          ▼                   │
│                                     5. Review Order          │
│                                          │                   │
│                      ┌──────────────┬────┴────┐             │
│                      ▼              ▼         ▼              │
│                   APPROVE       REJECT    CANCEL             │
│                      │              │         │              │
│                      ▼              ▼         ▼              │
│                  Internal       Close      Close             │
│                  Workflow       Order      Order             │
│                      │                                       │
│                      ▼                                       │
│               ┌──────────────────┐                          │
│               │ Internal Status  │                          │
│               │ Progression:     │                          │
│               │ NEW → WAREHOUSE  │                          │
│               │ → PAYMENT        │                          │
│               │ → INVOICE        │                          │
│               │ → SHIPMENT       │                          │
│               │ → COMPLETE       │                          │
│               └────────┬─────────┘                          │
│                        │                                     │
│                        ▼                                     │
│  6. Customer sees ◄────── 5. Update External Status         │
│     status updates          (APPROVED → SHIPPED → DELIVERED) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Quote Request Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   Quote Request Workflow                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customer                            Admin                   │
│  ────────                           ─────                    │
│                                                              │
│  1. Upload Excel File                                        │
│     (Parts list)                                             │
│       │                                                      │
│       ▼                                                      │
│  2. Parse & Create ──────────────► 3. Receive Request       │
│     QuoteRequest                      (status: NEW)          │
│     (status: NEW)                        │                   │
│                                          ▼                   │
│                                     4. Review Items          │
│                                          │                   │
│                                     For each item:           │
│                                     ┌────┴────┐              │
│                                     ▼         ▼              │
│                                  MATCH     NO MATCH          │
│                                  (Found)   (Missing)         │
│                                     │         │              │
│                                     ▼         ▼              │
│                                  Set price  Add to           │
│                                  & approve  Missing Parts    │
│                                     │                        │
│                                     ▼                        │
│  5. Download Priced ◄──────────── Complete Review           │
│     Excel Result                   (status: APPROVED/        │
│                                    PARTIALLY_APPROVED)       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Account Opening Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                Account Opening Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Visitor                             Admin                   │
│  ───────                            ─────                    │
│                                                              │
│  1. Fill Registration Form                                   │
│     - Business Info                                          │
│     - Contact Details                                        │
│     - Upload Documents                                       │
│       │                                                      │
│       ▼                                                      │
│  2. Submit Request ──────────────► 3. Receive Request       │
│     (status: NEW)                     (isNew: true)          │
│                                          │                   │
│                                          ▼                   │
│                                     4. Review Details        │
│                                     - Verify Documents       │
│                                     - Check Business Info    │
│                                          │                   │
│                      ┌──────────────────┼──────────┐        │
│                      ▼                  ▼          ▼         │
│                   APPROVE           ON_HOLD     REJECT       │
│                      │                  │          │         │
│                      ▼                  ▼          ▼         │
│               Assign Settings:     Request     Notify        │
│               - Price Level        More Info   Customer      │
│               - Search Points                               │
│               - Access Dates                                │
│               - Staff Limits                                │
│                      │                                       │
│                      ▼                                       │
│               Create User Account                            │
│               & Business Profile                             │
│                      │                                       │
│                      ▼                                       │
│  5. Receive ◄───────── Send Credentials                     │
│     Login Credentials   (clientId, password)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 Installment Request Workflow

```
┌─────────────────────────────────────────────────────────────┐
│               Installment Request Workflow                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customer          SINI CAR Admin         Suppliers          │
│  ────────          ──────────────         ─────────          │
│                                                              │
│  1. Create Request                                           │
│     - Select items                                           │
│     - Choose terms                                           │
│       │                                                      │
│       ▼                                                      │
│  2. Submit ─────────► 3. Review Request                     │
│     (PENDING)              │                                 │
│                      ┌─────┴─────┐                          │
│                      ▼           ▼                           │
│                   Approve     Reject                         │
│                   (Full/Partial)                             │
│                      │           │                           │
│                      │           ▼                           │
│                      │      Forward to ────────► 4. Review  │
│                      │      Suppliers               Request  │
│                      │                                │      │
│                      │                                ▼      │
│                      │                          Submit Offer │
│                      │                                │      │
│                      ▼                                │      │
│  5. Review ◄───────── Create Offer ◄─────────────────┘     │
│     Offers                                                   │
│       │                                                      │
│       ▼                                                      │
│  6. Accept/Reject                                            │
│       │                                                      │
│       ▼ (if accept)                                          │
│  7. Active Contract                                          │
│       │                                                      │
│       ▼                                                      │
│  8. Make Payments                                            │
│     (per schedule)                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 Team Management Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                Team Management Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Organization Owner                                          │
│  ──────────────────                                          │
│                                                              │
│  1. Access Team Management                                   │
│       │                                                      │
│       ▼                                                      │
│  ┌────────────────────────────────────────┐                 │
│  │  Actions Available:                     │                 │
│  │  ─────────────────                      │                 │
│  │                                         │                 │
│  │  [Invite Member]  [View Team]           │                 │
│  │  [Edit Permissions] [Activity Logs]     │                 │
│  │                                         │                 │
│  └────────────────────────────────────────┘                 │
│       │                                                      │
│       ├──────► Invite Member                                │
│       │        - Email/Phone                                │
│       │        - Select Role                                │
│       │        - Assign Permissions                         │
│       │              │                                       │
│       │              ▼                                       │
│       │        Create Invitation                            │
│       │        (TeamInvitation)                             │
│       │              │                                       │
│       │              ▼                                       │
│       │        Invitee Accepts                              │
│       │              │                                       │
│       │              ▼                                       │
│       │        Create OrganizationUser                      │
│       │                                                      │
│       ├──────► Edit Member                                  │
│       │        - Change Role                                │
│       │        - Update Permissions                         │
│       │        - Deactivate/Reactivate                      │
│       │                                                      │
│       └──────► View Activity Logs                           │
│                - Team actions                               │
│                - Permission changes                         │
│                - Login history                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. API Contracts

### 5.1 Authentication APIs

```typescript
// Login
MockApi.login(credentials: {
  clientId?: string;
  password?: string;
  phone?: string;
  activationCode?: string;
}): Promise<{ user: User; profile?: BusinessProfile } | null>

// Create Guest Session
MockApi.createGuestUser(): User

// Logout (client-side only)
// Clear localStorage session
```

### 5.2 User Management APIs

```typescript
// Get All Users
MockApi.getAllUsers(): Promise<{ user: User; profile: BusinessProfile | null }[]>

// Get User by ID
MockApi.getUserById(id: string): Promise<User | null>

// Update User
MockApi.updateUser(id: string, data: Partial<User>): Promise<User | null>

// Suspend/Reactivate User
MockApi.suspendUser(id: string): Promise<boolean>
MockApi.reactivateUser(id: string): Promise<boolean>

// Reset Password
MockApi.resetPassword(userId: string, newPassword: string): Promise<boolean>

// Add Search Points
MockApi.addSearchPoints(userId: string, points: number): Promise<User | null>
```

### 5.3 Product APIs

```typescript
// Search Products
MockApi.searchProducts(query: string, options?: {
  brand?: string;
  category?: string;
  inStock?: boolean;
  limit?: number;
}): Promise<Product[]>

// Get Product by ID
MockApi.getProductById(id: string): Promise<Product | null>

// CRUD Operations
MockApi.createProduct(product: Omit<Product, 'id'>): Promise<Product>
MockApi.updateProduct(id: string, data: Partial<Product>): Promise<Product | null>
MockApi.deleteProduct(id: string): Promise<boolean>

// Bulk Import
MockApi.bulkImportProducts(products: Omit<Product, 'id'>[]): Promise<{ 
  imported: number; 
  updated: number; 
  errors: string[] 
}>
```

### 5.4 Order APIs

```typescript
// Get Orders (by user or all)
MockApi.getOrdersByUserId(userId: string): Promise<Order[]>
MockApi.getAllOrders(): Promise<Order[]>

// Create Order
MockApi.createOrder(order: {
  userId: string;
  businessId?: string;
  items: CartItem[];
  branchId?: string;
}): Promise<Order>

// Update Order Status
MockApi.updateOrderStatus(
  orderId: string, 
  status: OrderStatus
): Promise<Order | null>

MockApi.updateOrderInternalStatus(
  orderId: string,
  internalStatus: OrderInternalStatus,
  notes?: string
): Promise<Order | null>

// Cancel Order
MockApi.cancelOrder(
  orderId: string, 
  cancelledBy: 'CUSTOMER' | 'ADMIN'
): Promise<Order | null>
```

### 5.5 Quote Request APIs

```typescript
// Get Quotes
MockApi.getQuotesByUserId(userId: string): Promise<QuoteRequest[]>
MockApi.getAllQuoteRequests(): Promise<QuoteRequest[]>

// Create Quote
MockApi.createQuoteRequest(quote: {
  userId: string;
  userName: string;
  companyName: string;
  items: QuoteItem[];
}): Promise<QuoteRequest>

// Review Quote Items
MockApi.updateQuoteItemStatus(
  quoteId: string,
  partNumber: string,
  status: QuoteItemApprovalStatus,
  matchedProduct?: Product,
  adminNote?: string
): Promise<QuoteRequest | null>

// Complete Quote Review
MockApi.finalizeQuoteReview(
  quoteId: string,
  adminReviewedBy: string
): Promise<QuoteRequest | null>
```

### 5.6 Organization APIs

```typescript
// Get Organizations
MockApi.getOrganizations(): Promise<Organization[]>
MockApi.getOrganizationById(id: string): Promise<Organization | null>
MockApi.getOrganizationByOwnerUserId(userId: string): Promise<Organization | null>
MockApi.getOrganizationsByUserId(userId: string): Promise<Organization[]>

// Create Organization
MockApi.createOrganization(org: {
  type: OrganizationType;
  name: string;
  ownerUserId: string;
}): Promise<Organization>

// Update Organization
MockApi.updateOrganization(
  id: string, 
  data: Partial<Organization>
): Promise<Organization | null>

// Team Members
MockApi.getOrganizationUsers(orgId: string): Promise<OrganizationUser[]>
MockApi.createOrganizationUser(orgId: string, data: {
  userId: string;
  role: OrganizationUserRole;
  permissions: ScopedPermissionKey[];
}): Promise<OrganizationUser>
MockApi.updateOrganizationUser(
  memberId: string, 
  data: Partial<OrganizationUser>
): Promise<OrganizationUser | null>
MockApi.deactivateOrganizationUser(memberId: string): Promise<OrganizationUser | null>
MockApi.reactivateOrganizationUser(memberId: string): Promise<OrganizationUser | null>
MockApi.removeOrganizationUser(memberId: string): Promise<boolean>

// Invitations
MockApi.getTeamInvitations(orgId: string): Promise<TeamInvitation[]>
MockApi.createTeamInvitation(orgId: string, inviterId: string, data: {
  email: string;
  phone?: string;
  role: OrganizationUserRole;
  permissions: ScopedPermissionKey[];
}): Promise<TeamInvitation>
MockApi.cancelTeamInvitation(invitationId: string): Promise<boolean>

// Activity Logs
MockApi.getOrganizationActivityLogs(
  orgId: string, 
  limit?: number
): Promise<OrganizationActivityLog[]>
MockApi.logOrganizationActivity(
  orgId: string,
  userId: string,
  actionType: string,
  category: OrganizationActivityLog['actionCategory'],
  metadata?: Record<string, any>
): Promise<void>

// Stats & Limits
MockApi.getOrganizationStats(orgId: string): Promise<OrganizationStats>
MockApi.canAddTeamMember(orgId: string): Promise<{ allowed: boolean; reason?: string }>
```

### 5.7 Installment APIs

```typescript
// Requests
MockApi.getInstallmentRequests(): Promise<InstallmentRequest[]>
MockApi.getInstallmentRequestById(id: string): Promise<InstallmentRequest | null>
MockApi.createInstallmentRequest(data: {
  customerId: string;
  customerName: string;
  items: InstallmentRequestItem[];
  paymentFrequency: PaymentFrequency;
  requestedDurationMonths: number;
}): Promise<InstallmentRequest>

// SINI CAR Decision
MockApi.recordSinicarDecision(
  requestId: string,
  payload: SinicarDecisionPayload
): Promise<{ request: InstallmentRequest; offer?: InstallmentOffer }>

// Forward to Suppliers
MockApi.forwardRequestToSuppliers(
  requestId: string, 
  supplierIds: string[]
): Promise<InstallmentRequest | null>

// Supplier Offers
MockApi.supplierSubmitOffer(
  requestId: string,
  supplierId: string,
  supplierName: string,
  offerData: {
    type: 'full' | 'partial';
    itemsApproved: OfferItem[];
    totalApprovedValue: number;
    frequency: PaymentFrequency;
    numberOfInstallments: number;
  }
): Promise<InstallmentOffer>

// Customer Response
MockApi.customerRespondToOffer(
  offerId: string, 
  decision: 'accept' | 'reject'
): Promise<{ offer: InstallmentOffer; request: InstallmentRequest }>

// Payments
MockApi.markInstallmentAsPaid(
  offerId: string,
  installmentId: string,
  paymentDetails?: { method?: string; reference?: string }
): Promise<InstallmentOffer | null>

// Statistics
MockApi.getInstallmentStats(): Promise<InstallmentStats>
```

### 5.8 Marketing APIs

```typescript
// Campaigns
MockApi.getMarketingCampaigns(): Promise<MarketingCampaign[]>
MockApi.createMarketingCampaign(
  campaign: Omit<MarketingCampaign, 'id'>
): Promise<MarketingCampaign>
MockApi.updateMarketingCampaign(
  id: string, 
  data: Partial<MarketingCampaign>
): Promise<MarketingCampaign | null>

// Get Active Campaigns for User
MockApi.getActiveCampaignsForUser(
  userId: string,
  userProfile: BusinessProfile
): Promise<MarketingCampaign[]>

// Track Interactions
MockApi.trackCampaignImpression(campaignId: string): Promise<void>
MockApi.trackCampaignClick(campaignId: string): Promise<void>
MockApi.dismissCampaign(userId: string, campaignId: string): Promise<void>
```

### 5.9 Advertising APIs

```typescript
// Ad Slots
MockApi.getAdSlots(): Promise<AdSlot[]>
MockApi.updateAdSlot(id: string, data: Partial<AdSlot>): Promise<AdSlot | null>

// Ad Campaigns
MockApi.getAdCampaigns(): Promise<AdCampaign[]>
MockApi.createAdCampaign(campaign: Omit<AdCampaign, 'id'>): Promise<AdCampaign>
MockApi.updateAdCampaignStatus(
  id: string, 
  status: AdCampaign['status']
): Promise<AdCampaign | null>

// Analytics
MockApi.trackAdImpression(campaignId: string): Promise<void>
MockApi.trackAdClick(campaignId: string): Promise<void>
MockApi.getAdAnalytics(campaignId: string): Promise<{
  impressions: number;
  clicks: number;
  ctr: number;
  spent: number;
}>
```

### 5.10 Marketer/Affiliate APIs

```typescript
// Profiles
MockApi.getMarketerProfiles(): Promise<MarketerProfile[]>
MockApi.getMarketerProfileById(id: string): Promise<MarketerProfile | null>
MockApi.createMarketerProfile(
  data: Omit<MarketerProfile, 'id'>
): Promise<MarketerProfile>
MockApi.updateMarketerStatus(
  id: string, 
  status: MarketerProfile['status']
): Promise<MarketerProfile | null>

// Referral Links
MockApi.createReferralLink(
  marketerId: string, 
  campaignName?: string
): Promise<MarketerReferralLink>
MockApi.trackReferralClick(code: string): Promise<void>
MockApi.trackReferralConversion(
  code: string, 
  orderId: string, 
  orderAmount: number
): Promise<MarketerCommission>

// Commissions
MockApi.getMarketerCommissions(marketerId: string): Promise<MarketerCommission[]>
MockApi.approveCommission(commissionId: string): Promise<MarketerCommission | null>
MockApi.markCommissionPaid(commissionId: string): Promise<MarketerCommission | null>

// Payouts
MockApi.requestPayout(
  marketerId: string, 
  amount: number
): Promise<MarketerPayout>
MockApi.processPayoutRequest(
  payoutId: string, 
  approved: boolean
): Promise<MarketerPayout | null>
```

---

## 6. localStorage Keys

### 6.1 Storage Keys Map

| Key | Description | Data Type |
|-----|-------------|-----------|
| `b2b_users_sini_v2` | User accounts | `User[]` |
| `b2b_profiles_sini_v2` | Business profiles | `BusinessProfile[]` |
| `b2b_products_sini_v2` | Products catalog | `Product[]` |
| `b2b_orders_sini_v2` | Orders | `Order[]` |
| `b2b_quotes_sini` | Quote requests | `QuoteRequest[]` |
| `b2b_missing_sini` | Missing parts requests | `MissingProductRequest[]` |
| `b2b_import_requests_sini` | Import requests | `ImportRequest[]` |
| `b2b_account_requests_sini` | Account opening requests | `AccountOpeningRequest[]` |
| `b2b_notifications_sini` | Notifications | `Notification[]` |
| `b2b_activity_logs_sini` | Activity logs | `ActivityLogEntry[]` |
| `b2b_site_settings_sini_v3` | Site settings | `SiteSettings` |
| `b2b_admin_users_sini` | Admin users | `AdminUser[]` |
| `b2b_admin_roles_sini` | Admin roles | `Role[]` |
| `b2b_search_history_sini` | Search history | `SearchHistoryItem[]` |
| `b2b_marketing_campaigns_sini` | Marketing campaigns | `MarketingCampaign[]` |
| `b2b_excel_presets_sini` | Excel column presets | `ExcelColumnPreset[]` |
| `b2b_pricing_settings_v2` | Pricing center settings | `PricingSettings` |
| `b2b_trader_tools_settings` | Trader tools settings | `TraderToolsSettings` |
| `b2b_supplier_settings` | Supplier marketplace settings | `SupplierMarketplaceSettings` |
| `b2b_supplier_profiles` | Supplier profiles | `SupplierProfile[]` |
| `b2b_marketer_profiles` | Marketer profiles | `MarketerProfile[]` |
| `b2b_marketer_commissions` | Commissions | `MarketerCommission[]` |
| `b2b_marketer_payouts` | Payout requests | `MarketerPayout[]` |
| `b2b_ad_slots` | Ad slots | `AdSlot[]` |
| `b2b_ad_campaigns` | Ad campaigns | `AdCampaign[]` |
| `b2b_installment_settings` | Installment settings | `InstallmentSettings` |
| `b2b_installment_requests` | Installment requests | `InstallmentRequest[]` |
| `b2b_installment_offers` | Installment offers | `InstallmentOffer[]` |
| `b2b_customer_credit_profiles` | Credit profiles | `CustomerCreditProfile[]` |
| `b2b_organizations` | Organizations | `Organization[]` |
| `b2b_organization_users` | Organization members | `OrganizationUser[]` |
| `b2b_organization_settings` | Org global settings | `OrganizationSettings` |
| `b2b_team_invitations` | Team invitations | `TeamInvitation[]` |
| `b2b_organization_activity_logs` | Org activity logs | `OrganizationActivityLog[]` |

### 6.2 Session/State Keys

| Key | Description |
|-----|-------------|
| `b2b_current_user_sini` | Current logged-in user |
| `b2b_current_profile_sini` | Current business profile |
| `b2b_session_token_sini` | Session token |
| `b2b_language_sini` | Selected language |
| `b2b_cart_sini` | Shopping cart items |
| `b2b_intro_shown_sini` | Intro modal shown flag |

---

## 7. Backend Handoff

### 7.1 Migration Strategy

#### Phase 1: Core Infrastructure
1. Set up database schema based on types.ts
2. Implement authentication (JWT recommended)
3. Create base CRUD APIs for Users, Products, Orders
4. Migrate localStorage to database

#### Phase 2: Business Logic
1. Implement order workflow with status transitions
2. Implement quote request processing
3. Implement account opening workflow
4. Set up notification system

#### Phase 3: Advanced Features
1. Organization & Team management
2. Installment system
3. Marketing & Advertising
4. Affiliate/Marketer system

#### Phase 4: Integration
1. External API integration (Onyx Pro)
2. Payment gateway integration
3. SMS/Email notifications
4. File storage (documents, Excel files)

### 7.2 Database Schema Recommendations

```sql
-- Core Tables
CREATE TABLE users (
  id UUID PRIMARY KEY,
  client_id VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES users(id),
  business_id UUID,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE business_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  region VARCHAR(100),
  city VARCHAR(100),
  cr_number VARCHAR(100),
  tax_number VARCHAR(100),
  national_address TEXT,
  customer_type VARCHAR(100),
  price_level VARCHAR(50),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  part_number VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  price_retail DECIMAL(10,2),
  price_wholesale DECIMAL(10,2),
  price_whole_wholesale DECIMAL(10,2),
  qty_total INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  business_id UUID REFERENCES business_profiles(id),
  total_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'PENDING',
  internal_status VARCHAR(50) DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2)
);

-- Organization Tables
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  owner_user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active',
  max_employees INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization_users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  permissions JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_products_part_number ON products(part_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_org_users_org_id ON organization_users(organization_id);
```

### 7.3 API Endpoint Structure (RESTful)

```
# Authentication
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/me

# Users
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
POST   /api/users/:id/suspend
POST   /api/users/:id/reactivate
POST   /api/users/:id/reset-password
POST   /api/users/:id/add-search-points

# Products
GET    /api/products
GET    /api/products/:id
GET    /api/products/search?q=...
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/products/bulk-import

# Orders
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id/status
PUT    /api/orders/:id/internal-status
POST   /api/orders/:id/cancel

# Organizations
GET    /api/organizations
GET    /api/organizations/:id
POST   /api/organizations
PUT    /api/organizations/:id
GET    /api/organizations/:id/users
POST   /api/organizations/:id/users
PUT    /api/organizations/:id/users/:userId
DELETE /api/organizations/:id/users/:userId
GET    /api/organizations/:id/invitations
POST   /api/organizations/:id/invitations
DELETE /api/organizations/:id/invitations/:invitationId
GET    /api/organizations/:id/activity-logs
GET    /api/organizations/:id/stats

# Installments
GET    /api/installments/requests
GET    /api/installments/requests/:id
POST   /api/installments/requests
PUT    /api/installments/requests/:id/sinicar-decision
PUT    /api/installments/requests/:id/forward-to-suppliers
GET    /api/installments/offers
POST   /api/installments/offers
PUT    /api/installments/offers/:id/customer-response
PUT    /api/installments/offers/:id/payments/:paymentId/mark-paid

# Marketing
GET    /api/marketing/campaigns
POST   /api/marketing/campaigns
PUT    /api/marketing/campaigns/:id
GET    /api/marketing/campaigns/active

# Advertising
GET    /api/ads/slots
PUT    /api/ads/slots/:id
GET    /api/ads/campaigns
POST   /api/ads/campaigns
PUT    /api/ads/campaigns/:id/status

# Marketers
GET    /api/marketers
GET    /api/marketers/:id
POST   /api/marketers
PUT    /api/marketers/:id/status
GET    /api/marketers/:id/commissions
POST   /api/marketers/:id/referral-links
POST   /api/marketers/:id/payout-request

# Settings
GET    /api/settings
PUT    /api/settings
GET    /api/settings/organization
PUT    /api/settings/organization
```

### 7.4 Security Recommendations

1. **Authentication**: Use JWT with refresh tokens
2. **Authorization**: Implement role-based access control (RBAC)
3. **Rate Limiting**: Protect sensitive endpoints
4. **Input Validation**: Validate all inputs server-side
5. **HTTPS**: Enforce HTTPS in production
6. **Password Hashing**: Use bcrypt with salt rounds >= 12
7. **SQL Injection**: Use parameterized queries
8. **XSS Protection**: Sanitize user inputs
9. **CORS**: Configure properly for production

### 7.5 Integration Points

| External System | Purpose | Notes |
|-----------------|---------|-------|
| Onyx Pro | ERP Integration | Products, Prices, Inventory sync |
| SMS Gateway | Notifications | OTP, Order updates |
| Email Service | Notifications | Transactional emails |
| Payment Gateway | Payments | Installment payments |
| File Storage | Documents | S3 or similar |
| CDN | Static Assets | Images, PDFs |

### 7.6 Feature Flags for Gradual Rollout

```typescript
const FEATURE_FLAGS = {
  ENABLE_TRADER_TOOLS: true,
  ENABLE_SUPPLIER_MARKETPLACE: true,
  ENABLE_MARKETER_SYSTEM: true,
  ENABLE_ADVERTISING: true,
  ENABLE_INSTALLMENTS: true,
  ENABLE_TEAM_MANAGEMENT: true,
  ENABLE_GUEST_MODE: true,
  ENABLE_MARKETING_CAMPAIGNS: true,
};
```

### 7.7 Testing Checklist

- [ ] User authentication (owner & staff)
- [ ] User authorization (roles & permissions)
- [ ] Product search (Arabic text support)
- [ ] Order lifecycle (create → approve → deliver)
- [ ] Quote request processing
- [ ] Account opening workflow
- [ ] Import request tracking
- [ ] Organization creation & management
- [ ] Team member management
- [ ] Scoped permissions enforcement
- [ ] Installment request workflow
- [ ] Marketing campaign targeting
- [ ] Ad campaign management
- [ ] Affiliate commission tracking
- [ ] Activity logging
- [ ] Notification delivery

---

## Appendix A: Scoped Permissions Reference

### Customer Organization Permissions
| Key | Description (EN) | الوصف (AR) |
|-----|-----------------|------------|
| `cust_view_orders` | View orders | عرض الطلبات |
| `cust_create_orders` | Create orders | إنشاء الطلبات |
| `cust_view_prices` | View prices | عرض الأسعار |
| `cust_manage_cart` | Manage cart | إدارة السلة |
| `cust_use_trader_tools` | Use trader tools | استخدام أدوات التاجر |
| `cust_create_installment_requests` | Create installment requests | إنشاء طلبات التقسيط |
| `cust_manage_installment_requests` | Manage installment requests | إدارة طلبات التقسيط |
| `cust_view_team_activity` | View team activity | عرض نشاط الفريق |

### Supplier Organization Permissions
| Key | Description (EN) | الوصف (AR) |
|-----|-----------------|------------|
| `sup_view_forwarded_requests` | View forwarded requests | عرض الطلبات المحولة |
| `sup_submit_offers` | Submit offers | تقديم العروض |
| `sup_view_team_activity` | View team activity | عرض نشاط الفريق |
| `sup_manage_products` | Manage products | إدارة المنتجات |
| `sup_view_analytics` | View analytics | عرض التحليلات |

### Advertiser Organization Permissions
| Key | Description (EN) | الوصف (AR) |
|-----|-----------------|------------|
| `adv_view_campaigns` | View campaigns | عرض الحملات |
| `adv_manage_campaigns` | Manage campaigns | إدارة الحملات |
| `adv_manage_slots` | Manage ad slots | إدارة المساحات الإعلانية |
| `adv_view_reports` | View reports | عرض التقارير |

### Affiliate Organization Permissions
| Key | Description (EN) | الوصف (AR) |
|-----|-----------------|------------|
| `aff_view_links` | View referral links | عرض روابط الإحالة |
| `aff_manage_links` | Manage referral links | إدارة روابط الإحالة |
| `aff_view_commissions` | View commissions | عرض العمولات |
| `aff_withdraw_commissions` | Withdraw commissions | سحب العمولات |
| `aff_view_analytics` | View analytics | عرض التحليلات |

### Shared Organization Permissions
| Key | Description (EN) | الوصف (AR) |
|-----|-----------------|------------|
| `org_manage_team` | Manage team members | إدارة أعضاء الفريق |
| `org_view_logs` | View activity logs | عرض سجل النشاط |
| `org_view_settings` | View settings | عرض الإعدادات |
| `org_edit_profile` | Edit profile | تعديل الملف الشخصي |

---

## Appendix B: Status Enums Quick Reference

### Order Status
| Value | Arabic | English |
|-------|--------|---------|
| `PENDING` | بانتظار الموافقة | Pending Approval |
| `APPROVED` | تم الاعتماد | Approved |
| `REJECTED` | مرفوض | Rejected |
| `SHIPPED` | تم الشحن | Shipped |
| `DELIVERED` | تم التسليم | Delivered |
| `CANCELLED` | تم الإلغاء | Cancelled |

### Internal Order Status
| Value | Arabic | English |
|-------|--------|---------|
| `NEW` | طلب جديد | New Order |
| `SENT_TO_WAREHOUSE` | تم إرسال للمستودع | Sent to Warehouse |
| `WAITING_PAYMENT` | انتظار الدفع | Waiting Payment |
| `PAYMENT_CONFIRMED` | تم تأكيد الدفع | Payment Confirmed |
| `SALES_INVOICE_CREATED` | تم إصدار فاتورة | Invoice Created |
| `READY_FOR_SHIPMENT` | جاهز للشحن | Ready for Shipment |
| `COMPLETED_INTERNAL` | مكتمل | Completed |
| `CANCELLED_INTERNAL` | ملغى | Cancelled |

### Account Request Status
| Value | Arabic | English |
|-------|--------|---------|
| `NEW` | طلب جديد | New Request |
| `UNDER_REVIEW` | قيد المراجعة | Under Review |
| `APPROVED` | تم الموافقة | Approved |
| `REJECTED` | مرفوض | Rejected |
| `ON_HOLD` | مؤجل | On Hold |

### Installment Request Status
| Value | Arabic |
|-------|--------|
| `PENDING_SINICAR_REVIEW` | قيد مراجعة صيني كار |
| `WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR` | انتظار قرار العميل |
| `REJECTED_BY_SINICAR` | مرفوض من صيني كار |
| `FORWARDED_TO_SUPPLIERS` | محول للموردين |
| `WAITING_FOR_SUPPLIER_OFFERS` | انتظار عروض الموردين |
| `WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER` | انتظار قرار العميل على عرض المورد |
| `ACTIVE_CONTRACT` | عقد نشط |
| `COMPLETED` | مكتمل |
| `CANCELLED` | ملغى |
| `CLOSED` | مغلق |

---

**Document End**

*This documentation is auto-generated and should be kept in sync with the codebase.*
