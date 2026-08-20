require('dotenv').config();

const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const catalogService = require('./src/services/catalogService');
const { initRedis } = require('./src/utils/cache');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
  } catch (error) {
    console.warn('MySQL is not ready yet. Catalog routes still work; cart and accounts need the database.');
    console.warn(error.message);
  }

  await initRedis();

  app.listen(PORT, async () => {
    console.log(`VELORA API running on http://localhost:${PORT}`);
    try {
      const snapshot = await catalogService.checkConnection();
      console.log(`BigCommerce live: ${snapshot.productCount} products, ${snapshot.categoryCount} categories`);
    } catch (error) {
      console.warn('BigCommerce catalog not live:', error.message);
      console.warn('The store will use demo data until the Access Token has Products + Categories read scopes.');
    }
  });
}

startServer();
