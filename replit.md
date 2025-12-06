# Overview

This is the **Sini Car B2B Portal** (صيني كار), a comprehensive wholesale customer portal for an auto parts company specializing in Chinese vehicle spare parts. It enables business customers (parts shops, rental companies, insurance companies) to browse products, place orders, request quotes, and manage their organization's structure, including branches and staff members. The application features a customer-facing portal and an admin dashboard, built as a single-page React application with a mock backend using localStorage for data persistence.

**Full Technical Documentation**: See `docs/TECHNICAL_DOCUMENTATION.md` for complete API contracts, data models, workflows, and backend handoff guide.

# Core Systems (5 Main Modules)

1. **Trader Tools Hub** - Advanced tools for traders (VIN Extractor, Price Comparison, PDF to Excel)
2. **Supplier Portal** - Complete supplier portal with product management, quote request handling, Excel import/export, and dashboard stats (login: SL-20001 / supplier123)
3. **Supplier Marketplace** - Marketplace connecting suppliers with product listings and forward requests
4. **Marketer/Affiliate System** - Affiliate marketing with referral links, commission tracking, and payouts
5. **Advertising Management** - Ad campaign management with slots, targeting, and analytics
6. **Installment Wholesale Purchase System** - Wholesale installment purchases with credit profiles and payment schedules

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The portal is built with React 19.2 and TypeScript using Vite. It utilizes Tailwind CSS v4 for styling. State management relies on React hooks, with the Context API handling cross-cutting concerns like language, toast notifications, organization/team state, and admin permissions. Routing is managed client-side using component state. The system supports multilingual interfaces (Arabic RTL, English, Hindi, Chinese) via react-i18next.

**Key Context Providers:**
- `LanguageContext` - Language management (4 languages)
- `ToastContext` - Toast notifications
- `OrganizationContext` - Organization & team state
- `PermissionContext` - Admin role-based permissions
- `AdminBadgesContext` - Admin notification badges

## Data Layer

All data is persisted in the browser's `localStorage` through a mock API layer (`services/mockApi.ts` - 6486 lines), simulating asynchronous operations. TypeScript interfaces (`types.ts` - 2401 lines) define all domain entities, statuses, and role-based access control.

**Key Storage Categories:**
- Users & Profiles: `b2b_users_sini_v2`, `b2b_profiles_sini_v2`
- Products: `b2b_products_sini_v2`
- Orders & Quotes: `b2b_orders_sini_v2`, `b2b_quotes_sini`
- Organizations: `b2b_organizations`, `b2b_organization_users`, `b2b_team_invitations`
- Installments: `b2b_installment_requests`, `b2b_installment_offers`
- Marketing: `b2b_marketing_campaigns`, `b2b_ad_campaigns`
- Affiliates: `b2b_marketer_profiles`, `b2b_marketer_commissions`

## Business Logic Patterns

**Price Reveal System**: A gamified feature where customers spend "search points" to view prices, with tracking and quotas.
**Order Workflow**: A multi-step process from customer submission to admin review and final status (DELIVERED/CANCELLED) with internal status tracking.
**Quote Request Flow**: Customers upload Excel files, which are parsed, reviewed by admins, and priced.
**Account Opening Process**: New businesses register, admins approve, assign pricing levels, and grant access.
**Multi-Branch/Staff Management**: Business owners can create branches and add staff with specific roles (MANAGER, BUYER) and permissions.
**Pricing Center**: An admin-configurable system supporting price levels, matrices, customer-specific profiles, global settings, and a configurable precedence order for price calculation via the `pricingEngine.ts`.
**Organization & Team System**: Complete team management with scoped permissions per organization type (Customer, Supplier, Advertiser, Affiliate).

## Authentication & Authorization

### Demo Users (للاختبار)

| # | البريد الإلكتروني | كلمة المرور | الدور |
|---|------------------|-------------|-------|
| 1 | 1@sinicar.com | 1 | SUPER_ADMIN (مدير عام) |
| 2 | 2@sinicar.com | 2 | ADMIN (مدير) |
| 3 | 3@sinicar.com | 3 | STAFF (موظف) |
| 4 | 4@sinicar.com | 4 | CUSTOMER (عميل) |
| 5 | 5@sinicar.com | 5 | SUPPLIER (مورد) |
| 6 | 6@sinicar.com | 6 | MARKETER (مسوق) |

**Primary Roles:**
- `SUPER_ADMIN` - Full admin access
- `CUSTOMER_OWNER` - Business owner
- `CUSTOMER_STAFF` - Staff member

**Organization Roles:**
- `owner` - Organization owner (all permissions)
- `manager` - Full access to assigned features
- `staff` - Limited operational access
- `readonly` - View-only access

**Scoped Permissions:** 26+ granular permissions across 4 organization types (customer, supplier, advertiser, affiliate).

## Admin Features

The **Admin Dashboard** provides comprehensive management tools including:
- Statistics with charts (Recharts)
- Customer management (view, suspend, reset passwords, adjust quotas)
- Order management with dual status tracking (external + internal)
- Product catalog with bulk Excel import/export
- Processing of quote, missing parts, and import requests
- Account opening request approval workflow
- Activity log viewer
- Settings panel for banners, texts, UI customization, and API configurations
- Status label and UI text customization
- Document upload and viewing for account requests
- Guest Mode settings for controlling guest access and content visibility
- Marketing Center for managing campaigns (banners, popups, bell notifications)
- Trader Tools Settings
- Supplier Marketplace Settings
- Marketer/Affiliate Management
- Advertising Management
- Installment System Management
- Organization & Team Settings (max employees, default permissions)
- Abandoned Carts Tracking (auto-saved carts with 15-min inactivity threshold, admin view with filtering)

