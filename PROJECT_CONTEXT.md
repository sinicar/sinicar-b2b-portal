# SINI CAR B2B Portal - Complete Project Context

> This document provides comprehensive context for AI assistants and developers to understand and work with the SINI CAR B2B Portal project.

---

## 1. Project Overview

**Name:** SINI CAR B2B Portal (صيني كار)  
**Type:** Wholesale Auto Parts Business Portal  
**Language:** Primarily Arabic (RTL), with multilingual support (English, Hindi, Chinese)  
**Tech Stack:** React 19.2 + TypeScript + Vite + Tailwind CSS v4 + Express.js + PostgreSQL (Prisma)

### Core Purpose
A comprehensive B2B wholesale portal for an auto parts company specializing in Chinese vehicle spare parts. The platform serves:
- Parts shops and distributors
- Rental companies
- Insurance companies
- Maintenance centers
- Sales representatives

### Key Differentiators
- **AI-Powered Command Center**: Natural language interface for admin operations
- **Multi-tier Pricing Engine**: Configurable pricing with customer levels, matrices, and rules
- **Gamified Search**: Search points system for price reveals
- **Multi-organization Support**: Branches, staff management, role-based access

---

## 2. Architecture Overview

### Frontend Structure
```
src/
├── components/           # 60+ React components
│   ├── admin-settings/   # Modular admin settings components
│   ├── dashboard/        # Extracted dashboard components
│   ├── Dashboard.tsx     # Main customer portal (1,676 lines)
│   ├── AdminDashboard.tsx # Admin control panel
│   └── [40+ other components]
├── hooks/
│   └── useIsMobile.ts    # Responsive detection hook
├── services/
│   ├── mock-api/         # Modular mock API structure
│   │   ├── core/         # Helpers, storage keys, defaults
│   │   └── domains/      # Auth, notifications, settings, system
│   ├── mockApi.ts        # Legacy mock backend (5,000+ lines)
│   ├── pricingEngine.ts  # Price calculation logic
│   └── [context providers]
├── types/                # Modular type definitions
│   ├── index.ts          # Re-exports all types
│   ├── user.ts, order.ts, product.ts, etc.
├── locales/              # i18n translations (4 languages)
│   ├── ar.json, en.json, hi.json, zh.json
├── utils/                # Utility functions
└── types.ts              # Legacy types file (4,391 lines)
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── middleware/       # Express middleware
│   └── index.ts          # Server entry point
├── prisma/
│   └── schema.prisma     # Database schema
```

### Key Patterns
1. **Context Providers**: Language, Toast, Organization, Permission, AdminBadges
2. **Mock API Layer**: localStorage-based data persistence for development
3. **Real API Layer**: Express.js + PostgreSQL for production
4. **Type Safety**: Comprehensive TypeScript interfaces (4,391 lines in types.ts)

---

## 3. Core Modules & Features

### 3.1 Customer Portal (Dashboard.tsx)
Main features accessible to business customers:
- **Product Catalog**: Search with Arabic text support, OEM number lookup
- **Price Reveal System**: Gamified points-based pricing
- **Cart & Ordering**: Multi-item orders with internal tracking
- **Quote Requests**: Excel upload for bulk pricing requests
- **Import from China**: Request bulk imports with tracking
- **Trader Tools Hub**: VIN Extractor, Price Comparison, PDF to Excel
- **Team Management**: Add staff, manage branches, assign roles
- **Notifications**: Real-time in-app notifications

### 3.2 Admin Dashboard (AdminDashboard.tsx)
Comprehensive admin control panel:
- **Dashboard Stats**: KPIs, charts (Recharts), activity overview
- **Customer Management**: Profiles, status, quotas, notes
- **Order Management**: Dual status tracking (external + internal)
- **Quote/Import/Missing Parts**: Request processing workflows
- **Account Requests**: Approval workflow with document verification
- **User & Role Management**: CRUD for admin users, granular permissions
- **Marketing Center**: Campaigns (popups, banners, bell notifications)
- **Pricing Center**: Levels, matrices, customer profiles, audit log
- **AI Settings**: Provider config, features, limits, prompts
- **AI Command Center**: Natural language admin operations

