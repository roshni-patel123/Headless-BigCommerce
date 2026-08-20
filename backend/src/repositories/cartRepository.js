const { query } = require('../config/database');

async function findOpenCart({ customerId, sessionId }) {
  if (customerId) {
    const rows = await query(
      'SELECT * FROM carts WHERE customer_id = :customerId ORDER BY id DESC LIMIT 1',
      { customerId }
    );
    return rows[0] || null;
  }

  if (!sessionId) return null;

  const rows = await query(
    'SELECT * FROM carts WHERE session_id = :sessionId ORDER BY id DESC LIMIT 1',
    { sessionId }
  );
  return rows[0] || null;
}

async function createCart({ customerId, sessionId }) {
  const result = await query(
    'INSERT INTO carts (customer_id, session_id) VALUES (:customerId, :sessionId)',
    { customerId: customerId || null, sessionId: sessionId || null }
  );
  const rows = await query('SELECT * FROM carts WHERE id = :id', { id: result.insertId });
  return rows[0];
}

async function getItems(cartId) {
  return query(
    'SELECT * FROM cart_items WHERE cart_id = :cartId ORDER BY id DESC',
    { cartId }
  );
}

async function findItem(cartId, productId, variantId) {
  if (variantId) {
    const rows = await query(
      `SELECT * FROM cart_items
       WHERE cart_id = :cartId AND product_id = :productId AND variant_id = :variantId
       LIMIT 1`,
      { cartId, productId, variantId }
    );
    return rows[0] || null;
  }

  const rows = await query(
    `SELECT * FROM cart_items
     WHERE cart_id = :cartId AND product_id = :productId AND variant_id IS NULL
     LIMIT 1`,
    { cartId, productId }
  );
  return rows[0] || null;
}

async function addItem(data) {
  const result = await query(
    `INSERT INTO cart_items (cart_id, product_id, variant_id, name, sku, image, price, quantity)
     VALUES (:cartId, :productId, :variantId, :name, :sku, :image, :price, :quantity)`,
    data
  );
  const rows = await query('SELECT * FROM cart_items WHERE id = :id', { id: result.insertId });
  return rows[0];
}

async function updateQuantity(itemId, quantity) {
  await query('UPDATE cart_items SET quantity = :quantity WHERE id = :itemId', {
    itemId,
    quantity,
  });
}

async function findItemById(itemId) {
  const rows = await query('SELECT * FROM cart_items WHERE id = :itemId LIMIT 1', { itemId });
  return rows[0] || null;
}

async function removeItem(itemId) {
  await query('DELETE FROM cart_items WHERE id = :itemId', { itemId });
}

module.exports = {
  findOpenCart,
  createCart,
  getItems,
  findItem,
  addItem,
  updateQuantity,
  findItemById,
  removeItem,
};
