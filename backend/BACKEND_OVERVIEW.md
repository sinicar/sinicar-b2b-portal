# SINI CAR B2B Backend - Developer Guide

## ⚠️ ملاحظة هامة

**هذا هيكل (Skeleton) جاهز للتطوير** - جميع الـ endpoints تحتوي على TODO placeholders تحتاج لاستبدالها بمنطق Prisma الفعلي. الهيكل يوفر:
- تنظيم الملفات والمجلدات
- تعريف الـ Routes والـ Middleware
- مخطط قاعدة البيانات الكامل (Prisma Schema)
- توثيق شامل للمطورين

---

## 📋 نظرة عامة

هذا المجلد يحتوي على هيكل Backend جاهز للتطوير باستخدام:
- **Node.js + Express** - إطار العمل
- **TypeScript** - لغة البرمجة
- **Prisma** - ORM للتعامل مع قاعدة البيانات
- **SQLite** - قاعدة البيانات (قابلة للتبديل إلى PostgreSQL)
- **JWT** - للمصادقة والجلسات

---

## 🚀 البدء السريع

```bash
# 1. الانتقال لمجلد Backend
cd backend

# 2. تثبيت المكتبات
npm install

# 3. إنشاء ملف البيئة
cp .env.example .env

# 4. إنشاء قاعدة البيانات
npx prisma generate
npx prisma db push

# 5. تشغيل الخادم
npm run dev
```

---

## 📁 هيكل المشروع

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # إعدادات البيئة
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts  # المصادقة والصلاحيات
│   │
│   ├── modules/
│   │   ├── auth/               # تسجيل الدخول والخروج
│   │   ├── organizations/      # إدارة الفرق والمنظمات
│   │   ├── customers/          # إدارة العملاء
│   │   ├── orders/             # الطلبات وعروض الأسعار
│   │   ├── installments/       # نظام التقسيط
│   │   ├── suppliers/          # سوق الموردين
│   │   ├── ads/                # نظام الإعلانات
│   │   └── tools/              # أدوات التاجر والمسوقين
│   │
│   ├── prisma/
│   │   └── schema.prisma       # مخطط قاعدة البيانات
│   │
│   ├── routes/
│   │   └── index.ts            # توجيه API الرئيسي
│   │
│   ├── utils/
│   │   └── response.ts         # مساعدات الاستجابة
│   │
│   └── server.ts               # نقطة البداية
│
├── package.json
├── tsconfig.json
├── .env.example
└── BACKEND_OVERVIEW.md
```

---

## 🔌 API Endpoints

### Authentication `/api/v1/auth`
| Method | Endpoint | Auth Required | الوصف |
|--------|----------|---------------|-------|
| POST | `/login` | ❌ | تسجيل الدخول |
| POST | `/register` | ❌ | إنشاء حساب جديد |
| POST | `/logout` | ✅ | تسجيل الخروج |
| GET | `/me` | ✅ | الحصول على بيانات المستخدم |
| POST | `/refresh-token` | ❌ | تجديد رمز الدخول (يتطلب refreshToken في body) |
| POST | `/forgot-password` | ❌ | طلب استعادة كلمة المرور |
| POST | `/reset-password` | ❌ | إعادة تعيين كلمة المرور |

### Organizations `/api/v1/organizations`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/` | قائمة المنظمات |
| GET | `/:id` | تفاصيل منظمة |
| POST | `/` | إنشاء منظمة |
| PUT | `/:id` | تحديث منظمة |
| DELETE | `/:id` | حذف منظمة |
| GET | `/:id/users` | أعضاء المنظمة |
| POST | `/:id/users` | إضافة عضو |
| POST | `/:id/invitations` | إرسال دعوة |
| GET | `/:id/activity-logs` | سجل النشاط |

### Customers `/api/v1/customers`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/` | قائمة العملاء (Admin) |
| GET | `/:id` | تفاصيل عميل |
| PUT | `/:id/status` | تحديث حالة العميل |
| PUT | `/:id/price-level` | تحديث مستوى السعر |
| GET | `/:id/branches` | فروع العميل |
| GET | `/account-requests` | طلبات فتح الحساب |
| POST | `/account-requests` | طلب فتح حساب |

### Orders `/api/v1/orders`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/` | جميع الطلبات |
| GET | `/my-orders` | طلباتي |
| POST | `/` | إنشاء طلب |
| PUT | `/:id/status` | تحديث الحالة |
| PUT | `/:id/internal-status` | الحالة الداخلية |
| GET | `/quotes` | عروض الأسعار |
| POST | `/quotes` | طلب عرض سعر |

### Installments `/api/v1/installments`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/` | طلبات التقسيط |
| GET | `/my-requests` | طلباتي |
| POST | `/` | طلب تقسيط جديد |
| PUT | `/:id/sinicar-decision` | قرار SINICAR |
| PUT | `/:id/forward-to-suppliers` | تحويل للموردين |
| GET | `/:id/offers` | العروض المقدمة |
| POST | `/:id/offers` | تقديم عرض |
| GET | `/settings` | الإعدادات |
| GET | `/stats` | الإحصائيات |

### Suppliers `/api/v1/suppliers`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/` | قائمة الموردين |
| POST | `/register` | التسجيل كمورد |
| GET | `/:id/catalog` | كتالوج المورد |
| POST | `/:id/catalog` | إضافة منتج |
| POST | `/:id/catalog/bulk` | إضافة منتجات متعددة |
| GET | `/marketplace/search` | البحث في السوق |
| GET | `/settings` | إعدادات السوق |

