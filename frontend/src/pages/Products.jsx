import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBrands, getCategories, getCategoryTree, getProducts } from '../services/catalogService';
import Filters from '../components/product/Filters';
import ProductGrid from '../components/product/ProductGrid';
import ListingToolbar, { PAGE_SIZE_OPTIONS } from '../components/product/ListingToolbar';
import Pagination from '../components/product/Pagination';
import { ProductSkeleton } from '../components/common/Skeleton';
import useDebounce from '../hooks/useDebounce';
import styles from './Listing.module.scss';

function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 6 });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = Object.fromEntries(params.entries());
  const debouncedQ = useDebounce(filters.q || '');
  const limit = PAGE_SIZE_OPTIONS.includes(Number(filters.limit))
    ? Number(filters.limit)
    : 6;
  const view = filters.view === 'list' ? 'list' : 'grid';
  const page = Math.max(Number(filters.page) || 1, 1);

  useEffect(() => {
    getBrands().then((res) => setBrands(res.data || [])).catch(() => setBrands([]));
    getCategoryTree()
      .then((res) => {
        const tree = res.data || [];
        const flat = [];
        function walk(nodes, depth = 0) {
          nodes.forEach((node) => {
            flat.push({ id: node.id, name: `${'- '.repeat(depth)}${node.name}` });
            if (node.children?.length) walk(node.children, depth + 1);
          });
        }
        walk(tree);
        setCategories(flat.length ? flat : []);
      })
      .catch(() => {
        getCategories().then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = {
      ...filters,
      q: debouncedQ || undefined,
      limit,
      page,
      view: undefined,
    };

    getProducts(query)
      .then((res) => {
        setProducts(res.data || []);
        setMeta(res.meta || { page: 1, totalPages: 1, total: res.data?.length || 0, limit });
      })
      .catch(() => {
        setProducts([]);
        setMeta({ page: 1, totalPages: 1, total: 0, limit });
      })
      .finally(() => setLoading(false));
  }, [
    debouncedQ,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.brandId,
    filters.categoryId,
    filters.inStock,
    page,
    limit,
  ]);

  function onChange(next) {
    const clean = Object.fromEntries(
      Object.entries(next).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    setParams(clean);
  }

  const categoryName = categories.find((item) => String(item.id) === String(filters.categoryId))?.name;
  const brandName = brands.find((item) => String(item.id) === String(filters.brandId))?.name;

  return (
    <div className={`container page ${styles.page}`}>
      <header className={styles.intro}>
        <p className="eyebrow">Shop</p>
        <h1>All products</h1>
        <p>Browse all products. Filter by category, brand, or price.</p>
      </header>

      <div className={styles.layout}>
        <Filters filters={filters} onChange={onChange} brands={brands} categories={categories} />
        <div className={styles.results}>
          <ListingToolbar
            total={meta.total || products.length}
            limit={limit}
            view={view}
            activeLabel={[categoryName, brandName].filter(Boolean).join(' · ')}
            onLimitChange={(nextLimit) => onChange({ ...filters, limit: nextLimit, page: 1 })}
            onViewChange={(nextView) => onChange({ ...filters, view: nextView === 'grid' ? undefined : nextView })}
          />
          {loading ? (
            <ProductSkeleton />
          ) : (
            <ProductGrid
              products={products}
              view={view}
              onClearFilters={() => onChange({})}
            />
          )}
          <Pagination
            page={meta.page || page}
            totalPages={meta.totalPages || 1}
            onChange={(nextPage) => onChange({ ...filters, page: nextPage, limit })}
          />
        </div>
      </div>
    </div>
  );
}

export default Products;
