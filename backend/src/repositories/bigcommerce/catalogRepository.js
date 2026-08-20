const { v3 } = require('../../config/bigcommerce');
const {
  mapProduct,
  mapProductDetail,
  mapCategory,
  mapBrand,
} = require('../../helpers/productMapper');

// Heavy includes force BigCommerce to cap page size (~10). Keep list payloads light.
const LIST_INCLUDE = 'images,primary_image';
const DETAIL_INCLUDE =
  'images,primary_image,variants,options,modifiers,custom_fields,videos';

class CatalogRepository {
  sortToBigCommerce(sort) {
    const map = {
      newest: { sort: 'date_modified', direction: 'desc' },
      price_asc: { sort: 'price', direction: 'asc' },
      price_desc: { sort: 'price', direction: 'desc' },
      name: { sort: 'name', direction: 'asc' },
      featured: { sort: 'id', direction: 'desc' },
      bestselling: { sort: 'total_sold', direction: 'desc' },
    };
    return map[sort] || { sort: 'id', direction: 'desc' };
  }

  cleanParams(params = {}) {
    const next = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      next[key] = value;
    });
    return next;
  }

  async getBrands() {
    const response = await v3.get('/catalog/brands', { params: { limit: 250 } });
    return (response.data.data || []).map(mapBrand);
  }

  async getCategories() {
    const response = await v3.get('/catalog/categories', {
      params: { is_visible: true, limit: 250 },
    });
    return (response.data.data || [])
      .map(mapCategory)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getProducts(params = {}) {
    const sort = this.sortToBigCommerce(params.sort);
    const limit = Math.min(Math.max(Number(params.limit) || 6, 1), 250);
    const query = this.cleanParams({
      include: LIST_INCLUDE,
      is_visible: true,
      page: params.page || 1,
      limit,
      keyword: params.q || undefined,
      'categories:in': params.categoryId || undefined,
      brand_id: params.brandId || undefined,
      'price:min': params.minPrice || undefined,
      'price:max': params.maxPrice || undefined,
      is_featured: params.featured ? true : undefined,
      sort: sort.sort,
      direction: sort.direction,
    });

    const response = await v3.get('/catalog/products', { params: query });
    const pagination = response.data.meta?.pagination || {};
    let products = (response.data.data || []).map(mapProduct);

    if (params.inStock === '1' || params.inStock === true) {
      products = products.filter((item) => item.inStock);
    }

    return {
      data: products,
      meta: {
        page: pagination.current_page || 1,
        limit: pagination.per_page || limit,
        total: pagination.total || products.length,
        totalPages: pagination.total_pages || 1,
      },
    };
  }

  async getProductById(id) {
    const response = await v3.get(`/catalog/products/${id}`, {
      params: { include: DETAIL_INCLUDE },
    });
    return mapProductDetail(response.data.data);
  }

  async getProductReviews(productId, { page = 1, limit = 20 } = {}) {
    const response = await v3.get(`/catalog/products/${productId}/reviews`, {
      params: { page, limit, status: 1 },
    });
    return (response.data.data || []).map((review) => ({
      id: review.id,
      title: review.title,
      text: review.text,
      rating: review.rating,
      name: review.name,
      date: review.date_created,
      status: review.status,
    }));
  }

  attachBrandNames(products, brands) {
    const names = Object.fromEntries(brands.map((brand) => [brand.id, brand.name]));
    return products.map((product) => {
      if (!product.brandId) return product;
      return {
        ...product,
        brand: { id: product.brandId, name: names[product.brandId] || product.brand?.name || '' },
      };
    });
  }
}

module.exports = new CatalogRepository();
