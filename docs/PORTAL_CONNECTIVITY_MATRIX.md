# Portal Connectivity Matrix - SINI CAR B2B

> Generated: 2025-12-31 | READ-ONLY AUDIT

---

## 1. Portal Routes Overview

### Customer Portal (`/`)

| Route/View      | Component               | Purpose                     |
| --------------- | ----------------------- | --------------------------- |
| `/`             | `Dashboard.tsx`         | Main dashboard              |
| `HOME`          | Dashboard               | Statistics, recent activity |
| `SEARCH`        | ProductSearchPage       | Product search              |
| `ORDERS`        | OrdersPage              | Order history               |
| `QUOTES`        | QuoteRequestPage        | Quote requests              |
| `INSTALLMENTS`  | CustomerInstallmentPage | Installment requests        |
| `NOTIFICATIONS` | NotificationsPage       | User notifications          |
| `ORGANIZATION`  | OrganizationPage        | Team management             |
| `PROFILE`       | (in Dashboard)          | User profile                |

### Supplier Portal (`/supplier`)

| Route/View        | Component            | Purpose                 |
| ----------------- | -------------------- | ----------------------- |
| `/supplier`       | `SupplierPortal.tsx` | Main supplier dashboard |
| `DASHBOARD`       | SupplierPortal       | Statistics              |
| `PRODUCTS`        | SupplierPortal       | Catalog management      |
| `REQUESTS`        | SupplierPortal       | Quote requests          |
| `PURCHASE_ORDERS` | SupplierPortal       | Order fulfillment       |
| `SETTINGS`        | SupplierPortal       | Account settings        |
| `TEAM`            | TeamManagementPage   | Team members            |
| `IMAGES`          | SupplierPortal       | Product images          |

### Admin Portal (`/admin/*`)

| Route/View   | Component                | Lines | Purpose                |
| ------------ | ------------------------ | ----- | ---------------------- |
| `/admin`     | `AdminDashboard.tsx`     | 1207  | Admin home             |
| CUSTOMERS    | AdminCustomersPage       | 1773  | Customer management    |
| ORDERS       | AdminOrdersManager       | ~800  | Order management       |
| QUOTES       | AdminQuoteManager        | ~600  | Quote management       |
| PRODUCTS     | AdminProductsPage        | 1193  | Product catalog        |
| SUPPLIERS    | AdminSupplierMarketplace | 1086  | Supplier settings      |
| INSTALLMENTS | AdminInstallmentsPage    | 1047  | Installment management |
| PRICING      | AdminPricingCenter       | 1633  | Pricing configuration  |
| PERMISSIONS  | UnifiedPermissionCenter  | 2517  | RBAC management        |
| SETTINGS     | AdminSettings            | 1874  | System settings        |
| REPORTS      | AdminReportsCenterPage   | 1145  | Reports                |
| AI_TRAINING  | AdminAITrainingPage      | 1781  | AI configuration       |
| MESSAGING    | AdminMessagingCenter     | 1060  | Message templates      |
| ADVERTISING  | AdminAdvertisingPage     | 1504  | Ads management         |

---

## 2. Feature/Flow Connectivity Matrix

| Feature/Flow       | Customer Uses       | Admin Uses        | Supplier Uses      | Shared DB Entities                       | API Endpoints                 |
| ------------------ | ------------------- | ----------------- | ------------------ | ---------------------------------------- | ----------------------------- |
| **Authentication** | ✅ Login/Logout     | ✅ Login/Logout   | ✅ Login/Logout    | `User`                                   | `/auth/*`                     |
| **Product Search** | ✅ Search           | ✅ View All       | ✅ Own Products    | `Product`, `SupplierCatalogItem`         | `/products/*`                 |
| **Orders**         | ✅ Create/View Own  | ✅ Manage All     | ✅ View Assigned   | `Order`, `OrderItem`                     | `/orders/*`                   |
| **Quote Requests** | ✅ Create/View Own  | ✅ Process/Price  | ✅ Respond         | `QuoteRequest`, `QuoteItem`              | `/orders/quotes/*`            |
| **Installments**   | ✅ Request/View Own | ✅ Approve/Manage | ✅ Submit Offers   | `InstallmentRequest`, `InstallmentOffer` | `/installments/*`             |
| **Notifications**  | ✅ View Own         | ✅ Send           | ✅ View Own        | `Notification`                           | `/notifications/*`            |
| **User Profile**   | ✅ Edit Own         | ✅ Manage All     | ✅ Edit Own        | `User`, `BusinessProfile`                | `/customers/*`, `/auth/me`    |
| **Team/Org**       | ✅ Manage Own Team  | ✅ View All       | ✅ Manage Own Team | `Organization`, `OrganizationUser`       | `/organizations/*`            |
| **Pricing**        | ❌ View Only        | ✅ Full Control   | ❌ View Own        | `Currency`, `ExchangeRate`               | `/pricing/*`, `/currencies/*` |
| **Settings**       | ✅ Preferences      | ✅ Full Control   | ✅ Preferences     | `Settings`                               | `/settings/*`                 |
| **Reports**        | ❌                  | ✅ Generate       | ❌                 | Various                                  | `/reports/*`                  |
| **Permissions**    | ❌                  | ✅ Full Control   | ❌                 | `Role`, `Permission`                     | `/permissions/*`              |

