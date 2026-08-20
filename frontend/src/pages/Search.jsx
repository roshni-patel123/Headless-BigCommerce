import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBrands, getCategories, getCategoryTree, searchCatalog } from '../services/catalogService';
import Filters from '../components/product/Filters';
import ProductGrid from '../components/product/ProductGrid';
import ListingToolbar, { PAGE_SIZE_OPTIONS } from '../components/product/ListingToolbar';
import Pagination from '../components/product/Pagination';
import SeoHead from '../components/seo/SeoHead';
import { ProductSkeleton } from '../components/common/Skeleton';
import useDebounce from '../hooks/useDebounce';
import styles from './Listing.module.scss';
import searchStyles from './Search.module.scss';

function Search() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 6 });
  const [suggestions, setSuggestions] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const filters = Object.fromEntries(params.entries());
  const debouncedQ = useDebounce(filters.q || '', 250);
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
    if (!debouncedQ) {
      setProducts([]);
      setSuggestions(null);
      setMeta({ page: 1, totalPages: 1, total: 0, limit });
      setLoading(false);
      return;
    }

    setLoading(true);
    searchCatalog({
      ...filters,
      q: debouncedQ,
      limit,
      page,
      view: undefined,
    })
      .then((res) => {
        setProducts(res.data?.products || []);
        setSuggestions(res.data?.suggestions || null);
        setMeta(res.meta || {
          page: 1,
          totalPages: 1,
          total: res.data?.products?.length || 0,
          limit,
        });
      })
      .catch(() => {
        setProducts([]);
        setSuggestions(null);
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
  const relatedLinks = [
    ...(suggestions?.categories || []).map((item) => ({
      key: `c${item.id}`,
      to: `/category/${item.id}`,
      label: item.name,
    })),
    ...(suggestions?.brands || []).map((item) => ({
      key: `b${item.id}`,
      to: `/brand/${item.id}`,
      label: item.name,
    })),
  ].slice(0, 8);

  return (
    <div className={`container page ${styles.page}`}>
      <SeoHead title={debouncedQ ? `Search: ${debouncedQ}` : 'Search'} />

      <header className={styles.intro}>
        <p className="eyebrow">Search</p>
        <h1>Search</h1>
        <p>
          {debouncedQ
            ? `Results for “${debouncedQ}”. Narrow by category, brand, price, or availability.`
            : 'Search products, then filter your results.'}
        </p>
      </header>

      {relatedLinks.length > 0 && (
        <div className={searchStyles.chips}>
          {relatedLinks.map((item) => (
            <Link key={item.key} to={item.to}>{item.label}</Link>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        <Filters
          filters={filters}
          onChange={onChange}
          brands={brands}
          categories={categories}
          keepKeys={['q']}
        />
        <div className={styles.results}>
          <ListingToolbar
            total={meta.total || products.length}
            limit={limit}
            view={view}
            activeLabel={[categoryName, brandName].filter(Boolean).join(' · ')}
            onLimitChange={(nextLimit) => onChange({ ...filters, limit: nextLimit, page: 1 })}
            onViewChange={(nextView) => onChange({
              ...filters,
              view: nextView === 'grid' ? undefined : nextView,
            })}
          />

          {!debouncedQ ? (
            <div className={searchStyles.empty}>
              <h2>Start with a search</h2>
              <p>Enter a product name to see results.</p>
            </div>
          ) : loading ? (
            <ProductSkeleton />
          ) : (
            <ProductGrid
              products={products}
              view={view}
              onClearFilters={() => onChange({ q: filters.q })}
            />
          )}

          {debouncedQ && (
            <Pagination
              page={meta.page || page}
              totalPages={meta.totalPages || 1}
              onChange={(nextPage) => onChange({ ...filters, page: nextPage, limit })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
