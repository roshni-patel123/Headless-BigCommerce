export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function truncate(text, length = 110) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}
