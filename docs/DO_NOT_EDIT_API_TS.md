# ⚠️ DO NOT EDIT api.ts DIRECTLY

## القاعدة الذهبية

**ملف `src/services/api.ts` هو facade فقط** - جميع التنفيذات يجب أن تكون في `src/services/api/modules/`.

---

## لماذا هذه القاعدة؟

1. **api.ts = 335 سطر فقط** - تم تقليصه من 4063 سطر
2. **سهولة الصيانة** - كل domain في ملف منفصل
3. **تجنب conflicts** - المطورين يعملون على modules مختلفة
4. **testability** - يمكن اختبار كل module بشكل مستقل

---

## كيف أضيف endpoint جديد؟

### 1. حدد الـ Module المناسب

| Domain           | Module                                 |
| ---------------- | -------------------------------------- |
| العملاء          | `customers.ts`                         |
| الطلبات          | `orders.ts`                            |
| المنتجات         | `products.ts`                          |
| الموردين         | `suppliers.ts`                         |
| الإشعارات        | `notifications.ts`                     |
| الإعدادات        | `settings.ts`                          |
| الأقساط          | `installments.ts`                      |
| المستخدمين       | `userManagement.ts` أو `adminUsers.ts` |
| التقارير         | `reports.ts`                           |
| لوحة المعلومات   | `dashboard.ts`                         |
| الذكاء الاصطناعي | `ai.ts`                                |
| الصور            | `images.ts`                            |
| العملات          | `currency.ts`                          |
| النشاط           | `activity.ts`                          |
| عروض الأسعار     | `quotes.ts`                            |

### 2. أضف الوظيفة في الـ Module

```typescript
// src/services/api/modules/customers.ts

export async function myNewFunction(param: string) {
  const result = await get(`/customers/${param}/data`);
  return (result as any)?.data || null;
}
```

### 3. أضف delegate في api.ts

```typescript
// src/services/api.ts

import * as CustomersModule from "./api/modules/customers";

const RealApiAdapter = {
  // ...existing...
  myNewFunction: CustomersModule.myNewFunction,
};
```

### 4. تأكد من re-export في index.ts

```typescript
// src/services/api/modules/index.ts
export * from "./customers";
```

---

## ❌ ما لا يجب فعله

- ❌ إضافة implementations مباشرة في api.ts
- ❌ استيراد api.ts داخل أي module (circular dependency)
- ❌ استخدام fetch مباشرة - استخدم `get/post/put/del` من `apiClient`

---

## ✅ ما يجب فعله

- ✅ إضافة الوظائف في الـ module المناسب
- ✅ تشغيل `npm run build` بعد كل تغيير
- ✅ التحقق أن الوظيفة مصدّرة في `modules/index.ts`

---

## مراجع

- [API_CONTRIBUTIONS.md](./API_CONTRIBUTIONS.md)
- [MAINTENANCE_CHECKLIST.md](./MAINTENANCE_CHECKLIST.md)
