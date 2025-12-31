# SINI CAR B2B - API Contracts Map

> Generated: 2025-12-31 | Frontend ↔ Backend API Documentation

---

## 1. Connection Configuration (إعدادات الاتصال)

### Base URL

```
Development: http://localhost:3005/api/v1
Production:  Set via VITE_API_URL environment variable
```

### Authentication Header

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Token Storage

```javascript
// Token saved in localStorage
localStorage.setItem("auth_token", token);
localStorage.getItem("auth_token");
```

---

## 2. Frontend API Structure (هيكل الـ API)

### Primary Client

**File**: `src/services/apiClient.ts` (1055 lines)

This is the **main HTTP client** that all frontend modules use.

### Module Directory

**Location**: `src/services/api/modules/` (18 modules)

---

## 3. API Modules Reference (مرجع الوحدات)

### Auth Module (`auth.ts`)

| Function         | Endpoint               | Method | Description           |
| ---------------- | ---------------------- | ------ | --------------------- |
| `login`          | `/auth/login`          | POST   | User login            |
| `logout`         | `/auth/logout`         | POST   | User logout           |
| `register`       | `/auth/register`       | POST   | New user registration |
| `getCurrentUser` | `/auth/me`             | GET    | Get current session   |
| `resetPassword`  | `/auth/reset-password` | POST   | Password reset        |

**Request/Response**:

```typescript
// Login Request
{ identifier: string, password: string, loginType: 'owner' | 'staff' }

// Login Response
{ success: boolean, data: { user: User, accessToken: string, refreshToken: string } }
```

---

### Customers Module (`customers.ts`)

| Function             | Endpoint                       | Method | Description           |
| -------------------- | ------------------------------ | ------ | --------------------- |
| `getAll`             | `/customers`                   | GET    | List all customers    |
| `getById`            | `/customers/:id`               | GET    | Get customer details  |
| `create`             | `/customers`                   | POST   | Create customer       |
| `update`             | `/customers/:id`               | PUT    | Update customer       |
| `updateStatus`       | `/customers/:id/status`        | PATCH  | Change status         |
| `delete`             | `/customers/:id`               | DELETE | Delete customer       |
| `getOrders`          | `/customers/:id/orders`        | GET    | Customer orders       |
| `getQuotes`          | `/customers/:id/quotes`        | GET    | Customer quotes       |
| `addSearchPoints`    | `/customers/:id/search-points` | POST   | Add search credits    |
| `getAccountRequests` | `/customers/account-requests`  | GET    | Pending registrations |

---

### Orders Module (`orders.ts`)

| Function               | Endpoint                      | Method | Description         |
| ---------------------- | ----------------------------- | ------ | ------------------- |
| `getAll`               | `/orders`                     | GET    | List orders         |
| `getById`              | `/orders/:id`                 | GET    | Order details       |
| `create`               | `/orders`                     | POST   | Create order        |
| `updateStatus`         | `/orders/:id/status`          | PATCH  | Update status       |
| `updateInternalStatus` | `/orders/:id/internal-status` | PATCH  | Internal status     |
| `cancel`               | `/orders/:id/cancel`          | POST   | Cancel order        |
| `getMyOrders`          | `/orders/my-orders`           | GET    | Current user orders |
| `getStats`             | `/orders/stats`               | GET    | Order statistics    |

---

### Quotes Module (`quotes.ts`)

| Function         | Endpoint                     | Method | Description          |
| ---------------- | ---------------------------- | ------ | -------------------- |
| `getAll`         | `/orders/quotes`             | GET    | List quotes          |
| `getById`        | `/orders/quotes/:id`         | GET    | Quote details        |
| `create`         | `/orders/quotes`             | POST   | Create quote request |
| `updateStatus`   | `/orders/quotes/:id/status`  | PATCH  | Update status        |
| `submitPricing`  | `/orders/quotes/:id/pricing` | POST   | Submit pricing       |
| `convertToOrder` | `/orders/quotes/:id/convert` | POST   | Convert to order     |
| `getMyQuotes`    | `/orders/quotes/my-quotes`   | GET    | User's quotes        |

