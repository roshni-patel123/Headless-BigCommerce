import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ProductOptions.module.scss';

function ProductOptions({ product, onChange }) {
  const options = product?.options || [];
  const variants = product?.variants || [];
  const [selected, setSelected] = useState({});
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const defaults = {};
    options.forEach((option) => {
      const def = option.values?.find((v) => v.isDefault) || option.values?.[0];
      if (def) defaults[option.id] = def.id;
    });
    setSelected(defaults);
  }, [product?.id]);

  const variant = useMemo(() => {
    if (!variants.length) return null;
    const selectedIds = Object.values(selected).map(Number);
    if (!selectedIds.length) return variants[0] || null;
    return (
      variants.find((row) => {
        const ids = (row.optionValues || []).map((ov) => Number(ov.id));
        return selectedIds.every((id) => ids.includes(id));
      }) || null
    );
  }, [variants, selected]);

  useEffect(() => {
    const optionSelections = Object.entries(selected).map(([optionId, optionValueId]) => ({
      optionId: Number(optionId),
      optionValueId: Number(optionValueId),
    }));
    onChangeRef.current?.({
      variantId: variant?.id || null,
      price: variant?.price ?? product?.price,
      optionSelections,
      sku: variant?.sku || product?.sku,
      inStock:
        variant != null ? (variant.inventoryLevel ?? 1) > 0 : product?.inStock,
    });
  }, [variant, selected, product]);

  if (!options.length && variants.length <= 1) return null;

  return (
    <div className={styles.root}>
      {options.map((option) => (
        <div key={option.id} className={styles.group}>
          <p className={styles.label}>{option.displayName}</p>
          <div className={styles.values}>
            {(option.values || []).map((value) => {
              const active = Number(selected[option.id]) === Number(value.id);
              const swatch = value.valueData?.colors?.[0];
              return (
                <button
                  key={value.id}
                  type="button"
                  className={`${styles.chip} ${active ? styles.active : ''} ${swatch ? styles.swatch : ''}`}
                  style={swatch ? { '--swatch': swatch } : undefined}
                  onClick={() =>
                    setSelected((current) => ({ ...current, [option.id]: value.id }))
                  }
                >
                  {swatch ? <span className={styles.dot} /> : null}
                  {value.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {variant?.sku && <p className={styles.sku}>SKU {variant.sku}</p>}
    </div>
  );
}

export default ProductOptions;
