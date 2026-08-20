import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingBag, HiOutlineX } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import SafeImage from '../common/SafeImage';
import CouponForm from './CouponForm';
import { formatPrice } from '../../utils/format';
import styles from './CartDrawer.module.scss';

function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();

  useEffect(() => {
    if (!isDrawerOpen) return undefined;

    function onKey(event) {
      if (event.key === 'Escape') closeDrawer();
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const items = cart.items || [];
  const empty = items.length === 0;

  async function changeQty(item, next) {
    const quantity = Math.max(1, Number(next) || 1);
    await updateItem(item.id, quantity);
  }

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className={styles.backdrop} onClick={closeDrawer} aria-label="Close cart" />
      <aside className={styles.panel}>
        <div className={styles.head}>
          <div>
            <p className="eyebrow">Your cart</p>
            <h2>
              {cart.itemCount || 0} {cart.itemCount === 1 ? 'item' : 'items'}
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={closeDrawer} aria-label="Close">
            <HiOutlineX />
          </button>
        </div>

        {empty ? (
          <div className={styles.empty}>
            <HiOutlineShoppingBag />
            <h3>Your cart is empty</h3>
            <p>Add a product to get started.</p>
            <Link className="btn btn-primary" to="/products" onClick={closeDrawer}>
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className={styles.body}>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id}>
                  <Link to={`/product/${item.productId}`} onClick={closeDrawer}>
                    <SafeImage src={item.image} alt={item.name} />
                  </Link>
                  <div className={styles.meta}>
                    <Link to={`/product/${item.productId}`} onClick={closeDrawer}>
                      <h3>{item.name}</h3>
                    </Link>
                    {(item.options || []).length > 0 && (
                      <p>{item.options.map((opt) => `${opt.name}: ${opt.value}`).join(' · ')}</p>
                    )}
                    <p>{formatPrice(item.price)}</p>
                    <div className={styles.controls}>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => changeQty(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <HiOutlineMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => changeQty(item, item.quantity + 1)}
                        >
                          <HiOutlinePlus />
                        </button>
                      </div>
                      <button type="button" className={styles.remove} onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong>{formatPrice(item.lineTotal)}</strong>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <CouponForm
                coupons={cart.coupons || []}
                discounts={cart.discounts || []}
                onApply={applyCoupon}
                onRemove={removeCoupon}
              />
              <div className={styles.summary}>
                <span>Subtotal</span>
                <strong>{formatPrice(cart.subtotal)}</strong>
              </div>
              <div className={`${styles.summary} ${styles.total}`}>
                <span>Total</span>
                <strong>{formatPrice(cart.total ?? cart.cartAmount ?? cart.subtotal)}</strong>
              </div>
              <p className={styles.note}>Shipping and taxes calculated at checkout.</p>
              <div className={styles.actions}>
                <Link className="btn btn-ghost" to="/cart" onClick={closeDrawer}>
                  View cart
                </Link>
                <Link className="btn btn-primary" to="/checkout" onClick={closeDrawer}>
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
