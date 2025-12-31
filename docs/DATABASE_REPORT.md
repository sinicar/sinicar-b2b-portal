# SINI CAR B2B - Database Report

> Generated: 2025-12-31 | Schema: Prisma + PostgreSQL

---

## 1. Schema Location (موقع قاعدة البيانات)

```
backend/prisma/
├── schema.prisma       # Main schema (1367 lines, 40KB)
├── migrations/         # Migration history
├── seed.ts             # Initial data seeding (55KB)
└── migrate-legacy-ids.ts  # Legacy data migration
```

---

## 2. Running Database Locally (تشغيل قاعدة البيانات محلياً)

```bash
# 1. Set DATABASE_URL in backend/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/sinicar_b2b"

# 2. Push schema to database
cd backend
npx prisma db push

# 3. Seed initial data
npx prisma db seed

# 4. Open visual editor
npx prisma studio
```

---

## 3. Models Overview (نظرة عامة على الجداول)

### Core User & Auth (المستخدمون والمصادقة)

| Model             | Purpose            | Key Fields                                               |
| ----------------- | ------------------ | -------------------------------------------------------- |
| `User`            | All system users   | id, clientId, name, email, phone, password, role, status |
| `BusinessProfile` | Extended profile   | companyName, crNumber, priceLevel, searchPoints          |
| `Branch`          | User branches      | profileId, name, city, isMainBranch                      |
| `Document`        | Uploaded documents | type, fileName, fileUrl, status                          |
| `ActivityLog`     | User actions log   | userId, eventType, description                           |

### Organization & Teams (المنظمات والفرق)

| Model              | Purpose           | Key Fields                                |
| ------------------ | ----------------- | ----------------------------------------- |
| `Organization`     | Business entities | type, name, ownerUserId, maxEmployees     |
| `OrganizationUser` | Team members      | organizationId, userId, role, permissions |
| `TeamInvitation`   | Join invites      | email, inviteCode, status, expiresAt      |
| `OrgActivityLog`   | Team activity     | action, description                       |

### Products (المنتجات)

| Model         | Purpose              | Key Fields                                          |
| ------------- | -------------------- | --------------------------------------------------- |
| `Product`     | Main product catalog | partNumber\*, name, brand, prices (3 levels), stock |
| `QualityCode` | Quality grades       | code\*, label, defaultMarginAdjust                  |
| `BrandCode`   | Manufacturer brands  | code\*, name, country                               |

### Orders & Quotes (الطلبات وعروض الأسعار)

| Model                | Purpose          | Key Fields                                  |
| -------------------- | ---------------- | ------------------------------------------- |
| `Order`              | Customer orders  | userId, status, internalStatus, totalAmount |
| `OrderItem`          | Order line items | partNumber, quantity, unitPrice             |
| `OrderStatusHistory` | Status changes   | status, changedBy, changedAt                |
| `QuoteRequest`       | Quote requests   | userId, status, qualityCode                 |
| `QuoteItem`          | Quote line items | partNumber, requestedQty, matchedPrice      |

### Installments (التقسيط)

| Model                 | Purpose               | Key Fields                               |
| --------------------- | --------------------- | ---------------------------------------- |
| `InstallmentRequest`  | Installment requests  | customerId, totalValue, status, duration |
| `InstallmentItem`     | Requested items       | partNumber, quantity, estimatedPrice     |
| `InstallmentOffer`    | Supplier/Admin offers | sourceType, totalApprovedValue, schedule |
| `InstallmentSettings` | Global config         | minValue, maxValue, commission           |

### Suppliers (الموردين)

| Model                       | Purpose             | Key Fields                                    |
| --------------------------- | ------------------- | --------------------------------------------- |
| `SupplierGroup`             | Supplier categories | name, defaultMarginPercent                    |
| `SupplierProfile`           | Supplier profiles   | customerId, companyName, rating, supplierType |
| `SupplierCatalogItem`       | Supplier products   | partNumber, price, stock, leadTimeDays        |
| `SupplierExcelUpload`       | Catalog uploads     | originalFileName, status, rowsTotal           |
| `SupplierUser`              | Supplier team       | supplierId, userId, roleCode, isOwner         |
| `SupplierRequestAssignment` | Request assignments | supplierId, requestType, requestId, status    |

### Pricing & Currency (التسعير والعملات)

| Model            | Purpose              | Key Fields                            |
| ---------------- | -------------------- | ------------------------------------- |
| `Currency`       | Supported currencies | code\*, symbol, isBase                |
| `ExchangeRate`   | Exchange rates       | currencyId, rateToBase, effectiveFrom |
| `ShippingMethod` | Shipping options     | code\*, baseRate, deliveryDays        |
| `ShippingZone`   | Geographic zones     | countries[], extraRatePerKg           |

### Permissions (الصلاحيات)

