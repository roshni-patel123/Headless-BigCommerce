function getSessionId(req) {
  return req.header('x-session-id') || req.body?.sessionId || '';
}

function getCustomerId(req) {
  return req.user?.id || null;
}

module.exports = {
  getSessionId,
  getCustomerId,
};
