# SINI CAR B2B - Routing & Views Report

> Generated: 2025-12-31 | Navigation & Page Structure

---

## 1. Route Map (خريطة المسارات)

### Main Entry Point

**File**: `src/App.tsx` (38KB)

### Route Structure

```
/                           → Dashboard (Customer Portal)
/login                      → UnifiedLoginPage
/register                   → Register
/supplier                   → SupplierPortal
/admin/*                    → Admin Portal (nested routes)
```

---

## 2. Portal Routes by User Type

### Customer Portal (/)

| Route            | Component                 | Description             |
| ---------------- | ------------------------- | ----------------------- |
| `/`              | `Dashboard`               | Main customer dashboard |
| `/search`        | `ProductSearchPage`       | Product search          |
| `/orders`        | `OrdersPage`              | Order history           |
| `/quotes`        | `QuoteRequestPage`        | Quote requests          |
| `/installments`  | `CustomerInstallmentPage` | Installment requests    |
| `/notifications` | `NotificationsPage`       | User notifications      |
| `/organization`  | `OrganizationPage`        | Team management         |
| `/profile`       | (in Dashboard)            | User profile            |

### Supplier Portal (/supplier)

| Route                | Component            | Description        |
| -------------------- | -------------------- | ------------------ |
| `/supplier`          | `SupplierPortal`     | Supplier dashboard |
| `/supplier/products` | (in SupplierPortal)  | Product catalog    |
| `/supplier/requests` | (in SupplierPortal)  | Quote requests     |
| `/supplier/orders`   | (in SupplierPortal)  | Purchase orders    |
| `/supplier/settings` | (in SupplierPortal)  | Account settings   |
| `/supplier/team`     | `TeamManagementPage` | Team members       |

### Admin Portal (/admin/\*)

| Route                 | Component                          | Description           |
| --------------------- | ---------------------------------- | --------------------- |
| `/admin`              | `AdminDashboard`                   | Admin homepage        |
| `/admin/customers`    | `AdminCustomersPage`               | Customer management   |
| `/admin/orders`       | `AdminOrdersManager`               | Order management      |
| `/admin/quotes`       | `AdminQuoteManager`                | Quote management      |
| `/admin/suppliers`    | `AdminSupplierMarketplaceSettings` | Supplier settings     |
| `/admin/products`     | `AdminProductsPage`                | Product catalog       |
| `/admin/installments` | `AdminInstallmentsPage`            | Installment requests  |
| `/admin/pricing`      | `AdminPricingCenter`               | Pricing configuration |
| `/admin/permissions`  | `UnifiedPermissionCenter`          | RBAC management       |
| `/admin/users`        | `UnifiedAccountRequestsCenter`     | User approvals        |
| `/admin/settings`     | `AdminSettings`                    | System settings       |
| `/admin/reports`      | `AdminReportsCenterPage`           | Reports center        |
| `/admin/ai`           | `AdminAITrainingPage`              | AI configuration      |
| `/admin/messaging`    | `AdminMessagingCenter`             | Message templates     |
| `/admin/activity`     | `AdminActivityLogPage`             | Activity logs         |
| `/admin/security`     | `AdminSecurityCenter`              | Security settings     |

---

## 3. Auth Guards (حماية المسارات)

### Route Protection Pattern

```typescript
// In App.tsx
const renderContent = () => {
  // Not authenticated → Login page
  if (!currentUser) {
    return <UnifiedLoginPage onLogin={handleLogin} />;
  }

  // Authenticated → Check role & render portal
  switch (currentUser.role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'EMPLOYEE':
      return <AdminDashboard ... />;
    case 'SUPPLIER_OWNER':
    case 'SUPPLIER_MANAGER':
    case 'SUPPLIER_STAFF':
      return <SupplierPortal ... />;
    default:
      return <Dashboard ... />; // Customer
  }
};
```

### Admin-Only Routes

```typescript
// Backend enforcement
router.get('/admin/*', authMiddleware, adminOnly, ...);
```

---

## 4. Shared Layouts (التخطيطات المشتركة)

### Common Layout Components

