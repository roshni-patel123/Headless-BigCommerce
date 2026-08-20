import { HiOutlineViewGrid, HiOutlineViewList } from 'react-icons/hi';
import styles from './ListingToolbar.module.scss';

export const PAGE_SIZE_OPTIONS = [6, 12, 24, 36];

function ListingToolbar({
  total = 0,
  limit = 6,
  view = 'grid',
  activeLabel = '',
  onLimitChange,
  onViewChange,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.meta}>
        <span>{total} {total === 1 ? 'product' : 'products'}</span>
        {activeLabel && <span className={styles.active}>{activeLabel}</span>}
      </div>

      <div className={styles.controls}>
        <label className={styles.perPage}>
          <span>Show</span>
          <select
            value={String(limit)}
            onChange={(event) => onLimitChange?.(Number(event.target.value))}
            aria-label="Products per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.views} role="group" aria-label="Layout">
          <button
            type="button"
            className={view === 'grid' ? styles.on : ''}
            onClick={() => onViewChange?.('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            title="Grid view"
          >
            <HiOutlineViewGrid />
          </button>
          <button
            type="button"
            className={view === 'list' ? styles.on : ''}
            onClick={() => onViewChange?.('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
            title="List view"
          >
            <HiOutlineViewList />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListingToolbar;
