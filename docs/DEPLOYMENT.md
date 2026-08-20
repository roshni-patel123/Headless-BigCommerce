# Deployment

## Backend (Render, Railway, or a VPS)

1. Create a MySQL database (PlanetScale, Railway, RDS, or your host).
2. Run `backend/src/database/schema.sql` against that database.
3. Set environment variables:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-storefront.example
BIGCOMMERCE_STORE_HASH=
BIGCOMMERCE_ACCESS_TOKEN=
BIGCOMMERCE_CHANNEL_ID=
DATABASE_URL=mysql://user:pass@host:3306/velora
JWT_SECRET=a-long-random-string
JWT_EXPIRES_IN=7d
```

4. Start command:

```bash
cd backend
npm install --omit=dev
node server.js
```

Create a BigCommerce API account with catalog read scopes. The store hash is the short id in your store’s API path (`stores/{hash}/v3`).

## Frontend (Netlify or Vercel)

1. Build from `frontend/`:

```bash
npm install
npm run build
```

2. Set:

```env
VITE_API_URL=https://your-api.example/api
```

3. Publish the `dist` folder. SPA fallback should send all routes to `index.html`.

### Netlify `_redirects`

```text
/api/*  https://your-api.example/api/:splat  200
/*      /index.html  200
```

### Vercel `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## CORS

`FRONTEND_URL` on the API must match the live storefront origin.

## Checklist

- [ ] MySQL schema applied
- [ ] JWT secret is not the example value
- [ ] BigCommerce token stored only on the server
- [ ] Helmet and rate limits stay enabled
- [ ] Frontend talks to HTTPS API
- [ ] Images from BigCommerce or Unsplash are allowed by your CSP if you tighten Helmet later