---

### Suppliers Module (`suppliers.ts`)

| Function             | Endpoint                  | Method | Description       |
| -------------------- | ------------------------- | ------ | ----------------- |
| `getAll`             | `/suppliers`              | GET    | List suppliers    |
| `getById`            | `/suppliers/:id`          | GET    | Supplier details  |
| `getProducts`        | `/suppliers/:id/products` | GET    | Supplier products |
| `update`             | `/suppliers/:id`          | PUT    | Update profile    |
| `addProduct`         | `/suppliers/:id/products` | POST   | Add product       |
| **`getMyDashboard`** | `/suppliers/me/dashboard` | GET    | My dashboard      |
| **`getMyProducts`**  | `/suppliers/me/products`  | GET    | My products       |
| **`getMyRequests`**  | `/suppliers/me/requests`  | GET    | My requests       |
| **`getMySettings`**  | `/suppliers/me/settings`  | GET    | My settings       |

> ⚠️ **Important**: Use `/me/` endpoints for Supplier Portal (token-based access)

---

### Products Module (`products.ts`)

| Function          | Endpoint                             | Method | Description       |
| ----------------- | ------------------------------------ | ------ | ----------------- |
| `search`          | `/products/search`                   | GET    | Search products   |
| `getById`         | `/products/:id`                      | GET    | Product details   |
| `getAlternatives` | `/products/:partNumber/alternatives` | GET    | Find alternatives |

---

### Installments Module (`installments.ts`)

| Function             | Endpoint                                              | Method | Description     |
| -------------------- | ----------------------------------------------------- | ------ | --------------- |
| `getSettings`        | `/installments/settings`                              | GET    | Get settings    |
| `updateSettings`     | `/installments/settings`                              | PUT    | Update settings |
| `getRequests`        | `/installments`                                       | GET    | List requests   |
| `getMyRequests`      | `/installments/my-requests`                           | GET    | My requests     |
| `createRequest`      | `/installments`                                       | POST   | New request     |
| `getById`            | `/installments/:id`                                   | GET    | Request details |
| `adminReview`        | `/installments/:id/sinicar-decision`                  | PUT    | Admin decision  |
| `forwardToSuppliers` | `/installments/:id/forward-to-suppliers`              | PUT    | Forward request |
| `getOffers`          | `/installments/:id/offers`                            | GET    | Get offers      |
| `createOffer`        | `/installments/:id/offers`                            | POST   | Create offer    |
| `respondToOffer`     | `/installments/:id/offers/:offerId/customer-response` | PUT    | Accept/reject   |

---

### Notifications Module (`notifications.ts`)

| Function         | Endpoint                      | Method | Description           |
| ---------------- | ----------------------------- | ------ | --------------------- |
| `getAll`         | `/notifications`              | GET    | List notifications    |
| `getById`        | `/notifications/:id`          | GET    | Notification details  |
| `getUnreadCount` | `/notifications/unread-count` | GET    | Unread count          |
| `markAsRead`     | `/notifications/:id/read`     | PUT    | Mark as read          |
| `markAllAsRead`  | `/notifications/read-all`     | PUT    | Mark all read         |
| `create`         | `/notifications`              | POST   | Create notification   |
| `getSettings`    | `/notifications/settings`     | GET    | Notification settings |
| `updateSettings` | `/notifications/settings`     | PUT    | Update settings       |

---

### Settings Module (`settings.ts`)

