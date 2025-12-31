# خريطة API Surface

> تم توليدها تلقائياً - 30 ديسمبر 2025

## 📊 إحصائيات

- **إجمالي الملف**: 4063 سطر
- **عدد الوظائف**: ~150 وظيفة
- **الـ Domains**: 12 domain

---

## 🔐 Auth (المصادقة)

| الوظيفة               | الـ Endpoint      | الوصف          |
| --------------------- | ----------------- | -------------- |
| `checkHealth()`       | GET /health       | فحص الصحة      |
| `login()`             | POST /auth/login  | تسجيل الدخول   |
| `logout()`            | POST /auth/logout | تسجيل الخروج   |
| `getCurrentSession()` | GET /auth/me      | الجلسة الحالية |

---

## 📦 Orders (الطلبات)

| الوظيفة               | الـ Endpoint             | الوصف        |
| --------------------- | ------------------------ | ------------ |
| `getAllOrders()`      | GET /orders              | جميع الطلبات |
| `getMyOrders()`       | GET /orders/my-orders    | طلباتي       |
| `getOrders()`         | GET /orders/my-orders    | طلبات العميل |
| `getOrderById()`      | GET /orders/:id          | طلب بـ ID    |
| `createOrder()`       | POST /orders             | إنشاء طلب    |
| `updateOrderStatus()` | PATCH /orders/:id/status | تحديث الحالة |
| `cancelOrder()`       | PATCH /orders/:id/cancel | إلغاء        |
| `deleteOrder()`       | DELETE /orders/:id       | حذف          |
| `getOrderHistory()`   | GET /orders/:id/history  | السجل        |
| `getOrderStats()`     | GET /orders/stats        | الإحصائيات   |

---

## 🏷 Products (المنتجات)

| الوظيفة            | الـ Endpoint         | الوصف      |
| ------------------ | -------------------- | ---------- |
| `searchProducts()` | GET /products/search | بحث        |
| `getProductById()` | GET /products/:id    | منتج بـ ID |

---

## 👥 Customers (العملاء)

| الوظيفة                        | الـ Endpoint                         | الوصف           |
| ------------------------------ | ------------------------------------ | --------------- |
| `getAllUsers()`                | GET /users                           | جميع المستخدمين |
| `getCustomersDatabase()`       | GET /customers                       | قاعدة العملاء   |
| `getCustomerById()`            | GET /customers/:id                   | عميل بـ ID      |
| `createCustomerFromAdmin()`    | POST /customers                      | إنشاء عميل      |
| `updateCustomerStatus()`       | PATCH /customers/:id/status          | تحديث الحالة    |
| `updateCustomerProfileAdmin()` | PATCH /customers/:id                 | تحديث الملف     |
| `addCustomerSearchPoints()`    | POST /customers/:id/points/add       | إضافة نقاط      |
| `deductCustomerSearchPoints()` | POST /customers/:id/points/deduct    | خصم نقاط        |
| `getCustomerStats()`           | GET /customers/stats                 | الإحصائيات      |
| `addCustomerNote()`            | POST /customers/:id/notes            | إضافة ملاحظة    |
| `getCustomerNotes()`           | GET /customers/:id/notes             | الملاحظات       |
| `getCustomerOrdersSummary()`   | GET /customers/:id/orders-summary    | ملخص الطلبات    |
| `addBranch()`                  | POST /customers/:id/branches         | إضافة فرع       |
| `deleteBranch()`               | DELETE /customers/:id/branches/:bid  | حذف فرع         |
| `addEmployee()`                | POST /customers/:id/employees        | إضافة موظف      |
| `toggleEmployeeStatus()`       | PATCH /employees/:id/toggle          | تبديل الحالة    |
| `deleteEmployee()`             | DELETE /customers/:id/employees/:eid | حذف موظف        |
| `getAdminCustomers()`          | GET /admin/customers                 | عملاء CRM       |

---

## 🏭 Suppliers (الموردين)

| الوظيفة                   | الـ Endpoint                       | الوصف       |
| ------------------------- | ---------------------------------- | ----------- |
| `getSupplierProducts()`   | GET /suppliers/:id/products        | المنتجات    |
| `getSupplierStats()`      | GET /suppliers/:id/stats           | الإحصائيات  |
| `getSupplierById()`       | GET /suppliers/:id                 | مورد بـ ID  |
| `updateSupplierProfile()` | PATCH /suppliers/:id               | تحديث الملف |
| `addSupplierProduct()`    | POST /suppliers/:id/products       | إضافة منتج  |
| `updateSupplierProduct()` | PATCH /suppliers/:id/products/:pid | تحديث منتج  |

---

## 📋 Quotes (عروض الأسعار)

| الوظيفة                 | الـ Endpoint             | الوصف        |
| ----------------------- | ------------------------ | ------------ |
| `getAllQuoteRequests()` | GET /quotes              | جميع الطلبات |
| `getMyQuoteRequests()`  | GET /quotes/my-quotes    | طلباتي       |
| `createQuoteRequest()`  | POST /quotes             | إنشاء طلب    |
| `getQuoteById()`        | GET /quotes/:id          | طلب بـ ID    |
| `updateQuoteStatus()`   | PATCH /quotes/:id/status | تحديث الحالة |

