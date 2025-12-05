# Overview

This is **Sini Car B2B Portal** - a wholesale customer portal for an auto parts company specializing in Chinese vehicle spare parts (Changan, MG, Geely, Haval, etc.). The system enables business customers (parts shops, rental companies, insurance companies) to browse products, place orders, request quotes, and manage their organization structure including branches and staff members.

The application is built as a single-page React application with a mock backend that simulates real API interactions using localStorage for data persistence. It features both a customer-facing portal and an admin dashboard for managing accounts, orders, products, and business operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Project Structure (Production-Ready)

```
├── index.html              # Entry HTML (points to /src/index.tsx)
├── tailwind.config.js      # Tailwind v4 configuration
├── postcss.config.js       # PostCSS with @tailwindcss/postcss
├── tsconfig.json           # TypeScript config
├── vite.local.config.ts    # Vite dev configuration
├── src/
│   ├── index.tsx          # React entry point
│   ├── index.css          # Tailwind imports & custom styles
│   ├── App.tsx            # Main application component
│   ├── types.ts           # TypeScript interfaces
│   ├── components/        # React components
│   ├── services/          # API, i18n, contexts
│   ├── utils/             # Utility functions
│   └── locales/           # Translation files (ar, en, hi, zh)
```

## Frontend Architecture

**Framework**: React 19.2 with TypeScript, built using Vite

**UI Library**: Tailwind CSS v4 with @tailwindcss/postcss (local installation, no CDN)

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
- `siniCar_priceLevels`: Configurable price levels (base and derived)
- `siniCar_priceMatrix`: Product-specific price entries per level
- `siniCar_customerProfiles`: Customer pricing profiles with custom rules
- `siniCar_globalPricingSettings`: Global pricing configuration

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

**Pricing Center (مركز التسعيرات)**: Admin-configurable pricing system
- Price Levels: Define base levels and derived levels (percentage adjustments)
- Price Matrix: Set product-specific prices per level
- Customer Profiles: Override pricing for specific customers with custom rules
- Global Settings: Configure currency, rounding, default level, precedence order
- Price Simulation: Test price calculations for any product/customer combination
- Precedence Order: CUSTOM_RULE → LEVEL_EXPLICIT → LEVEL_DERIVED (configurable)
- Pricing Engine (`services/pricingEngine.ts`): Centralized calculation with caching

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

# Recent Enhancements (Dec 2025)

**Security & Authentication**:
- Password change flow for customers (OrganizationPage → Security tab)
- Admin password reset for customers/staff/admin accounts (AdminCustomersPage)
- Persistent login with secure session tokens (sini_car_session_tokens localStorage key, 7-day expiry)
- Password changes invalidate all existing session tokens

**Notification System**:
- NotificationBell component with real-time notification center
- Type-specific icons (quote, order, import, system notifications)
- Individual notification deletion and "clear all" functionality
- Red badge counters for unread notifications, orders, quotes

**Online User Tracking**:
- Heartbeat system (60-second pings) for customer portal users
- OnlineUsersCard in admin dashboard showing active users (within 5 minutes)
- Auto-refresh every 30 seconds

**Settings Management**:
- STATUS_LABELS tab for color-coded status label management (orders, quotes, imports, accounts, missing parts)
- TEXTS tab for CMS-like UI text customization
- Configurable status label colors and text via AdminSettings

**Account Opening**:
- Document upload support with file validation (PDF, JPEG, PNG, WebP, max 5MB)
- Required documents differ by business category
- Document viewing in AdminAccountRequests detail panel

**Organization Page**:
- New "Company Profile" tab for editing business information
- Editable fields: business name, CR number, VAT number, national address, city, phone, email
- Four tabs: Profile, Branches, Employees, Security

**Guest Mode System** (Dec 2025):
- Guest browsing allows visitors to preview the portal without account
- Content protection with configurable blur intensity (light/medium/heavy)
- Admin-controlled visibility for each section (businessTypes, mainServices, howItWorks, whySiniCar, cart, marketingCards)
- Search blocking when allowSearch = false - shows login prompt instead of search bar
- Overlay controls: show/hide blur overlay buttons on protected sections
- Page restrictions: guests can only view HOME, clicking other pages triggers marketing modal
- Professional marketing modal prompts guests to register as wholesale customers
- Guest settings managed via GUEST_MODE tab in Admin Settings

**Flying Cart Animation**:
- Animated shopping cart with dynamic flying items effect
- Products fly from add-to-cart button to cart icon
- Multiple items animate based on quantity (max 5 for performance)
- Smooth cubic-bezier easing with scale and opacity transitions

**Marketing Center** (Dec 2025):
- Full-featured campaign management system for B2B customer engagement
- Campaign types: BANNER (top banner), POPUP (modal overlay), BELL (notification bell integration)
- Targeting: By customer type (PARTS_SHOP, RENTAL, INSURANCE, GENERAL, etc.)
- Admin features: Create/edit/delete campaigns, status management (ACTIVE/DRAFT/EXPIRED/SCHEDULED)
- Input validation: URL validation for CTA links, date range validation, priority bounds (1-100)
- Campaign display:
  - BANNER: Gradient banner at top of dashboard with navigation arrows, dismiss button
  - POPUP: Modal overlay with optional background image, CTA button
  - BELL: Integrated with NotificationBell component, pink gradient styling, "عرض" badge
- Dismissal persistence: Dismissed campaigns stored in user profile (dismissedCampaignIds)
- Read state persistence: BELL campaign read status stored in localStorage per user
- Priority-based sorting: Higher priority campaigns displayed first
- Date-range support: Campaigns with startsAt/expiresAt for scheduling
- Skippable flag: Controls whether users can dismiss the campaign

**Known Enhancement Opportunities**:
- Status labels configuration in AdminSettings stores data but components still use hardcoded STATUS_COLORS maps - future enhancement to propagate configurable labels to all badge renderers