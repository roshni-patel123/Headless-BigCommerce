import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext(null);
const STORAGE_KEY = 'velora_compare';
export const MAX_COMPARE = 4;

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function toSnapshot(product) {
  return {
    id: Number(product.id),
    name: product.name,
    image: product.image || '',
    price: product.price,
  };
}

export function CompareProvider({ children }) {
  const [items, setItems] = useState(readStored);
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isCompared(productId) {
        return items.some((item) => item.id === Number(productId));
      },
      toggle(product) {
        const id = Number(product.id);
        const exists = items.some((item) => item.id === id);

        if (exists) {
          setItems((current) => current.filter((item) => item.id !== id));
          toast.notify('Removed from compare');
          return;
        }

        if (items.length >= MAX_COMPARE) {
          toast.notify(`You can compare up to ${MAX_COMPARE} products`);
          return;
        }

        setItems((current) => [...current, toSnapshot(product)]);
        toast.notify('Added to compare');
      },
      remove(productId) {
        setItems((current) => current.filter((item) => item.id !== Number(productId)));
      },
      clear() {
        setItems([]);
      },
    }),
    [items, toast]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  return useContext(CompareContext);
}
