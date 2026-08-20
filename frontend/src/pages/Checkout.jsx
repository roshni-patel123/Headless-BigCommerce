import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/common/EmptyState';
import SafeImage from '../components/common/SafeImage';
import CouponForm from '../components/cart/CouponForm';
import SeoHead from '../components/seo/SeoHead';
import {
  applyCheckoutCoupon,
  applyGiftCertificate,
  getPaymentMethods,
  placeOrder,
  removeCheckoutCoupon,
  selectShippingOption,
  setBilling,
  setContact,
  setShipping,
  startCheckout,
} from '../services/checkoutService';
import { getAddresses } from '../services/customerService';
import { formatPrice } from '../utils/format';
import {
  clearCheckoutDraft,
  DEFAULT_FORM,
  readCheckoutDraft,
  writeCheckoutDraft,
} from '../utils/checkoutDraft';
import { getToken } from '../utils/session';
import CountryFields from '../components/common/CountryFields';
import styles from './Checkout.module.scss';

const STEPS = ['Customer', 'Shipping', 'Billing', 'Payment'];
const initialDraft = readCheckoutDraft();

function formatPersonAddress(data = {}) {
  return [
    `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    data.phone,
    [data.address1, data.address2].filter(Boolean).join(', '),
    [data.city, data.stateOrProvince, data.postalCode].filter(Boolean).join(', '),
    data.countryCode,
  ].filter(Boolean);
}

function parseExpiry(value = '') {
  const cleaned = String(value).replace(/\s/g, '');
  const [month, yearPart] = cleaned.split(/[/\-]/);
  const year = yearPart?.length === 2 ? `20${yearPart}` : yearPart;
  return {
    expiryMonth: Number(month) || 0,
    expiryYear: Number(year) || 0,
  };
}

function methodLabel(method = {}) {
  return method.name || method.id || 'Payment method';
}

function isCardMethod(method = {}) {
  return String(method.type || '').toLowerCase() === 'card';
}

function Checkout() {
  const { cart, refresh } = useCart();
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(() => {
    if (initialDraft?.step != null) return initialDraft.step;
    return getToken() ? 1 : 0;
  });
  const [checkout, setCheckout] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(() => initialDraft?.selectedAddressId || '');
  const [shippingReady, setShippingReady] = useState(() => Boolean(initialDraft?.shippingReady));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [accountReady, setAccountReady] = useState(false);
  const [contactSynced, setContactSynced] = useState(() => (initialDraft?.step || 0) > 0);
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...(initialDraft?.form || {}),
  }));

  useEffect(() => {
    if (!cart.items?.length) {
      clearCheckoutDraft();
      return undefined;
    }
    let active = true;
    setBusy(true);
    startCheckout()
      .then(async (res) => {
        if (!active) return;
        setCheckout(res.data.checkout || res.data);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [cart.items?.length]);

  useEffect(() => {
    if (!cart.items?.length) return;
    writeCheckoutDraft({
      step,
      form,
      shippingReady,
      selectedAddressId,
      cartId: cart.id,
    });
  }, [step, form, shippingReady, selectedAddressId, cart.id, cart.items?.length]);

  useEffect(() => {
    if (authLoading || accountReady) return undefined;
    if (!user) {
      setAccountReady(true);
      return undefined;
    }

    let active = true;

    async function prefillFromAccount() {
      const profile = {
        email: user.email || '',
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      };

      let list = user.addresses || [];
      try {
        const res = await getAddresses();
        if (res.data?.length) list = res.data;
      } catch {
        // ignore
      }

      if (!active) return;
      setAddresses(list);
      const address = list.find((item) => String(item.id) === selectedAddressId) || list[0] || null;
      if (address?.id && !selectedAddressId) setSelectedAddressId(String(address.id));

      setForm((current) => ({
        ...current,
        email: current.email || profile.email,
        phone: current.phone || address?.phone || profile.phone,
        firstName: current.firstName || address?.firstName || profile.firstName,
        lastName: current.lastName || address?.lastName || profile.lastName,
        address1: current.address1 || address?.address1 || '',
        address2: current.address2 || address?.address2 || '',
        city: current.city || address?.city || '',
        stateOrProvince: current.stateOrProvince || address?.stateOrProvince || '',
        postalCode: current.postalCode || address?.postalCode || '',
        countryCode: current.countryCode || address?.countryCode || 'US',
      }));
      setAccountReady(true);
    }

    prefillFromAccount();
    return () => {
      active = false;
    };
  }, [user, authLoading, accountReady, selectedAddressId]);

  // Skip contact step when logged in.
  useEffect(() => {
    if (!accountReady || !user || !checkout || contactSynced) return undefined;
    const email = form.email || user.email;
    if (!email) return undefined;

    let active = true;
    setBusy(true);
    setContact({ email })
      .then((result) => {
        if (!active) return;
        applyContactResult(result.data || {});
        setContactSynced(true);
        setStep((current) => (current < 1 ? 1 : current));
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountReady, user, checkout, contactSynced, form.email]);

  // Restore shipping after refresh.
  useEffect(() => {
    if (!checkout || !shippingReady || !form.address1 || !(form.email || user?.email)) return undefined;
    let active = true;
    const email = form.email || user?.email;
    setShipping({
      email,
      firstName: form.firstName,
      lastName: form.lastName,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      stateOrProvince: form.stateOrProvince,
      postalCode: form.postalCode,
      countryCode: form.countryCode,
      phone: form.phone,
    })
      .then(async (result) => {
        if (!active) return;
        setCheckout(result.data);
        if (form.sameAsShipping || step >= 2) {
          try {
            const billing = await setBilling({
              email,
              firstName: form.sameAsShipping ? form.firstName : form.billFirstName || form.firstName,
              lastName: form.sameAsShipping ? form.lastName : form.billLastName || form.lastName,
              address1: form.sameAsShipping ? form.address1 : form.billAddress1 || form.address1,
              address2: form.sameAsShipping ? form.address2 : form.billAddress2 || form.address2,
              city: form.sameAsShipping ? form.city : form.billCity || form.city,
              stateOrProvince: form.sameAsShipping
                ? form.stateOrProvince
                : form.billStateOrProvince || form.stateOrProvince,
              postalCode: form.sameAsShipping ? form.postalCode : form.billPostalCode || form.postalCode,
              countryCode: form.sameAsShipping
                ? form.countryCode
                : form.billCountryCode || form.countryCode,
              phone: form.sameAsShipping ? form.phone : form.billPhone || form.phone,
            });
            if (active) setCheckout(billing.data);
          } catch {
            // retry on place order
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout?.id, shippingReady]);

  useEffect(() => {
    if (step !== 3) return undefined;
    let active = true;
    setMessage('');
    getPaymentMethods()
      .then((res) => {
        if (!active) return;
        const methods = Array.isArray(res.data) ? res.data : [];
        setPaymentMethods(methods);
        setForm((current) => {
          if (methods.some((method) => method.id === current.paymentMethod)) {
            return current;
          }
          const preferred =
            methods.find((method) => isCardMethod(method)) ||
            methods[0];
          return preferred ? { ...current, paymentMethod: preferred.id } : current;
        });
      })
      .catch((error) => {
        if (!active) return;
        setPaymentMethods([]);
        setMessage(error.message || 'Could not load payment methods');
      });
    return () => {
      active = false;
    };
  }, [step]);

  const selectedPayment = useMemo(
    () => paymentMethods.find((method) => method.id === form.paymentMethod) || null,
    [paymentMethods, form.paymentMethod]
  );

  if (!cart.items?.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        text="Add items to your cart before checking out."
        actionLabel="Browse products"
        to="/products"
      />
    );
  }

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function applySavedAddress(address) {
    if (!address) return;
    setSelectedAddressId(String(address.id));
    setShippingReady(false);
    setForm((current) => ({
      ...current,
      firstName: address.firstName || current.firstName,
      lastName: address.lastName || current.lastName,
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      stateOrProvince: address.stateOrProvince || '',
      postalCode: address.postalCode || '',
      countryCode: address.countryCode || 'US',
      phone: address.phone || current.phone,
      shippingOptionId: '',
    }));
  }

  const addressPayload = {
    email: form.email || user?.email || '',
    firstName: form.firstName,
    lastName: form.lastName,
    address1: form.address1,
    address2: form.address2,
    city: form.city,
    stateOrProvince: form.stateOrProvince,
    postalCode: form.postalCode,
    countryCode: form.countryCode,
    phone: form.phone,
  };

  function editStep(nextStep) {
    setMessage('');
    if (nextStep <= 1) setShippingReady(false);
    setStep(nextStep);
  }

  function applyAddressToForm(address = {}, profile = {}) {
    setForm((current) => {
      const blank = (value) => !value || value === 'TBD';
      return {
        ...current,
        email: current.email || profile.email || '',
        phone: address.phone || profile.phone || current.phone || '',
        firstName: address.firstName || profile.firstName || current.firstName || '',
        lastName: address.lastName || profile.lastName || current.lastName || '',
        address1: address.address1 || (blank(current.address1) ? '' : current.address1),
        address2: address.address2 || current.address2 || '',
        city: address.city || (blank(current.city) ? '' : current.city),
        stateOrProvince: address.stateOrProvince || current.stateOrProvince || '',
        postalCode: address.postalCode || current.postalCode || '',
        countryCode: address.countryCode || current.countryCode || 'US',
      };
    });
  }

  function applyContactResult(payload = {}) {
    const checkoutData = payload.checkout || payload;
    if (checkoutData?.id) setCheckout(checkoutData);

    const list = Array.isArray(payload.addresses) ? payload.addresses : [];
    if (list.length) {
      setAddresses(list);
      const address = list.find((item) => String(item.id) === selectedAddressId) || list[0];
      if (address?.id) setSelectedAddressId(String(address.id));
      applyAddressToForm(address || {}, payload.matchedCustomer || {});
      return Boolean(address?.address1);
    }

    if (payload.matchedCustomer) {
      applyAddressToForm({}, payload.matchedCustomer);
    }
    return false;
  }

  async function saveContact() {
    setBusy(true);
    setMessage('');
    try {
      const result = await setContact({ email: form.email });
      const filled = applyContactResult(result.data || {});
      setContactSynced(true);
      setStep(1);
      if (filled) {
        setMessage('Address filled from your store account.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveShippingStep() {
    setBusy(true);
    setMessage('');
    try {
      if (!shippingReady || !shippingOptions.length) {
        const result = await setShipping(addressPayload);
        setCheckout(result.data);
        if (form.sameAsShipping) {
          await setBilling(addressPayload);
        }
        setShippingReady(true);
        const options = result.data?.consignments?.[0]?.availableShippingOptions || [];
        if (options.length === 1) {
          update('shippingOptionId', options[0].id);
        }
        return;
      }

      const optionId =
        form.shippingOptionId ||
        (shippingOptions.length === 1 ? shippingOptions[0].id : '');

      if (!optionId) {
        setMessage('Select a shipping method to continue.');
        return;
      }

      const result = await selectShippingOption({ shippingOptionId: optionId });
      setCheckout(result.data);
      if (optionId !== form.shippingOptionId) {
        update('shippingOptionId', optionId);
      }
      if (!form.sameAsShipping) {
        setStep(2);
      } else {
        const billing = await setBilling(addressPayload);
        setCheckout(billing.data);
        setStep(3);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveBilling() {
    setBusy(true);
    setMessage('');
    try {
      const payload = form.sameAsShipping
        ? addressPayload
        : {
            ...addressPayload,
            firstName: form.billFirstName || form.firstName,
            lastName: form.billLastName || form.lastName,
            address1: form.billAddress1 || form.address1,
            address2: form.billAddress2 || form.address2,
            city: form.billCity || form.city,
            stateOrProvince: form.billStateOrProvince || form.stateOrProvince,
            postalCode: form.billPostalCode || form.postalCode,
            countryCode: form.billCountryCode || form.countryCode,
            phone: form.billPhone || form.phone,
          };
      const result = await setBilling(payload);
      setCheckout(result.data);
      setStep(3);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function onPlaceOrder(event) {
    event.preventDefault();
    if (!form.paymentMethod && paymentMethods.length) {
      setMessage('Select a payment method.');
      return;
    }

    if (isCardMethod(selectedPayment)) {
      if (!form.cardNumber || !form.cardExpiry || !form.cardName || !form.cardCvv) {
        setMessage('Enter your card details to continue.');
        return;
      }
    }

    const email = (form.email || user?.email || '').trim();
    if (!email) {
      setMessage('Contact email is required.');
      setStep(0);
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const optionId =
        form.shippingOptionId ||
        checkout?.consignments?.[0]?.selectedShippingOption?.id ||
        checkout?.consignments?.[0]?.availableShippingOptions?.[0]?.id ||
        '';

      if (optionId && !checkout?.consignments?.[0]?.selectedShippingOption) {
        const shipped = await selectShippingOption({ shippingOptionId: optionId });
        setCheckout(shipped.data);
      }
      if (optionId && !form.shippingOptionId) {
        update('shippingOptionId', optionId);
      }

      const billingPayload = form.sameAsShipping
        ? { ...addressPayload, email }
        : {
            ...addressPayload,
            email,
            firstName: form.billFirstName || form.firstName,
            lastName: form.billLastName || form.lastName,
            address1: form.billAddress1 || form.address1,
            address2: form.billAddress2 || form.address2,
            city: form.billCity || form.city,
            stateOrProvince: form.billStateOrProvince || form.stateOrProvince,
            postalCode: form.billPostalCode || form.postalCode,
            countryCode: form.billCountryCode || form.countryCode,
            phone: form.billPhone || form.phone,
          };
      const billing = await setBilling(billingPayload);
      setCheckout(billing.data);

      const { expiryMonth, expiryYear } = parseExpiry(form.cardExpiry);
      const payment = {
        paymentMethodId: form.paymentMethod || 'manual',
        method: form.paymentMethod || 'manual',
        email,
        shippingOptionId: optionId || form.shippingOptionId,
      };
      if (isCardMethod(selectedPayment)) {
        payment.card = {
          number: form.cardNumber.replace(/\s+/g, ''),
          cardholderName: form.cardName,
          expiryMonth,
          expiryYear,
          cvv: form.cardCvv,
        };
      }

      const result = await placeOrder(payment, {
        email,
        address: billingPayload,
        shippingOptionId: optionId || form.shippingOptionId,
      });
      await refresh();
      clearCheckoutDraft();
      const orderId = result.data.orderId;
      const orderEmail = result.data.email || email;
      if (orderId && orderEmail) {
        localStorage.setItem('velora:lastOrder', JSON.stringify({ orderId, email: orderEmail }));
      }
      navigate(`/orders/${orderId}?email=${encodeURIComponent(orderEmail)}`, { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  const summary = checkout || {};
  const consignments = summary.consignments || [];
  const shippingOptions = consignments[0]?.availableShippingOptions || [];
  const selectedShipping =
    shippingOptions.find((option) => option.id === form.shippingOptionId) ||
    consignments[0]?.selectedShippingOption ||
    null;
  const coupons = summary.coupons?.length ? summary.coupons : cart.coupons || [];
  const automaticDiscounts = summary.cart?.discounts || cart.discounts || [];
  const couponTotal = coupons.reduce(
    (sum, coupon) => sum + (Number(coupon.discountAmount) || 0),
    0
  );
  const automaticTotal = automaticDiscounts.reduce(
    (sum, discount) => sum + (Number(discount.amount) || 0),
    0
  );
  const discountTotal = Math.max(
    Number(summary.discountAmount) || 0,
    Number(cart.discountAmount) || 0,
    couponTotal + automaticTotal
  );
  const totals = {
    subtotal: summary.subtotal ?? cart.subtotal,
    shipping: summary.shippingCost ?? selectedShipping?.cost ?? 0,
    tax: summary.taxTotal ?? 0,
    couponTotal,
    automaticTotal,
    discountTotal,
    total: summary.grandTotal ?? cart.total,
  };

  const customerDone = step > 0 && Boolean(form.email);
  const shippingDone = step > 1 && Boolean(form.address1 && selectedShipping);
  const billingDone = step > 2;

  return (
    <div className={`container page ${styles.page}`} data-theme-region="checkout">
      <SeoHead title="Checkout" />
      <div className={styles.head}>
        <p className="eyebrow">Checkout</p>
        <h1>Checkout</h1>
        <ol className={styles.steps}>
          {STEPS.map((label, index) => (
            <li key={label} className={index === step ? styles.stepOn : index < step ? styles.stepDone : ''}>
              {label}
            </li>
          ))}
        </ol>
        {message && <p className={styles.hint}>{message}</p>}
      </div>

      <div className={styles.layout}>
        <div className={styles.form}>
          <section className={styles.block}>
            <div className={styles.blockHead}>
              <h2>Customer</h2>
              {customerDone && step !== 0 && (
                <button type="button" className={styles.editBtn} onClick={() => editStep(0)}>
                  Edit
                </button>
              )}
            </div>
            {step === 0 ? (
              <>
                {user ? (
                  <div className={styles.customerRow}>
                    <div>
                      <p className={styles.summaryLine}>{form.email || user.email}</p>
                      <p className={styles.hint}>Signed in</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        logout();
                        setContactSynced(false);
                        setStep(0);
                        setForm((current) => ({ ...current, email: '' }));
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                  />
                )}
                {!user && (
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                  />
                )}
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={busy || !form.email}
                  onClick={saveContact}
                >
                  Continue
                </button>
              </>
            ) : (
              customerDone && (
                <div className={styles.customerRow}>
                  <p className={styles.summaryLine}>{form.email}</p>
                  {user && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        logout();
                        setContactSynced(false);
                        setStep(0);
                        setForm((current) => ({ ...current, email: '' }));
                      }}
                    >
                      Sign out
                    </button>
                  )}
                </div>
              )
            )}
          </section>

          <section className={styles.block}>
            <div className={styles.blockHead}>
              <h2>Shipping</h2>
              {shippingDone && step !== 1 && (
                <button type="button" className={styles.editBtn} onClick={() => editStep(1)}>
                  Edit
                </button>
              )}
            </div>

            {step === 1 ? (
              <>
                <p className={styles.subheading}>Shipping address</p>
                {addresses.length > 0 && (
                  <label className={styles.selectLabel}>
                    Saved addresses
                    <select
                      value={selectedAddressId}
                      onChange={(event) => {
                        const next = addresses.find((item) => String(item.id) === event.target.value);
                        if (next) applySavedAddress(next);
                      }}
                    >
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.firstName} {address.lastName} — {address.address1}, {address.city}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className={styles.row}>
                  <input required placeholder="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
                  <input required placeholder="Last name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
                </div>
                <input required placeholder="Address" value={form.address1} onChange={(e) => update('address1', e.target.value)} />
                <input placeholder="Apartment, suite (optional)" value={form.address2} onChange={(e) => update('address2', e.target.value)} />
                <div className={styles.row}>
                  <input required placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
                  <input placeholder="State / Province" value={form.stateOrProvince} onChange={(e) => update('stateOrProvince', e.target.value)} />
                </div>
                <input required placeholder="Postal code" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} />
                <CountryFields
                  idPrefix="checkout-shipping"
                  countryCode={form.countryCode}
                  phone={form.phone}
                  required
                  onCountryChange={(countryCode) => {
                    setShippingReady(false);
                    update('countryCode', countryCode);
                  }}
                  onPhoneChange={(phone) => update('phone', phone)}
                />
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={form.sameAsShipping}
                    onChange={(event) => update('sameAsShipping', event.target.checked)}
                  />
                  My billing address is the same as my shipping address
                </label>

                {shippingReady && (
                  <>
                    <p className={styles.subheading}>Shipping method</p>
                    {shippingOptions.length ? (
                      <div className={styles.options}>
                        {shippingOptions.map((option) => (
                          <label
                            key={option.id}
                            className={`${styles.option} ${form.shippingOptionId === option.id ? styles.optionOn : ''}`}
                          >
                            <input
                              type="radio"
                              name="shippingOption"
                              checked={form.shippingOptionId === option.id}
                              onChange={() => update('shippingOptionId', option.id)}
                            />
                            <span>{option.description}</span>
                            <strong>{formatPrice(option.cost)}</strong>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.hint}>No shipping methods for this address.</p>
                    )}
                  </>
                )}

                <div className={styles.actionsRow}>
                  <button className="btn btn-ghost" type="button" onClick={() => editStep(0)}>Back</button>
                  <button className="btn btn-primary" type="button" disabled={busy} onClick={saveShippingStep}>
                    {shippingReady ? 'Continue' : 'Continue'}
                  </button>
                </div>
              </>
            ) : (
              shippingDone && (
                <div className={styles.summaryBlock}>
                  {formatPersonAddress(form).map((line) => (
                    <p key={line} className={styles.summaryLine}>{line}</p>
                  ))}
                  {selectedShipping && (
                    <p className={styles.summaryMeta}>
                      {selectedShipping.description} · {formatPrice(selectedShipping.cost)}
                    </p>
                  )}
                </div>
              )
            )}
          </section>

          <section className={styles.block}>
            <div className={styles.blockHead}>
              <h2>Billing</h2>
              {billingDone && step !== 2 && (
                <button type="button" className={styles.editBtn} onClick={() => editStep(2)}>
                  Edit
                </button>
              )}
            </div>

            {step === 2 ? (
              <>
                {!form.sameAsShipping && (
                  <>
                    <p className={styles.subheading}>Billing address</p>
                    <div className={styles.row}>
                      <input placeholder="First name" value={form.billFirstName || ''} onChange={(e) => update('billFirstName', e.target.value)} />
                      <input placeholder="Last name" value={form.billLastName || ''} onChange={(e) => update('billLastName', e.target.value)} />
                    </div>
                    <input placeholder="Address" value={form.billAddress1 || ''} onChange={(e) => update('billAddress1', e.target.value)} />
                    <input placeholder="Apartment, suite (optional)" value={form.billAddress2 || ''} onChange={(e) => update('billAddress2', e.target.value)} />
                    <div className={styles.row}>
                      <input placeholder="City" value={form.billCity || ''} onChange={(e) => update('billCity', e.target.value)} />
                      <input placeholder="Postal code" value={form.billPostalCode || ''} onChange={(e) => update('billPostalCode', e.target.value)} />
                    </div>
                  </>
                )}
                {form.sameAsShipping && (
                  <p className={styles.hint}>Billing address matches shipping.</p>
                )}
                <div className={styles.row}>
                  <input
                    placeholder="Gift certificate"
                    value={form.giftCertificateCode}
                    onChange={(e) => update('giftCertificateCode', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      applyGiftCertificate(form.giftCertificateCode)
                        .then((res) => setCheckout(res.data))
                        .catch((error) => setMessage(error.message))
                    }
                  >
                    Apply gift
                  </button>
                </div>
                <div className={styles.actionsRow}>
                  <button className="btn btn-ghost" type="button" onClick={() => editStep(1)}>Back</button>
                  <button className="btn btn-primary" type="button" disabled={busy} onClick={saveBilling}>
                    Continue to payment
                  </button>
                </div>
              </>
            ) : (
              billingDone && (
                <div className={styles.summaryBlock}>
                  {form.sameAsShipping
                    ? formatPersonAddress(form).map((line) => (
                        <p key={line} className={styles.summaryLine}>{line}</p>
                      ))
                    : formatPersonAddress({
                        firstName: form.billFirstName || form.firstName,
                        lastName: form.billLastName || form.lastName,
                        phone: form.billPhone || form.phone,
                        address1: form.billAddress1 || form.address1,
                        address2: form.billAddress2 || form.address2,
                        city: form.billCity || form.city,
                        stateOrProvince: form.billStateOrProvince || form.stateOrProvince,
                        postalCode: form.billPostalCode || form.postalCode,
                        countryCode: form.billCountryCode || form.countryCode,
                      }).map((line) => (
                        <p key={line} className={styles.summaryLine}>{line}</p>
                      ))}
                </div>
              )
            )}
          </section>

          <section className={styles.block}>
            <div className={styles.blockHead}>
              <h2>Payment</h2>
            </div>
            {step === 3 ? (
              <form onSubmit={onPlaceOrder} className={styles.paymentForm}>
                <p className={styles.subheading}>Payment methods</p>
                {(paymentMethods.length
                  ? paymentMethods
                  : [{ id: 'manual', name: 'Pay on confirmation', type: 'offline' }]
                ).map((method) => {
                  const selected = form.paymentMethod === method.id;
                  return (
                    <div
                      key={method.id || method.name}
                      className={`${styles.paymentMethod} ${selected ? styles.paymentOn : ''}`}
                    >
                      <label className={styles.paymentLabel}>
                        <input
                          type="radio"
                          name="payment"
                          checked={selected}
                          onChange={() => update('paymentMethod', method.id)}
                        />
                        <span>
                          {methodLabel(method)}
                          {method.testMode ? ' (Test)' : ''}
                        </span>
                      </label>
                      {selected && isCardMethod(method) && (
                        <div className={styles.cardFields}>
                          <input
                            required
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="Card number"
                            value={form.cardNumber}
                            onChange={(event) => update('cardNumber', event.target.value)}
                          />
                          <div className={styles.row}>
                            <input
                              required
                              autoComplete="cc-exp"
                              placeholder="MM / YY"
                              value={form.cardExpiry}
                              onChange={(event) => update('cardExpiry', event.target.value)}
                            />
                            <input
                              required
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              placeholder="CVV"
                              value={form.cardCvv}
                              onChange={(event) => update('cardCvv', event.target.value)}
                            />
                          </div>
                          <input
                            required
                            autoComplete="cc-name"
                            placeholder="Name on card"
                            value={form.cardName}
                            onChange={(event) => update('cardName', event.target.value)}
                          />
                        </div>
                      )}
                      {selected && !isCardMethod(method) && (
                        <p className={styles.hint}>
                          {method.type === 'offline' || method.source === 'store'
                            ? 'Order will be marked as awaiting payment.'
                            : 'Payment will be processed through your store settings.'}
                        </p>
                      )}
                    </div>
                  );
                })}
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  Place order · {formatPrice(totals.total)}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => editStep(2)}>
                  Back
                </button>
              </form>
            ) : (
              <p className={styles.hint}>Finish billing to choose a payment method.</p>
            )}
          </section>
        </div>

        <aside className={styles.summary}>
          <div className={styles.summaryHead}>
            <h2>Order summary</h2>
            <Link to="/cart">Edit cart</Link>
          </div>
          <p className={styles.itemCount}>
            {(summary.cart?.items || cart.items).length}{' '}
            {(summary.cart?.items || cart.items).length === 1 ? 'item' : 'items'}
          </p>
          <ul>
            {(summary.cart?.items || cart.items).map((item) => (
              <li key={item.id}>
                <SafeImage src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <span>Qty {item.quantity}</span>
                  {(item.options || []).map((opt) => (
                    <span key={`${opt.name}-${opt.value}`}>{opt.name}: {opt.value}</span>
                  ))}
                </div>
                <strong>{formatPrice(item.lineTotal)}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.discountBox}>
            <CouponForm
              compact
              coupons={coupons}
              discounts={automaticDiscounts}
              onApply={async (code) => {
                const res = await applyCheckoutCoupon(code);
                setCheckout(res.data);
                await refresh();
              }}
              onRemove={async (code) => {
                const res = await removeCheckoutCoupon(code);
                setCheckout(res.data);
                await refresh();
              }}
            />
          </div>
          <div className={styles.totals}>
            <p><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></p>
            {totals.couponTotal > 0 && (
              <p><span>Coupons</span><span>-{formatPrice(totals.couponTotal)}</span></p>
            )}
            {totals.automaticTotal > 0 && (
              <p><span>Discounts</span><span>-{formatPrice(totals.automaticTotal)}</span></p>
            )}
            {totals.couponTotal <= 0 && totals.automaticTotal <= 0 && totals.discountTotal > 0 && (
              <p><span>Discount</span><span>-{formatPrice(totals.discountTotal)}</span></p>
            )}
            <p><span>Shipping</span><span>{formatPrice(totals.shipping)}</span></p>
            <p><span>Tax</span><span>{formatPrice(totals.tax)}</span></p>
            <p className={styles.total}><span>Total</span><span>{formatPrice(totals.total)}</span></p>
            {totals.discountTotal > 0 && (
              <p className={styles.savings}>You saved {formatPrice(totals.discountTotal)} in total</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
