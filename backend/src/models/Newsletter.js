function toSubscriber(row) {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
  };
}

module.exports = {
  toSubscriber,
};
