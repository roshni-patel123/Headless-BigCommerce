import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addWishlistItem, fetchWishlist, removeWishlistItem } from '../services/wishlistService';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useToast();

  async function refresh() {
    try {
      const res = await fetchWishlist();
      setItems(res.data || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      items,
      isSaved(productId) {
        return items.some((item) => Number(item.productId) === Number(productId));
      },
      async toggle(productId) {
        const id = Number(productId);
        const saved = items.some((item) => Number(item.productId) === id);
        const res = saved
          ? await removeWishlistItem(id)
          : await addWishlistItem(id);
        setItems(res.data || []);
        toast.notify(saved ? 'Removed from wishlist' : 'Added to wishlist');
      },
    }),
    [items, toast]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
