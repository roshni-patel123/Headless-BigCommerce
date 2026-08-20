import { useMemo } from 'react';
import { useWishlist } from '../context/WishlistContext';
import EmptyState from '../components/common/EmptyState';
import ProductGrid from '../components/product/ProductGrid';
import SeoHead from '../components/seo/SeoHead';
import styles from './Wishlist.module.scss';

function toProduct(item) {
  return {
    id: item.productId,
    name: item.name,
    price: item.price,
    image: item.image,
    brand: item.brand ? { name: item.brand } : null,
    inStock: item.inStock !== false,
    hasOptions: Boolean(item.hasOptions),
    options: item.options || [],
    variants: item.variants || [],
    rating: item.rating,
    hoverImage: item.hoverImage,
  };
}

function Wishlist() {
  const { items } = useWishlist();
  const products = useMemo(() => items.map(toProduct), [items]);

  if (!items.length) {
    return (
      <>
        <SeoHead title="Saved" />
        <EmptyState
          title="Nothing saved"
          text="Tap the heart on a product to save it here."
          actionLabel="Browse products"
          to="/products"
        />
      </>
    );
  }

  return (
    <div className="container page">
      <SeoHead title="Saved" />
      <h1 className={styles.title}>Saved</h1>
      <p className={styles.lede}>{products.length} {products.length === 1 ? 'item' : 'items'}</p>
      <ProductGrid products={products} view="grid" columns={4} />
    </div>
  );
}

export default Wishlist;