### 3.3 Supplier Portal (SupplierPortal.tsx)
For local and international suppliers:
- **Product Management**: Add/edit products, pricing, stock
- **Request Handling**: View and respond to quote requests
- **Excel Import/Export**: Bulk product management
- **Dashboard Stats**: Sales, orders, performance metrics

### 3.4 Marketer/Affiliate System
- **Referral Links**: Trackable affiliate URLs
- **Commission Tracking**: Percentage or fixed commission models
- **Payout Management**: Request and approve payouts

### 3.5 Installment System
- **Credit Profiles**: Customer creditworthiness assessment
- **Payment Plans**: Configurable installment schedules
- **Offer Management**: Create and manage installment offers

---

## 4. Data Models

### Primary Entities
| Entity | Description | Storage Key |
|--------|-------------|-------------|
| User | Customer/Admin accounts | `b2b_users_sini_v2` |
| BusinessProfile | Customer business info | `b2b_profiles_sini_v2` |
| Product | Auto parts catalog | `b2b_products_sini_v2` |
| Order | Customer orders | `b2b_orders_sini_v2` |
| QuoteRequest | Bulk pricing requests | `b2b_quotes_sini` |
| Organization | Multi-branch entities | `b2b_organizations` |
| AdminUser | Admin accounts | `b2b_admin_users` |
| Role | Permission roles | `b2b_roles` |

### Type Categories (src/types/)
- **user.ts**: User, BusinessProfile, Staff, ExtendedUserRole
- **order.ts**: Order, OrderItem, OrderStatus, OrderInternalStatus
- **product.ts**: Product, ProductCategory, SearchResult
- **quote.ts**: QuoteRequest, QuoteItem, QuoteRequestStatus
- **settings.ts**: SiteSettings, GuestModeSettings, APISettings
- **notification.ts**: Notification, NotificationSettings
- **admin.ts**: AdminUser, Role, Permission, PermissionResource
- **supplier.ts**: SupplierProduct, SupplierProfile, SupplierRequest
- **trader.ts**: ToolConfig, VINExtraction, PriceComparison

---

## 5. Authentication & Authorization

### Demo Credentials
| Email | Password | Role |
|-------|----------|------|
| 1@sinicar.com | 1 | SUPER_ADMIN |
| 2@sinicar.com | 2 | ADMIN |
| 3@sinicar.com | 3 | STAFF |
| 4@sinicar.com | 4 | CUSTOMER |
| 5@sinicar.com | 5 | SUPPLIER |
| 6@sinicar.com | 6 | MARKETER |

### Role Types
- **ExtendedUserRole**: SUPER_ADMIN, ADMIN, EMPLOYEE, CUSTOMER, SUPPLIER_LOCAL, SUPPLIER_INTERNATIONAL, MARKETER
- **Organization Roles**: owner, manager, staff, readonly
- **Staff Roles**: MANAGER, BUYER

### Permission System
26+ granular permissions across resources:
- dashboard, products, customers, orders, quotes, imports, missing
- settings_general, settings_api, settings_backup, settings_security
- users, roles, export_center, content_management

---

## 6. API Integration

### Mock API (Development)
- Location: `src/services/mockApi.ts`
- Storage: localStorage with prefixed keys
- All operations return Promises to simulate async behavior

### Real API (Production)
- Base URL: `http://localhost:3001/api/v1`
- Auto-spawned via Vite plugin
- Endpoints:
  - `/auth` - Authentication
  - `/customers` - Customer management
  - `/orders` - Order processing
  - `/currencies` - Currency management
  - `/pricing` - International pricing engine
  - `/notifications` - Notification system
  - `/messaging` - Message templates (WhatsApp, Email)

---

## 7. Key Business Logic

### Price Calculation Flow (pricingEngine.ts)
1. Get base product price
2. Apply customer price level (LEVEL_1, LEVEL_2, LEVEL_3, SPECIAL)
3. Check custom price matrices
4. Apply customer-specific profile rules
5. Consider global pricing settings
6. Return final calculated price

### Order Workflow
1. **Customer**: Creates order → Status: PENDING
2. **Admin**: Reviews → Approves/Rejects → Status: APPROVED/REJECTED
3. **Internal**: SENT_TO_WAREHOUSE → WAITING_PAYMENT → PAYMENT_CONFIRMED
4. **Shipping**: READY_FOR_SHIPMENT → SHIPPED → DELIVERED/CANCELLED

