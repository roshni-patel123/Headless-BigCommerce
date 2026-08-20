import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiOutlineEye, HiOutlineHeart, HiStar } from 'react-icons/hi';
import { formatPrice } from '../../utils/format';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import QuickView from './QuickView';
import CompareToggle from './CompareToggle';
import SafeImage from '../common/SafeImage';
import styles from './ProductCard.module.scss';

function ProductCard({ product, layout = 'grid' }) {
  const navigate = useNavigate();
  const [quick, setQuick] = useState(false);
  const [adding, setAdding] = useState(false);
  const { isSaved, toggle } = useWishlist();
  const { addItem } = useCart();
  const saved = isSaved(product.id);
  const isList = layout === 'list';
  const hasOptions = Boolean(product.hasOptions)
    || (product.options || []).length > 0
    || (product.variants || []).length > 1;

  async function onAdd(event) {
    event.preventDefault();
    setAdding(true);
    try {
      await addItem(product.id, 1, { _event: event, imageUrl: product.image });
    } finally {
      setAdding(false);
    }
  }

  function onCartAction(event) {
    event.preventDefault();
    event.stopPropagation();
    if (hasOptions) {
      navigate(`/product/${product.id}`);
      return;
    }
    if (!product.inStock) return;
    onAdd(event);
  }

  let cartLabel = 'Add to cart';
  if (hasOptions) cartLabel = 'Choose options';
  else if (!product.inStock) cartLabel = 'Out of stock';
  else if (adding) cartLabel = 'Adding…';

  return (
    <>
      <motion.article
        className={`${styles.card} ${isList ? styles.listCard : ''}`}
        whileHover={isList ? undefined : { y: -6 }}
        transition={{ duration: 0.25 }}
      >
        <div className={styles.media}>
          <Link to={`/product/${product.id}`}>
            <SafeImage src={product.image} alt={product.name} loading="lazy" />
            {product.hoverImage && product.hoverImage !== product.image && (
              <SafeImage src={product.hoverImage} alt="" className={styles.hover} loading="lazy" />
            )}
          </Link>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.viewBtn}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setQuick(true);
              }}
              aria-label="Quick view"
              title="Quick view"
            >
              <HiOutlineEye />
            </button>
            <button
              type="button"
              className={saved ? styles.active : ''}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggle(product.id);
              }}
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              title={saved ? 'Wishlisted' : 'Wishlist'}
            >
              {saved ? <HiHeart /> : <HiOutlineHeart />}
            </button>
          </div>
          {!isList && (
            <button
              type="button"
              className={styles.cartBtn}
              onClick={onCartAction}
              disabled={!hasOptions && (adding || !product.inStock)}
            >
              {cartLabel}
            </button>
          )}
        </div>
        <div className={styles.meta}>
          <p className={styles.brand}>{product.brand?.name || ''}</p>
          <Link to={`/product/${product.id}`}>
            <h3>{product.name}</h3>
          </Link>
          <div className={styles.footer}>
            <div className={styles.row}>
              <strong>{formatPrice(product.price)}</strong>
              {product.rating && (
                <span className={styles.rating}>
                  <HiStar /> {product.rating}
                </span>
              )}
            </div>
            <div className={styles.listActions}>
              <CompareToggle product={product} />
              {isList && (
                <button
                  type="button"
                  className={`btn btn-primary ${styles.listCart}`}
                  onClick={onCartAction}
                  disabled={!hasOptions && (adding || !product.inStock)}
                >
                  {cartLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.article>
      <QuickView product={product} open={quick} onClose={() => setQuick(false)} />
    </>
  );
}

export default ProductCard;
