const { query } = require('../config/database');
const { toWishlistItem } = require('../models/Wishlist');

async function list({ customerId, sessionId }) {
  let rows = [];
  if (customerId) {
    rows = await query(
      'SELECT * FROM wishlists WHERE customer_id = :customerId ORDER BY id DESC',
      { customerId }
    );
  } else if (sessionId) {
    rows = await query(
      'SELECT * FROM wishlists WHERE session_id = :sessionId ORDER BY id DESC',
      { sessionId }
    );
  }
  return rows.map(toWishlistItem);
}

async function findOne({ customerId, sessionId, productId }) {
  if (customerId) {
    const rows = await query(
      'SELECT * FROM wishlists WHERE customer_id = :customerId AND product_id = :productId LIMIT 1',
      { customerId, productId }
    );
    return rows[0] || null;
  }

  const rows = await query(
    'SELECT * FROM wishlists WHERE session_id = :sessionId AND product_id = :productId LIMIT 1',
    { sessionId, productId }
  );
  return rows[0] || null;
}

async function add(data) {
  const result = await query(
    `INSERT INTO wishlists (customer_id, session_id, product_id, name, price, image, brand)
     VALUES (:customerId, :sessionId, :productId, :name, :price, :image, :brand)`,
    data
  );
  const rows = await query('SELECT * FROM wishlists WHERE id = :id', { id: result.insertId });
  return toWishlistItem(rows[0]);
}

async function remove({ customerId, sessionId, productId }) {
  if (customerId) {
    await query(
      'DELETE FROM wishlists WHERE customer_id = :customerId AND product_id = :productId',
      { customerId, productId }
    );
    return;
  }
  await query(
    'DELETE FROM wishlists WHERE session_id = :sessionId AND product_id = :productId',
    { sessionId, productId }
  );
}

module.exports = {
  list,
  findOne,
  add,
  remove,
};
