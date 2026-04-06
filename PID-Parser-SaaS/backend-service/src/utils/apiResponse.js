const success = (res, statusCode, data, extras = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...extras,
  });
};

const failure = (res, statusCode, message, code = 'INTERNAL_ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
    details,
  });
};

module.exports = { success, failure };