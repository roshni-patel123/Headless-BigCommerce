const { query } = require('../config/database');
const { toCustomer } = require('../models/Customer');

async function findByEmail(email) {
  const rows = await query(
    'SELECT * FROM customers WHERE email = :email LIMIT 1',
    { email }
  );
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query('SELECT * FROM customers WHERE id = :id LIMIT 1', { id });
  return toCustomer(rows[0]);
}

async function create(data) {
  const result = await query(
    `INSERT INTO customers (bc_customer_id, first_name, last_name, email, password_hash, phone)
     VALUES (:bcCustomerId, :firstName, :lastName, :email, :passwordHash, :phone)`,
    data
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await query(
    `UPDATE customers
     SET first_name = :firstName,
         last_name = :lastName,
         email = :email,
         phone = :phone,
         bc_customer_id = COALESCE(:bcCustomerId, bc_customer_id)
     WHERE id = :id`,
    {
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      bcCustomerId: data.bcCustomerId ?? null,
    }
  );
  return findById(id);
}

module.exports = {
  findByEmail,
  findById,
  create,
  update,
};