---

## 3. API Usage by Portal

### Customer Portal APIs

```
Auth:        /auth/login, /auth/logout, /auth/me
Orders:      /orders/my-orders, /orders (POST)
Quotes:      /orders/quotes/my-quotes, /orders/quotes (POST)
Products:    /products/search, /products/:id
Installments: /installments/my-requests, /installments (POST)
Notifications: /notifications, /notifications/unread-count
Settings:    /settings (user preferences)
```

### Supplier Portal APIs

```
Auth:        /auth/login, /auth/logout, /auth/me
Suppliers:   /suppliers/me/dashboard, /suppliers/me/products
             /suppliers/me/requests, /suppliers/me/settings
Assignments: (via /suppliers/me/requests)
Notifications: /notifications
```

### Admin Portal APIs

```
Auth:        /auth/login, /auth/logout, /auth/me
Admin:       /admin/stats, /admin/dashboard, /admin/users/*
Customers:   /customers (CRUD)
Orders:      /orders (full access)
Suppliers:   /suppliers (full access)
Products:    /products (CRUD)
Installments: /installments (full access)
Permissions: /permissions/* (CRUD)
Settings:    /settings/* (full access)
Reports:     /reports/*
Currency:    /currencies/*
Activity:    /admin/activity-logs
```

---

## 4. Real-Time Updates

| Mechanism                | Status             | Details                        |
| ------------------------ | ------------------ | ------------------------------ |
| WebSocket                | ❌ Not Implemented | No WebSocket found in codebase |
| SSE (Server-Sent Events) | ❌ Not Implemented | No EventSource found           |
| Polling                  | ⚠️ Manual Only     | User-triggered refresh         |
| Fetch on Mount           | ✅ Implemented     | useEffect on mount             |

**Finding**: All data updates are **Fetch-only** via user actions or page load. No real-time push notifications.

---

## 5. Portal Connection Status

| Connection         | Status       | Evidence                               |
| ------------------ | ------------ | -------------------------------------- |
| Customer ↔ Backend | ✅ Connected | ApiClient.\* calls in Dashboard.tsx    |
| Supplier ↔ Backend | ✅ Connected | ApiClient.suppliers.getMyProducts etc. |
| Admin ↔ Backend    | ✅ Connected | ApiClient._ calls in Admin_ components |
| All ↔ Same DB      | ✅ Unified   | Single Prisma schema, shared models    |
| Auth Token Shared  | ✅ Yes       | Single localStorage key `auth_token`   |

---

## 6. Cross-Portal Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                           PostgreSQL DB                          │
│   (User, Order, Product, QuoteRequest, Installment, etc.)       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Prisma ORM
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                          │
│   /auth/* | /orders/* | /products/* | /suppliers/* | /admin/*   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP (JWT Auth)
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Customer Portal │ │  Supplier Portal │ │   Admin Portal   │
│   Dashboard.tsx  │ │ SupplierPortal   │ │  AdminDashboard  │
│   (1531 lines)   │ │   (2012 lines)   │ │   (1207 lines)   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 7. Gaps Identified (فجوات مكتشفة)

| Gap                       | Severity | Description                                |
| ------------------------- | -------- | ------------------------------------------ |
| No Real-Time Updates      | P1       | Changes in one portal don't push to others |
| localStorage for Features | P2       | Feature flags stored locally, not synced   |
| Large Monolithic Files    | P2       | Hard to maintain, risk of side effects     |
| No Offline Support        | P3       | No service worker or caching strategy      |

---

_Next: See [API_CALL_SOURCES.md](./API_CALL_SOURCES.md) for detailed API layer audit_
