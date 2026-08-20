import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiStar } from 'react-icons/hi';
import Modal from '../common/Modal';
import SafeImage from '../common/SafeImage';
import CompareToggle from './CompareToggle';
import ProductOptions from './ProductOptions';
import { getProduct } from '../../services/catalogService';
import { formatPrice, truncate } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import styles from './QuickView.module.scss';

function QuickView({ product, open, onClose }) {
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const [detail, setDetail] = useState(product);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selection, setSelection] = useState({});
  const [activeImage, setActiveImage] = useState(product?.image);
  const saved = isSaved(detail?.id || product?.id);

  useEffect(() => {
    if (!open || !product?.id) return undefined;

    let active = true;
    setDetail(product);
    setActiveImage(product.image);
    setQty(1);
    setSelection({});
    setLoading(true);

    getProduct(product.id)
      .then((res) => {
        if (!active) return;
        const next = res.data || product;
        setDetail(next);
        setActiveImage(next.image || product.image);
      })
      .catch(() => {
        if (active) setDetail(product);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, product?.id]);

  if (!product) return null;

  const images = detail?.images?.length
    ? detail.images
    : [{ id: 1, standard: detail?.image || product.image, thumbnail: detail?.thumbnail || product.image }];

  async function onAdd(event) {
    setAdding(true);
    try {
      await addItem(detail.id, qty, {
        variantId: selection.variantId,
        optionSelections: selection.optionSelections,
        _event: event,
        imageUrl: activeImage || detail.image || product.image,
      });
      onClose();
    } finally {
      setAdding(false);
    }
  }

  const price = selection.price ?? detail.price;
  const inStock = selection.inStock ?? detail.inStock;

  return (
    <Modal open={open} onClose={onClose} label={`Quick view ${product.name}`}>
      <div className={styles.wrap}>
        <div className={styles.gallery}>
          <SafeImage src={activeImage} alt={detail.name} className={styles.hero} />
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.slice(0, 5).map((image) => (
                <button
                  key={image.id || image.standard}
                  type="button"
                  className={activeImage === (image.standard || image.thumbnail) ? styles.thumbOn : ''}
                  onClick={() => setActiveImage(image.standard || image.thumbnail)}
                >
                  <SafeImage src={image.thumbnail || image.standard} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <p className="eyebrow">{detail.brand?.name || 'Velora'}</p>
          <h2>{detail.name}</h2>

          <div className={styles.meta}>
            <strong className={styles.price}>{formatPrice(price)}</strong>
            {detail.rating && (
              <span className={styles.rating}>
                <HiStar /> {detail.rating}
                <small>({detail.reviewCount || 0})</small>
              </span>
            )}
          </div>

          <ul className={styles.facts}>
            {(selection.sku || detail.sku) && (
              <li>SKU {selection.sku || detail.sku}</li>
            )}
            <li className={inStock ? styles.in : styles.out}>
              {inStock ? 'In stock' : 'Out of stock'}
            </li>
          </ul>

          {loading ? (
            <p className={styles.loading}>Loading product details…</p>
          ) : (
            <>
              <p className={styles.copy}>
                {truncate(detail.plainDescription, 220) || 'No description available.'}
              </p>
              <ProductOptions product={detail} onChange={setSelection} />
            </>
          )}

          <div className={styles.buy}>
            <div className={styles.qty}>
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((value) => Math.min(10, value + 1))} aria-label="Increase">
                +
              </button>
            </div>
            <button
              className="btn btn-primary"
              type="button"
              onClick={onAdd}
              disabled={adding || !inStock}
            >
              {!inStock ? 'Out of stock' : adding ? 'Adding…' : 'Add to cart'}
            </button>
            <button
              className={`btn btn-ghost ${styles.wish} ${saved ? styles.wishOn : ''}`}
              type="button"
              onClick={() => toggle(detail.id)}
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              title={saved ? 'Wishlisted' : 'Wishlist'}
            >
              {saved ? <HiHeart /> : <HiOutlineHeart />}
            </button>
          </div>

          <div className={styles.footer}>
            <CompareToggle product={detail} />
            <Link className={styles.full} to={`/product/${detail.id}`} onClick={onClose}>
              View full details
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default QuickView;
