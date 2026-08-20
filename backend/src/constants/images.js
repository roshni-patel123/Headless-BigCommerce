const BC_DEFAULT_PRODUCT_IMAGE =
  'https://cdn.jsdelivr.net/gh/bigcommerce/cornerstone@master/assets/img/ProductDefault.gif';

function withDefaultImage(url) {
  return url && String(url).trim() ? url : BC_DEFAULT_PRODUCT_IMAGE;
}

module.exports = {
  BC_DEFAULT_PRODUCT_IMAGE,
  withDefaultImage,
};
