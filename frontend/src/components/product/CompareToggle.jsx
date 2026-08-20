import { useCompare } from '../../context/CompareContext';
import styles from './CompareToggle.module.scss';

function CompareToggle({ product, className = '' }) {
  const { isCompared, toggle } = useCompare();
  const checked = isCompared(product.id);

  return (
    <label className={`${styles.toggle} ${checked ? styles.on : ''} ${className}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggle(product)}
      />
      <span>Compare</span>
    </label>
  );
}

export default CompareToggle;
