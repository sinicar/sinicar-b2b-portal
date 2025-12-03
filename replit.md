# Overview

This is **Sini Car B2B Portal** - a wholesale customer portal for an auto parts company specializing in Chinese vehicle spare parts (Changan, MG, Geely, Haval, etc.). The system enables business customers (parts shops, rental companies, insurance companies) to browse products, place orders, request quotes, and manage their organization structure including branches and staff members.

The application is built as a single-page React application with a mock backend that simulates real API interactions using localStorage for data persistence. It features both a customer-facing portal and an admin dashboard for managing accounts, orders, products, and business operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 19.2 with TypeScript, built using Vite

**UI Library**: Tailwind CSS with custom design tokens for Royal Blue/Orange/Navy color scheme

**State Management**: React hooks (useState, useEffect, useMemo) with local component state - no global state management library

**Routing**: Client-side view switching using component state rather than React Router

**Key Design Patterns**:
- Component composition with prop drilling for data flow
- Context API for cross-cutting concerns (Language, Toast notifications)
- Memoization for performance optimization on filtered/sorted lists
- Modal-based workflows for complex interactions

**Multilingual Support**: Custom LanguageContext supporting Arabic (RTL), English, Hindi, and Chinese with translation dictionaries

**Key UI Components**:
- `Dashboard`: Main customer portal with tabbed navigation
- `AdminDashboard`: Admin control panel with statistics and management tools
- `ProductCard`: Displays products with conditional price reveal mechanism
- `Modal`: Reusable modal component with animations
- `Toast`: Global notification system
- `NotificationBell`: Real-time notification center

## Data Layer

**Storage Strategy**: All data persists in browser localStorage with a mock API layer (`services/mockApi.ts`) that simulates async operations

**localStorage Keys**:
- `siniCar_users`: User accounts and profiles
- `siniCar_products`: Product catalog
- `siniCar_orders`: Order history
- `siniCar_quoteRequests`: Quote/pricing requests
- `siniCar_missingRequests`: Missing product requests
- `siniCar_importRequests`: Import from China requests
- `siniCar_accountRequests`: New account opening requests
- `siniCar_activityLog`: System activity tracking
- `siniCar_banners`: Marketing banners
- `siniCar_settings`: Site configuration
- `siniCar_searchHistory`: User search history for price reveal tracking
- `siniCar_notifications`: User notifications

**Type System** (`types.ts`):
- Comprehensive TypeScript interfaces for all domain entities
- Enums for statuses (OrderStatus, CustomerStatus, AccountRequestStatus, etc.)
- Role-based access control types (UserRole: SUPER_ADMIN, CUSTOMER_OWNER, CUSTOMER_STAFF)
- Multi-level business structure (BusinessProfile → Branches → Staff)

**Search Engine**: Custom Arabic-aware search implementation in `utils/arabicSearch.ts`:
- Text normalization (unifying Arabic characters, removing diacritics)
- Levenshtein distance for fuzzy matching
- Part number normalization utilities in `utils/partNumberUtils.ts`
- Tokenization and multi-field ranking

## Business Logic Patterns

**Price Reveal System**: Gamified feature where customers must spend "search points" to view prices, tracked through search history with daily/monthly quotas

**Order Workflow**:
1. Customer adds items to cart
2. Submits order with PENDING status
3. Admin reviews and changes to APPROVED/REJECTED
4. Admin tracks internal status (warehouse, payment, shipping)
5. Final status: DELIVERED or CANCELLED

**Quote Request Flow**:
1. Customer uploads Excel file with part numbers
2. System parses and displays items
3. Admin reviews, marks items as MATCHED/NOT_FOUND, adds pricing
4. Status progresses: NEW → UNDER_REVIEW → QUOTED → PROCESSED

**Account Opening Process**:
1. New business submits registration form
2. Admin reviews and approves/rejects
3. Admin assigns price level, customer type, portal access dates
4. System generates client ID and password
5. Customer can then login and start ordering

**Multi-Branch/Staff Management**:
- Business owners can create branches
- Can add staff with roles (MANAGER with full access, BUYER with limited access)
- Staff authenticate using phone + activation code
- Permissions cascade from owner → branches → staff

## Utility Modules

**Date Formatting** (`utils/dateUtils.ts`): Consistent Arabic date/time display with AM/PM markers

**Part Number Utilities** (`utils/partNumberUtils.ts`): 
- Normalization (uppercase, remove special chars, convert Arabic numerals)
- Numeric core extraction for flexible searching

**Search Utilities** (`utils/arabicSearch.ts`):
- Arabic text normalization
- Fuzzy matching with configurable threshold
- Multi-field product search with ranking

## Authentication & Authorization

**Auth Flow**:
- Two login modes: OWNER (clientId + password) or STAFF (phone + activationCode)
- No JWT/session tokens - user object stored in component state
- Role-based UI rendering (admin sees AdminDashboard, customers see Dashboard)

**User Roles**:
- `SUPER_ADMIN`: Full system access
- `CUSTOMER_OWNER`: Business owner with full customer portal access
- `CUSTOMER_STAFF`: Limited access based on employee role (MANAGER or BUYER)

**Staff Roles** (within CUSTOMER_STAFF):
- `MANAGER`: Can view prices, place orders, manage staff
- `BUYER`: Can browse and add to cart but needs approval

## Admin Features

**Admin Dashboard Sections**:
- Statistics overview with charts (recharts library)
- Customer management (view, suspend, reset passwords, adjust quotas)
- Order management with dual status tracking (customer-facing + internal)
- Product catalog with bulk Excel import/export
- Quote request processing
- Missing parts tracking
- Import from China request management
- Account opening request approval workflow
- Activity log viewer
- Settings panel (banners, texts, UI customization, API configs)

**Product Management**:
- Excel import/export using `xlsx` library
- Bulk operations (import updates existing by partNumber)
- Product search and filtering
- Stock level tracking

# External Dependencies

**Core Libraries**:
- `react` (19.2) & `react-dom`: UI framework
- `typescript` (5.8): Type safety
- `vite` (6.4): Build tool and dev server

**UI & Styling**:
- `tailwindcss` (4.1): Utility-first CSS framework
- `lucide-react` (0.555): Icon library
- `recharts` (2.15): Charts for admin dashboard
- Google Fonts: Tajawal font family for Arabic typography

**Data Processing**:
- `xlsx` (0.18): Excel file parsing and generation
- `html2canvas` (1.4): Screenshot functionality for reports
- `jspdf` (3.0) & `jspdf-autotable` (5.0): PDF generation for quotes/orders

**Utilities**:
- `clsx` (2.1) & `tailwind-merge` (2.6): Conditional className utilities
- `autoprefixer` (10.4) & `postcss` (8.5): CSS processing

**Development**:
- `@vitejs/plugin-react` (5.1): Vite React integration
- `@types/node` (22.19): Node.js type definitions

**Environment Variables**:
- `GEMINI_API_KEY`: Google Gemini API key (configured in vite.config.ts but not actively used in core functionality)

**Build Configuration**:
- Vite configured to run on port 3000 (main) or 5000 (local)
- Path alias `@/` points to project root
- Two config files: `vite.config.ts` (production) and `vite.local.config.ts` (local dev)

**Browser APIs**:
- localStorage for all data persistence
- No external database or backend service
- No authentication service (mock implementation only)

**Future Integration Points** (prepared but not implemented):
- `services/realApi.ts`: Placeholder for actual backend API integration
- API configuration in settings panel for future ERP/accounting system integration
- Structured to allow swap from mockApi to realApi with minimal changes