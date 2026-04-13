-- ============================================
-- CravingsSpot Database Schema
-- Run this in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================

-- 1. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL DEFAULT 'pickup',
  delivery_address TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

-- 2. Menu availability table (tracks sold-out items)
CREATE TABLE IF NOT EXISTS menu_availability (
  item_id TEXT PRIMARY KEY,
  is_available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_availability ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for orders
-- Allow anyone (anon) to INSERT orders (customers placing orders)
CREATE POLICY "Allow anon insert orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone (anon) to read orders (needed for realtime, or restrict to authenticated)
CREATE POLICY "Allow anon read orders"
  ON orders FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow authenticated full access orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. RLS Policies for menu_availability
-- Allow anyone to read availability (customers need to see sold-out items)
CREATE POLICY "Allow anon read availability"
  ON menu_availability FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow authenticated full access availability"
  ON menu_availability FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 7. Featured items table (Promos)
CREATE TABLE IF NOT EXISTS featured_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  main_price INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read featured items"
  ON featured_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated full access featured items"
  ON featured_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE featured_items;

-- ============================================
-- DONE! Now create an admin user:
-- Go to Authentication → Users → Add User
-- Email: your-email@example.com
-- Password: your-password
-- ============================================