# External Dependencies

**Core Libraries:**
- `react`, `react-dom` (v19.2)
- `typescript`
- `vite`
- `react-i18next`, `i18next`, `i18next-browser-languagedetector`

**UI & Styling:**
- `tailwindcss` (v4)
- `lucide-react` (icons)
- `recharts` (charts)
- Google Fonts (Tajawal)

**Data Processing:**
- `xlsx` (Excel)
- `html2canvas` (screenshots)
- `jspdf`, `jspdf-autotable` (PDF generation)

**Utilities:**
- `clsx`, `tailwind-merge`
- `autoprefixer`, `postcss`

**Development:**
- `@vitejs/plugin-react`
- `@types/node`

**Browser APIs:**
- `localStorage` (for all data persistence)

**Future Integration Points:**
- Placeholder for `realApi.ts` for actual backend API integration
- Onyx Pro ERP Integration
- SMS/Email notifications
- Payment gateway for installments

# File Structure

```
src/
├── components/           # 43 React components
│   ├── Dashboard.tsx     # Main customer portal (2243 lines)
│   ├── AdminDashboard.tsx # Admin control panel (931 lines)
│   ├── TeamManagementPage.tsx # Team management UI
│   └── ...
├── services/
│   ├── mockApi.ts        # Complete mock backend (6486 lines)
│   ├── OrganizationContext.tsx # Organization state (403 lines)
│   ├── PermissionContext.tsx
│   ├── pricingEngine.ts
│   └── ...
├── locales/              # 4 language files (~1900 lines each)
│   ├── ar.json, en.json, hi.json, zh.json
├── utils/
│   ├── arabicSearch.ts   # Arabic text search
│   ├── dateUtils.ts
│   └── partNumberUtils.ts
├── types.ts              # All TypeScript definitions (2401 lines)
└── App.tsx
```

# AI Integration

## AI Assistant
- **Component**: `src/components/AIAssistant.tsx` - Floating chat widget available globally
- **Service**: `src/services/mockApi.ts` - `sendAIMessage()` method for mock AI responses
- **Admin Settings**: `src/components/AdminAISettings.tsx` - Configure AI providers and behavior
- **Types**: `AIChatMessage`, `AIConversation`, `AIUsageLog`, `AISettings` in `types.ts`

**Features:**
- Floating chat button (bottom-right corner)
- Multilingual support (Arabic/English responses)
- Contextual responses (search, orders, pricing queries)
- Conversation history management
- Minimize/close controls

**Future Integration:**
- OpenAI API via Replit AI Integrations
- Multi-provider support (Gemini, Anthropic)
- Real-time streaming responses

# Backend Architecture (December 2024)

## Backend Integration
The application now includes a fully integrated Express.js backend with PostgreSQL (Prisma ORM):

**Backend Server**:
- Location: `backend/` directory
- Port: 3001 (proxied through Vite on port 5000)
- Auto-starts with Vite via custom plugin in `vite.local.config.ts`

**Key API Endpoints** (all prefixed with `/api/v1`):
- `/auth` - Authentication & session management
- `/currencies` - Currency management & exchange rates
- `/pricing` - International pricing engine (supplier groups, quality codes, brand codes, shipping methods/zones, roles)
- `/organizations` - Organization management
- `/customers` - Customer management
- `/orders` - Order processing
- `/permissions` - Permission management
- `/messaging` - Message Templates & Communication Center (WhatsApp, Email, Notifications)
- `/notifications` - Core Notification System (in-app notifications with user settings)

**Database**:
- PostgreSQL with Prisma ORM
- Schema: `backend/prisma/schema.prisma`
- Soft delete pattern (isActive=false) for foreign key safety

**Dev Server Behavior**:
- Backend spawns automatically when Vite starts
- Proper lifecycle handling (SIGTERM/SIGKILL cleanup)
- Prevents orphaned processes on restart

# Recent Changes (December 2024)

- **Core Notification System (COMMAND 25A)**: Complete in-app notification system with:
  - `Notification` and `UserNotificationSettings` Prisma models
  - User-configurable notification preferences per event type
  - 10-minute caching for settings to optimize performance
  - Integration with Message Templates engine (channel: NOTIFICATION)
  - Full CRUD API with pagination and authentication
  - Automatic category assignment based on event types
  - Zod validation for all mutation endpoints
- **Backend Integration**: Full Express.js + PostgreSQL backend with Prisma ORM
- **International Pricing API**: Complete CRUD for currencies, exchange rates, supplier groups, quality codes, brand codes, shipping methods, shipping zones, and roles
- **Vite Plugin**: Auto-spawn backend with proper process lifecycle management
- Added AI Assistant floating chat widget with mock responses
- Fixed toggle switches in AI Settings (z-index and pointer-events issues)
- Created reusable ToggleSwitch component
- Implemented complete Organization & Team Management System
- Added scoped permissions for 4 organization types
- Created TeamManagementPage with invitation system
- Added AdminOrganizationSettings for admin control
- Full i18n support for team management (4 languages)
- Integration with existing Dashboard sidebar
- Complete technical documentation created (`docs/TECHNICAL_DOCUMENTATION.md`)
