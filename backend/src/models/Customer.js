function toCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    bcCustomerId: row.bc_customer_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
  };
}

module.exports = {
  toCustomer,
};
