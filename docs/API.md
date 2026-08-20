# VELORA API

Base URL: `http://localhost:5000/api`

All JSON responses look like:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 12, "total": 8, "totalPages": 1 }
}
```

Errors:

```json
{
  "success": false,
  "message": "Product not found"
}
```

Send these headers when needed:

| Header | When |
| --- | --- |
| `X-Session-Id` | Guest cart and wishlist |
| `Authorization: Bearer <token>` | Signed-in customer |

The React app sets both automatically.

---

## Home

`GET /home`

Homepage hero, categories, featured products, new arrivals, best sellers, and reviews.

---

## Products

`GET /products`

Query: `page`, `limit`, `sort` (`newest` \| `price_asc` \| `price_desc` \| `name`), `minPrice`, `maxPrice`, `brandId`, `categoryId`, `q`

`GET /products/search?q=`

`GET /products/featured`

`GET /products/new-arrivals`

`GET /products/best-sellers`

`GET /products/:id`

`GET /products/:id/related`

---

## Categories

`GET /categories`

`GET /categories/:id`

`GET /categories/:id/products` — same product filters as above

---

## Brands

`GET /brands`

`GET /brands/:id`

`GET /brands/:id/products`

---

## Search

`GET /search?q=pearl`

Returns products plus category and brand suggestions.

---

## Cart

`GET /cart`

`POST /cart/items`

```json
{ "productId": 101, "quantity": 1, "variantId": null }
```

`PATCH /cart/items/:itemId`

```json
{ "quantity": 2 }
```

`DELETE /cart/items/:itemId`

---

## Wishlist

`GET /wishlist`

`POST /wishlist`

```json
{ "productId": 101 }
```

`DELETE /wishlist/:productId`

---

## Customers

`POST /customers/register`

```json
{
  "firstName": "Amelia",
  "lastName": "Hart",
  "email": "amelia@example.com",
  "password": "secret123",
  "phone": ""
}
```

`POST /customers/login`

```json
{ "email": "amelia@example.com", "password": "secret123" }
```

`GET /customers/profile` — auth required

`PATCH /customers/profile` — auth required

```json
{ "firstName": "Amelia", "lastName": "Hart", "phone": "555-0100" }
```

---

## Newsletter

`POST /newsletter`

```json
{ "email": "hello@example.com" }
```

---

## Health

`GET /health` (not under `/api`)
