import { useState } from 'react';
import { formatPrice } from '../../utils/format';
import styles from './CouponForm.module.scss';

function uniqueAutomaticDiscounts(coupons = [], discounts = []) {
  const couponCodes = new Set(
    coupons.map((coupon) => String(coupon.code || coupon.displayName || '').toLowerCase())
  );
  const discountMap = new Map();

  discounts.forEach((discount) => {
    if (!discount?.amount) return;
    const label = discount.name || 'Promotion';
    const key = label.toLowerCase();
    if (couponCodes.has(key)) return;
    if (discountMap.has(key)) {
      discountMap.get(key).amount += Number(discount.amount) || 0;
    } else {
      discountMap.set(key, { ...discount, name: label, amount: Number(discount.amount) || 0 });
    }
  });

  return Array.from(discountMap.values());
}

function CouponForm({ coupons = [], discounts = [], onApply, onRemove, compact = false }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const automatic = uniqueAutomaticDiscounts(coupons, discounts);

  async function submit(event) {
    event.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onApply(code.trim());
      setCode('');
    } catch (err) {
      setError(err.message || 'Could not apply coupon');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${styles.root} ${compact ? styles.compact : ''}`}>
      <section className={styles.section}>
        <p className={styles.label}>{compact ? 'Discount code' : 'Coupon code'}</p>
        <form onSubmit={submit}>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter coupon code"
            aria-label="Coupon code"
          />
          <button type="submit" className="btn btn-ghost" disabled={busy}>
            Apply
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        {coupons.length > 0 ? (
          <ul className={styles.list}>
            {coupons.map((coupon) => (
              <li key={coupon.code || coupon.id} className={styles.couponRow}>
                <div>
                  <strong>{coupon.code || coupon.displayName}</strong>
                  {coupon.displayName && coupon.code && coupon.displayName !== coupon.code && (
                    <small>{coupon.displayName}</small>
                  )}
                </div>
                <div className={styles.rowEnd}>
                  {coupon.discountAmount > 0 && (
                    <span className={styles.amount}>-{formatPrice(coupon.discountAmount)}</span>
                  )}
                  {onRemove && (
                    <button type="button" onClick={() => onRemove(coupon.code)}>
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !compact && <p className={styles.hint}>No coupons applied</p>
        )}
      </section>

      {!compact && (
        <section className={styles.section}>
          <p className={styles.label}>Discounts</p>
          {automatic.length > 0 ? (
            <ul className={styles.list}>
              {automatic.map((discount) => (
                <li key={discount.id || `${discount.name}-${discount.amount}`} className={styles.autoRow}>
                  <div>
                    <strong>{discount.name}</strong>
                    <small>Auto applied</small>
                  </div>
                  {discount.amount > 0 && (
                    <span className={styles.amount}>-{formatPrice(discount.amount)}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.hint}>No discounts on this cart</p>
          )}
        </section>
      )}
    </div>
  );
}

export default CouponForm;
