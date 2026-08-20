import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import styles from './ProductGrid.module.scss';

function ProductGrid({ products, view = 'grid', columns, onClearFilters }) {
  if (!products?.length) {
    return (
      <EmptyState
        title="No products found"
        text="No products match these filters. Clear filters or browse all products."
        actionLabel={onClearFilters ? 'Clear filters' : 'Browse products'}
        to={onClearFilters ? undefined : '/products'}
        onAction={onClearFilters}
      />
    );
  }

  const layout = view === 'list' ? styles.list : styles.grid;
  const colsClass = columns === 4 ? styles.cols4 : columns === 2 ? styles.cols2 : '';

  return (
    <div className={`${layout} ${colsClass}`.trim()}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} layout={view} />
      ))}
    </div>
  );
}

export default ProductGrid;