| Function             | Endpoint                     | Method | Description           |
| -------------------- | ---------------------------- | ------ | --------------------- |
| `getAll`             | `/settings`                  | GET    | All settings          |
| `getSetting`         | `/settings/:key`             | GET    | Specific setting      |
| `update`             | `/settings/:key`             | PUT    | Update setting        |
| `getStatusLabels`    | `/settings/status-labels`    | GET    | Status configurations |
| `getFeatureFlags`    | `/settings/features/flags`   | GET    | Feature toggles       |
| `getQualityCodes`    | `/settings/quality-codes`    | GET    | Quality grades        |
| `getBrandCodes`      | `/settings/brand-codes`      | GET    | Brand list            |
| `getShippingMethods` | `/settings/shipping/methods` | GET    | Shipping options      |
| `getExcelTemplates`  | `/settings/excel-templates`  | GET    | Import templates      |

---

### Admin Module (in `apiClient.ts`)

| Function          | Endpoint                   | Method | Description       |
| ----------------- | -------------------------- | ------ | ----------------- |
| `getStats`        | `/admin/stats`             | GET    | Dashboard stats   |
| `getDashboard`    | `/admin/dashboard`         | GET    | Dashboard data    |
| `getActivityLogs` | `/admin/activity-logs`     | GET    | Activity history  |
| `getOnlineUsers`  | `/admin/online-users`      | GET    | Active users      |
| `getPendingUsers` | `/admin/users/pending`     | GET    | Pending approvals |
| `approveUser`     | `/admin/users/:id/approve` | PUT    | Approve user      |
| `rejectUser`      | `/admin/users/:id/reject`  | PUT    | Reject user       |
| `blockUser`       | `/admin/users/:id/block`   | PUT    | Block user        |

---

## 4. Response Normalization Pattern (نمط التوحيد)

### Standard Success Response

```typescript
{
  success: true,
  data: T,            // Actual data
  message?: string    // Optional message
}
```

### Paginated Response

```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Error Response

```typescript
{
  success: false,
  message: string,
  error?: string
}
```

---

## 5. API DO's and DON'Ts (قواعد عدم كسر الـ API)

### ✅ DO (افعل)

- Always use `ApiClient` from `src/services/apiClient.ts`
- Add new endpoints to existing module files
- Use TypeScript types for request/response
- Handle errors with try/catch
- Check `response.success` before using data

### ❌ DON'T (لا تفعل)

- **NEVER edit `src/services/api.ts`** (facade layer)
- Don't call `fetch()` directly - use `get()`, `post()`, etc.
- Don't hardcode API URLs
- Don't ignore error responses
- Don't change existing endpoint paths without backend coordination

---

## 6. Adding New API Endpoints (إضافة endpoints جديدة)

### Frontend Steps:

1. Add function to appropriate module in `src/services/api/modules/`
2. Add to `ApiClient` object in `apiClient.ts` if needed
3. Export from `src/services/api/modules/index.ts`
4. Run `npm run typecheck` to verify

### Example:

```typescript
// In src/services/api/modules/orders.ts
export async function archiveOrder(orderId: string) {
  return post(`/orders/${orderId}/archive`);
}
```

---

## 7. Backend Modules Reference

| Backend Module  | Routes Prefix      | Purpose             |
| --------------- | ------------------ | ------------------- |
| `auth`          | `/auth/*`          | Authentication      |
| `customers`     | `/customers/*`     | Customer management |
| `orders`        | `/orders/*`        | Orders & quotes     |
| `suppliers`     | `/suppliers/*`     | Supplier portal     |
| `products`      | `/products/*`      | Product catalog     |
| `installments`  | `/installments/*`  | Installment system  |
| `notifications` | `/notifications/*` | Notification system |
| `settings`      | `/settings/*`      | System settings     |
| `admin`         | `/admin/*`         | Admin operations    |
| `permissions`   | `/permissions/*`   | RBAC system         |
| `pricing`       | `/pricing/*`       | Price calculations  |
| `reports`       | `/reports/*`       | Report generation   |
| `currency`      | `/currencies/*`    | Currency management |

---

## Next Steps

- See [AUTH_AND_ROLES.md](./AUTH_AND_ROLES.md) for authentication details
- See [BUSINESS_FLOWS.md](./BUSINESS_FLOWS.md) for end-to-end workflows
