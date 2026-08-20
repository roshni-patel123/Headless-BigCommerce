const { v2, v3, payments } = require('../../config/bigcommerce');
const env = require('../../config/env');

const OFFLINE_TYPES = new Set(['offline', 'manual', 'cheque', 'cod', 'moneyorder', 'bankdeposit']);
const CARD_GATEWAY_CODES = new Set([
  'bigpaypay',
  'stripe',
  'stripev3',
  'authorizenet',
  'braintree',
  'adyen',
  'cybersource',
  'eway',
  'mollie',
]);
const HIDDEN_CHECKOUT_CODES = new Set([
  'bigcommerce_gift_certificate',
  'bigcommerce_store_credit',
]);

function isOfflineMethod(method = {}) {
  const type = String(method.type || '').toLowerCase();
  const id = String(method.id || method.code || '').toLowerCase();
  if (type === 'store_credit' || type === 'gift_certificate' || type === 'card') return false;
  if (OFFLINE_TYPES.has(type)) return true;
  return (
    id.includes('cod') ||
    id.includes('cheque') ||
    id.includes('check') ||
    id.includes('manual') ||
    id.includes('offline') ||
    id.includes('moneyorder') ||
    id.includes('bankdeposit') ||
    id.includes('purchaseorder') ||
    id === 'manual'
  );
}

function mapV3Method(method = {}) {
  return {
    id: method.id,
    name: method.name || method.id,
    type: method.type || 'card',
    testMode: Boolean(method.test_mode),
    storedInstruments: method.stored_instruments || [],
    source: 'payments_api',
  };
}

function mapV2Method(method = {}) {
  const code = method.code || method.name || 'manual';
  const lower = String(code).toLowerCase();
  let type = method.type || 'gateway';

  if (lower.includes('store_credit')) type = 'store_credit';
  else if (lower.includes('gift_certificate')) type = 'gift_certificate';
  else if (isOfflineMethod({ id: code, type })) type = 'offline';
  else if (CARD_GATEWAY_CODES.has(lower) || lower.includes('card')) type = 'card';

  return {
    id: code,
    code,
    name: method.name || code,
    type,
    testMode: Boolean(method.test_mode),
    storedInstruments: [],
    source: 'store',
  };
}

function isSelectableCheckoutMethod(method = {}) {
  const code = String(method.code || method.id || '').toLowerCase();
  if (HIDDEN_CHECKOUT_CODES.has(code)) return false;
  if (method.type === 'gift_certificate') return false;
  return true;
}

function matchPaymentMethod(methods = [], methodId) {
  if (!methodId) return null;
  const needle = String(methodId).toLowerCase();
  return (
    methods.find((method) => String(method.id).toLowerCase() === needle) ||
    methods.find((method) => String(method.code || '').toLowerCase() === needle) ||
    methods.find((method) => String(method.id).toLowerCase().startsWith(`${needle}.`)) ||
    null
  );
}

/** Payments API expects ids like bigpaypay.card, not the store gateway code alone. */
function resolveCardPaymentMethodId(selected, accepted = []) {
  if (!selected) return null;

  if (selected.source === 'payments_api' && selected.type === 'card' && selected.id) {
    return selected.id;
  }

  const code = String(selected.code || selected.id || '')
    .toLowerCase()
    .split('.')[0];

  const fromAccepted =
    matchPaymentMethod(accepted, selected.id) ||
    accepted.find((method) => {
      if (method.type !== 'card') return false;
      const id = String(method.id || '').toLowerCase();
      return id === `${code}.card` || id.startsWith(`${code}.`);
    });

  if (fromAccepted?.id) return fromAccepted.id;
  if (code) return `${code}.card`;
  return selected.id || null;
}

