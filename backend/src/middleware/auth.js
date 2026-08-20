const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UNAUTHORIZED } = require('../constants/httpStatus');
const messages = require('../constants/messages');

function optionalAuth(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(UNAUTHORIZED).json({
      success: false,
      message: messages.UNAUTHORIZED,
    });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    return res.status(UNAUTHORIZED).json({
      success: false,
      message: 'Session expired. Please sign in again.',
    });
  }
}

module.exports = {
  optionalAuth,
  requireAuth,
};
