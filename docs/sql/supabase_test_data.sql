-- =============================================================================
-- SiniCar B2B Portal - بيانات تجريبية شاملة
-- Complete Test Data for All User Types
-- =============================================================================

-- =====================================================
-- 1. المستخدم المشرف (Admin) - موجود مسبقاً
-- =====================================================
-- رقم العميل: 1 | كلمة المرور: 1

-- =====================================================
-- 2. عملاء (Customers) - محلات قطع غيار
-- =====================================================

-- عميل 1: محل قطع غيار في جدة
INSERT INTO users (client_id, customer_number, name, email, phone, password_hash, role, is_active)
VALUES ('CUST001', '100', 'محل النجم للقطع', 'alnajm@test.com', '0501234567', '123456', 'OWNER', true)
ON CONFLICT (client_id) DO NOTHING;

INSERT INTO business_profiles (user_id, business_name, customer_type, city, address, search_points, price_level, customer_status)
SELECT id, 'محل النجم لقطع غيار السيارات', 'محل قطع غيار', 'جدة', 'حي الصفا، شارع الأمير سلطان', 500, 'LEVEL_1', 'ACTIVE'
FROM users WHERE client_id = 'CUST001'
ON CONFLICT DO NOTHING;

-- عميل 2: ورشة صيانة في الرياض
INSERT INTO users (client_id, customer_number, name, email, phone, password_hash, role, is_active)
VALUES ('CUST002', '101', 'ورشة الخليج', 'alkhalij@test.com', '0559876543', '123456', 'OWNER', true)
ON CONFLICT (client_id) DO NOTHING;

INSERT INTO business_profiles (user_id, business_name, customer_type, city, address, search_points, price_level, customer_status)
SELECT id, 'ورشة الخليج للصيانة', 'مركز صيانة', 'الرياض', 'حي العليا، طريق الملك فهد', 300, 'LEVEL_2', 'ACTIVE'
FROM users WHERE client_id = 'CUST002'
ON CONFLICT DO NOTHING;

-- عميل 3: شركة تأجير في الدمام
INSERT INTO users (client_id, customer_number, name, email, phone, password_hash, role, is_active)
VALUES ('CUST003', '102', 'شركة السيارات الذهبية', 'golden@test.com', '0501112233', '123456', 'OWNER', true)
ON CONFLICT (client_id) DO NOTHING;

INSERT INTO business_profiles (user_id, business_name, customer_type, city, address, search_points, price_level, customer_status)
SELECT id, 'شركة السيارات الذهبية للتأجير', 'شركة تأجير سيارات', 'الدمام', 'حي الفيصلية', 1000, 'LEVEL_1', 'ACTIVE'
FROM users WHERE client_id = 'CUST003'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. موظفين (Staff/Employees)
-- =====================================================

-- موظف 1: مدير مبيعات
INSERT INTO users (client_id, customer_number, name, email, phone, password_hash, role, is_active, employee_role)
VALUES ('STAFF001', '200', 'أحمد المبيعات', 'ahmed.sales@test.com', '0551234567', '123456', 'STAFF', true, 'MANAGER')
ON CONFLICT (client_id) DO NOTHING;

-- موظف 2: محاسب
INSERT INTO users (client_id, customer_number, name, email, phone, password_hash, role, is_active, employee_role)
VALUES ('STAFF002', '201', 'سارة المحاسبة', 'sara.acc@test.com', '0559999888', '123456', 'STAFF', true, 'MANAGER')
ON CONFLICT (client_id) DO NOTHING;

-- موظف 3: مسؤول المستودع
INSERT INTO users (client_id, customer_number, name, email, phone, password_hash, role, is_active, employee_role)
VALUES ('STAFF003', '202', 'خالد المستودع', 'khaled.wh@test.com', '0557778899', '123456', 'STAFF', true, 'BUYER')
ON CONFLICT (client_id) DO NOTHING;

-- =====================================================
-- 4. موردين محليين (Local Suppliers)
-- =====================================================