function mergePaymentMethods(storeMethods = [], acceptedMethods = []) {
  const byId = new Map();

  storeMethods.forEach((method) => {
    byId.set(String(method.id).toLowerCase(), method);
  });

  acceptedMethods.forEach((method) => {
    const key = String(method.id).toLowerCase();
    const existing = byId.get(key);
    if (existing) {
      byId.set(key, {
        ...existing,
        ...method,
        name: method.name || existing.name,
        type: method.type || existing.type,
        source: 'payments_api',
      });
      return;
    }

    // Prefer Payments API card method ids when store list only has a gateway code.
    const gatewayKey = key.split('.')[0];
    const matchedStore = [...byId.values()].find((item) => {
      const code = String(item.code || item.id || '').toLowerCase();
      return code === gatewayKey || code.startsWith(`${gatewayKey}.`);
    });

    if (matchedStore && method.type === 'card') {
      byId.delete(String(matchedStore.id).toLowerCase());
      byId.set(key, {
        ...matchedStore,
        ...method,
        name: method.name || matchedStore.name,
        type: method.type,
        source: 'payments_api',
      });
      return;
    }

    byId.set(key, method);
  });

  return Array.from(byId.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
}

class PaymentRepository {
  channelId() {
    return env.bigcommerce.channelId ? Number(env.bigcommerce.channelId) : undefined;
  }

  async getEnabledStoreMethods() {
    try {
      const response = await v2.get('/payments/methods');
      const rows = Array.isArray(response.data) ? response.data : response.data?.data || [];
      return rows.map(mapV2Method).filter((method) => method.id);
    } catch (error) {
      console.warn('[payments] v2 methods failed:', error.message);
      return [];
    }
  }

  async getMethodsForCheckout(checkoutId, { currencyCode } = {}) {
    const params = { checkout_id: checkoutId };
    if (currencyCode) params.currency_code = currencyCode;
    const channelId = this.channelId();
    if (channelId) params.channel_id = channelId;

    try {
      const response = await v3.get('/payments/methods', { params });
      return (response.data.data || []).map(mapV3Method);
    } catch (error) {
      console.warn('[payments] v3 checkout methods failed:', error.message, error.details || '');
      return [];
    }
  }

  async getMethodsForOrder(orderId) {
    try {
      const response = await v3.get('/payments/methods', {
        params: { order_id: Number(orderId) },
      });
      return (response.data.data || []).map(mapV3Method);
    } catch (error) {
      console.warn('[payments] v3 order methods failed:', error.message);
      return [];
    }
  }

  async getCheckoutPaymentMethods(checkoutId, { currencyCode } = {}) {
    const [storeMethods, acceptedMethods] = await Promise.all([
      this.getEnabledStoreMethods(),
      this.getMethodsForCheckout(checkoutId, { currencyCode }),
    ]);

    const merged = mergePaymentMethods(storeMethods, acceptedMethods).filter(
      isSelectableCheckoutMethod
    );
    if (merged.length) return merged;

    // Last-resort fallback so checkout always has at least one selectable option.
    return [
      {
        id: 'manual',
        name: 'Pay on confirmation',
        type: 'offline',
        testMode: false,
        storedInstruments: [],
        source: 'fallback',
      },
    ];
  }

  async createAccessToken(orderId) {
    const response = await v3.post('/payments/access_tokens', {
      order: { id: Number(orderId) },
    });
    return response.data.data?.id;
  }

  async processPayment(patToken, payload) {
    const response = await payments.post('/payments', payload, {
      headers: {
        Authorization: `PAT ${patToken}`,
      },
    });
    return response.data.data;
  }

  async processCardPayment(orderId, paymentMethodId, card = {}) {
    const pat = await this.createAccessToken(orderId);
    return this.processPayment(pat, {
      payment: {
        instrument: {
          type: 'card',
          number: card.number,
          cardholder_name: card.cardholderName || card.cardholder_name,
          expiry_month: Number(card.expiryMonth || card.expiry_month),
          expiry_year: Number(card.expiryYear || card.expiry_year),
          verification_value: card.verificationValue || card.cvv,
        },
        payment_method_id: paymentMethodId,
      },
    });
  }

  async processStoreCredit(orderId, paymentMethodId) {
    const pat = await this.createAccessToken(orderId);
    return this.processPayment(pat, {
      payment: {
        instrument: { type: 'store_credit' },
        payment_method_id: paymentMethodId,
      },
    });
  }

  /**
   * After POST /checkouts/{id}/orders the order is always Incomplete (status 0).
   * Offline/manual methods must be finalized by moving to Awaiting Payment (7).
   * Card/gateway methods must use the Payments API.
   */
  async finalizeOrderPayment(orderId, payment = {}) {
    const [accepted, storeMethods] = await Promise.all([
      this.getMethodsForOrder(orderId),
      this.getEnabledStoreMethods(),
    ]);
    const methods = mergePaymentMethods(storeMethods, accepted).filter(isSelectableCheckoutMethod);
    const methodId = payment.paymentMethodId || payment.method;
    let selected = matchPaymentMethod(methods, methodId);

    if (!selected && methodId) {
      // Keep an explicit offline selection even if merge filtered oddly.
      selected = matchPaymentMethod(storeMethods, methodId);
    }

    if (!selected && methods.length) {
      selected =
        methods.find((method) => isOfflineMethod(method)) ||
        methods.find((method) => method.type === 'card') ||
        methods[0];
    }

    const wantsCard = Boolean(payment.card) && selected?.type === 'card';

    if (wantsCard) {
      const cardMethodId = resolveCardPaymentMethodId(selected, accepted);
      if (!cardMethodId) {
        const error = new Error('No card payment method is available for this order');
        error.statusCode = 402;
        throw error;
      }

      try {
        const result = await this.processCardPayment(orderId, cardMethodId, payment.card);
        return {
          mode: 'card',
          result,
          status: 'paid',
          paymentMethod: selected?.name || 'Card',
        };
      } catch (error) {
        // Retry once with the canonical .card id when the store code was used.
        const fallbackId = String(cardMethodId).includes('.')
          ? null
          : `${String(cardMethodId).split('.')[0]}.card`;
        if (fallbackId && fallbackId !== cardMethodId) {
          const result = await this.processCardPayment(orderId, fallbackId, payment.card);
          return {
            mode: 'card',
            result,
            status: 'paid',
            paymentMethod: selected?.name || 'Card',
          };
        }
        throw error;
      }
    }

    if (selected?.type === 'store_credit') {
      const creditId =
        selected.source === 'payments_api'
          ? selected.id
          : matchPaymentMethod(accepted, selected.id)?.id || selected.id;
      const result = await this.processStoreCredit(orderId, creditId);
      return { mode: 'store_credit', result, status: 'paid', paymentMethod: selected.name };
    }

    if (selected?.type === 'card' && !payment.card) {
      const error = new Error('Enter your card details to continue');
      error.statusCode = 400;
      throw error;
    }

    // Offline methods (COD, Check, money order, etc.) — same as hosted BC checkout.
    if (isOfflineMethod(selected) || selected?.type === 'offline' || !selected) {
      return {
        mode: 'offline',
        status: 'awaiting_payment',
        paymentMethod: selected?.name || payment.method || 'Manual',
      };
    }

    if (!payment.card) {
      return {
        mode: 'offline',
        status: 'awaiting_payment',
        paymentMethod: selected?.name || payment.method || 'Manual',
      };
    }

    return {
      mode: 'unknown',
      status: 'awaiting_payment',
      paymentMethod: selected?.name || 'Manual',
    };
  }
}

module.exports = new PaymentRepository();
module.exports.isOfflineMethod = isOfflineMethod;
