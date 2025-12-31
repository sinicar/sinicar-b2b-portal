-- =============================================================================
-- SiniCar B2B Portal - Supabase Database Schema
-- Optimized for MILLIONS of products with proper indexes
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fast text search

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(20) UNIQUE NOT NULL,
    customer_number VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'CUSTOMER' CHECK (role IN ('OWNER', 'STAFF', 'ADMIN', 'SUPER_ADMIN')),
    parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_id UUID,
    is_active BOOLEAN DEFAULT true,
    branch_id UUID,
    employee_role VARCHAR(20) CHECK (employee_role IN ('MANAGER', 'BUYER')),
    activation_code VARCHAR(10),
    failed_login_attempts INT DEFAULT 0,
    last_failed_login TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_customer_number ON users(customer_number);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =============================================================================
-- 2. BUSINESS PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_name_en VARCHAR(255),
    customer_type VARCHAR(50),
    cr_number VARCHAR(50),
    vat_number VARCHAR(50),
    city VARCHAR(100),
    address TEXT,
    search_points INT DEFAULT 0,
    search_points_used INT DEFAULT 0,
    search_daily_limit INT DEFAULT 100,
    monthly_point_allocation INT DEFAULT 500,
    price_level VARCHAR(20) DEFAULT 'LEVEL_1',
    customer_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (customer_status IN ('ACTIVE', 'SUSPENDED', 'BLOCKED', 'PENDING')),
    suspended_until TIMESTAMPTZ,
    portal_access_start DATE,
    portal_access_end DATE,
    can_create_staff BOOLEAN DEFAULT false,
    max_staff_users INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for business profiles
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_customer_type ON business_profiles(customer_type);
CREATE INDEX idx_business_profiles_city ON business_profiles(city);
CREATE INDEX idx_business_profiles_price_level ON business_profiles(price_level);

-- =============================================================================
-- 3. PRODUCTS TABLE - OPTIMIZED FOR MILLIONS OF RECORDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_number VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    name_en VARCHAR(500),
    brand VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Car compatibility
    car_make VARCHAR(100),
    car_model VARCHAR(100),
    car_year_from INT,
    car_year_to INT,
    
    -- Pricing (stored as integers in cents/halalas for precision)
    price_level_1 BIGINT DEFAULT 0,
    price_level_2 BIGINT DEFAULT 0,
    price_level_3 BIGINT DEFAULT 0,
    price_level_4 BIGINT DEFAULT 0,
    cost_price BIGINT DEFAULT 0,
    
    -- Stock
    quantity INT DEFAULT 0,
    min_order_qty INT DEFAULT 1,
    availability_type VARCHAR(20) DEFAULT 'INSTOCK' CHECK (availability_type IN ('INSTOCK', 'ORDER_PRODUCT', 'UNAVAILABLE')),
    delivery_hours INT DEFAULT 0,
    
    -- Metadata
    weight_kg DECIMAL(10,3),
    dimensions VARCHAR(100),
    image_url TEXT,
    oem_numbers TEXT[], -- Array of original equipment numbers
    cross_references TEXT[], -- Compatible part numbers
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    
    -- Supplier info
    supplier_id UUID,
    supplier_sku VARCHAR(100),
    
    -- Search optimization
    search_vector tsvector,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CRITICAL INDEXES FOR MILLIONS OF PRODUCTS
-- =============================================================================

-- Primary search indexes
CREATE INDEX idx_products_part_number ON products(part_number);
CREATE INDEX idx_products_part_number_gin ON products USING gin (part_number gin_trgm_ops);
CREATE INDEX idx_products_name_gin ON products USING gin (name gin_trgm_ops);

-- Full-text search index
CREATE INDEX idx_products_search_vector ON products USING gin(search_vector);

-- Brand and category indexes
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand_category ON products(brand, category);

-- Car compatibility composite index
CREATE INDEX idx_products_car ON products(car_make, car_model);

-- Availability and stock
CREATE INDEX idx_products_availability ON products(availability_type, is_active);
CREATE INDEX idx_products_stock ON products(quantity) WHERE quantity > 0;

-- Featured products (partial index for faster queries)
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_new_arrivals ON products(created_at DESC) WHERE is_new_arrival = true;
CREATE INDEX idx_products_on_sale ON products(is_on_sale) WHERE is_on_sale = true;

-- Supplier index
CREATE INDEX idx_products_supplier ON products(supplier_id);

-- Active products only (partial index)
CREATE INDEX idx_products_active ON products(id) WHERE is_active = true;

-- OEM numbers search (GIN index for array)
CREATE INDEX idx_products_oem ON products USING gin(oem_numbers);
CREATE INDEX idx_products_cross_refs ON products USING gin(cross_references);

