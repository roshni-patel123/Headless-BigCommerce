const { query } = require('../config/database');
const { toSubscriber } = require('../models/Newsletter');

async function findByEmail(email) {
  const rows = await query(
    'SELECT * FROM newsletter_subscribers WHERE email = :email LIMIT 1',
    { email }
  );
  return rows[0] || null;
}

async function create(email) {
  const result = await query(
    'INSERT INTO newsletter_subscribers (email) VALUES (:email)',
    { email }
  );
  const rows = await query('SELECT * FROM newsletter_subscribers WHERE id = :id', {
    id: result.insertId,
  });
  return toSubscriber(rows[0]);
}

module.exports = {
  findByEmail,
  create,
};
