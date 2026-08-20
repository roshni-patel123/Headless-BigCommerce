import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getBrands, getCategoryProducts } from '../services/catalogService';
import Filters from '../components/product/Filters';
import ProductGrid from '../components/product/ProductGrid';
import ListingToolbar, { PAGE_SIZE_OPTIONS } from '../components/product/ListingToolbar';
import Pagination from '../components/product/Pagination';
import { ProductSkeleton } from '../components/common/Skeleton';
import SafeImage from '../components/common/SafeImage';
import styles from './Listing.module.scss';

function Category() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 6 });
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = Object.fromEntries(params.entries());
  const limit = PAGE_SIZE_OPTIONS.includes(Number(filters.limit))
    ? Number(filters.limit)
    : 6;
  const view = filters.view === 'list' ? 'list' : 'grid';
  const page = Math.max(Number(filters.page) || 1, 1);

  useEffect(() => {
    getBrands().then((res) => setBrands(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getCategoryProducts(id, {
      ...filters,
      limit,
      page,
      view: undefined,
    })
      .then((res) => {
        setCategory(res.data.category);
        setProducts(res.data.products);
        setMeta(res.meta || { page: 1, totalPages: 1, total: res.data.products?.length || 0, limit });
      })
      .finally(() => setLoading(false));
  }, [id, filters.sort, filters.minPrice, filters.maxPrice, filters.brandId, filters.q, filters.inStock, page, limit]);

  function onChange(next) {
    setParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value)));
  }

  return (
    <div className={`container page ${styles.page}`}>
      {category && (
        <div className={styles.banner}>
          {category.image && <SafeImage src={category.image} alt="" />}
          <div>
            <p className="eyebrow">Collection</p>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <Filters filters={filters} onChange={onChange} brands={brands} />
        <div className={styles.results}>
          <ListingToolbar
            total={meta.total || products.length}
            limit={limit}
            view={view}
            onLimitChange={(nextLimit) => onChange({ ...filters, limit: nextLimit, page: 1 })}
            onViewChange={(nextView) => onChange({ ...filters, view: nextView === 'grid' ? undefined : nextView })}
          />
          {loading ? <ProductSkeleton /> : <ProductGrid products={products} view={view} />}
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

export default Category;
