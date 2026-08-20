import styles from './Pagination.module.scss';

function buildPages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
    .reduce((list, page, index, source) => {
      if (index > 0 && page - source[index - 1] > 1) list.push('…');
      list.push(page);
      return list;
    }, []);
}

function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null;

  const current = Number(page) || 1;
  const pages = buildPages(current, totalPages);

  return (
    <nav className={styles.pager} aria-label="Pagination">
      <button
        type="button"
        disabled={current <= 1}
        onClick={() => onChange?.(current - 1)}
      >
        Prev
      </button>

      <div className={styles.pages}>
        {pages.map((item, index) =>
          item === '…' ? (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={item === current ? styles.on : ''}
              aria-current={item === current ? 'page' : undefined}
              onClick={() => onChange?.(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        disabled={current >= totalPages}
        onClick={() => onChange?.(current + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
