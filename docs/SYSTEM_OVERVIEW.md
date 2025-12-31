# SINI CAR B2B - System Overview

> Generated: 2025-12-31 | Version: 1.0

---

## 1. Platform Description (وصف المنصة)

**SINI CAR B2B** is a comprehensive B2B automotive parts trading platform connecting:

- **Customers (العملاء)**: Workshops, retailers, wholesalers
- **Suppliers (الموردين)**: Parts manufacturers and distributors
- **Administrators (المدراء)**: Platform operators and support

### Three Main Portals (البوابات الثلاث)

| Portal              | Entry Route     | Purpose                                             |
| ------------------- | --------------- | --------------------------------------------------- |
| **Customer Portal** | `/` (Dashboard) | Product search, orders, quotes, installments        |
| **Supplier Portal** | `/supplier`     | Product catalog, quote responses, order fulfillment |
| **Admin Portal**    | `/admin/*`      | Full system management, users, pricing, reports     |

### Key Business Flows (التدفقات الأساسية)

```
┌──────────────┐   Quote Request   ┌──────────────┐   Forward   ┌──────────────┐
│   Customer   │ ───────────────▶ │    Admin     │ ──────────▶ │   Supplier   │
└──────────────┘                   └──────────────┘              └──────────────┘
       │                                  │                            │
       │◀────────── Price Quote ──────────┤◀────── Supplier Offer ────┤
       │                                  │                            │
       ▼                                  ▼                            ▼
   Create Order                     Manage Order                 Fulfill Order
```

---

## 2. High-Level Folder Structure (هيكل المجلدات)

```
SINI CAR B2B/
├── src/                    # Frontend (React + TypeScript)
│   ├── App.tsx             # Main entry & routing
│   ├── components/         # 74 main UI components
│   ├── features/           # Feature-based modules (admin, customer, supplier)
│   ├── services/           # API clients, contexts, business logic
│   │   ├── api/modules/    # Modular API functions (18 modules)
│   │   ├── apiClient.ts    # Main HTTP client to backend
│   │   └── pricingEngine.ts # Pricing calculations
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
│
├── backend/                # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── server.ts       # Express app entry
│   │   ├── modules/        # 30 feature modules
│   │   ├── middleware/     # Auth, validation, error handling
│   │   └── schemas/        # Zod validation schemas
│   └── prisma/
│       ├── schema.prisma   # Database schema (40KB)
│       └── seed.ts         # Initial data seeding
│
├── docs/                   # Documentation (this folder)
└── scripts/                # Utility scripts
```

---

## 3. Entry Points (نقاط الدخول)

### Frontend Entry Points

| File                        | Purpose                   |
| --------------------------- | ------------------------- |
| `src/index.tsx`             | React DOM render          |
| `src/App.tsx`               | Routes + Auth + Providers |
| `src/services/apiClient.ts` | All Backend API calls     |
| `src/services/api.ts`       | API facade (DO NOT EDIT)  |

### Backend Entry Points

| File                           | Purpose             |
| ------------------------------ | ------------------- |
| `backend/src/server.ts`        | Express server init |
| `backend/src/routes/index.ts`  | Route registration  |
| `backend/prisma/schema.prisma` | Database models     |

---

## 4. Key System Locations (أين تجد الأشياء)

| Feature              | Frontend Location                        | Backend Location                        |
| -------------------- | ---------------------------------------- | --------------------------------------- |
| **Authentication**   | `services/apiClient.ts → auth`           | `modules/auth/`                         |
| **Permissions/RBAC** | `components/UnifiedPermissionCenter.tsx` | `modules/permissions/`                  |
| **Customer Portal**  | `components/Dashboard.tsx`               | `modules/customers/`, `modules/orders/` |
| **Supplier Portal**  | `components/SupplierPortal.tsx`          | `modules/suppliers/`                    |
| **Admin Dashboard**  | `components/AdminDashboard.tsx`          | `modules/admin/`                        |
| **Pricing Engine**   | `services/pricingEngine.ts`              | `modules/pricing/`                      |
| **Excel Import**     | `features/admin/components/`             | `modules/tools/`                        |
| **Reports**          | `components/AdminReportsCenterPage.tsx`  | `modules/reports/`                      |
| **AI Training**      | `components/AdminAITrainingPage.tsx`     | `modules/ai/`                           |
| **Notifications**    | `components/NotificationsPage.tsx`       | `modules/notifications/`                |
| **Installments**     | `components/AdminInstallmentsPage.tsx`   | `modules/installments/`                 |

---

## 5. Folder Map (خريطة المجلدات)

| Folder                         | Purpose                           | Owner/Team      |
| ------------------------------ | --------------------------------- | --------------- |
| `src/components/`              | All React UI components           | Frontend        |
| `src/components/Admin*.tsx`    | Admin portal pages (36 files)     | Frontend        |
| `src/components/Supplier*.tsx` | Supplier portal pages             | Frontend        |
| `src/features/`                | Feature-based organization        | Frontend        |
| `src/services/`                | Business logic & API              | Frontend/Shared |
| `src/services/api/modules/`    | Modular API layer (18 modules)    | Frontend        |
| `src/types/`                   | TypeScript interfaces             | All             |
| `src/utils/`                   | Helper functions                  | All             |
| `backend/src/modules/`         | Backend feature modules (30 dirs) | Backend         |
| `backend/src/middleware/`      | Express middleware                | Backend         |
| `backend/prisma/`              | Database schema & migrations      | Backend         |
| `docs/`                        | Project documentation             | DevOps          |

---

## 6. Technology Stack (التقنيات المستخدمة)

### Frontend

- **Framework**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Build**: Vite
- **State**: React Context + useState
- **i18n**: react-i18next (Arabic/English)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod

### Infrastructure

- **Development**: Vite dev server (port 3000) + Express (port 3005)
- **Auth**: JWT tokens stored in localStorage

---

## 7. Development Commands (أوامر التطوير)

```bash
# Frontend
npm run dev          # Start frontend (port 3000)
npm run typecheck    # TypeScript validation
npm run build        # Production build

# Backend
cd backend
npm run dev          # Start backend (port 3005)

# Database
cd backend
npx prisma db push   # Sync schema
npx prisma studio    # Visual DB editor
```

---

## 8. Environment Files (ملفات البيئة)

| File           | Contains                                        |
| -------------- | ----------------------------------------------- |
| `.env`         | Frontend config (VITE_API_URL)                  |
| `backend/.env` | Backend config (PORT, DATABASE_URL, JWT_SECRET) |

> ⚠️ **Never commit real credentials to git**

---

## Next Steps (الخطوات التالية)

- See [DATABASE_REPORT.md](./DATABASE_REPORT.md) for schema details
- See [API_CONTRACTS_MAP.md](./API_CONTRACTS_MAP.md) for API documentation
- See [AUTH_AND_ROLES.md](./AUTH_AND_ROLES.md) for authentication flow
