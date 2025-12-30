# Supplier Portal Architecture Map

خريطة بوابة المورد للمطورين

---

## 📁 موقع الملفات

```
src/features/supplier/
├── index.ts                    # Barrel exports
├── types.ts                    # Shared types
├── views/
│   ├── index.ts                # Views barrel
│   ├── SupplierDashboardView.tsx
│   ├── SupplierProductsView.tsx
│   └── SupplierPurchaseOrdersView.tsx
└── components/
    ├── index.ts                # Components barrel
    ├── SupplierSidebarItem.tsx
    ├── SupplierStatCard.tsx
    └── SupplierPortalHeader.tsx
```

---

## 🔍 وصف الـ Views

| View                           | المسار                                 | الوظيفة                                                  |
| ------------------------------ | -------------------------------------- | -------------------------------------------------------- |
| **SupplierDashboardView**      | `views/SupplierDashboardView.tsx`      | لوحة التحكم الرئيسية: إحصائيات، طلبات أخيرة، أزرار سريعة |
| **SupplierProductsView**       | `views/SupplierProductsView.tsx`       | إدارة المنتجات: بحث، إضافة، تعديل، حذف، استيراد/تصدير    |
| **SupplierPurchaseOrdersView** | `views/SupplierPurchaseOrdersView.tsx` | أوامر الشراء: عرض، تحديث الحالة                          |

---

## ➕ أين تضيف UI جديد؟

### إضافة View جديد

1. أنشئ ملف في `src/features/supplier/views/YourNewView.tsx`
2. أضف export في `views/index.ts`
3. أضف الـ view في switch case في `SupplierPortal.tsx`

### إضافة Component مشترك

1. أنشئ ملف في `src/features/supplier/components/YourComponent.tsx`
2. أضف export في `components/index.ts`

---

## ✅ قائمة فحص Regression

قبل كل commit، تأكد من:

- [ ] `npm run build` ناجح
- [ ] Dashboard يحمّل بشكل صحيح
- [ ] Products view يعمل (بحث، إضافة)
- [ ] Purchase Orders يعرض الطلبات

---

## 📚 ملفات ذات صلة

- [ROUTES_AND_VIEWS.md](./ROUTES_AND_VIEWS.md) — خريطة كل الـ routes
- [MAINTENANCE_CHECKLIST.md](./MAINTENANCE_CHECKLIST.md) — قائمة الصيانة
