const CART_TARGET = '[data-cart-target]';

export function captureFlyOrigin(event, imageUrl) {
  const source = event?.currentTarget || event?.target;
  let rect = null;

  if (source && typeof source.getBoundingClientRect === 'function') {
    rect = source.getBoundingClientRect();
  }

  if (!rect || (!rect.width && !rect.height)) {
    rect = {
      left: window.innerWidth / 2 - 40,
      top: window.innerHeight / 2 - 40,
      width: 80,
      height: 80,
    };
  }

  let image = imageUrl || null;
  if (!image && source?.closest) {
    const card = source.closest('article') || source.closest('[data-product-card]');
    const img = card?.querySelector('img');
    image = img?.currentSrc || img?.src || null;
  }

  return { rect, imageUrl: image };
}

export function flyToCart(origin) {
  if (!origin?.rect) return;

  const bagIcon = document.querySelector(CART_TARGET);
  if (!bagIcon) return;

  const { rect: startRect, imageUrl } = origin;
  const endRect = bagIcon.getBoundingClientRect();

  const startSize = 88;
  const endSize = 28;

  const ghost = document.createElement('div');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${startRect.left + startRect.width / 2 - startSize / 2}px`,
    top: `${startRect.top + startRect.height / 2 - startSize / 2}px`,
    width: `${startSize}px`,
    height: `${startSize}px`,
    borderRadius: '12px',
    background: '#fff',
    border: '3px solid #fff',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.28)',
    overflow: 'hidden',
    zIndex: '9999',
    pointerEvents: 'none',
    opacity: '1',
    transform: 'scale(1)',
    transition: 'left 1.2s cubic-bezier(0.22, 0.61, 0.36, 1), top 1.2s cubic-bezier(0.22, 0.61, 0.36, 1), width 1.2s cubic-bezier(0.22, 0.61, 0.36, 1), height 1.2s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 1.2s ease, transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
  });

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    Object.assign(img.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    });
    ghost.appendChild(img);
  } else {
    ghost.style.background = '#2563eb';
  }

  document.body.appendChild(ghost);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      Object.assign(ghost.style, {
        left: `${endRect.left + endRect.width / 2 - endSize / 2}px`,
        top: `${endRect.top + endRect.height / 2 - endSize / 2}px`,
        width: `${endSize}px`,
        height: `${endSize}px`,
        borderRadius: '50%',
        opacity: '0.85',
        transform: 'scale(0.75)',
      });
    });
  });

  const cleanup = () => ghost.remove();
  ghost.addEventListener('transitionend', cleanup, { once: true });
  setTimeout(cleanup, 1400);

  bagIcon.animate?.(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.35)' },
      { transform: 'scale(1)' },
    ],
    { duration: 450, delay: 1050 }
  );
}
