import { createContext, useContext, useMemo, useRef, useState } from 'react';
import styles from './Toast.module.scss';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmToast, setConfirmToast] = useState(null);
  const confirmResolver = useRef(null);

  function dismiss(id) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  function closeConfirm(result) {
    if (confirmResolver.current) {
      confirmResolver.current(result);
      confirmResolver.current = null;
    }
    setConfirmToast(null);
  }

  const value = useMemo(
    () => ({
      notify(message) {
        const id = Date.now() + Math.random();
        setToasts((current) => [...current, { id, message }]);
        setTimeout(() => dismiss(id), 2600);
      },
      confirm({
        title = 'Are you sure?',
        message = '',
        confirmLabel = 'Delete',
        cancelLabel = 'Cancel',
      } = {}) {
        return new Promise((resolve) => {
          if (confirmResolver.current) {
            confirmResolver.current(false);
          }
          confirmResolver.current = resolve;
          setConfirmToast({
            id: Date.now(),
            title,
            message,
            confirmLabel,
            cancelLabel,
          });
        });
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.stack}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            {toast.message}
          </div>
        ))}

        {confirmToast && (
          <div className={`${styles.toast} ${styles.confirm}`} role="alertdialog" aria-modal="true">
            <strong>{confirmToast.title}</strong>
            {confirmToast.message && <p>{confirmToast.message}</p>}
            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={() => closeConfirm(false)}>
                {confirmToast.cancelLabel}
              </button>
              <button type="button" className={styles.danger} onClick={() => closeConfirm(true)}>
                {confirmToast.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