### Account Opening Flow
1. Business submits application with documents
2. Admin reviews (NEW → UNDER_REVIEW)
3. Assign price level, customer type
4. Approve/Reject with notes
5. System creates user account on approval

---

## 8. Internationalization

### Supported Languages
- Arabic (ar) - Primary, RTL
- English (en)
- Hindi (hi)
- Chinese (zh)

### Implementation
- **i18next** with react-i18next
- Language files: `src/locales/*.json` (~1,900 keys each)
- Context: `LanguageContext.tsx`
- Auto-detection via browser settings

---

## 9. Styling & UI

### Design System
- **Tailwind CSS v4** with custom configuration
- **Brand Colors**: Navy (#0B1B3A), Gold (#C8A04F)
- **Font**: Google Tajawal (Arabic-optimized)
- **Icons**: Lucide React

### Component Library
- Custom components following shadcn patterns
- Modal, Toast, FilterBar, ProductCard
- Recharts for data visualization

---

## 10. Development Guidelines

### Running the Project
```bash
# Start development server (frontend + backend)
npm run dev

# The application runs on port 5000
# Backend API runs on port 3001
```

### File Naming Conventions
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Utilities: camelCase (e.g., `dateUtils.ts`)
- Types: PascalCase interfaces, SCREAMING_SNAKE for enums

### Code Organization Principles
1. Keep components under 2,000 lines
2. Extract reusable logic to hooks
3. Use context for cross-cutting concerns
4. Maintain type safety with TypeScript

### Recent Refactoring (December 2024)
- **types.ts**: Modular type files in `src/types/`
- **mockApi.ts**: Modular structure in `src/services/mock-api/`
- **AdminSettings.tsx**: Extracted 4 sub-components (44% reduction)
- **Dashboard.tsx**: Extracted 5 sub-components (27% reduction)

---

## 11. Known Issues & Technical Debt

### Current Limitations
1. **types.ts**: Still large (4,391 lines) - gradual migration to modular types ongoing
2. **mockApi.ts**: Still large (5,000+ lines) - modular structure created but not fully migrated
3. **`any` types**: Some props still use `any` - should be tightened to domain types

### Duplicate Types (Resolved)
- `SupplierType`: Single definition in Supplier Portal section
- `Role`/`Permission`: Frontend version vs Backend version (renamed to `BackendRole`, `BackendPermission`)
- `SupplierProfile`: Frontend version vs Backend version (renamed to `BackendSupplierProfile`)

---

## 12. Testing

### Test Credentials
See Section 5 for demo user credentials.

### Manual Testing Areas
- Login/Authentication flow
- Product search and price reveal
- Cart and order placement
- Admin dashboard navigation
- Quote request submission
- Supplier product management

---

## 13. Future Roadmap

### Planned Features
- Real-time WebSocket notifications
- OpenAI API integration for AI Assistant
- SMS/Email notification service
- Payment gateway for installments
- Onyx Pro ERP integration

### Architecture Goals
- Complete migration to modular type files
- Full backend API coverage (currently ~60%)
- Implement comprehensive test suite

---

## 14. Quick Reference

### Important File Locations
| Purpose | Location |
|---------|----------|
| Main Customer Portal | `src/components/Dashboard.tsx` |
| Admin Dashboard | `src/components/AdminDashboard.tsx` |
| Type Definitions | `src/types.ts` + `src/types/` |
| Mock API | `src/services/mockApi.ts` |
| Pricing Engine | `src/services/pricingEngine.ts` |
| Translations | `src/locales/` |
| Backend Schema | `backend/prisma/schema.prisma` |

### Storage Keys (localStorage)
| Key | Purpose |
|-----|---------|
| `b2b_users_sini_v2` | User accounts |
| `b2b_profiles_sini_v2` | Business profiles |
| `b2b_products_sini_v2` | Product catalog |
| `b2b_orders_sini_v2` | Customer orders |
| `b2b_admin_users` | Admin accounts |
| `b2b_site_settings` | Site configuration |

---

## 15. Contact & Resources

- **Project Documentation**: `docs/TECHNICAL_DOCUMENTATION.md`
- **AI Knowledge Base**: `src/services/AIKnowledgeBase.ts`
- **Vite Config**: `vite.config.ts`, `vite.local.config.ts`

---

*Last Updated: December 2024*
