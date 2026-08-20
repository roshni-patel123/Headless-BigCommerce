const CHECKOUT_DRAFT_KEY = 'velora_checkout_draft';

const DEFAULT_FORM = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  stateOrProvince: '',
  postalCode: '',
  countryCode: 'US',
  sameAsShipping: true,
  shippingOptionId: '',
  giftCertificateCode: '',
  paymentMethod: '',
  cardNumber: '',
  cardExpiry: '',
  cardName: '',
  cardCvv: '',
  billFirstName: '',
  billLastName: '',
  billAddress1: '',
  billAddress2: '',
  billCity: '',
  billPostalCode: '',
  billStateOrProvince: '',
  billCountryCode: '',
  billPhone: '',
};

function sanitizeForm(form = {}) {
  const {
    cardNumber,
    cardCvv,
    cardExpiry,
    cardName,
    ...safe
  } = form;
  return { ...DEFAULT_FORM, ...safe };
}

export function readCheckoutDraft() {
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return null;
    return {
      step: Math.min(Math.max(Number(draft.step) || 0, 0), 3),
      form: sanitizeForm(draft.form || {}),
      shippingReady: Boolean(draft.shippingReady),
      selectedAddressId: draft.selectedAddressId ? String(draft.selectedAddressId) : '',
      cartId: draft.cartId || null,
      updatedAt: draft.updatedAt || null,
    };
  } catch {
    return null;
  }
}

export function writeCheckoutDraft(draft) {
  try {
    localStorage.setItem(
      CHECKOUT_DRAFT_KEY,
      JSON.stringify({
        step: draft.step,
        form: sanitizeForm(draft.form),
        shippingReady: Boolean(draft.shippingReady),
        selectedAddressId: draft.selectedAddressId || '',
        cartId: draft.cartId || null,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearCheckoutDraft() {
  localStorage.removeItem(CHECKOUT_DRAFT_KEY);
}

export { DEFAULT_FORM, CHECKOUT_DRAFT_KEY };
