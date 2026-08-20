# Setup guide

## Requirements

- Node.js 18+
- MySQL 8
- BigCommerce store (optional for local demo catalog)

---

## Database

Local accounts, wishlist, and newsletter use MySQL. Catalog and checkout use BigCommerce.

### 1. Install MySQL

Install MySQL 8 and make sure the service is running.

### 2. Set `DATABASE_URL`

In `backend/.env`:

```env
DATABASE_URL=mysql://root:yourpassword@localhost:3306/velora
```

No password:

```env
DATABASE_URL=mysql://root:@localhost:3306/velora
```

### 3. Create database and tables

**Easiest:**

```bash
cd backend
npm install
npm run db:init
```

**Or run the SQL file:**

```bash
mysql -u root -p < src/database/schema.sql
```

**Or paste this in MySQL Workbench:**

```sql
CREATE DATABASE IF NOT EXISTS velora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE velora;

CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bc_customer_id INT UNSIGNED NULL,
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(80) NULL,
  customer_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_carts_session (session_id),
  INDEX idx_carts_customer (customer_id),
  CONSTRAINT fk_carts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  variant_id INT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(80) NULL,
  image VARCHAR(500) NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlists (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(80) NULL,
  customer_id INT UNSIGNED NULL,
  product_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image VARCHAR(500) NULL,
  brand VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wishlist_customer (customer_id, product_id),
  UNIQUE KEY uniq_wishlist_session (session_id, product_id),
  CONSTRAINT fk_wishlists_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Verify

```sql
USE velora;
SHOW TABLES;
DESCRIBE customers;
```

---

## Backend

```bash
cd backend
copy .env.example .env
npm install
npm run db:init
npm run dev
```

Minimum `.env` for local work:

```env
PORT=5111
DATABASE_URL=mysql://root:password@localhost:3306/velora
JWT_SECRET=dev-secret
FRONTEND_URL=http://localhost:5173
```

---

## BigCommerce

1. Admin → **Settings → API → Store-level API accounts → Create API account**
2. Token type: **V2/V3 API token**
3. Give read/modify scopes for products, categories, brands, carts, checkouts, customers, orders, payments, content
4. Copy store hash + access token into `backend/.env`

Test:

```bash
cd backend
npm run bc:check
```

Leave BigCommerce fields empty to use the demo catalog.

---

## Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5111/api
```

Open http://localhost:5173

---

## Push to GitHub

```bash
# from project root
git init
git add .
git status   # confirm .env is NOT listed
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Do not commit `backend/.env` or `frontend/.env`.

---

## Common issues

**MySQL connection refused**  
Start the MySQL service, then check host/port in `DATABASE_URL`.

**Access denied**  
Wrong user/password. URL-encode special characters in the password.

**Cart / account errors**  
Run `npm run db:init` again.

**CORS errors**  
`FRONTEND_URL` must match the Vite origin, including the port.
