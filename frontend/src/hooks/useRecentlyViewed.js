import { useEffect, useState } from 'react';

const KEY = 'velora_recent';

function toRecentItem(product) {
  if (!product?.id) return null;
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    hoverImage: product.hoverImage || null,
    thumbnail: product.thumbnail || product.image || null,
    brand: product.brand?.name ? { name: product.brand.name } : product.brand || null,
    rating: product.rating || null,
    reviewCount: product.reviewCount || 0,
    inStock: product.inStock !== false,
    hasOptions: Boolean(product.hasOptions)
      || (product.options || []).length > 0
      || (product.variants || []).length > 1,
  };
}

export default function useRecentlyViewed(currentProduct) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
    setItems(stored.filter((item) => item.id !== currentProduct?.id).slice(0, 4));

    const current = toRecentItem(currentProduct);
    if (!current) return;

    const next = [
      current,
      ...stored.filter((item) => item.id !== current.id),
    ].slice(0, 8);

    localStorage.setItem(KEY, JSON.stringify(next));
  }, [currentProduct]);

  return items;
}