INSERT INTO suppliers (code, name, name_en, type, is_local, contact_person, phone, email, city, rating, response_time_hours, is_active)
VALUES 
('SUP-LOCAL-001', 'مصنع الصناعات السعودية', 'Saudi Industries Factory', 'REGISTERED', true, 'محمد القحطاني', '0501234567', 'saudi.ind@test.com', 'الرياض', 4.5, 24, true),
('SUP-LOCAL-002', 'شركة التوريدات الوطنية', 'National Supplies Co', 'REGISTERED', true, 'عبدالله العتيبي', '0559876543', 'national@test.com', 'جدة', 4.2, 12, true),
('SUP-LOCAL-003', 'مؤسسة الأمانة للقطع', 'Al-Amana Parts Est', 'REGISTERED', true, 'فهد السعيد', '0551112233', 'amana@test.com', 'الدمام', 4.0, 48, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. موردين دوليين (International Suppliers)
-- =====================================================

INSERT INTO suppliers (code, name, name_en, type, is_local, contact_person, phone, email, city, rating, response_time_hours, is_active)
VALUES 
('SUP-INT-001', 'شركة قوانزو الصينية', 'Guangzhou Auto Parts Co', 'REGISTERED', false, 'Li Wei', '+8613812345678', 'guangzhou@test.com', 'قوانزو - الصين', 4.3, 72, true),
('SUP-INT-002', 'مصنع دبي للقطع', 'Dubai Parts Factory', 'REGISTERED', false, 'Ahmed Hassan', '+971501234567', 'dubai.parts@test.com', 'دبي - الإمارات', 4.6, 48, true),
('SUP-INT-003', 'شركة كوريا للسيارات', 'Korea Auto Corp', 'REGISTERED', false, 'Kim Sung', '+821012345678', 'korea.auto@test.com', 'سيول - كوريا', 4.8, 96, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 6. منتجات متنوعة (Products)
-- =====================================================

INSERT INTO products (part_number, name, brand, category, car_make, car_model, price_level_1, price_level_2, price_level_3, quantity, availability_type, is_active)
VALUES 
-- فلاتر
('FLT-OIL-001', 'فلتر زيت تويوتا كامري', 'DENSO', 'فلاتر', 'Toyota', 'Camry', 4500, 4200, 3900, 150, 'INSTOCK', true),
('FLT-OIL-002', 'فلتر زيت هيونداي النترا', 'MANN', 'فلاتر', 'Hyundai', 'Elantra', 3800, 3500, 3200, 200, 'INSTOCK', true),
('FLT-AIR-001', 'فلتر هواء هوندا أكورد', 'K&N', 'فلاتر', 'Honda', 'Accord', 8500, 8000, 7500, 80, 'INSTOCK', true),

-- فرامل
('BRK-PAD-001', 'طقم فحمات فرامل أمامي - كامري', 'BREMBO', 'فرامل', 'Toyota', 'Camry', 25000, 23000, 21000, 50, 'INSTOCK', true),
('BRK-DSK-001', 'قرص فرامل أمامي - سوناتا', 'BOSCH', 'فرامل', 'Hyundai', 'Sonata', 18000, 16500, 15000, 30, 'INSTOCK', true),

-- إضاءة
('LGT-HEAD-001', 'شمعة أمامية يسار - كورولا', 'DEPO', 'إضاءة', 'Toyota', 'Corolla', 45000, 42000, 39000, 20, 'INSTOCK', true),
('LGT-TAIL-001', 'شمعة خلفية يمين - اكسنت', 'TYC', 'إضاءة', 'Hyundai', 'Accent', 28000, 26000, 24000, 25, 'INSTOCK', true),

-- محركات
('ENG-SPARK-001', 'شمعات إشعال - 4 قطع', 'NGK', 'محركات', 'Universal', 'All', 12000, 11000, 10000, 100, 'INSTOCK', true),
('ENG-BELT-001', 'سير توقيت كيا سورينتو', 'GATES', 'محركات', 'Kia', 'Sorento', 35000, 32000, 29000, 15, 'ORDER_PRODUCT', true),

-- تعليق
('SUS-SHOCK-001', 'ممتص صدمات أمامي - راف فور', 'KYB', 'تعليق', 'Toyota', 'RAV4', 55000, 51000, 47000, 10, 'INSTOCK', true),
('SUS-ARM-001', 'ذراع تحكم علوي - أكورد', 'MOOG', 'تعليق', 'Honda', 'Accord', 32000, 29000, 26000, 8, 'ORDER_PRODUCT', true),

-- طلبية (منتجات بوقت توصيل)
('ORD-BUMPER-001', 'صدام أمامي كامل - ألتيما', 'AFTERMARKET', 'هيكل', 'Nissan', 'Altima', 85000, 80000, 75000, 0, 'ORDER_PRODUCT', true),
('ORD-HOOD-001', 'غطاء محرك - لانسر', 'OEM', 'هيكل', 'Mitsubishi', 'Lancer', 120000, 115000, 110000, 0, 'ORDER_PRODUCT', true)
ON CONFLICT DO NOTHING;

-- تحديث delivery_hours للمنتجات الطلبية
UPDATE products SET delivery_hours = 72 WHERE availability_type = 'ORDER_PRODUCT';

-- =====================================================
-- 7. طلبات تجريبية (Orders)
-- =====================================================

-- طلب 1: طلب مكتمل
INSERT INTO orders (order_number, user_id, status, subtotal, total_amount, delivery_city, notes)
SELECT 'ORD-2024-001', id, 'DELIVERED', 6800000, 6800000, 'جدة', 'طلب مكتمل - تم التوصيل'
FROM users WHERE client_id = 'CUST001'
ON CONFLICT (order_number) DO NOTHING;

-- طلب 2: قيد المعالجة
INSERT INTO orders (order_number, user_id, status, subtotal, total_amount, delivery_city, notes)
SELECT 'ORD-2024-002', id, 'PROCESSING', 4300000, 4300000, 'الرياض', 'طلب قيد التجهيز'
FROM users WHERE client_id = 'CUST002'
ON CONFLICT (order_number) DO NOTHING;

-- طلب 3: جديد
INSERT INTO orders (order_number, user_id, status, subtotal, total_amount, delivery_city, notes)
SELECT 'ORD-2024-003', id, 'PENDING', 2500000, 2500000, 'الدمام', 'طلب جديد ينتظر المراجعة'
FROM users WHERE client_id = 'CUST003'
ON CONFLICT (order_number) DO NOTHING;

-- =====================================================
-- 8. طلبات أسعار (Quote Requests)
-- =====================================================

INSERT INTO quote_requests (request_number, user_id, status, notes)
SELECT 'QR-2024-001', id, 'PENDING', 'طلب تسعير قطع غيار متعددة'
FROM users WHERE client_id = 'CUST001'
ON CONFLICT (request_number) DO NOTHING;

INSERT INTO quote_requests (request_number, user_id, status, notes)
SELECT 'QR-2024-002', id, 'QUOTED', 'تم التسعير - بانتظار موافقة العميل'
FROM users WHERE client_id = 'CUST002'
ON CONFLICT (request_number) DO NOTHING;

-- =====================================================
-- 9. طلبات استيراد (Import Requests)
-- =====================================================

INSERT INTO import_requests (request_number, user_id, status, description)
SELECT 'IMP-2024-001', id, 'PENDING', 'طلب استيراد 500 فلتر زيت من الصين'
FROM users WHERE client_id = 'CUST003'
ON CONFLICT (request_number) DO NOTHING;

-- =====================================================
-- 10. إشعارات تجريبية (Notifications)
-- =====================================================

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT id, 'ORDER_STATUS', 'تم تحديث طلبك', 'تم شحن طلبك رقم ORD-2024-001', false
FROM users WHERE client_id = 'CUST001';

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT id, 'QUOTE_READY', 'عرض السعر جاهز', 'تم تسعير طلبك رقم QR-2024-002', false
FROM users WHERE client_id = 'CUST002';

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT id, 'SYSTEM', 'مرحباً بك', 'مرحباً بك في منصة صيني كار للأعمال', true
FROM users WHERE role = 'OWNER';

-- =====================================================
-- 11. طلبات فتح حساب (Account Opening Requests)
-- =====================================================

INSERT INTO account_requests (category, status, business_name, full_name, phone, email, city, cr_number)
VALUES 
('SPARE_PARTS_SHOP', 'PENDING', 'محل المستقبل للقطع', 'سعد الغامدي', '0501234567', 'future@test.com', 'مكة', '1234567890'),
('MAINTENANCE_CENTER', 'APPROVED', 'مركز الإتقان', 'ماجد الأحمدي', '0559876543', 'etqan@test.com', 'المدينة', '0987654321'),
('RENTAL_COMPANY', 'REJECTED', 'شركة السفر', 'ياسر السالم', '0551112233', 'travel@test.com', 'الطائف', '1122334455')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ملخص بيانات الاختبار
-- =====================================================
/*
المستخدمين:
-----------
| رقم العميل | الاسم | النوع | كلمة المرور |
|------------|-------|-------|-------------|
| 1 | مدير النظام | Admin | 1 |
| 100 | محل النجم | عميل | 123456 |
| 101 | ورشة الخليج | عميل | 123456 |
| 102 | السيارات الذهبية | عميل | 123456 |
| 200 | أحمد المبيعات | موظف | 123456 |
| 201 | سارة المحاسبة | موظف | 123456 |
| 202 | خالد المستودع | موظف | 123456 |

الموردين:
---------
- 3 موردين محليين (الرياض، جدة، الدمام)
- 3 موردين دوليين (الصين، الإمارات، كوريا)

المنتجات:
---------
- 13 منتج متنوع (فلاتر، فرامل، إضاءة، محركات، تعليق، هيكل)
- منتجات متوفرة ومنتجات طلبية

الطلبات:
--------
- 3 طلبات بحالات مختلفة (مكتمل، قيد المعالجة، جديد)
- 2 طلبات تسعير
- 1 طلب استيراد
- 3 طلبات فتح حساب
*/
