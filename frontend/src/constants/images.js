export const BC_DEFAULT_PRODUCT_IMAGE = '/images/product-default.gif';

export function catalogImage(src) {
  return src && String(src).trim() ? src : BC_DEFAULT_PRODUCT_IMAGE;
}
