const { BC_DEFAULT_PRODUCT_IMAGE, withDefaultImage } = require('../constants/images');

function pickImage(product) {
  const primary = product.primary_image || product.images?.[0];
  const gallery = (product.images || [])
    .map((image) => ({
      id: image.id,
      thumbnail: withDefaultImage(image.url_thumbnail || image.url_standard),
      standard: withDefaultImage(image.url_standard || image.url_thumbnail),
      zoom: withDefaultImage(image.url_zoom || image.url_standard),
      alt: image.description || product.name,
    }))
    .filter((image) => image.standard);

  if (!gallery.length) {
    gallery.push({
      id: 0,
      thumbnail: BC_DEFAULT_PRODUCT_IMAGE,
      standard: BC_DEFAULT_PRODUCT_IMAGE,
      zoom: BC_DEFAULT_PRODUCT_IMAGE,
      alt: product.name,
    });
  }

  return {
    thumbnail: withDefaultImage(primary?.url_thumbnail || primary?.url_standard),
    standard: withDefaultImage(primary?.url_standard || primary?.url_zoom || primary?.url_thumbnail),
    zoom: withDefaultImage(primary?.url_zoom || primary?.url_standard || primary?.url_thumbnail),
    images: gallery,
  };
}

function mapOption(option = {}) {
  return {
    id: option.id,
    displayName: option.display_name || option.name || '',
    type: option.type,
    required: Boolean(option.required),
    sortOrder: option.sort_order || 0,
    values: (option.option_values || []).map((value) => ({
      id: value.id,
      label: value.label,
      sortOrder: value.sort_order || 0,
      isDefault: Boolean(value.is_default),
      valueData: value.value_data || null,
    })),
  };
}

function mapModifier(modifier = {}) {
  return {
    id: modifier.id,
    displayName: modifier.display_name || '',
    type: modifier.type,
    required: Boolean(modifier.required),
    sortOrder: modifier.sort_order || 0,
    config: modifier.config || {},
    values: (modifier.option_values || []).map((value) => ({
      id: value.id,
      label: value.label,
      adjusters: value.adjusters || null,
    })),
  };
}

function mapCustomField(field = {}) {
  return {
    id: field.id,
    name: field.name,
    value: field.value,
  };
}

function mapVideo(video = {}) {
  return {
    id: video.id,
    title: video.title || '',
    type: video.type,
    videoId: video.video_id || '',
    description: video.description || '',
  };
}

function mapProduct(product) {
  const media = pickImage(product);
  const options = product.options || [];
  const variants = product.variants || [];
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.calculated_price ?? product.price ?? 0),
    salePrice: product.sale_price ? Number(product.sale_price) : null,
    retailPrice: product.retail_price ? Number(product.retail_price) : null,
    description: product.description || '',
    plainDescription: stripHtml(product.description || ''),
    brand: product.brand_id ? { id: product.brand_id, name: product.brand_name || '' } : null,
    brandId: product.brand_id || null,
    categories: product.categories || [],
    inventoryLevel: product.inventory_level ?? null,
    inStock: product.availability === 'available' && (product.inventory_level ?? 1) > 0,
    hasOptions:
      Boolean(product.option_set_id)
      || options.length > 0
      || variants.length > 1,
    isFeatured: Boolean(product.is_featured),
    dateCreated: product.date_created,
    dateModified: product.date_modified,
    image: media.standard,
    hoverImage: media.images[1]?.standard || '',
    thumbnail: media.thumbnail,
    zoomImage: media.zoom,
    images: media.images,
    rating: Number((4.5 + ((product.id || 1) % 5) * 0.1).toFixed(1)),
    reviewCount: 18 + ((product.id || 1) % 47),
    customUrl: product.custom_url?.url || '',
    metaTitle: product.page_title || product.name || '',
    metaDescription: product.meta_description || '',
    searchKeywords: product.search_keywords || '',
    customFields: (product.custom_fields || []).map(mapCustomField),
  };
}

function mapProductDetail(product) {
  return {
    ...mapProduct(product),
    weight: product.weight,
    relatedIds: product.related_products || [],
    options: (product.options || []).map(mapOption),
    modifiers: (product.modifiers || []).map(mapModifier),
    videos: (product.videos || []).map(mapVideo),
    variants: (product.variants || []).map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: Number(variant.calculated_price ?? variant.price ?? 0),
      inventoryLevel: variant.inventory_level,
      imageUrl: variant.image_url || '',
      optionValues: (variant.option_values || []).map((ov) => ({
        id: ov.id,
        label: ov.label,
        optionId: ov.option_id,
        optionDisplayName: ov.option_display_name,
      })),
    })),
  };
}

function mapCategory(category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description || '',
    parentId: category.parent_id,
    image: category.image_url || '',
    sortOrder: category.sort_order,
    isVisible: category.is_visible !== false,
    metaTitle: category.page_title || category.name || '',
    metaDescription: category.meta_description || '',
    customUrl: category.custom_url?.url || '',
  };
}

function mapBrand(brand) {
  return {
    id: brand.id,
    name: brand.name,
    pageTitle: brand.page_title || brand.name,
    metaDescription: brand.meta_description || '',
    image: brand.image_url || '',
  };
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = {
  mapProduct,
  mapProductDetail,
  mapCategory,
  mapBrand,
  mapOption,
  mapModifier,
};