| Model                | Purpose                 | Key Fields                   |
| -------------------- | ----------------------- | ---------------------------- |
| `Role`               | System roles            | code\*, name, isSystem       |
| `Permission`         | Atomic permissions      | code\*, module, category     |
| `RolePermission`     | Role-Permission mapping | canCreate/Read/Update/Delete |
| `UserRoleAssignment` | User-Role binding       | userId, roleId               |
| `PermissionGroup`    | Permission bundles      | code\*, name                 |

---

## 4. Key Relationships (العلاقات الأساسية)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER HIERARCHY                           │
├─────────────────────────────────────────────────────────────────┤
│  User ──┬── BusinessProfile ──┬── Branch                        │
│         │                     └── Document                      │
│         ├── Organization ──── OrganizationUser                  │
│         ├── Order ──── OrderItem                                │
│         ├── QuoteRequest ──── QuoteItem                         │
│         └── InstallmentRequest ──── InstallmentItem             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SUPPLIER STRUCTURE                          │
├─────────────────────────────────────────────────────────────────┤
│  SupplierGroup                                                   │
│       └── SupplierProfile ──┬── SupplierCatalogItem             │
│                             ├── SupplierExcelUpload              │
│                             └── SupplierUser (team)              │
│                                                                  │
│  SupplierRequestAssignment ──── SupplierAssignmentAudit         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PERMISSION STRUCTURE                        │
├─────────────────────────────────────────────────────────────────┤
│  Role ──┬── RolePermission ──── Permission                      │
│         └── UserRoleAssignment ──── User                        │
│                                                                  │
│  PermissionGroup ──── PermissionGroupPermission ──── Permission │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Key Enums & Status Flows (الحالات والتدفقات)

### SupplierType

```
LOCAL | INTERNATIONAL
```

### UploadStatus

```
PENDING_REVIEW → APPROVED
             ↘ REJECTED
             ↘ NEEDS_CORRECTION
```

### MessageEvent (Notification triggers)

```
QUOTE_* | ORDER_* | PAYMENT_* | SHIPMENT_* | ACCOUNT_* | INSTALLMENT_* | SUPPLIER_*
```

### Order Status Flow

```
PENDING → PROCESSING → SHIPPED → DELIVERED
      ↘ CANCELLED
```

### InstallmentRequest Status Flow

```
PENDING_SINICAR_REVIEW → APPROVED → WAITING_FOR_OFFERS → OFFER_ACCEPTED → COMPLETED
                      ↘ REJECTED
```

### SupplierRequestAssignment Status

```
NEW → ACCEPTED → IN_PROGRESS → SHIPPED
  ↘ REJECTED
  ↘ CANCELLED (Admin only)
```

---

## 6. Seed Data (بيانات البذر)

Located in `backend/prisma/seed.ts` (55KB):

- **Admin User**: Super admin account
- **Sample Customers**: Test customer accounts
- **Sample Suppliers**: Test supplier profiles
- **Quality Codes**: OEM, GENUINE, AFTERMARKET, etc.
- **Brand Codes**: TOYOTA, HYUNDAI, etc.
- **Currencies**: SAR, USD, EUR, CNY
- **Roles & Permissions**: Default RBAC setup

```bash
# Run seed
cd backend
npx prisma db seed
```

---

## 7. Multi-Tenant Strategy (استراتيجية تعدد المستأجرين)

The system uses **User-based isolation** (not Organization-based):

| Scope         | Identifier       | Example                        |
| ------------- | ---------------- | ------------------------------ |
| Customer data | `userId`         | Orders, Quotes, Installments   |
| Supplier data | `customerId`     | SupplierProfile linked to User |
| Organization  | `organizationId` | Team management only           |

⚠️ **Important**: All queries should filter by user context to prevent data leaks.

---

## 8. Critical Tables (الجداول الحرجة)

| Table                | Risk Level | Notes                             |
| -------------------- | ---------- | --------------------------------- |
| `User`               | 🔴 HIGH    | Core authentication, never delete |
| `Order`              | 🔴 HIGH    | Financial records, audit required |
| `InstallmentRequest` | 🔴 HIGH    | Financial contracts               |
| `SupplierProfile`    | 🟡 MEDIUM  | Supplier business data            |
| `RolePermission`     | 🟡 MEDIUM  | Security boundaries               |

---

## 9. Indexes (الفهارس)

Already defined in schema:

- `User.clientId` - UNIQUE
- `Product.partNumber` - UNIQUE
- `SupplierUser(supplierId, userId)` - UNIQUE + INDEXED
- `SupplierRequestAssignment` - Multiple indexes for performance

---

## Next Steps

- See [API_CONTRACTS_MAP.md](./API_CONTRACTS_MAP.md) for API endpoints
- See [AUTH_AND_ROLES.md](./AUTH_AND_ROLES.md) for authentication flow
