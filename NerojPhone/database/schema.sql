-- NerojPhone Database Schema
-- Supabase PostgreSQL Database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'payment_pending', 'payment_uploaded', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('qi_card', 'visa', 'mastercard', 'fastpay', 'zaincash', 'asiahawala', 'cash_on_delivery', 'pay_at_store', 'installment');
CREATE TYPE payment_status AS ENUM ('pending', 'uploaded', 'verified', 'failed', 'refunded');
CREATE TYPE product_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'out_of_stock');

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Extends Supabase auth.users
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    language VARCHAR(5) DEFAULT 'ar',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer-specific data
CREATE TABLE public.customers (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    shipping_addresses JSONB DEFAULT '[]',
    wishlist JSONB DEFAULT '[]',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchant-specific data
CREATE TABLE public.merchants (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_license VARCHAR(100),
    commission_rate DECIMAL(5, 2) DEFAULT 5.00, -- Percentage
    bank_account_info JSONB,
    is_verified BOOLEAN DEFAULT false,
    total_sales DECIMAL(12, 2) DEFAULT 0,
    total_products INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRODUCTS & CATALOG
-- ============================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    description_ar TEXT,
    
    -- Pricing
    price DECIMAL(12, 2) NOT NULL,
    compare_at_price DECIMAL(12, 2), -- Original price for discounts
    cost_price DECIMAL(12, 2), -- For merchant tracking
    
    -- Inventory
    sku VARCHAR(100) UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    
    -- Specifications (for phones)
    specifications JSONB DEFAULT '{}', -- {storage: "128GB", ram: "8GB", color: "Black", etc}
    
    -- Media
    images JSONB DEFAULT '[]', -- Array of image URLs
    video_url TEXT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Status
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    
    -- Stats
    views INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "128GB Black"
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(12, 2),
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB DEFAULT '{}', -- {storage: "128GB", color: "Black"}
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id UUID, -- Reference to verify purchase
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    images JSONB DEFAULT '[]',
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS & CART
-- ============================================

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    
    -- Order Details
    status order_status DEFAULT 'pending',
    items JSONB NOT NULL, -- Array of {product_id, variant_id, quantity, price, name}
    
    -- Pricing
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) DEFAULT 0,
    tax DECIMAL(12, 2) DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL,
    
    -- Shipping
    shipping_address JSONB NOT NULL,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- Payment
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE RESTRICT,
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    
    product_snapshot JSONB, -- Store product details at time of order
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Payment Info
    payment_method payment_method NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    
    -- QI Card / External Payment
    payment_link TEXT, -- For QI Card pay-by-link
    transaction_id VARCHAR(255), -- Customer-provided transaction ID
    
    -- Receipt Upload
    receipt_url TEXT, -- Uploaded receipt image
    receipt_uploaded_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification
    verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Metadata
    payment_metadata JSONB DEFAULT '{}', -- Store additional payment gateway data
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- 'order_update', 'payment_verified', 'product_approved', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    link TEXT, -- Deep link to relevant page
    metadata JSONB DEFAULT '{}',
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- Products
CREATE INDEX idx_products_merchant_id ON public.products(merchant_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_slug ON public.products(slug);

-- Orders
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Order Items
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_items_merchant_id ON public.order_items(merchant_id);

-- Payments
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Products: Public can read approved products, merchants can manage their own
CREATE POLICY "Anyone can view approved products" ON public.products
    FOR SELECT USING (status = 'approved' OR merchant_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Merchants can insert own products" ON public.products
    FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Merchants can update own products" ON public.products
    FOR UPDATE USING (merchant_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Orders: Customers can view their own orders, merchants can view orders containing their products
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'NRJ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq;

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update product rating when review is added
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET 
        rating = (SELECT AVG(rating) FROM public.product_reviews WHERE product_id = NEW.product_id AND is_approved = true),
        review_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = NEW.product_id AND is_approved = true)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger AFTER INSERT OR UPDATE ON public.product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO public.categories (name, name_ar, slug, display_order) VALUES
('Mobile Phones', 'الهواتف المحمولة', 'mobile-phones', 1),
('Chargers & Cables', 'الشواحن والكابلات', 'chargers-cables', 2),
('Phone Cases', 'حافظات الهاتف', 'phone-cases', 3),
('Power Banks', 'بنوك الطاقة', 'power-banks', 4),
('Headphones & Earbuds', 'سماعات الرأس والأذن', 'headphones-earbuds', 5),
('Screen Protectors', 'واقيات الشاشة', 'screen-protectors', 6),
('Accessories', 'الإكسسوارات', 'accessories', 7);

-- Insert popular brands
INSERT INTO public.brands (name) VALUES
('Apple'),
('Samsung'),
('Xiaomi'),
('Huawei'),
('Oppo'),
('Vivo'),
('Realme'),
('OnePlus'),
('Nokia'),
('Infinix'),
('Tecno');

-- Insert system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('site_name', '{"en": "NerojPhone", "ar": "نيروج فون"}', 'Site name'),
('default_commission_rate', '5.0', 'Default merchant commission percentage'),
('shipping_fee', '5000', 'Default shipping fee in IQD'),
('tax_rate', '0', 'Tax percentage'),
('currency', '{"code": "IQD", "symbol": "د.ع"}', 'Currency settings'),
('payment_methods', '["qi_card", "visa", "mastercard", "fastpay", "zaincash", "asiahawala", "cash_on_delivery", "pay_at_store"]', 'Enabled payment methods'),
('qi_card_payment_link', '"https://payment.qi-card.com/pay"', 'QI Card payment link base URL');
