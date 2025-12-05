# Overview

This is the **Sini Car B2B Portal**, a wholesale customer portal for an auto parts company specializing in Chinese vehicle spare parts. It enables business customers (parts shops, rental companies, insurance companies) to browse products, place orders, request quotes, and manage their organization's structure, including branches and staff members. The application features a customer-facing portal and an admin dashboard, built as a single-page React application with a mock backend using localStorage for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The portal is built with React 19.2 and TypeScript using Vite. It utilizes Tailwind CSS v4 for styling. State management relies on React hooks, with the Context API handling cross-cutting concerns like language and toast notifications. Routing is managed client-side using component state. The system supports multilingual interfaces (Arabic RTL, English, Hindi, Chinese) via a custom `LanguageContext`. Key UI components include `Dashboard`, `AdminDashboard`, `ProductCard`, `Modal`, `Toast`, and `NotificationBell`.

## Data Layer

All data is persisted in the browser's `localStorage` through a mock API layer (`services/mockApi.ts`), simulating asynchronous operations. Critical `localStorage` keys include those for users, products, orders, quote requests, and various system settings. TypeScript interfaces (`types.ts`) define all domain entities, statuses, and role-based access control (SUPER_ADMIN, CUSTOMER_OWNER, CUSTOMER_STAFF). A custom Arabic-aware search engine (`utils/arabicSearch.ts`) provides fuzzy matching and part number normalization.

## Business Logic Patterns

**Price Reveal System**: A gamified feature where customers spend "search points" to view prices, with tracking and quotas.
**Order Workflow**: A multi-step process from customer submission to admin review and final status (DELIVERED/CANCELLED).
**Quote Request Flow**: Customers upload Excel files, which are parsed, reviewed by admins, and priced.
**Account Opening Process**: New businesses register, admins approve, assign pricing levels, and grant access.
**Multi-Branch/Staff Management**: Business owners can create branches and add staff with specific roles (MANAGER, BUYER) and permissions.
**Pricing Center**: An admin-configurable system supporting price levels, matrices, customer-specific profiles, global settings, and a configurable precedence order for price calculation via the `pricingEngine.ts`.

## Utility Modules

The system includes utilities for:
- **Date Formatting** (`utils/dateUtils.ts`): Consistent Arabic date/time display.
- **Part Number Utilities** (`utils/partNumberUtils.ts`): Normalization and numeric core extraction.
- **Search Utilities** (`utils/arabicSearch.ts`): Arabic text normalization, fuzzy matching, and multi-field search.

## Authentication & Authorization

Authentication supports OWNER (clientId + password) and STAFF (phone + activationCode) logins. User roles (`SUPER_ADMIN`, `CUSTOMER_OWNER`, `CUSTOMER_STAFF`) determine access. Staff roles further differentiate between `MANAGER` (full access) and `BUYER` (limited access). Login sessions are persistent with secure session tokens in `localStorage`.

## Admin Features

The **Admin Dashboard** provides comprehensive management tools including:
- Statistics with charts.
- Customer management (view, suspend, reset passwords, adjust quotas).
- Order management with dual status tracking.
- Product catalog with bulk Excel import/export.
- Processing of quote, missing parts, and import requests.
- Account opening request approval workflow.
- Activity log viewer.
- Settings panel for banners, texts, UI customization, and API configurations.
- Status label and UI text customization.
- Document upload and viewing for account requests.
- Guest Mode settings for controlling guest access and content visibility.
- Marketing Center for managing campaigns (banners, popups, bell notifications) with targeting and scheduling.
- Team & Sub-User Management System with an `Organization Context`, UI for managing team members, inviting new users, and a scoped permissions system.

# External Dependencies

**Core Libraries**:
- `react`, `react-dom`
- `typescript`
- `vite`

**UI & Styling**:
- `tailwindcss`
- `lucide-react` (icons)
- `recharts` (charts)
- Google Fonts (Tajawal)

**Data Processing**:
- `xlsx` (Excel)
- `html2canvas` (screenshots)
- `jspdf`, `jspdf-autotable` (PDF generation)

**Utilities**:
- `clsx`, `tailwind-merge`
- `autoprefixer`, `postcss`

**Development**:
- `@vitejs/plugin-react`
- `@types/node`

**Environment Variables**:
- `GEMINI_API_KEY` (configured but not actively used)

**Browser APIs**:
- `localStorage` (for all data persistence)

**Future Integration Points**:
- Placeholder for `realApi.ts` for actual backend API integration.