-- ============================================================
-- PayCart — Add product images
-- Run: psql "host=YOUR_RDS_ENDPOINT ... sslmode=require" -f database/add-images.sql
--
-- Using Unsplash Source URLs — free, no API key needed
-- Replace any URL with your own S3/CDN image URL if preferred
-- ============================================================

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
WHERE name = 'Wireless Headphones';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80'
WHERE name = 'Mechanical Keyboard';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80'
WHERE name = 'Leather Wallet';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'
WHERE name = 'Running Shoes';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'
WHERE name = 'Stainless Steel Bottle';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
WHERE name = 'Backpack';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'
WHERE name = 'Desk Lamp';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'
WHERE name = 'Cotton T-Shirt';

-- Verify
SELECT name, image_url FROM products ORDER BY created_at;
