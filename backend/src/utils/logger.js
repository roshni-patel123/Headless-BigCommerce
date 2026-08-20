function logError(scope, error) {
  console.error(`[${scope}]`, error.message || error);
}

module.exports = {
  logError,
};
