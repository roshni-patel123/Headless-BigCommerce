# VELORA — Headless Commerce

Headless storefront powered by **BigCommerce** (catalog, cart, checkout) with **MySQL** for local accounts, wishlist, and newsletter.

**Stack:** Node.js · Express · MySQL · React (Vite) · BigCommerce API

---

## Before you push to Git

1. Never commit secrets. `.env` files are already in `.gitignore`.
2. Copy examples instead:

```bash
cd backend
copy .env.example .env

cd ../frontend
copy .env.example .env
```

3. Fill in your own values in those `.env` files (see below).
4. Then push:

```bash
git init
git add .
git commit -m "Initial commit: Velora headless commerce"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Requirements

- Node.js 18+
- MySQL 8 (or MariaDB)
- BigCommerce store + API token (optional for demo catalog)

---

## 1. Database setup

### Option A — recommended (auto create DB + tables)

```bash
cd backend
copy .env.example .env
```

Edit `DATABASE_URL` in `backend/.env`:

```env
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=mysql://root:yourpassword@localhost:3306/velora
```

If your MySQL root has no password:

```env
DATABASE_URL=mysql://root:@localhost:3306/velora
```

Install and create the database:

```bash
npm install
npm run db:init
```

You should see: `Database "velora" is ready`

### Option B — run SQL yourself

Open MySQL (Workbench, CLI, or phpMyAdmin) and run:

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

Or from the MySQL CLI:

```bash
mysql -u root -p < backend/src/database/schema.sql
```

### Check tables

```sql
USE velora;
SHOW TABLES;
```

Expected tables:

- `customers`
- `carts`
- `cart_items`
- `wishlists`
- `newsletter_subscribers`

---

## 2. Backend env

`backend/.env` example:

```env
PORT=5111
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DATABASE_URL=mysql://root:yourpassword@localhost:3306/velora
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d

BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_ACCESS_TOKEN=your_access_token
BIGCOMMERCE_CLIENT_ID=
BIGCOMMERCE_CHANNEL_ID=1
BIGCOMMERCE_STOREFRONT_TOKEN=
```

### BigCommerce API token scopes

Create a Store API account and enable:

- Products, Categories, Brands — read
- Carts, Checkouts — modify
- Customers, Orders — modify / read
- Payments — modify (for card payments)
- Content — read (pages, blog)
- Channel Settings — read (menus)

---

## 3. Frontend env

`frontend/.env` example:

```env
VITE_API_URL=http://localhost:5111/api
```

Use the same port as `PORT` in `backend/.env`.

---

## 4. Run locally

Terminal 1 — API:

```bash
cd backend
npm install
npm run db:init
npm run dev
```

API: http://localhost:5111  
Health: http://localhost:5111/health

Terminal 2 — storefront:

```bash
cd frontend
npm install
npm run dev
```

Store: http://localhost:5173

---

## Project structure

```text
├── backend/          Express API
│   ├── server.js
│   ├── .env.example
│   └── src/database/schema.sql
├── frontend/         React (Vite) storefront
├── docs/             Extra docs
└── README.md
```

---

## Useful commands

| Command | Where | What it does |
|---------|--------|--------------|
| `npm run db:init` | backend | Create DB + tables from `schema.sql` |
| `npm run bc:check` | backend | Test BigCommerce connection |
| `npm run dev` | backend / frontend | Start in watch mode |
| `npm start` | backend | Start API without nodemon |

---

## Common issues

**MySQL connection refused**  
Start MySQL, then check `DATABASE_URL` user/password/port.

**Access denied for user**  
Fix username/password in `DATABASE_URL`. Special characters in the password must be URL-encoded.

**Empty product list**  
Add BigCommerce credentials, or leave them blank to use the demo catalog.

**CORS errors**  
`FRONTEND_URL` in backend must match the Vite URL (including port).

**Cart / login not working**  
Those features need MySQL. Run `npm run db:init` again.

---

## More docs

- [Setup details](docs/SETUP.md)
- [API reference](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
