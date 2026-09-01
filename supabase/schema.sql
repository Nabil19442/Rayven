-- =====================================================================
-- RAYVEN FOOTBALL SPORTSWEAR - SUPABASE POSTGRESQL DATABASE SCHEMA
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin');
CREATE TYPE product_type AS ENUM ('jersey', 'training', 'jacket', 'shorts', 'accessory');
CREATE TYPE jersey_version AS ENUM ('fan', 'player', 'retro', 'goalkeeper');
CREATE TYPE jersey_size AS ENUM ('S', 'M', 'L', 'XL', 'XXL', '3XL');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cod', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cod', 'bkash', 'nagad', 'sslcommerz', 'card');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- 3. PROFILES TABLE (Associated with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    role user_role DEFAULT 'customer' NOT NULL,
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    is_featured BOOLEAN DEFAULT false NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    team TEXT NOT NULL,
    season TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    details JSONB DEFAULT '[]'::jsonb,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
    sku TEXT NOT NULL UNIQUE,
    product_type product_type DEFAULT 'jersey' NOT NULL,
    jersey_version jersey_version DEFAULT 'fan' NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_new_arrival BOOLEAN DEFAULT true NOT NULL,
    is_bestseller BOOLEAN DEFAULT false NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb NOT NULL,
    size_guide JSONB DEFAULT '{}'::jsonb NOT NULL,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    review_count INT DEFAULT 0 NOT NULL,
    meta_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRODUCT VARIANTS / INVENTORY TABLE (Per size stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size jersey_size NOT NULL,
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    sku TEXT NOT NULL UNIQUE,
    price_adjustment NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_product_size UNIQUE (product_id, size)
);

-- 7. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type discount_type DEFAULT 'percentage' NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    max_discount_amount NUMERIC(10, 2) DEFAULT NULL,
    start_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    usage_limit INT DEFAULT 100 NOT NULL,
    used_count INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    postal_code TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 60.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    coupon_code TEXT DEFAULT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    grand_total NUMERIC(10, 2) NOT NULL,
    order_status order_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'cod' NOT NULL,
    payment_method payment_method DEFAULT 'cod' NOT NULL,
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    size jersey_size NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    custom_name TEXT DEFAULT NULL,
    custom_number TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. CUSTOMER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Home' NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    postal_code TEXT DEFAULT '',
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 12. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT DEFAULT '',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    is_verified_purchase BOOLEAN DEFAULT false NOT NULL,
    is_approved BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    badge_text TEXT DEFAULT 'NEW SEASON 2026/27',
    cta_text TEXT DEFAULT 'SHOP NOW' NOT NULL,
    cta_link TEXT DEFAULT '/shop' NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT DEFAULT 'RAYVEN' NOT NULL,
    store_tagline TEXT DEFAULT 'Official Football Kits & Sportswear' NOT NULL,
    logo_url TEXT DEFAULT '' NOT NULL,
    phone TEXT DEFAULT '+880 1711-000000' NOT NULL,
    email TEXT DEFAULT 'support@rayven.store' NOT NULL,
    facebook_url TEXT DEFAULT 'https://facebook.com/rayvenfootball' NOT NULL,
    instagram_url TEXT DEFAULT 'https://instagram.com/rayven.bd' NOT NULL,
    whatsapp_number TEXT DEFAULT '+8801711000000' NOT NULL,
    announcement_bar TEXT DEFAULT '🔥 FREE SHIPPING ON ORDERS OVER ৳3,000 | ⚡ 24-48H EXPRESS DELIVERY IN DHAKA' NOT NULL,
    inside_dhaka_delivery_fee NUMERIC(10, 2) DEFAULT 60.00 NOT NULL,
    outside_dhaka_delivery_fee NUMERIC(10, 2) DEFAULT 120.00 NOT NULL,
    free_shipping_threshold NUMERIC(10, 2) DEFAULT 3000.00 NOT NULL,
    currency_symbol TEXT DEFAULT '৳' NOT NULL,
    order_prefix TEXT DEFAULT 'RAY' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Current User Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Categories Policies
CREATE POLICY "Categories are readable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "Published products readable by everyone" ON public.products FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin());

-- Variants Policies
CREATE POLICY "Variants readable by everyone" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins manage variants" ON public.product_variants FOR ALL USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "Order items viewable by order owner or admin" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = public.order_items.order_id
    AND (public.orders.customer_id = auth.uid() OR public.is_admin())
  )
);
CREATE POLICY "Order items insertable on checkout" ON public.order_items FOR INSERT WITH CHECK (true);

-- Addresses Policies
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Wishlists Policies
CREATE POLICY "Users manage own wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Approved reviews viewable by everyone" ON public.reviews FOR SELECT USING (is_approved = true OR public.is_admin());
CREATE POLICY "Authenticated users can submit review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage all reviews" ON public.reviews FOR ALL USING (public.is_admin());

-- Coupons Policies
CREATE POLICY "Active coupons viewable by all" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- Banners & Store Settings Policies
CREATE POLICY "Banners readable by all" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Admins manage banners" ON public.banners FOR ALL USING (public.is_admin());
CREATE POLICY "Store settings readable by all" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage store settings" ON public.store_settings FOR ALL USING (public.is_admin());

-- Activity Logs Policies
CREATE POLICY "Admins view activity logs" ON public.activity_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System/Admins insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- =====================================================================
-- TRIGGERS & PROCEDURES
-- =====================================================================

-- Auto create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto reduce inventory on order completion
CREATE OR REPLACE FUNCTION public.reduce_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE public.product_variants
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE id = NEW.variant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_order_item_placed
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE PROCEDURE public.reduce_inventory_on_order();
