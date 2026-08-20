import { useState } from 'react';
import { BC_DEFAULT_PRODUCT_IMAGE, catalogImage } from '../../constants/images';

function isPlaceholder(src) {
  return !src || src === BC_DEFAULT_PRODUCT_IMAGE || src.includes('ProductDefault.gif');
}

function SafeImage({ src, alt = '', className = '', ...props }) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? BC_DEFAULT_PRODUCT_IMAGE : catalogImage(src);
  const classes = [className, isPlaceholder(resolved) ? 'catalog-placeholder' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <img
      loading="lazy"
      decoding="async"
      {...props}
      className={classes}
      src={resolved}
      alt={alt}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}

export default SafeImage;
