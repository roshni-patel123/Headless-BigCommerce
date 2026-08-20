import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiHeart, HiOutlineHeart, HiOutlineShieldCheck, HiOutlineTruck, HiStar } from 'react-icons/hi';
import { getProduct, getProductReviews, getRelated } from '../services/catalogService';
import ImageGallery from '../components/product/ImageGallery';
import ProductGrid from '../components/product/ProductGrid';
import ProductOptions from '../components/product/ProductOptions';
import SeoHead from '../components/seo/SeoHead';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import { PageSkeleton } from '../components/common/Skeleton';
import CompareToggle from '../components/product/CompareToggle';
import QuantityStepper from '../components/common/QuantityStepper';
import styles from './ProductDetail.module.scss';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('story');
  const [selection, setSelection] = useState({});
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const recent = useRecentlyViewed(product);

  useEffect(() => {
    setProduct(null);
    setQty(1);
    setSelection({});
    getProduct(id).then((res) => setProduct(res.data));
    getRelated(id).then((res) => setRelated(res.data)).catch(() => setRelated([]));
    getProductReviews(id)
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]));
  }, [id]);

  if (!product) return <div className="container page"><PageSkeleton /></div>;

  const price = selection.price ?? product.price;
  const inStock = selection.inStock ?? product.inStock;

  async function handleAdd(event) {
    await addItem(product.id, qty, {
      variantId: selection.variantId,
      optionSelections: selection.optionSelections,
      _event: event,
      imageUrl: selection.image || product.image,
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img) => img.standard) || [product.image],
    description: product.plainDescription || product.metaDescription,
    sku: selection.sku || product.sku,
    brand: product.brand?.name ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="container page">
      <SeoHead
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.plainDescription}
        image={product.image}
        jsonLd={jsonLd}
      />
      <div className={styles.layout}>
        <ImageGallery product={product} />
        <div>
          <p className="eyebrow">{product.brand?.name || 'Velora'}</p>
          <h1>{product.name}</h1>
          <div className={styles.rating}>
            <HiStar /> {product.rating || '4.8'}
            <span>{reviews.length || product.reviewCount || 0} reviews</span>
          </div>
          <p className={styles.price}>{formatPrice(price)}</p>
          <ul className={styles.facts}>
            {(selection.sku || product.sku) && (
              <li>SKU {selection.sku || product.sku}</li>
            )}
            <li className={inStock ? styles.in : styles.out}>
              {inStock ? 'In stock' : 'Out of stock'}
            </li>
          </ul>
          <ProductOptions product={product} onChange={setSelection} />
          <div className={styles.buy}>
            <QuantityStepper value={qty} onChange={setQty} min={1} max={10} />
            <button className={`btn btn-primary ${styles.addBtn}`} onClick={handleAdd} disabled={!inStock}>
              {inStock ? 'Add to cart' : 'Out of stock'}
            </button>
            <button
              className={`btn btn-ghost ${styles.wish} ${isSaved(product.id) ? styles.wishOn : ''}`}
              type="button"
              onClick={() => toggle(product.id)}
              aria-label={isSaved(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isSaved(product.id) ? 'Wishlisted' : 'Wishlist'}
            >
              {isSaved(product.id) ? <HiHeart /> : <HiOutlineHeart />}
            </button>
          </div>
          <div className={styles.buyExtras}>
            <CompareToggle product={product} />
          </div>
          <div className={styles.ship}>
            <p><HiOutlineTruck /> Insured delivery in 2–4 business days</p>
            <p><HiOutlineShieldCheck /> 30-day returns</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={tab === 'story' ? styles.on : ''} onClick={() => setTab('story')}>Description</button>
        <button className={tab === 'details' ? styles.on : ''} onClick={() => setTab('details')}>Details</button>
        <button className={tab === 'reviews' ? styles.on : ''} onClick={() => setTab('reviews')}>Reviews</button>
      </div>
      <div className={styles.panel}>
        {tab === 'story' && <div dangerouslySetInnerHTML={{ __html: product.description }} />}
        {tab === 'details' && (
          <ul>
            <li>Brand: {product.brand?.name || 'Velora'}</li>
            {(selection.sku || product.sku) && (
              <li>SKU: {selection.sku || product.sku}</li>
            )}
            <li>Availability: {inStock ? 'Ready to ship' : 'Out of stock'}</li>
            {(product.customFields || []).map((field) => (
              <li key={field.id}>{field.name}: {field.value}</li>
            ))}
          </ul>
        )}
        {tab === 'reviews' && (
          reviews.length ? (
            <ul>
              {reviews.map((review) => (
                <li key={review.id}>
                  <strong>{review.title || `${review.rating}/5`}</strong>
                  <p>{review.text}</p>
                  <span>{review.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No published reviews yet.</p>
          )
        )}
      </div>

      <div className={styles.sticky}>
        <div>
          <strong>{formatPrice(price)}</strong>
          <span>{product.name}</span>
        </div>
        <button className="btn btn-primary" onClick={handleAdd} disabled={!inStock}>
          {inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>

      {related.length > 0 && (
        <section className={styles.more}>
          <h2>You may also like</h2>
          <ProductGrid products={related} columns={4} />
        </section>
      )}

      {recent.length > 0 && (
        <section className={styles.more}>
          <h2>Recently viewed</h2>
          <ProductGrid products={recent} columns={4} />
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
