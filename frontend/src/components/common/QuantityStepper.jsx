import { HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi';
import styles from './QuantityStepper.module.scss';

function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}) {
  const qty = Number(value) || min;

  function setValue(next) {
    const clamped = Math.min(max, Math.max(min, Number(next) || min));
    onChange(clamped);
  }

  return (
    <div className={`${styles.stepper} ${styles[size] || ''}`} role="group" aria-label="Quantity">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setValue(qty - 1)}
        disabled={qty <= min}
      >
        <HiOutlineMinus />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={qty}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Quantity"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setValue(qty + 1)}
        disabled={qty >= max}
      >
        <HiOutlinePlus />
      </button>
    </div>
  );
}

export default QuantityStepper;
