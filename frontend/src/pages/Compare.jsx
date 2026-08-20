import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineX, HiStar } from 'react-icons/hi';
import { getCompare } from '../services/compareService';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { formatPrice, truncate } from '../utils/format';
import { PageSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import SafeImage from '../components/common/SafeImage';
import styles from './Compare.module.scss';

function productHasOptions(product) {
  return Boolean(product.hasOptions)
    || (product.options || []).length > 0
    || (product.variants || []).length > 1;
}

const rows = [
  { key: 'price', label: 'Price', render: (product) => formatPrice(product.price) },
  {
    key: 'rating',
    label: 'Rating',
    render: (product) => (
      <span className={styles.rating}>
        <HiStar /> {product.rating || '—'}
        <small>({product.reviewCount || 0})</small>
      </span>
    ),
  },
  { key: 'brand', label: 'Brand', render: (product) => product.brand?.name || '—' },
  { key: 'sku', label: 'SKU', render: (product) => product.sku || '—' },
  {
    key: 'availability',
    label: 'Availability',
    render: (product) => (product.inStock ? 'In stock' : 'Out of stock'),
  },
  { key: 'weight', label: 'Weight', render: (product) => (product.weight ? `${product.weight}` : '—') },
  {
    key: 'description',
    label: 'Description',
    render: (product) => truncate(product.plainDescription, 180) || '—',
  },
];

function Compare() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { items, remove, clear } = useCompare();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const ids = useMemo(() => {
    if (items.length) return items.map((item) => item.id);
    return (params.get('ids') || '').split(',').map(Number).filter(Boolean);
  }, [params, items]);

  useEffect(() => {
    if (ids.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getCompare(ids)
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids.join(',')]);

  async function onAdd(productId, event) {
    setAddingId(productId);
    try {
      const product = products.find((row) => row.id === productId);
      await addItem(productId, 1, { _event: event, imageUrl: product?.image });
    } finally {
      setAddingId(null);
    }
  }

  function syncIds(nextIds) {
    if (nextIds.length) setParams({ ids: nextIds.join(',') });
    else setParams({});
  }

  function onRemove(productId) {
    remove(productId);
    syncIds(ids.filter((id) => id !== productId));
  }

  function onClear() {
    clear();
    setParams({});
  }

  if (loading) return <div className="container page"><PageSkeleton /></div>;

  if (products.length < 2) {
    return (
      <EmptyState
        title="Compare products"
        text="Select at least two products to compare."
      />
    );
  }

  return (
    <div className={`container page ${styles.page}`}>
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Compare</p>
          <h1>Compare products</h1>
        </div>
        <button type="button" className={styles.clear} onClick={onClear}>
          Remove all
        </button>
      </div>

      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th aria-hidden="true" />
              {products.map((product) => (
                <th key={product.id}>
                  <article className={styles.card}>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => onRemove(product.id)}
                      aria-label={`Remove ${product.name}`}
                    >
                      <HiOutlineX /> Remove
                    </button>
                    <Link to={`/product/${product.id}`}>
                      <SafeImage src={product.image} alt={product.name} />
                      <h2>{product.name}</h2>
                    </Link>
                    <strong>{formatPrice(product.price)}</strong>
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={
                        !productHasOptions(product)
                        && (addingId === product.id || !product.inStock)
                      }
                      onClick={(e) => {
                        if (productHasOptions(product)) {
                          navigate(`/product/${product.id}`);
                          return;
                        }
                        onAdd(product.id, e);
                      }}
                    >
                      {productHasOptions(product)
                        ? 'Choose options'
                        : !product.inStock
                          ? 'Out of stock'
                          : addingId === product.id
                            ? 'Adding…'
                            : 'Add to cart'}
                    </button>
                  </article>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {products.map((product) => (
                  <td key={`${product.id}-${row.key}`}>{row.render(product)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Compare;
