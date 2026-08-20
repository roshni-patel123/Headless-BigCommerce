let warned = false;

function isStoreAuthError(error) {
  const status = error.statusCode || error.status;
  const message = String(error.message || '').toLowerCase();
  return (
    status === 401 ||
    status === 403 ||
    message.includes('scope') ||
    message.includes('unauthorized') ||
    message.includes('invalid') && message.includes('token')
  );
}

function warnOnce(error) {
  if (warned) return;
  warned = true;
  console.warn('BigCommerce catalog is blocked. Using the local jewelry catalog instead.');
  console.warn('Fix: BigCommerce admin → Settings → API → API accounts.');
  console.warn('Give the token read access to Products, Categories, and Brands, then restart the API.');
  console.warn(`BigCommerce said: ${error.message}`);
}

async function withCatalogFallback(liveCall, demoCall) {
  try {
    return await liveCall();
  } catch (error) {
    if (!isStoreAuthError(error)) throw error;
    warnOnce(error);
    return demoCall();
  }
}

module.exports = {
  isStoreAuthError,
  withCatalogFallback,
};
