# SINI CAR B2B - Business Flows

> Generated: 2025-12-31 | End-to-End Business Scenarios

---

## Flow 1: Quote Request via Excel Upload (طلب تسعير عبر Excel)

### Scenario

Customer uploads Excel file with parts list → Admin processes → Returns pricing

### Actors

- **Customer** (Customer Portal)
- **Admin** (Admin Portal)
- **System** (Background processing)

### Steps

| Step | Actor    | Action              | Data Changed       | API Used                          |
| ---- | -------- | ------------------- | ------------------ | --------------------------------- |
| 1    | Customer | Login to portal     | Session created    | `POST /auth/login`                |
| 2    | Customer | Navigate to Quotes  | -                  | (View change)                     |
| 3    | Customer | Upload Excel file   | File uploaded      | `POST /orders/quotes`             |
| 4    | System   | Parse Excel rows    | QuoteItems created | (Backend)                         |
| 5    | System   | Create QuoteRequest | status: NEW        | (Backend)                         |
| 6    | Admin    | View pending quotes | -                  | `GET /orders/quotes`              |
| 7    | Admin    | Open quote details  | -                  | `GET /orders/quotes/:id`          |
| 8    | Admin    | Match products      | QuoteItems updated | (Manual/AI)                       |
| 9    | Admin    | Submit pricing      | status: PRICED     | `POST /orders/quotes/:id/pricing` |
| 10   | Customer | View quote response | -                  | `GET /orders/quotes/:id`          |
| 11   | Customer | Accept quote        | status: ACCEPTED   | `PATCH /orders/quotes/:id/status` |
| 12   | System   | Convert to order    | Order created      | `POST /orders/quotes/:id/convert` |

### Status Flow

```
NEW → PROCESSING → PRICED → ACCEPTED → CONVERTED
                        ↘ REJECTED
```

---

## Flow 2: Product Search with Alternatives (بحث المنتجات والبدائل)

### Scenario

Customer searches for part number → Finds alternatives → Compares quality grades

### Steps

| Step | Actor    | Action                    | Data Read       | API Used                                 |
| ---- | -------- | ------------------------- | --------------- | ---------------------------------------- |
| 1    | Customer | Enter part number         | -               | -                                        |
| 2    | Customer | Click search              | -               | `GET /products/search?q=...`             |
| 3    | System   | Return matches            | Products list   | -                                        |
| 4    | Customer | Click "Find Alternatives" | -               | `GET /products/:partNumber/alternatives` |
| 5    | System   | Return alternatives       | Alt products    | -                                        |
| 6    | Customer | Filter by quality         | QualityCodes    | `GET /settings/quality-codes`            |
| 7    | Customer | View prices               | Prices by level | (In response)                            |
| 8    | Customer | Add to cart               | Cart updated    | (State/API)                              |

### Quality Code Hierarchy

```
OEM (Original) → GENUINE → AFTERMARKET → ECONOMY
         ↓
   Higher Price    →     Lower Price
```

---

## Flow 3: Supplier Product Management (إدارة منتجات المورد)

### Scenario

Supplier adds products → Receives request → Responds with quote → Ships order

### Steps

| Step | Actor    | Action                      | Data Changed        | API Used                                     |
| ---- | -------- | --------------------------- | ------------------- | -------------------------------------------- |
| 1    | Supplier | Login                       | Session             | `POST /auth/login`                           |
| 2    | Supplier | Navigate to Products        | -                   | -                                            |
| 3    | Supplier | Click "Add Product"         | -                   | -                                            |
| 4    | Supplier | Fill product form           | -                   | -                                            |
| 5    | Supplier | Submit                      | CatalogItem created | `POST /suppliers/me/products`                |
| 6    | Admin    | Forward request to supplier | Assignment created  | `POST /suppliers/assignments`                |
| 7    | Supplier | View pending requests       | -                   | `GET /suppliers/me/requests`                 |
| 8    | Supplier | Open request                | -                   | (View)                                       |
| 9    | Supplier | Accept request              | status: ACCEPTED    | `PATCH /suppliers/me/assignments/:id/status` |
| 10   | Supplier | Start processing            | status: IN_PROGRESS | `PATCH /suppliers/me/assignments/:id/status` |
| 11   | Supplier | Mark shipped                | status: SHIPPED     | `PATCH /suppliers/me/assignments/:id/status` |

### Assignment Status Flow

```
NEW → ACCEPTED → IN_PROGRESS → SHIPPED
  ↘ REJECTED
```

---

## Flow 4: Admin User Management (إدارة المستخدمين)

### Scenario

Admin reviews pending users → Approves/Rejects → Manages permissions

### Steps

