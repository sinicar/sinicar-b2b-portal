# خطة التنفيذ - تحسينات مشروع صيني كار

## نظرة عامة

خطة تنفيذ تدريجية لتحسين مشروع صيني كار B2B Portal بناءً على التحليل والتصميم.

---

## المهام

- [ ] 1. المرحلة الأولى: إعادة هيكلة الكود
  - [ ] 1.1 تقسيم ملف types.ts إلى ملفات منفصلة
    - إنشاء مجلد `src/types/` مع ملفات منفصلة لكل نوع
    - نقل الأنواع من `types.ts` إلى الملفات الجديدة
    - إنشاء `index.ts` لإعادة التصدير
    - _Requirements: 1.1_

  - [ ] 1.2 تقسيم ملف mockApi.ts إلى وحدات
    - إنشاء مجلد `src/services/mock-api/`
    - تقسيم الوظائف حسب المجال (auth, orders, products, etc.)
    - إنشاء ملف رئيسي للتصدير
    - _Requirements: 1.1_

  - [ ] 1.3 إضافة Error Boundaries
    - إنشاء مكون `ErrorBoundary.tsx`
    - إنشاء مكون `ErrorFallback.tsx`
    - تغليف المكونات الرئيسية بـ Error Boundaries
    - _Requirements: 1.2_

- [ ] 2. Checkpoint - التحقق من إعادة الهيكلة
  - التأكد من عمل التطبيق بشكل صحيح بعد التغييرات
  - اسأل المستخدم إذا كانت هناك أسئلة

- [ ] 3. المرحلة الثانية: تحسينات الأمان
  - [ ] 3.1 إضافة Rate Limiting للـ Backend
    - تثبيت `express-rate-limit`
    - إنشاء middleware للـ rate limiting
    - تطبيقه على routes الحساسة
    - _Requirements: 2.1_

  - [ ]* 3.2 كتابة اختبار Property لـ Rate Limiting
    - **Property 2: Rate Limiting يحد الطلبات**
    - **Validates: Requirements 2.1**

  - [ ] 3.3 إضافة Input Validation مع Zod
    - تثبيت `zod`
    - إنشاء schemas للتحقق من المدخلات
    - إنشاء middleware للتحقق
    - تطبيقه على جميع routes
    - _Requirements: 2.2_

  - [ ]* 3.4 كتابة اختبار Property لـ Input Validation
    - **Property 3: Input Validation يرفض المدخلات غير الصالحة**
    - **Validates: Requirements 2.2**

  - [ ] 3.5 إضافة CSRF Protection
    - إنشاء middleware لتوليد والتحقق من CSRF tokens
    - تطبيقه على طلبات POST/PUT/DELETE
    - تحديث Frontend لإرسال CSRF token
    - _Requirements: 2.3_

  - [ ]* 3.6 كتابة اختبار Property لـ CSRF Protection
    - **Property 4: CSRF Protection يمنع الطلبات غير المصرح بها**
    - **Validates: Requirements 2.3**

- [ ] 4. Checkpoint - التحقق من تحسينات الأمان
  - التأكد من عمل Rate Limiting
  - التأكد من عمل Input Validation
  - التأكد من عمل CSRF Protection
  - اسأل المستخدم إذا كانت هناك أسئلة

- [ ] 5. المرحلة الثالثة: إعداد الاختبارات
  - [ ] 5.1 إعداد بيئة الاختبار
    - تثبيت `vitest` و `@testing-library/react`
    - إنشاء ملف `vitest.config.ts`
    - إنشاء ملفات setup للاختبارات
    - _Requirements: 3.1_

  - [ ] 5.2 كتابة Unit Tests للخدمات الأساسية
    - اختبارات لـ `pricingEngine.ts`
    - اختبارات لـ `searchService.ts`
    - اختبارات لـ `toolsAccess.ts`
    - _Requirements: 3.2_

  - [ ] 5.3 إعداد Property-Based Testing
    - تثبيت `fast-check`
    - إنشاء generators للأنواع الأساسية
    - _Requirements: 3.3_

  - [ ]* 5.4 كتابة Property Tests لمحرك التسعير
    - **Property: السعر دائماً موجب**
    - **Property: الخصم لا يتجاوز السعر الأصلي**
    - **Validates: Requirements 3.2**

  - [ ] 5.5 كتابة Integration Tests للـ API
    - اختبارات لـ Authentication endpoints
    - اختبارات لـ Orders endpoints
    - اختبارات لـ Products endpoints
    - _Requirements: 3.4_

