import { Link, useLocation } from 'react-router-dom';
import { HiOutlineX } from 'react-icons/hi';
import { useCompare, MAX_COMPARE } from '../../context/CompareContext';
import SafeImage from '../common/SafeImage';
import styles from './CompareBar.module.scss';

function CompareBar() {
  const { items, remove, clear } = useCompare();
  const { pathname } = useLocation();

  if (!items.length || pathname === '/compare') return null;

  const ready = items.length >= 2;
  const remaining = MAX_COMPARE - items.length;

  return (
    <div className={styles.bar} role="region" aria-label="Compare products">
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <p className={styles.label}>
            Compare <strong>{items.length}</strong>
            <span> / {MAX_COMPARE}</span>
          </p>
          <div className={styles.chips}>
            {items.map((item) => (
              <div key={item.id} className={styles.chip}>
                <SafeImage src={item.image} alt="" />
                <span>{item.name}</span>
                <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}>
                  <HiOutlineX />
                </button>
              </div>
            ))}
            {remaining > 0 && (
              <p className={styles.hint}>Select {remaining} more</p>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          {ready ? (
            <Link className="btn btn-primary" to={`/compare?ids=${items.map((item) => item.id).join(',')}`}>
              Compare now
            </Link>
          ) : (
            <button className="btn btn-primary" type="button" disabled>
              Compare now
            </button>
          )}
          <button className={styles.clear} type="button" onClick={clear}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompareBar;
