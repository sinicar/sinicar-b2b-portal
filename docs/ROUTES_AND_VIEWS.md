# دليل الصفحات والتنقل

## 🗺 خريطة البوابات

```
App.tsx
├── Login Page (unauthenticated)
├── AdminDashboard (role: SUPER_ADMIN)
├── SupplierPortal (role: SUPPLIER)
└── Dashboard (role: CUSTOMER_OWNER, CUSTOMER_STAFF)
```

## 📱 بوابة العملاء (Dashboard.tsx)

### الصفحات المتاحة:

| View            | الوصف              | المسار              |
| --------------- | ------------------ | ------------------- |
| HOME            | الصفحة الرئيسية    | DynamicHomePage     |
| ORDERS          | طلباتي             | OrdersPage          |
| QUOTE_REQUEST   | طلب عرض سعر        | QuoteRequestPage    |
| ORGANIZATION    | إدارة المنشأة      | OrganizationPage    |
| ABOUT           | عن الشركة          | AboutPage           |
| HISTORY         | سجل البحث          | (inline)            |
| IMPORT_CHINA    | الاستيراد من الصين | ImportFromChinaPage |
| TRADER_TOOLS    | أدوات التاجر       | TraderToolsHub      |
| TOOLS_HISTORY   | سجل الأدوات        | TraderToolsHistory  |
| TEAM_MANAGEMENT | إدارة الفريق       | TeamManagementPage  |
| ALTERNATIVES    | بدائل الأصناف      | AlternativesPage    |
| PRODUCT_SEARCH  | الطلبات السريعة    | ProductSearchPage   |
| NOTIFICATIONS   | الإشعارات          | NotificationsPage   |

### التنقل:

```typescript
const [view, setView] = useState<ViewType>("HOME");
// التنقل عبر handleSetView(newView)
```

## 🏢 بوابة المورد (SupplierPortal.tsx)

### الصفحات المتاحة:

| View        | الوصف           |
| ----------- | --------------- |
| DASHBOARD   | لوحة التحكم     |
| PRODUCTS    | إدارة المنتجات  |
| ORDERS      | الطلبات الواردة |
| ASSIGNMENTS | التكليفات       |
| QUOTES      | طلبات الأسعار   |
| ANALYTICS   | التقارير        |
| SETTINGS    | الإعدادات       |

## 👨‍💼 بوابة الإدارة (AdminDashboard.tsx)

### الصفحات المتاحة:

| View           | الوصف          |
| -------------- | -------------- |
| COMMAND_CENTER | مركز القيادة   |
| CUSTOMERS      | إدارة العملاء  |
| ORDERS         | إدارة الطلبات  |
| PRODUCTS       | إدارة المنتجات |
| SUPPLIERS      | إدارة الموردين |
| QUOTES         | عروض الأسعار   |
| ASSIGNMENTS    | مركز التكليفات |
| REPORTS        | التقارير       |
| SETTINGS       | الإعدادات      |
| AI_CENTER      | مركز AI        |
| ... وغيرها     |

## 🔐 التحكم في الوصول (Role-Based)

```typescript
// App.tsx
if (currentUser.role === "SUPER_ADMIN") {
  return <AdminDashboard />;
}
if (currentUser.role === "SUPPLIER" || currentUser.isSupplier) {
  return <SupplierPortal />;
}
return <Dashboard />; // Customer
```

## 📝 إضافة صفحة جديدة

1. أنشئ Component في `components/`
2. أضف View type في Dashboard.tsx
3. أضف الـ routing في render
4. أضف العنصر في Sidebar

```typescript
// 1. types
type View = "..." | "MY_NEW_PAGE";

// 2. render
{
  view === "MY_NEW_PAGE" && <MyNewPage />;
}

// 3. sidebar
<SidebarItem label="صفحتي" onClick={() => setView("MY_NEW_PAGE")} />;
```