| Component        | Location                          | Used By     |
| ---------------- | --------------------------------- | ----------- |
| Sidebar          | Inline in each portal             | All portals |
| Header           | Inline in each portal             | All portals |
| NotificationBell | `components/NotificationBell.tsx` | All portals |
| LanguageSwitcher | `components/LanguageSwitcher.tsx` | All portals |
| Modal            | `components/Modal.tsx`            | All pages   |
| Toast            | `components/Toast.tsx`            | All pages   |

### Layout Structure

```
┌───────────────────────────────────────────────────────┐
│ Header (Logo, Search, User Menu, Notifications)       │
├───────────────┬───────────────────────────────────────┤
│               │                                       │
│   Sidebar     │         Content Area                  │
│   (Nav Menu)  │         (Route Component)             │
│               │                                       │
│               │                                       │
├───────────────┴───────────────────────────────────────┤
│ Footer (optional)                                     │
└───────────────────────────────────────────────────────┘
```

---

## 5. View State Management

### Dashboard Views (Customer Portal)

```typescript
type ViewType =
  | "HOME"
  | "HOME_LEGACY"
  | "SEARCH"
  | "ORDERS"
  | "QUOTES"
  | "INSTALLMENTS"
  | "NOTIFICATIONS"
  | "PROFILE"
  | "ORGANIZATION";
```

### Supplier Portal Views

```typescript
type SupplierView =
  | "DASHBOARD"
  | "PRODUCTS"
  | "PURCHASE_ORDERS"
  | "REQUESTS"
  | "SETTINGS"
  | "NOTIFICATIONS"
  | "TEAM"
  | "IMAGES";
```

### Admin Dashboard Views

```typescript
type AdminView = "DASHBOARD" | "CUSTOMERS" | "ORDERS" | "QUOTES";
// ... (50+ views)
```

---

## 6. Adding a New Page (إضافة صفحة جديدة)

### Step-by-Step Guide

#### 1. Create Component

```typescript
// src/components/MyNewPage.tsx
import React from "react";

export const MyNewPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">صفحة جديدة</h1>
    </div>
  );
};
```

#### 2. Add to Portal View Type

```typescript
// In relevant portal file
type AdminView =
  | 'DASHBOARD'
  | 'MY_NEW_PAGE' // Add new view
  | ...
```

#### 3. Add Sidebar Navigation

```typescript
// In sidebar menu array
{
  id: 'MY_NEW_PAGE',
  label: t('admin.myNewPage'),
  icon: <SomeIcon />,
}
```

#### 4. Add View Rendering

```typescript
// In main render logic
{
  view === "MY_NEW_PAGE" && <MyNewPage />;
}
```

#### 5. Add Translation Keys

```json
// src/locales/ar.json
{
  "admin": {
    "myNewPage": "صفحتي الجديدة"
  }
}
```

#### 6. Verify

```bash
npm run typecheck
npm run build
```

---

## 7. Navigation Patterns

### Programmatic Navigation

```typescript
// Set view state
setView("ORDERS");

// With URL update (if using router)
navigate("/admin/orders");
```

### Deep Linking

Admin portal uses internal view state, not URL routes.
Consider migrating to React Router for better URL handling.

---

## 8. Mobile Responsiveness

### Breakpoints

```css
/* TailwindCSS defaults */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Mobile Menu

```typescript
// Toggle sidebar on mobile
const [sidebarOpen, setSidebarOpen] = useState(false);
```

---

## 9. Common Routing Issues

| Issue                    | Cause                   | Solution               |
| ------------------------ | ----------------------- | ---------------------- |
| Page not found           | View not in switch case | Add case for new view  |
| Sidebar not highlighting | Active check wrong      | Verify view === id     |
| 403 on navigation        | Role mismatch           | Check user.role access |
| State lost on refresh    | View in state only      | Consider URL routing   |

---

## Next Steps

- See [BUSINESS_FLOWS.md](./BUSINESS_FLOWS.md) for user journeys
- See [MAINTAINABILITY_RULES.md](./MAINTAINABILITY_RULES.md) for coding standards