### Ads `/api/v1/ads`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/slots` | أماكن الإعلانات |
| POST | `/slots` | إنشاء مكان |
| GET | `/advertisers` | المعلنين |
| POST | `/advertisers` | إنشاء معلن |
| GET | `/campaigns` | الحملات |
| POST | `/campaigns` | إنشاء حملة |
| PUT | `/:id/status` | تحديث حالة الحملة |
| POST | `/:id/track-impression` | تتبع الظهور |
| POST | `/:id/track-click` | تتبع النقر |

### Tools `/api/v1/trader-tools`
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/configs` | إعدادات الأدوات |
| GET | `/usage` | سجل الاستخدام |
| POST | `/price-comparison/session` | جلسة مقارنة أسعار |
| POST | `/vin-extraction` | استخراج VIN |
| POST | `/pdf-to-excel` | تحويل PDF |
| GET | `/marketers` | المسوقين |
| POST | `/marketers` | تسجيل مسوق |
| GET | `/:id/commissions` | عمولات المسوق |

---

## 🗃️ نموذج البيانات (Prisma Schema)

### الكيانات الرئيسية:

1. **User** - المستخدمين (عملاء، موظفين، مدراء)
2. **BusinessProfile** - الملف التجاري للعميل
3. **Branch** - فروع العميل
4. **Organization** - المنظمات (فرق العمل)
5. **OrganizationUser** - أعضاء المنظمة
6. **TeamInvitation** - دعوات الانضمام
7. **Product** - المنتجات (قطع الغيار)
8. **Order** - الطلبات
9. **QuoteRequest** - طلبات عروض الأسعار
10. **AccountOpeningRequest** - طلبات فتح الحساب
11. **InstallmentRequest** - طلبات التقسيط
12. **InstallmentOffer** - عروض التقسيط
13. **SupplierProfile** - ملفات الموردين
14. **SupplierCatalogItem** - كتالوج المورد
15. **Advertiser** - المعلنين
16. **AdSlot** - أماكن الإعلانات
17. **AdCampaign** - الحملات الإعلانية
18. **Marketer** - المسوقين بالعمولة
19. **CustomerReferral** - الإحالات
20. **MarketerCommission** - العمولات
21. **ToolConfig** - إعدادات أدوات التاجر
22. **CustomerToolsOverride** - استثناءات الأدوات للعملاء
23. **ToolUsageRecord** - سجل استخدام الأدوات
24. **SupplierPriceRecord** - سجلات أسعار الموردين (PDF to Excel)
25. **VinExtractionRecord** - سجلات استخراج VIN
26. **PriceComparisonSession** - جلسات مقارنة الأسعار
27. **SupplierMarketplaceSettings** - إعدادات سوق الموردين
28. **MarketerSettings** - إعدادات المسوقين
29. **InstallmentSettings** - إعدادات التقسيط

---

## 🔐 المصادقة والصلاحيات

### أنواع المستخدمين:
- `SUPER_ADMIN` - مدير النظام
- `CUSTOMER_OWNER` - صاحب الحساب التجاري
- `CUSTOMER_STAFF` - موظف العميل

### Middleware المتوفر:
```typescript
// التحقق من تسجيل الدخول
authMiddleware(req, res, next)

// صلاحيات المدير فقط
adminOnly(req, res, next)

// صلاحيات المالك أو المدير
ownerOrAdmin(req, res, next)
```

---

## 📝 خطوات التطوير

### 1. تنفيذ Auth Module
```typescript
// backend/src/modules/auth/auth.routes.ts
// TODO: استبدال الـ TODO بـ Prisma queries
```

### 2. تنفيذ CRUD للكيانات
كل ملف routes يحتوي على `TODO` يجب استبداله بـ Prisma operations:

```typescript
// مثال على تنفيذ حقيقي
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true }
    });
    successResponse(res, users);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
});
```

### 3. إضافة Validation
استخدم Zod للتحقق من البيانات:

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^05\d{8}$/),
  password: z.string().min(6)
});

router.post('/', async (req, res) => {
  const validation = createUserSchema.safeParse(req.body);
  if (!validation.success) {
    return validationError(res, validation.error.flatten().fieldErrors);
  }
  // ... continue
});
```

---

## 🔗 الربط مع Frontend

### تحويل من Mock إلى REST:
```typescript
// في src/services/apiConfig.ts
export const API_MODE: ApiMode = 'rest'; // بدلاً من 'mock'

// في src/services/realApi.ts
// يحتوي على الـ API calls الجاهزة للاستخدام
```

---

## 🧪 الاختبار

```bash
# اختبار Health Check
curl http://localhost:3001/health

# اختبار Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"clientId": "TEST001", "password": "123456"}'
```

---

## 📌 ملاحظات مهمة

1. **SQLite → PostgreSQL**: لتغيير قاعدة البيانات، عدّل `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **JWT Secret**: استخدم secret قوي في الإنتاج

3. **CORS**: عدّل `CORS_ORIGIN` في `.env` للإنتاج

4. **Rate Limiting**: أضف rate limiting قبل النشر

5. **File Upload**: أضف multer للتعامل مع الملفات

---

## 📞 الدعم

للأسئلة أو المشاكل، راجع:
- `/docs/TECHNICAL_DOCUMENTATION.md` - التوثيق التقني الشامل
- `/docs/README_API.md` - توثيق API المفصل
- `/src/types.ts` - تعريفات الأنواع الكاملة
