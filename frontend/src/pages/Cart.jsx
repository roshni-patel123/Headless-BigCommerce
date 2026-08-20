import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/common/EmptyState';
import SafeImage from '../components/common/SafeImage';
import QuantityStepper from '../components/common/QuantityStepper';
import CouponForm from '../components/cart/CouponForm';
import SeoHead from '../components/seo/SeoHead';
import { formatPrice } from '../utils/format';
import styles from './Cart.module.scss';

function Cart() {
  const { cart, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();

  if (!cart.items?.length) {
    return <EmptyState title="Your cart is empty" text="Browse products and add items to your cart." />;
  }

  return (
    <div className="container page">
      <SeoHead title="Cart" />
      <h1 className={styles.title}>Cart</h1>
      <div className={styles.layout}>
        <ul>
          {cart.items.map((item) => (
            <li key={item.id}>
              <SafeImage src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                {(item.options || []).length > 0 && (
                  <p>
                    {item.options.map((opt) => `${opt.name}: ${opt.value}`).join(' · ')}
                  </p>
                )}
                <p>{formatPrice(item.price)}</p>
                <div className={styles.controls}>
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    min={1}
                    max={99}
                    onChange={(quantity) => updateItem(item.id, quantity)}
                  />
                  <button type="button" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
              <strong>{formatPrice(item.lineTotal)}</strong>
            </li>
          ))}
        </ul>
        <aside>
          <h2>Summary</h2>
          <CouponForm
            coupons={cart.coupons || []}
            discounts={cart.discounts || []}
            onApply={applyCoupon}
            onRemove={removeCoupon}
          />
          <p><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></p>
          <p><span>Shipping</span><span>Calculated at checkout</span></p>
          <p className={styles.total}>
            <span>Total</span>
            <span>{formatPrice(cart.total ?? cart.cartAmount ?? cart.subtotal)}</span>
          </p>
          <Link className="btn btn-primary" to="/checkout">Checkout</Link>
          <Link className="btn btn-ghost" to="/products">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
