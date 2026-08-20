import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getOrder } from '../services/checkoutService';
import { formatPrice } from '../utils/format';
import SeoHead from '../components/seo/SeoHead';
import { PageSkeleton } from '../components/common/Skeleton';
import styles from './Checkout.module.scss';

function OrderConfirmation() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    getOrder(orderId, email || undefined)
      .then((res) => {
        if (active) setOrder(res.data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [orderId, email]);

  if (error) {
    return (
      <div className="container page">
        <p>{error}</p>
        <Link to="/products">Continue shopping</Link>
      </div>
    );
  }

  if (!order) {
    return <div className="container page"><PageSkeleton /></div>;
  }

  const awaitingPayment =
    order.statusId === 7 ||
    String(order.paymentStatus || order.status || order.statusLabel || '')
      .toLowerCase()
      .includes('await');

  return (
    <div className={`container page ${styles.page}`}>
      <SeoHead title={`Order #${order.id}`} />
      <div className={styles.head}>
        <p className="eyebrow">Thank you</p>
        <h1>Order #{order.id}</h1>
        <p className={styles.hint}>
          {awaitingPayment
            ? 'Your order is confirmed and awaiting payment in BigCommerce admin — the same status as hosted checkout for offline/manual payment methods.'
            : 'Your order has been placed successfully.'}
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.form}>
          <section>
            <h2>Order details</h2>
            <p><strong>Status:</strong> {order.statusLabel || order.status}</p>
            {order.paymentStatus && <p><strong>Payment:</strong> {order.paymentStatus}</p>}
            {order.email && <p><strong>Email:</strong> {order.email}</p>}
            {order.dateCreated && (
              <p><strong>Date:</strong> {new Date(order.dateCreated).toLocaleString()}</p>
            )}
          </section>

          {order.shippingAddress && (
            <section>
              <h2>Shipping to</h2>
              <p>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.address1}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </section>
          )}

          <Link className="btn btn-primary" to="/products">Continue shopping</Link>
          {email && <Link className="btn btn-ghost" to="/account">View account</Link>}
        </div>

        <aside className={styles.summary}>
          <h2>Items</h2>
          <ul>
            {(order.items || []).map((item) => (
              <li key={item.id}>
                <div>
                  <p>{item.name}</p>
                  <span>Qty {item.quantity}</span>
                </div>
                <strong>{formatPrice(item.lineTotal)}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.totals}>
            <p><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
            <p><span>Shipping</span><span>{formatPrice(order.shipping)}</span></p>
            <p><span>Tax</span><span>{formatPrice(order.tax)}</span></p>
            <p className={styles.total}><span>Total</span><span>{formatPrice(order.total)}</span></p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default OrderConfirmation;