-- Function to update search vector automatically
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('simple', COALESCE(NEW.part_number, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.brand, '')), 'C') ||
        setweight(to_tsvector('simple', COALESCE(NEW.car_make, '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(NEW.car_model, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating search vector
CREATE TRIGGER trigger_products_search_vector
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search_vector();

-- =============================================================================
-- 4. ORDERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
    
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    internal_status VARCHAR(30),
    
    -- Amounts (stored as integers)
    subtotal BIGINT DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    tax_amount BIGINT DEFAULT 0,
    total_amount BIGINT DEFAULT 0,
    
    -- Delivery
    delivery_method VARCHAR(50),
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_notes TEXT,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    
    notes TEXT,
    cancelled_by VARCHAR(20),
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- =============================================================================
-- 5. ORDER ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    part_number VARCHAR(100),
    name VARCHAR(500),
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL,
    total_price BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =============================================================================
-- 6. QUOTE REQUESTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
    
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUOTED', 'APPROVED', 'REJECTED', 'EXPIRED')),
    
    total_quoted_amount BIGINT DEFAULT 0,
    notes TEXT,
    general_note TEXT,
    reviewed_by VARCHAR(255),
    processed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);

-- =============================================================================
-- 7. QUOTE ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE,
    query VARCHAR(500) NOT NULL,
    quantity INT DEFAULT 1,
    quoted_part_number VARCHAR(100),
    quoted_name VARCHAR(500),
    quoted_price BIGINT,
    is_available BOOLEAN,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- =============================================================================
-- 8. IMPORT REQUESTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS import_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    status VARCHAR(30) DEFAULT 'PENDING',
    description TEXT,
    
    file_name VARCHAR(255),
    pricing_file_name VARCHAR(255),
    total_amount BIGINT,
    
    admin_name VARCHAR(255),
    customer_approval_note TEXT,
    
    timeline JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_import_requests_user_id ON import_requests(user_id);
CREATE INDEX idx_import_requests_status ON import_requests(status);

-- =============================================================================
-- 9. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    
    related_type VARCHAR(50),
    related_id UUID,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================================================
-- 10. ACCOUNT OPENING REQUESTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS account_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    
    business_name VARCHAR(255),
    full_name VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    
    cr_number VARCHAR(50),
    vat_number VARCHAR(50),
    
    documents JSONB DEFAULT '[]',
    
    -- Admin assignment
    assigned_price_level VARCHAR(20),
    assigned_customer_type VARCHAR(50),
    search_points_initial INT,
    search_points_monthly INT,
    search_daily_limit INT,
    
    portal_access_start DATE,
    portal_access_end DATE,
    can_create_staff BOOLEAN DEFAULT false,
    max_staff_users INT,
    
    admin_notes TEXT,
    reviewed_by VARCHAR(255),
    created_customer_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_account_requests_status ON account_requests(status);
CREATE INDEX idx_account_requests_phone ON account_requests(phone);

-- =============================================================================
-- 11. MISSING PRODUCT REQUESTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS missing_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    
    query VARCHAR(500) NOT NULL,
    source VARCHAR(20) DEFAULT 'SEARCH',
    quote_request_id UUID,
    
    status VARCHAR(30) DEFAULT 'PENDING',
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_missing_products_status ON missing_products(status);
CREATE INDEX idx_missing_products_user_id ON missing_products(user_id);

-- =============================================================================
-- 12. ACTIVITY LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name VARCHAR(255),
    customer_id UUID,
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioned by month for better performance with millions of logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_customer_id ON activity_logs(customer_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- =============================================================================
-- 13. SITE SETTINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
    ('general', '{"siteName": "صيني كار", "siteNameEn": "SiniCar", "phone": "+966123456789", "email": "info@sinicar.com"}'),
    ('banners', '[]'),
    ('news', '[]'),
    ('features', '{"guestMode": true, "searchEnabled": true}')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 14. SUPPLIERS TABLE (For Order Routing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    
    type VARCHAR(30) DEFAULT 'REGISTERED',
    is_local BOOLEAN DEFAULT true,
    
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    
    city VARCHAR(100),
    address TEXT,
    
    bank_name VARCHAR(255),
    bank_iban VARCHAR(50),
    
    rating DECIMAL(3,2) DEFAULT 0,
    response_time_hours INT DEFAULT 24,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_type ON suppliers(type);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- =============================================================================
-- 15. BRANCHES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    map_url VARCHAR(500),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branches_business_id ON branches(business_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (id = auth.uid() OR role IN ('ADMIN', 'SUPER_ADMIN'));

-- Policy: Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to search products efficiently
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    part_number VARCHAR,
    name VARCHAR,
    brand VARCHAR,
    price_level_1 BIGINT,
    quantity INT,
    availability_type VARCHAR,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.part_number,
        p.name,
        p.brand,
        p.price_level_1,
        p.quantity,
        p.availability_type,
        ts_rank(p.search_vector, plainto_tsquery('simple', search_query)) AS rank
    FROM products p
    WHERE 
        p.is_active = true
        AND (
            p.part_number ILIKE '%' || search_query || '%'
            OR p.name ILIKE '%' || search_query || '%'
            OR p.search_vector @@ plainto_tsquery('simple', search_query)
            OR search_query = ANY(p.oem_numbers)
        )
    ORDER BY rank DESC, p.part_number
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INITIAL ADMIN USER
-- =============================================================================
INSERT INTO users (id, client_id, customer_number, name, email, password_hash, role, is_active)
VALUES (
    uuid_generate_v4(),
    'ADMIN001',
    '1',
    'المشرف العام',
    'admin@sinicar.com',
    '1', -- Change this in production!
    'SUPER_ADMIN',
    true
) ON CONFLICT (client_id) DO NOTHING;

-- =============================================================================
-- STATISTICS VIEW (For Dashboard)
-- =============================================================================
CREATE OR REPLACE VIEW admin_stats AS
SELECT
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pending_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'DELIVERED') as total_revenue,
    (SELECT COUNT(*) FROM users WHERE role != 'ADMIN' AND role != 'SUPER_ADMIN') as total_users,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM quote_requests WHERE status = 'PENDING') as pending_quotes,
    (SELECT COUNT(*) FROM account_requests WHERE status = 'PENDING') as new_account_requests;