- [ ] 6. Checkpoint - التحقق من الاختبارات
  - تشغيل جميع الاختبارات والتأكد من نجاحها
  - اسأل المستخدم إذا كانت هناك أسئلة

- [ ] 7. المرحلة الرابعة: تحسينات الأداء
  - [ ] 7.1 تطبيق Code Splitting
    - استخدام `React.lazy` للمكونات الكبيرة
    - إنشاء مكون `PageLoader` للتحميل
    - تقسيم routes حسب الدور (admin, customer, supplier)
    - _Requirements: 4.1_

  - [ ] 7.2 إضافة React Query للتخزين المؤقت
    - تثبيت `@tanstack/react-query`
    - إنشاء `queryClient` مع الإعدادات
    - تحويل API calls لاستخدام `useQuery` و `useMutation`
    - _Requirements: 4.2_

  - [ ]* 7.3 كتابة اختبار Property لـ React Query Caching
    - **Property 6: React Query يخزن البيانات مؤقتاً**
    - **Validates: Requirements 4.2**

  - [ ] 7.4 إضافة Virtual Lists للقوائم الطويلة
    - تثبيت `@tanstack/react-virtual`
    - إنشاء مكون `VirtualList`
    - تطبيقه على قوائم المنتجات والطلبات
    - _Requirements: 4.3_

  - [ ] 7.5 تحسين تحميل الصور
    - إضافة lazy loading للصور
    - إضافة placeholder أثناء التحميل
    - ضغط الصور قبل الرفع
    - _Requirements: 4.4_

- [ ] 8. Checkpoint - التحقق من تحسينات الأداء
  - قياس أداء التطبيق قبل وبعد
  - التأكد من عمل Code Splitting
  - التأكد من عمل التخزين المؤقت
  - اسأل المستخدم إذا كانت هناك أسئلة

- [ ] 9. المرحلة الخامسة: تحسينات UX
  - [ ] 9.1 إضافة Skeleton Loading
    - إنشاء مكونات Skeleton للبطاقات والقوائم
    - تطبيقها أثناء تحميل البيانات
    - _Requirements: 5.1_

  - [ ] 9.2 تحسين معالجة الأخطاء في الواجهة
    - إنشاء مكون `ErrorMessage` موحد
    - إضافة retry buttons للأخطاء
    - تحسين رسائل الخطأ للمستخدم
    - _Requirements: 5.2_

  - [ ]* 9.3 كتابة اختبار Property لـ Error Handling
    - **Property 5: API Error Handling يعيد رسائل مناسبة**
    - **Validates: Requirements 5.2**

  - [ ] 9.4 إضافة Toast Notifications محسنة
    - تحسين مكون Toast الحالي
    - إضافة أنواع مختلفة (success, error, warning, info)
    - إضافة progress bar للإغلاق التلقائي
    - _Requirements: 5.3_

- [ ] 10. Checkpoint - التحقق من تحسينات UX
  - مراجعة تجربة المستخدم
  - التأكد من عمل جميع التحسينات
  - اسأل المستخدم إذا كانت هناك أسئلة

- [ ] 11. المرحلة السادسة: إكمال Real API
  - [ ] 11.1 مراجعة وإكمال Auth endpoints
    - التأكد من عمل login/logout
    - إضافة refresh token
    - إضافة password reset
    - _Requirements: 6.1_

  - [ ] 11.2 إكمال Orders endpoints
    - إكمال CRUD operations
    - إضافة status updates
    - إضافة order history
    - _Requirements: 6.2_

  - [ ] 11.3 إكمال Products endpoints
    - إكمال search functionality
    - إضافة filtering و pagination
    - إضافة product images
    - _Requirements: 6.3_

  - [ ] 11.4 إكمال Customers endpoints
    - إكمال customer management
    - إضافة customer approval workflow
    - إضافة customer statistics
    - _Requirements: 6.4_

- [ ] 12. Checkpoint النهائي
  - مراجعة شاملة للتغييرات
  - تشغيل جميع الاختبارات
  - التأكد من عمل التطبيق بالكامل
  - توثيق أي تغييرات إضافية

---

## ملاحظات

- المهام المعلمة بـ `*` اختيارية ويمكن تخطيها للحصول على MVP أسرع
- كل مهمة تشير إلى المتطلبات المحددة في وثيقة المتطلبات
- Checkpoints تضمن التحقق التدريجي من التغييرات
- Property tests تتحقق من خصائص الصحة العامة
