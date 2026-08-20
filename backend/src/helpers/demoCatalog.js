function jewelryImage(id, photo, alt) {
  const base = `https://images.unsplash.com/${photo}?auto=format&fit=crop&q=80`;
  return {
    id,
    url_standard: `${base}&w=900`,
    url_thumbnail: `${base}&w=400`,
    url_zoom: `${base}&w=1400`,
    description: alt,
  };
}

const products = [
  {
    id: 101,
    name: 'Aurelia Diamond Solitaire',
    sku: 'VL-101',
    price: 2480,
    sale_price: 0,
    description: '<p>A round brilliant set in 18k yellow gold. The claw is low and quiet so the stone reads as light, not hardware.</p>',
    brand_id: 1,
    brand_name: 'Velora Atelier',
    categories: [1],
    inventory_level: 6,
    availability: 'available',
    is_featured: true,
    date_created: '2026-03-12T00:00:00Z',
    related_products: [105, 108],
    images: [
      jewelryImage(1, 'photo-1605100804763-247f67b3557e', 'Aurelia diamond solitaire'),
      jewelryImage(11, 'photo-1603561591411-07134e71a2a9', 'Aurelia side view'),
    ],
    variants: [],
  },
  {
    id: 102,
    name: 'Luna Pearl Drop Earrings',
    sku: 'VL-102',
    price: 420,
    description: '<p>South Sea pearls on a slim gold hook. Made to move with you, not shout from across the room.</p>',
    brand_id: 2,
    brand_name: 'Luna Gold',
    categories: [3],
    inventory_level: 14,
    availability: 'available',
    is_featured: true,
    date_created: '2026-04-02T00:00:00Z',
    related_products: [106, 107],
    images: [
      jewelryImage(2, 'photo-1535632066927-ab7c9ab60908', 'Luna pearl drop earrings'),
      jewelryImage(12, 'photo-1630019852942-f89202989a59', 'Luna worn view'),
    ],
    variants: [],
  },
  {
    id: 103,
    name: 'Solene Herringbone Chain',
    sku: 'VL-103',
    price: 680,
    description: '<p>A flat 18k chain that sits close to the collarbone. Polished by hand so it catches light without glare.</p>',
    brand_id: 3,
    brand_name: 'Maison Solene',
    categories: [2],
    inventory_level: 11,
    availability: 'available',
    is_featured: true,
    date_created: '2026-05-18T00:00:00Z',
    related_products: [106, 104],
    images: [jewelryImage(3, 'photo-1599643478518-a784e5dc4c8f', 'Solene herringbone chain')],
    variants: [],
  },
  {
    id: 104,
    name: 'Thorn Tennis Bracelet',
    sku: 'VL-104',
    price: 1240,
    description: '<p>A line of white sapphires in a flexible gold setting. Fine enough for day, bright enough for evening.</p>',
    brand_id: 4,
    brand_name: 'Pearl & Thorn',
    categories: [4],
    inventory_level: 9,
    availability: 'available',
    is_featured: false,
    date_created: '2026-06-01T00:00:00Z',
    related_products: [101, 107],
    images: [jewelryImage(4, 'photo-1611591437281-460bfbe1220a', 'Thorn tennis bracelet')],
    variants: [],
  },
  {
    id: 105,
    name: 'Ember Signet Ring',
    sku: 'VL-105',
    price: 540,
    description: '<p>A softened oval signet in recycled gold. The face is left blank so it can stay private, or take an initial later.</p>',
    brand_id: 1,
    brand_name: 'Velora Atelier',
    categories: [1],
    inventory_level: 18,
    availability: 'available',
    is_featured: true,
    date_created: '2026-06-20T00:00:00Z',
    related_products: [101, 104],
    images: [jewelryImage(5, 'photo-1603561591411-07134e71a2a9', 'Ember signet ring')],
    variants: [],
  },
  {
    id: 106,
    name: 'Stillwater Pearl Strand',
    sku: 'VL-106',
    price: 890,
    description: '<p>A single strand of freshwater pearls with a gold clasp that hides at the nape. Meant to be worn, not stored.</p>',
    brand_id: 2,
    brand_name: 'Luna Gold',
    categories: [2],
    inventory_level: 12,
    availability: 'available',
    is_featured: false,
    date_created: '2026-07-04T00:00:00Z',
    related_products: [102, 103],
    images: [jewelryImage(6, 'photo-1515562141207-7a88fb7ce338', 'Stillwater pearl strand')],
    variants: [],
  },
  {
    id: 107,
    name: 'Halo Gold Studs',
    sku: 'VL-107',
    price: 320,
    description: '<p>Small brilliant-cut stones in a brushed gold cup. The everyday pair you forget you are wearing.</p>',
    brand_id: 3,
    brand_name: 'Maison Solene',
    categories: [3],
    inventory_level: 22,
    availability: 'available',
    is_featured: true,
    date_created: '2026-07-22T00:00:00Z',
    related_products: [102, 105],
    images: [jewelryImage(7, 'photo-1630019852942-f89202989a59', 'Halo gold studs')],
    variants: [],
  },
  {
    id: 108,
    name: 'Bridal Crescent Comb',
    sku: 'VL-108',
    price: 1680,
    description: '<p>A crescent of seed pearls and old-cut diamonds on a gold comb. Made for a veil, or worn alone in the hair.</p>',
    brand_id: 4,
    brand_name: 'Pearl & Thorn',
    categories: [5],
    inventory_level: 4,
    availability: 'available',
    is_featured: false,
    date_created: '2026-08-01T00:00:00Z',
    related_products: [101, 106],
    images: [jewelryImage(8, 'photo-1606800052052-a08af7148866', 'Bridal crescent comb')],
    variants: [],
  },
];

