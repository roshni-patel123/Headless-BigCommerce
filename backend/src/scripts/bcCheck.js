require('dotenv').config();

const catalogService = require('../services/catalogService');

async function check() {
  try {
    const snapshot = await catalogService.checkConnection();

    console.log('BigCommerce connected');
    console.log(`Products: ${snapshot.productCount}`);
    console.log(`Categories: ${snapshot.categoryCount}`);
    snapshot.products.slice(0, 5).forEach((item) => {
      console.log(` - ${item.id} ${item.name}`);
    });
    snapshot.categories.slice(0, 8).forEach((item) => {
      console.log(` - category ${item.id} ${item.name}`);
    });
  } catch (error) {
    console.log('BigCommerce catalog is blocked:', error.message);
    console.log('Create an API account with READ access to Products, Categories, and Brands.');
    console.log('Paste the Access Token into BIGCOMMERCE_ACCESS_TOKEN — not the Client ID.');
    process.exit(1);
  }
}

check();
