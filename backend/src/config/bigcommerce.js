const axios = require('axios');
const env = require('./env');

const storeHash = env.bigcommerce.storeHash;
const accessToken = (env.bigcommerce.accessToken || '').trim();
const clientId = (env.bigcommerce.clientId || '').trim();
const storefrontToken = (env.bigcommerce.storefrontToken || '').trim();

function adminHeaders() {
  const headers = {
    'X-Auth-Token': accessToken,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (clientId) headers['X-Auth-Client'] = clientId;
  return headers;
}

function createAdminClient(version) {
  const client = axios.create({
    baseURL: `https://api.bigcommerce.com/stores/${storeHash}/${version}`,
    timeout: 20000,
    headers: adminHeaders(),
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status || 500;
      const body = error.response?.data;
      const message =
        body?.title ||
        body?.message ||
        (Array.isArray(body) ? body.map((item) => item.message).join(', ') : null) ||
        error.message ||
        'BigCommerce request failed';

      const wrapped = new Error(message);
      wrapped.statusCode = status;
      wrapped.details = body;
      return Promise.reject(wrapped);
    }
  );

  return client;
}

const v3 = createAdminClient('v3');
const v2 = createAdminClient('v2');

const payments = axios.create({
  baseURL: `https://payments.bigcommerce.com/stores/${storeHash}`,
  timeout: 20000,
  headers: {
    Accept: 'application/vnd.bc.v1+json',
    'Content-Type': 'application/json',
  },
});

payments.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 500;
    const body = error.response?.data;
    const message =
      body?.title ||
      body?.message ||
      (Array.isArray(body?.errors) ? body.errors.map((item) => item.message).join(', ') : null) ||
      error.message ||
      'Payment request failed';

    const wrapped = new Error(message);
    wrapped.statusCode = status;
    wrapped.details = body;
    return Promise.reject(wrapped);
  }
);

const storefrontGraphql = axios.create({
  baseURL: `https://store-${storeHash}.mybigcommerce.com/graphql`,
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${storefrontToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

module.exports = v3;
module.exports.v3 = v3;
module.exports.v2 = v2;
module.exports.payments = payments;
module.exports.storefrontGraphql = storefrontGraphql;
module.exports.isConfigured = () => Boolean(storeHash && accessToken);
module.exports.hasStorefrontToken = () => Boolean(storefrontToken);
