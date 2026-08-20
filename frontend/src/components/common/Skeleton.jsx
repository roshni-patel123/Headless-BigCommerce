import styles from './Skeleton.module.scss';

export function ProductSkeleton({ count = 8 }) {
  return (
    <div className="grid-products">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.image} />
          <div className={styles.line} />
          <div className={`${styles.line} ${styles.short}`} />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.hero} />
      <ProductSkeleton count={4} />
    </div>
  );
}