const categories = [
  { id: 1, name: 'Rings', description: 'Solitaires, signets, and bands made to be worn every day.', parent_id: 0, image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80', sort_order: 1, is_visible: true },
  { id: 2, name: 'Necklaces', description: 'Chains and pearls that sit close to the skin.', parent_id: 0, image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80', sort_order: 2, is_visible: true },
  { id: 3, name: 'Earrings', description: 'Drops and studs for morning through late night.', parent_id: 0, image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80', sort_order: 3, is_visible: true },
  { id: 4, name: 'Bracelets', description: 'Tennis lines and fine gold for the wrist.', parent_id: 0, image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80', sort_order: 4, is_visible: true },
  { id: 5, name: 'Bridal', description: 'Pieces for the day you want remembered.', parent_id: 0, image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80', sort_order: 5, is_visible: true },
];

const brands = [
  { id: 1, name: 'Velora Atelier', page_title: 'Velora Atelier', meta_description: 'In-house gold and diamond work.', image_url: '' },
  { id: 2, name: 'Luna Gold', page_title: 'Luna Gold', meta_description: 'Pearls and quiet evening pieces.', image_url: '' },
  { id: 3, name: 'Maison Solene', page_title: 'Maison Solene', meta_description: 'Fine chains and everyday gold.', image_url: '' },
  { id: 4, name: 'Pearl & Thorn', page_title: 'Pearl & Thorn', meta_description: 'Bridal and high jewelry.', image_url: '' },
];

function filterProducts(filters = {}) {
  let list = [...products];

  if (filters.categoryId) {
    list = list.filter((item) => item.categories.includes(Number(filters.categoryId)));
  }
  if (filters.brandId) {
    list = list.filter((item) => item.brand_id === Number(filters.brandId));
  }
  if (filters.q) {
    const term = filters.q.toLowerCase();
    list = list.filter((item) => item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term));
  }
  if (filters.minPrice) {
    list = list.filter((item) => item.price >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    list = list.filter((item) => item.price <= Number(filters.maxPrice));
  }
  if (filters.featured) {
    list = list.filter((item) => item.is_featured);
  }
  if (filters.inStock === '1' || filters.inStock === true) {
    list = list.filter((item) => item.availability === 'available' && item.inventory_level > 0);
  }

  if (filters.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
  if (filters.sort === 'newest' || filters.sort === 'date_created') {
    list.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
  }

  return list;
}

module.exports = {
  products,
  categories,
  brands,
  filterProducts,
};
