# دليل إعداد Supabase لمنصة صيني كار

## الخطوة 1: إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجّل دخول أو أنشئ حساب جديد
3. اضغط على **"New Project"**
4. أدخل:
   - **Name**: `sinicar-b2b`
   - **Database Password**: كلمة مرور قوية (احفظها!)
   - **Region**: اختر أقرب منطقة (مثل: Singapore أو Frankfurt)
5. اضغط **"Create new project"**
6. انتظر حتى يكتمل الإعداد (2-3 دقائق)

---

## الخطوة 2: نسخ مفاتيح API

1. من لوحة التحكم، اذهب إلى **Settings** → **API**
2. انسخ:
   - **Project URL** (مثال: `https://abcdefgh.supabase.co`)
   - **anon public key** (المفتاح العام)

---

## الخطوة 3: إنشاء الجداول

1. من لوحة التحكم، اذهب إلى **SQL Editor**
2. اضغط **"New Query"**
3. افتح ملف `supabase_schema.sql` من مجلد المشروع
4. انسخ كل محتوى الملف والصقه في SQL Editor
5. اضغط **"Run"** (أو Ctrl+Enter)
6. يجب أن ترى رسالة نجاح

> ⚠️ **ملاحظة**: إذا ظهرت أخطاء، تأكد من تشغيل الـ SQL كاملاً وليس جزءاً منه.

---

## الخطوة 4: تحديث إعدادات المشروع

### الطريقة 1: باستخدام ملف .env

1. انسخ ملف `.env.example` إلى `.env`:
   ```
   copy .env.example .env
   ```

2. افتح ملف `.env` وعدّل:
   ```
   VITE_API_MODE=supabase
   VITE_USE_SUPABASE=true
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### الطريقة 2: تعديل الملفات مباشرة

1. افتح `src/config/supabase.config.ts`
2. عدّل:
   ```typescript
   export const SUPABASE_URL = 'https://your-project.supabase.co';
   export const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

3. افتح `src/config/api.config.ts`
4. عدّل:
   ```typescript
   USE_MOCK_API: false,
   USE_SUPABASE: true,
   ```

---

## الخطوة 5: تشغيل الموقع

```bash
npm run dev
```

---

## التحقق من الاتصال

1. افتح المتصفح على `http://localhost:5173`
2. افتح Developer Tools (F12) → Console
3. يجب أن لا ترى أخطاء Supabase
4. جرّب تسجيل الدخول:
   - رقم العميل: `1`
   - كلمة المرور: `1`

---

## إضافة بيانات تجريبية

إذا أردت بيانات تجريبية، شغّل هذا SQL في SQL Editor:

```sql
-- إضافة منتج تجريبي
INSERT INTO products (part_number, name, brand, price_level_1, quantity)
VALUES ('TEST-001', 'فلتر زيت تجريبي', 'Test Brand', 5000, 100);
```

---

## التبديل بين الأوضاع

| الوضع | USE_MOCK_API | USE_SUPABASE |
|-------|--------------|--------------|
| Mock (تجريبي) | `true` | `false` |
| Supabase (حقيقي) | `false` | `true` |
| REST API | `false` | `false` |

---

## الدعم

إذا واجهت مشاكل:
1. تحقق من Console في المتصفح
2. تحقق من إعدادات Supabase
3. تأكد من أن الجداول تم إنشاؤها بنجاح
