import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineX } from 'react-icons/hi';
import styles from './Modal.module.scss';

function Modal({ open, onClose, children, label = 'Dialog' }) {
  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <HiOutlineX />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
