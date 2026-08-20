import styles from './Filters.module.scss';

function Filters({ filters, onChange, brands = [], categories = [], keepKeys = [] }) {
  function update(name, value) {
    onChange({ ...filters, [name]: value, page: 1 });
  }

  function clearAll() {
    const kept = Object.fromEntries(
      keepKeys
        .filter((key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== '')
        .map((key) => [key, filters[key]])
    );
    onChange(kept);
  }

  const activeCount = ['q', 'sort', 'minPrice', 'maxPrice', 'categoryId', 'brandId', 'inStock', 'limit', 'view']
    .filter((key) => {
      if (keepKeys.includes(key)) return false;
      if (key === 'limit') return Boolean(filters.limit) && String(filters.limit) !== '6';
      if (key === 'view') return filters.view === 'list';
      return Boolean(filters[key]);
    })
    .length;

  return (
    <aside className={styles.filters}>
      <div className={styles.head}>
        <h3>Filters</h3>
        {activeCount > 0 && (
          <button type="button" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      <label>
        Search
        <input
          value={filters.q || ''}
          onChange={(event) => update('q', event.target.value)}
          placeholder="Search products"
        />
      </label>

      <label>
        Sort
        <select value={filters.sort || ''} onChange={(event) => update('sort', event.target.value)}>
          <option value="">Featured</option>
          <option value="newest">Newest</option>
          <option value="bestselling">Best selling</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </label>

      <div className={styles.range}>
        <label>
          Min
          <input
            type="number"
            min="0"
            value={filters.minPrice || ''}
            onChange={(event) => update('minPrice', event.target.value)}
          />
        </label>
        <label>
          Max
          <input
            type="number"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(event) => update('maxPrice', event.target.value)}
          />
        </label>
      </div>

      {categories.length > 0 && (
        <label>
          Category
          <select value={filters.categoryId || ''} onChange={(event) => update('categoryId', event.target.value)}>
            <option value="">All</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      )}

      {brands.length > 0 && (
        <label>
          Brand
          <select value={filters.brandId || ''} onChange={(event) => update('brandId', event.target.value)}>
            <option value="">All</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Availability
        <select value={filters.inStock || ''} onChange={(event) => update('inStock', event.target.value)}>
          <option value="">Any</option>
          <option value="1">In stock</option>
        </select>
      </label>
    </aside>
  );
}

export default Filters;
