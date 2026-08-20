import { Link } from 'react-router-dom';
import styles from './EmptyState.module.scss';

function EmptyState({
  title,
  text,
  actionLabel = 'Browse products',
  to = '/products',
  onAction,
}) {
  return (
    <div className={styles.wrap}>
      <h2>{title}</h2>
      <p>{text}</p>
      {onAction ? (
        <button className="btn btn-primary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : (
        <Link className="btn btn-primary" to={to}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
