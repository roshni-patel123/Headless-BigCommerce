import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  addCartItem,
  applyCoupon as apiApplyCoupon,
  fetchCart,
  removeCartItem,
  removeCoupon as apiRemoveCoupon,
  updateCartItem,
} from '../services/cartService';
import { captureFlyOrigin, flyToCart } from '../utils/flyToCart';
import { useToast } from './ToastContext';

const emptyCart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  total: 0,
  discountAmount: 0,
  coupons: [],
  discounts: [],
};
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toast = useToast();

  async function refresh() {
    try {
      const res = await fetchCart();
      setCart(res.data || emptyCart);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isDrawerOpen]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      isDrawerOpen,
      openDrawer() {
        setIsDrawerOpen(true);
      },
      closeDrawer() {
        setIsDrawerOpen(false);
      },
      async addItem(productId, quantity = 1, options = {}) {
        const flyOrigin = captureFlyOrigin(options._event, options.imageUrl);
        const res = await addCartItem({
          productId,
          quantity,
          variantId: options.variantId,
          optionSelections: options.optionSelections,
        });
        setCart(res.data);
        toast.notify('Added to cart');
        flyToCart(flyOrigin);
      },
      async updateItem(itemId, quantity) {
        const res = await updateCartItem(itemId, quantity);
        setCart(res.data);
      },
      async removeItem(itemId) {
        const res = await removeCartItem(itemId);
        setCart(res.data);
        toast.notify('Removed from cart');
      },
      async applyCoupon(couponCode) {
        const res = await apiApplyCoupon(couponCode);
        setCart(res.data);
        toast.notify('Coupon applied');
      },
      async removeCoupon(code) {
        const res = await apiRemoveCoupon(code);
        setCart(res.data);
        toast.notify('Coupon removed');
      },
      refresh,
    }),
    [cart, loading, isDrawerOpen, toast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
