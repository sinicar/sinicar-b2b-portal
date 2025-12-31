عندما -- ============================================================
-- 🚀 صيني كار - إعداد قاعدة البيانات الكامل
-- ============================================================
-- انسخ هذا الكود كاملاً والصقه في Supabase SQL Editor واضغط Run
-- ============================================================

-- 1. حذف الجداول القديمة (إذا وجدت)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- 2. إنشاء جدول المستخدمين
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_number TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول الملفات التجارية
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    customer_type TEXT DEFAULT 'RETAIL',
    price_level INTEGER DEFAULT 1,
    city TEXT,
    address TEXT,
    credit_limit DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء جدول المنتجات
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number TEXT,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    car_make TEXT,
    car_model TEXT,
    price_level_1 INTEGER DEFAULT 0,
    price_level_2 INTEGER DEFAULT 0,
    price_level_3 INTEGER DEFAULT 0,
    price_level_4 INTEGER DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    min_order_qty INTEGER DEFAULT 1,
    availability_type TEXT DEFAULT 'INSTOCK',
    delivery_hours INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إنشاء جدول الطلبات
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    user_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'PENDING',
    internal_status TEXT,
    subtotal DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    delivery_city TEXT,
    cancelled_by TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. إنشاء جدول عناصر الطلب
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. إنشاء جدول الإشعارات
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    type TEXT DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- إضافة البيانات الاختبارية
-- ============================================================

-- 8. إضافة المستخدمين
INSERT INTO users (customer_number, password_hash, name, email, role, is_active)
VALUES 
('C-100200', '123456', 'عميل اختبار', 'customer@test.com', 'CUSTOMER', true),
('admin', 'admin123', 'مدير النظام', 'admin@sinicar.com', 'ADMIN', true),
('1', '1', 'مدير سريع', 'quick@test.com', 'ADMIN', true)
ON CONFLICT (customer_number) DO NOTHING;

-- 9. إضافة ملفات تجارية للمستخدمين
INSERT INTO business_profiles (user_id, business_name, customer_type, price_level, city)
SELECT id, 'شركة اختبار', 'WHOLESALE', 1, 'الرياض'
FROM users WHERE customer_number = 'C-100200'
ON CONFLICT DO NOTHING;

-- 10. إضافة منتجات اختبار
INSERT INTO products (part_number, name, brand, category, car_make, car_model, price_level_1, price_level_2, price_level_3, quantity, availability_type, is_active)
VALUES 
('FLT-OIL-001', 'فلتر زيت تويوتا كامري 2020', 'DENSO', 'فلاتر', 'Toyota', 'Camry', 4500, 4200, 3900, 150, 'INSTOCK', true),
('FLT-OIL-002', 'فلتر زيت هيونداي النترا', 'MANN', 'فلاتر', 'Hyundai', 'Elantra', 3800, 3500, 3200, 200, 'INSTOCK', true),
('FLT-AIR-001', 'فلتر هواء تويوتا كورولا', 'K&N', 'فلاتر', 'Toyota', 'Corolla', 6500, 6000, 5500, 80, 'INSTOCK', true),
('BRK-PAD-001', 'فحمات فرامل أمامية تويوتا', 'BREMBO', 'فرامل', 'Toyota', 'Camry', 25000, 23000, 21000, 50, 'INSTOCK', true),
('BRK-PAD-002', 'فحمات فرامل خلفية هيونداي', 'TRW', 'فرامل', 'Hyundai', 'Sonata', 18000, 16500, 15000, 40, 'INSTOCK', true),
('LGT-HEAD-001', 'شمعة أمامية LED يسار', 'DEPO', 'إضاءة', 'Toyota', 'Camry', 45000, 42000, 39000, 20, 'INSTOCK', true),
('LGT-HEAD-002', 'شمعة أمامية LED يمين', 'DEPO', 'إضاءة', 'Toyota', 'Camry', 45000, 42000, 39000, 20, 'INSTOCK', true),
('ENG-BELT-001', 'سير مكينة تويوتا', 'GATES', 'محرك', 'Toyota', 'Camry', 8500, 7800, 7200, 100, 'INSTOCK', true),
('OIL-ENG-001', 'زيت محرك 5W-30 4 لتر', 'MOBIL', 'زيوت', 'Universal', 'All', 12000, 11000, 10000, 500, 'INSTOCK', true),
('BAT-001', 'بطارية 70 أمبير', 'VARTA', 'كهرباء', 'Universal', 'All', 35000, 32000, 29000, 30, 'INSTOCK', true)
ON CONFLICT DO NOTHING;

-- 11. تفعيل RLS (اختياري للأمان)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 12. إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('simple', coalesce(part_number,'') || ' ' || coalesce(name,'') || ' ' || coalesce(brand,'')));
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================
-- ✅ تم! الآن جرّب تسجيل الدخول بـ:
-- رقم العميل: C-100200
-- كلمة المرور: 123456
-- أو: 1 / 1 (للأدمن السريع)
-- ============================================================
