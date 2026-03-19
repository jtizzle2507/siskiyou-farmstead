-- =============================================
-- Siskiyou Farmstead Database Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- Products
CREATE TABLE IF NOT EXISTS farm_products (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'mushrooms',
  size text NOT NULL,
  price numeric(10,2) NOT NULL,
  inventory integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Delivery Zones
CREATE TABLE IF NOT EXISTS farm_delivery_zones (
  key text PRIMARY KEY,
  name text NOT NULL,
  day text NOT NULL,
  fee numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Delivery Info Cards
CREATE TABLE IF NOT EXISTS farm_delivery_info (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS farm_orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text,
  delivery_zone text REFERENCES farm_delivery_zones(key),
  delivery_day text,
  payment_method text NOT NULL DEFAULT 'stripe',
  subtotal numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS farm_order_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id text NOT NULL REFERENCES farm_orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_size text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS farm_subscribers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now(),
  active boolean NOT NULL DEFAULT true
);

-- Admin Users
CREATE TABLE IF NOT EXISTS farm_admin_users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Seed initial data
-- =============================================

-- Products
INSERT INTO farm_products (id, name, category, size, price, inventory, active) VALUES
  ('mush-4oz', 'Mixed Mushrooms', 'mushrooms', '4 oz', 8, 20, true),
  ('mush-8oz', 'Mixed Mushrooms', 'mushrooms', '8 oz', 15, 15, true),
  ('mush-1lb', 'Mixed Mushrooms', 'mushrooms', '1 lb', 28, 10, true),
  ('greens-1lb', 'Radish Greens', 'greens', '1 lb', 6, 25, true),
  ('greens-2lb', 'Radish Greens', 'greens', '2 lb', 11, 15, true)
ON CONFLICT (id) DO NOTHING;

-- Delivery Zones
INSERT INTO farm_delivery_zones (key, name, day, fee) VALUES
  ('hilt-hornbrook', 'Hilt / Hornbrook', 'Monday', 2),
  ('weed-shastina', 'Weed / Lake Shastina', 'Tuesday', 2),
  ('mtshasta-dunsmuir', 'Mt Shasta / Dunsmuir / McCloud', 'Wednesday', 2),
  ('yreka-grenada', 'Yreka / Grenada / Montague', 'Thursday', 2),
  ('fortjones-etna', 'Fort Jones / Greenview / Quartz Valley / Etna', 'Friday', 2),
  ('pickup', 'Yreka Pickup (Sunday)', 'Sunday', 0)
ON CONFLICT (key) DO NOTHING;

-- Delivery Info Cards
INSERT INTO farm_delivery_info (id, icon, title, description, sort_order) VALUES
  ('info-1', '📦', '$25 Minimum', 'All orders', 1),
  ('info-2', '🚚', '$2 Delivery', 'To your zone', 2),
  ('info-3', '🏡', 'Free Pickup', 'Sundays in Yreka', 3)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE farm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_delivery_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for products, zones, and info cards
CREATE POLICY "Public read products" ON farm_products FOR SELECT USING (true);
CREATE POLICY "Public read zones" ON farm_delivery_zones FOR SELECT USING (true);
CREATE POLICY "Public read info" ON farm_delivery_info FOR SELECT USING (true);

-- Service role has full access (for API routes)
CREATE POLICY "Service full access products" ON farm_products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access zones" ON farm_delivery_zones FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access info" ON farm_delivery_info FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access orders" ON farm_orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access order_items" ON farm_order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access subscribers" ON farm_subscribers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access admin_users" ON farm_admin_users FOR ALL USING (auth.role() = 'service_role');

-- Allow anon to insert orders and subscribers (for checkout and newsletter)
CREATE POLICY "Anon insert orders" ON farm_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert order_items" ON farm_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert subscribers" ON farm_subscribers FOR INSERT WITH CHECK (true);