| Step | Actor  | Action                  | Data Changed       | API Used                        |
| ---- | ------ | ----------------------- | ------------------ | ------------------------------- |
| 1    | Admin  | Navigate to Users       | -                  | -                               |
| 2    | Admin  | View pending list       | -                  | `GET /admin/users/pending`      |
| 3    | Admin  | Click user              | -                  | `GET /customers/:id`            |
| 4    | Admin  | Review documents        | -                  | (in profile)                    |
| 5    | Admin  | Approve user            | status: ACTIVE     | `PUT /admin/users/:id/approve`  |
| 6    | Admin  | Navigate to Permissions | -                  | -                               |
| 7    | Admin  | Find user               | -                  | (Search)                        |
| 8    | Admin  | Assign role             | UserRoleAssignment | `POST /permissions/assign-role` |
| 9    | System | Update permissions      | Cached permissions | -                               |
| 10   | User   | Login with new role     | -                  | -                               |

### User Status Flow

```
PENDING → ACTIVE → SUSPENDED
      ↘ REJECTED
```

---

## Flow 5: Pricing Engine (محرك التسعير)

### Scenario

How prices are calculated for different customer types

### Price Levels

| Level   | Customer Type | Margin |
| ------- | ------------- | ------ |
| PRICE_1 | VIP           | 5%     |
| PRICE_2 | Wholesale     | 10%    |
| PRICE_3 | Retail        | 15%    |
| PRICE_4 | Walk-in       | 20%    |

### Calculation Flow

```
┌─────────────┐
│ Base Price  │ (from Product or Supplier)
└─────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ + Quality Code Adjustment       │ (e.g., OEM +5%, AFTERMARKET -10%)
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ + Supplier Type Margin          │ (LOCAL vs INTERNATIONAL)
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ + Customer Price Level Margin   │ (PRICE_1 to PRICE_4)
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ × Currency Conversion           │ (SAR ↔ USD ↔ EUR)
└─────────────────────────────────┘
       │
       ▼
┌─────────────┐
│ Final Price │
└─────────────┘
```

### Files Involved

- `src/services/pricingEngine.ts` - Frontend calculations
- `backend/src/modules/pricing/` - Backend pricing logic
- `src/components/AdminPricingCenter.tsx` - Admin UI

---

## Flow 6: Notifications System (نظام الإشعارات)

### Scenario

System events trigger notifications to users

### Notification Triggers

| Event                  | Recipients         | Channels                      |
| ---------------------- | ------------------ | ----------------------------- |
| `QUOTE_CREATED`        | Admin              | Notification, Email           |
| `QUOTE_APPROVED`       | Customer           | Notification, WhatsApp        |
| `ORDER_CREATED`        | Admin, Customer    | Notification                  |
| `ORDER_SHIPPED`        | Customer           | Notification, WhatsApp, Email |
| `PAYMENT_DUE`          | Customer           | Notification, WhatsApp        |
| `INSTALLMENT_APPROVED` | Customer, Supplier | Notification                  |
| `SUPPLIER_APPLICATION` | Admin              | Notification                  |

### Notification Flow

```
┌─────────────┐     Event      ┌─────────────────┐
│   System    │ ─────────────▶│  Notification   │
│   Action    │                │    Service      │
└─────────────┘                └─────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
            ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
            │ In-App      │    │   Email     │    │  WhatsApp   │
            │ Notification│    │   (SMTP)    │    │   (API)     │
            └─────────────┘    └─────────────┘    └─────────────┘
```

### Template Management

**Location**: `src/components/AdminMessagingCenter.tsx`

| Template Type      | Variables                                    |
| ------------------ | -------------------------------------------- |
| Order Confirmation | {orderNumber}, {customerName}, {totalAmount} |
| Shipping Update    | {orderNumber}, {trackingNumber}, {carrier}   |
| Quote Response     | {quoteNumber}, {totalPrice}, {validUntil}    |

### Files Involved

- `backend/src/modules/notifications/` - Notification logic
- `backend/src/modules/messaging/` - Message templates
- `src/components/NotificationsPage.tsx` - User notification UI
- `src/components/AdminMessagingCenter.tsx` - Template management

---

## Summary Table

| Flow            | Complexity | Key APIs                           | Main Files                          |
| --------------- | ---------- | ---------------------------------- | ----------------------------------- |
| Quote Request   | Medium     | `/orders/quotes/*`                 | QuoteRequestPage, AdminQuoteManager |
| Product Search  | Low        | `/products/*`                      | ProductSearchPage                   |
| Supplier Flow   | High       | `/suppliers/me/*`                  | SupplierPortal                      |
| User Management | Medium     | `/admin/users/*`, `/permissions/*` | UnifiedAccountRequestsCenter        |
| Pricing         | High       | (Internal)                         | pricingEngine, AdminPricingCenter   |
| Notifications   | Medium     | `/notifications/*`                 | NotificationsPage                   |

---

## Next Steps

- See [API_CONTRACTS_MAP.md](./API_CONTRACTS_MAP.md) for API details
- See [MAINTAINABILITY_RULES.md](./MAINTAINABILITY_RULES.md) for editing guidelines
