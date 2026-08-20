function success(res, data, status = 200, meta) {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

function created(res, data) {
  return success(res, data, 201);
}

module.exports = {
  success,
  created,
};
