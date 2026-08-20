import { useState } from 'react';
import SafeImage from '../common/SafeImage';
import styles from './ImageGallery.module.scss';

function ImageGallery({ product }) {
  const images = product.images?.length
    ? product.images
    : [{ id: 1, standard: product.image, zoom: product.zoomImage || product.image, alt: product.name }];
  const [active, setActive] = useState(images[0]);
  const [origin, setOrigin] = useState('50% 50%');

  return (
    <div className={styles.gallery}>
      <div
        className={styles.stage}
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - box.left) / box.width) * 100;
          const y = ((event.clientY - box.top) / box.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
      >
        <SafeImage src={active.zoom || active.standard} alt={active.alt || product.name} style={{ transformOrigin: origin }} />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((image) => (
            <button key={image.id} onClick={() => setActive(image)}>
              <SafeImage src={image.thumbnail || image.standard} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
