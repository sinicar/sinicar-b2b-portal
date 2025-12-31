# دليل إضافة API Endpoints جديدة

## ⚠️ تحذير مهم

**لا تعدل `src/services/api.ts` مباشرة!**

راجع [DO_NOT_EDIT_API_TS.md](./DO_NOT_EDIT_API_TS.md) للتفاصيل.

---

## 📁 هيكل API Modules (17 ملف)

```
src/services/
├── api.ts              # Facade (335 سطر فقط)
├── httpClient.ts       # HTTP wrapper
├── apiClient.ts        # High-level client
└── api/
    └── modules/
        ├── index.ts        # Re-exports
        ├── auth.ts         # Health & Authentication (4)
        ├── orders.ts       # Orders API (10)
        ├── products.ts     # Products API (7)
        ├── suppliers.ts    # Suppliers API (7)
        ├── settings.ts     # Settings API (22)
        ├── notifications.ts # Notifications API (10)
        ├── customers.ts    # Customers API (21)
        ├── adminUsers.ts   # Admin Users & Roles (12)
        ├── quotes.ts       # Quotes API (6)
        ├── activity.ts     # Activity Logs (10)
        ├── installments.ts # Installments/Credit (21)
        ├── userManagement.ts # User Status (7)
        ├── ai.ts           # AI Suggestions (2)
        ├── images.ts       # Image Upload (2)
        ├── currency.ts     # Exchange Rates (2)
        ├── reports.ts      # Reports (3)
        └── dashboard.ts    # Dashboard Stats (2)
```

---

## 📋 قائمة الـ Modules والوظائف

### customers.ts (21 وظيفة)

- `getAllUsers`, `getCustomersDatabase`, `createCustomerFromAdmin`
- `updateCustomerStatus`, `getCustomerById`, `updateCustomerProfileAdmin`
- `addCustomerSearchPoints`, `deductCustomerSearchPoints`
- `updateCustomerPriceVisibility`, `getCustomerStats`
- `addCustomerNote`, `getCustomerNotes`, `getCustomerOrdersSummary`
- `addBranch`, `deleteBranch`, `addEmployee`, `toggleEmployeeStatus`
- `deleteEmployee`, `updateStaffStatus`, `resetFailedLogin`, `getAdminCustomers`

### installments.ts (21 وظيفة)

- `getInstallmentRequests`, `createInstallmentRequest`, `updateInstallmentRequest`
- `deleteInstallmentRequest`, `getInstallmentRequestById`
- `getInstallmentRequestsForSupplier`, `closeInstallmentRequest`, `cancelInstallmentRequest`
- `createInstallmentOffer`, `getInstallmentOffers`, `getInstallmentOfferById`
- `getOffersByRequestId`, `updateInstallmentOffer`, `customerRespondToOffer`
- `recordSinicarDecision`, `forwardRequestToSuppliers`, `supplierSubmitOffer`
- `markInstallmentAsPaid`, `getInstallmentStats`
- `generatePaymentSchedule`, `getCustomerCreditProfile`

### settings.ts (22 وظيفة)

- `getSettings`, `getSettingByKey`, `updateSetting`, `updateSettings`
- `getFeatureFlags`, `updateFeatureFlag`
- `getQualityCodes`, `createQualityCode`, `updateQualityCode`
- `getBrandCodes`, `createBrandCode`, `updateBrandCode`
- `getShippingMethods`, `createShippingMethod`, `updateShippingMethod`
- `getShippingZones`, `getBanners`, `updateBanners`
- `getNews`, `updateNews`, `getStatusLabels`, `updateStatusLabels`

### adminUsers.ts (12 وظيفة)

- `getAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser`
- `approveAdminUser`, `blockAdminUser`
- `getRoles`, `createRole`, `updateRole`, `deleteRole`
- `getPermissions`, `assignRoleToUser`, `removeRoleFromUser`

### orders.ts (10 وظائف)

- `getAllOrders`, `getOrderById`, `createOrder`, `updateOrderStatus`
- `cancelOrder`, `getMyOrders`, `getOrders`, `getOrderStats`
- `deleteOrder`, `getOrderHistory`

### notifications.ts (10 وظائف)

- `getNotificationsForUser`, `getAllNotifications`, `markNotificationAsRead`
- `markAllNotificationsAsRead`, `markNotificationsAsRead`
- `clearNotificationsForUser`, `deleteNotification`, `createNotification`
- `notifyAdmins`, `getUnreadNotificationCount`

### activity.ts (10 وظائف)

- `recordActivity`, `getActivityLogs`, `getActivityLogsFiltered`
- `getCustomerActivityLogs`, `getOnlineUsers`, `getOnlineUsersGrouped`
- `recordHeartbeat`, `updateUserLastActivity`, `getActivityStats`, `logActivityExtended`

### products.ts (7 وظائف)

- `searchProducts`, `getProductById`, `getAllProducts`
- `createProduct`, `updateProduct`, `deleteProduct`, `getProductAlternatives`

### suppliers.ts (7 وظائف)

- `getSupplierProducts`, `getSupplierStats`, `getSupplierById`
- `updateSupplierProfile`, `addSupplierProduct`, `updateSupplierProduct`, `getAllSuppliers`

### userManagement.ts (7 وظائف)

- `getPendingUsers`, `approveUser`, `rejectUser`
- `blockUser`, `unblockUser`, `suspendUser`, `updateUserPassword`

### quotes.ts (6 وظائف)

- `getAllQuoteRequests`, `getMyQuoteRequests`, `createQuoteRequest`
- `getQuoteById`, `updateQuoteStatus`, `getQuotes`

### auth.ts (4 وظائف)

- `checkHealth`, `login`, `logout`, `getCurrentSession`

### reports.ts (3 وظائف)

- `getReports`, `generateReport`, `getReportById`

### dashboard.ts (2 وظيفة)

- `getDashboardStats`, `getSupplierDashboardStats`

### ai.ts (2 وظيفة)

- `getAiSuggestions`, `processAiQuery`

### images.ts (2 وظيفة)

- `uploadImage`, `deleteImage`

### currency.ts (2 وظيفة)

- `getExchangeRates`, `updateExchangeRates`

---

## ✅ خطوات إضافة Endpoint جديد

### 1. حدد الـ Module المناسب

### 2. أضف الوظيفة في الـ Module

```typescript
// src/services/api/modules/customers.ts
import { get, post, put, del } from "../../apiClient";

export async function myNewFunction(param: string) {
  const result = await get(`/customers/${param}/data`);
  return (result as any)?.data || null;
}
```

### 3. أضف delegate في api.ts

```typescript
// src/services/api.ts
myNewFunction: CustomersModule.myNewFunction,
```

### 4. تأكد من re-export في index.ts

```typescript
// src/services/api/modules/index.ts
export * from "./customers"; // موجود بالفعل
```

### 5. شغل التحقق

```bash
npm run verify  # يشغل: check:deps + typecheck + build
```

---

## 🚫 قواعد صارمة

### ❌ ممنوع:

- تعديل implementations في api.ts مباشرة
- استيراد api.ts داخل أي module (circular)
- تغيير response shape لوظيفة موجودة
- استخدام fetch مباشرة (استخدم get/post/put/del)

### ✅ مسموح:

- إضافة وظائف جديدة في modules
- إضافة modules جديدة
- إضافة delegates في api.ts

---

## 📚 مراجع

- [DO_NOT_EDIT_API_TS.md](./DO_NOT_EDIT_API_TS.md)
- [MAINTENANCE_CHECKLIST.md](./MAINTENANCE_CHECKLIST.md)
