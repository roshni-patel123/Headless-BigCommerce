const { SERVER_ERROR } = require('../constants/httpStatus');

function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || SERVER_ERROR;
  const message = err.message || 'Something went wrong';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && err.details
      ? { details: err.details }
      : {}),
  });
}

module.exports = errorHandler;
