-- ============================================================
-- PayCart Seed Data — LOCAL DEV ONLY
-- Run: psql -U postgres -d paycart -f seed.sql
-- ============================================================

-- Admin user (password: Admin1234!)
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Admin User',
    'admin@paycart.com',
    '$2b$12$GJ4fL0/e7n4FjkYW1k8GE.qY5o0bNGVl6R2PMWkJ7s3D/IbHqZXKW',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Sample products
INSERT INTO products (name, description, price, stock, category) VALUES
  ('Wireless Headphones',    'Noise-cancelling over-ear headphones with 30h battery',      79.99,  50, 'Electronics'),
  ('Mechanical Keyboard',    'TKL layout, cherry MX blue switches, RGB backlight',        129.00,  30, 'Electronics'),
  ('Leather Wallet',         'Slim bifold genuine leather wallet, RFID blocking',          39.95, 100, 'Accessories'),
  ('Running Shoes',          'Lightweight breathable mesh, cushioned sole',                89.00,  40, 'Footwear'),
  ('Stainless Steel Bottle', '1L insulated water bottle, keeps cold 24h / hot 12h',       24.99,  75, 'Kitchen'),
  ('Backpack',               '30L waterproof backpack with laptop compartment',            59.00,  20, 'Accessories'),
  ('Desk Lamp',              'LED adjustable arm lamp, 3 colour temperatures, USB port',   34.50,  60, 'Home'),
  ('Cotton T-Shirt',         'Premium 100% organic cotton, unisex fit, 6 colours',        19.99, 200, 'Clothing')
ON CONFLICT DO NOTHING;
