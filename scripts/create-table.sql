-- CafeDerm: Create products table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/qogblzkpzreeikygwjhf/sql)

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_at_price INTEGER,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('face-care', 'body-care', 'bundles')),
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can browse products)
CREATE POLICY "Allow public read access on products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users or service_role can insert
CREATE POLICY "Allow authenticated insert on products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users or service_role can update
CREATE POLICY "Allow authenticated update on products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users or service_role can delete
CREATE POLICY "Allow authenticated delete on products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);