---

## 🔔 Notifications (الإشعارات)

| الوظيفة                        | الـ Endpoint                            | الوصف            |
| ------------------------------ | --------------------------------------- | ---------------- |
| `getNotificationsForUser()`    | GET /notifications/:userId              | إشعارات المستخدم |
| `getAllNotifications()`        | GET /notifications                      | جميع الإشعارات   |
| `markNotificationAsRead()`     | PATCH /notifications/:id/read           | تعليم كمقروء     |
| `markAllNotificationsAsRead()` | PATCH /notifications/read-all           | تعليم الكل       |
| `clearNotificationsForUser()`  | DELETE /notifications/:userId           | مسح الإشعارات    |
| `deleteNotification()`         | DELETE /notifications/:id               | حذف إشعار        |
| `createNotification()`         | POST /notifications                     | إنشاء إشعار      |
| `getUnreadNotificationCount()` | GET /notifications/:userId/unread-count | عدد غير المقروء  |

---

## ⚙️ Settings (الإعدادات)

| الوظيفة                | الـ Endpoint                       | الوصف          |
| ---------------------- | ---------------------------------- | -------------- |
| `getSettings()`        | GET /settings                      | جميع الإعدادات |
| `getSettingByKey()`    | GET /settings/:key                 | إعداد بـ key   |
| `updateSetting()`      | PATCH /settings/:key               | تحديث إعداد    |
| `updateSettings()`     | PATCH /settings                    | تحديث الكل     |
| `getFeatureFlags()`    | GET /settings/feature-flags        | الـ flags      |
| `updateFeatureFlag()`  | PATCH /settings/feature-flags/:key | تحديث flag     |
| `getQualityCodes()`    | GET /settings/quality-codes        | أكواد الجودة   |
| `getBrandCodes()`      | GET /settings/brand-codes          | أكواد الماركات |
| `getShippingMethods()` | GET /settings/shipping-methods     | طرق الشحن      |
| `getBanners()`         | GET /settings/banners              | البانرات       |
| `getNews()`            | GET /settings/news                 | الأخبار        |
| `getStatusLabels()`    | GET /settings/status-labels        | تسميات الحالات |

---

## 📊 Activity (السجلات)

| الوظيفة                     | الـ Endpoint                | الوصف               |
| --------------------------- | --------------------------- | ------------------- |
| `recordActivity()`          | POST /activity              | تسجيل نشاط          |
| `getActivityLogs()`         | GET /activity               | السجلات             |
| `getActivityLogsFiltered()` | GET /activity/filtered      | سجلات مفلترة        |
| `getCustomerActivityLogs()` | GET /customers/:id/activity | نشاط عميل           |
| `getOnlineUsers()`          | GET /activity/online        | المستخدمين المتصلين |
| `recordHeartbeat()`         | POST /activity/heartbeat    | تسجيل النبض         |
| `getActivityStats()`        | GET /activity/stats         | الإحصائيات          |

---

## 👔 Admin Users (مستخدمي الإدارة)

| الوظيفة             | الـ Endpoint            | الوصف      |
| ------------------- | ----------------------- | ---------- |
| `getAdminUsers()`   | GET /admin/users        | المستخدمين |
| `createAdminUser()` | POST /admin/users       | إنشاء      |
| `updateAdminUser()` | PATCH /admin/users/:id  | تحديث      |
| `deleteAdminUser()` | DELETE /admin/users/:id | حذف        |
| `getRoles()`        | GET /admin/roles        | الأدوار    |
| `createRole()`      | POST /admin/roles       | إنشاء دور  |
| `getPermissions()`  | GET /admin/permissions  | الصلاحيات  |

---

## 💳 Installments (الأقساط)

| الوظيفة                      | الـ Endpoint                | الوصف      |
| ---------------------------- | --------------------------- | ---------- |
| `getInstallmentRequests()`   | GET /installments/requests  | الطلبات    |
| `createInstallmentRequest()` | POST /installments/requests | إنشاء طلب  |
| `createInstallmentOffer()`   | POST /installments/offers   | إنشاء عرض  |
| `getInstallmentOffers()`     | GET /installments/offers    | العروض     |
| `getInstallmentStats()`      | GET /installments/stats     | الإحصائيات |

---

## 📈 Stats & Reports (الإحصائيات والتقارير)

| الوظيفة            | الـ Endpoint           | الوصف            |
| ------------------ | ---------------------- | ---------------- |
| `getAdminStats()`  | GET /admin/stats       | إحصائيات الإدارة |
| `getReports()`     | GET /reports           | التقارير         |
| `generateReport()` | POST /reports/generate | توليد تقرير      |

---

## ⏭ الخطة: تحويل api.ts إلى Facade

1. **الأولوية 1**: Orders + Products ✅ (موجود في modules/)
2. **الأولوية 2**: Customers + Suppliers
3. **الأولوية 3**: Settings + Notifications
4. **الأولوية 4**: Activity + Admin Users
5. **الأولوية 5**: Installments + Reports
