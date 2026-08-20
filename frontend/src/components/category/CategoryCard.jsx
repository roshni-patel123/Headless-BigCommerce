import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import styles from './CategoryCard.module.scss';

function CategoryCard({ category, span = 'tile' }) {
  return (
    <Link to={`/category/${category.id}`} className={`${styles.card} ${styles[span] || styles.tile}`}>
      <SafeImage src={category.image} alt={category.name} loading="lazy" />
      <span className={styles.scrim} aria-hidden="true" />
      <div className={styles.label}>
        <p>Collection</p>
        <h3>{category.name}</h3>
      </div>
    </Link>
  );
}

export default CategoryCard;
