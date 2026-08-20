const productService = require('./productService');
const categoryService = require('./categoryService');
const brandService = require('./brandService');
const contentService = require('./contentService');
const menuRepository = require('../repositories/bigcommerce/menuRepository');
const { getCache, setCache } = require('../utils/cache');

class HomeService {
  async getHomepage() {
    const cached = getCache('home:v3');
    if (cached) return cached;

    const [categories, featured, arrivals, bestsellers, brands, banners, blog, nav] =
      await Promise.all([
        categoryService.getAll(),
        productService.getFeatured(8),
        productService.getNewArrivals(8),
        productService.getBestSellers(8),
        brandService.getAll().catch(() => []),
        menuRepository.getBanners().catch(() => []),
        contentService.getBlogPosts({ limit: 3 }).catch(() => ({ data: [] })),
        menuRepository.getNavigation().catch(() => ({ items: [] })),
      ]);

    const shopCategories = categories.filter((item) => !/shop all/i.test(item.name));
    const heroImage =
      banners[0]?.content ||
      featured.data[0]?.image ||
      arrivals.data[0]?.image ||
      shopCategories[0]?.image ||
      '';

    const names = shopCategories.slice(0, 3).map((item) => item.name.toLowerCase());
    const store = await contentService.getStore().catch(() => ({ name: 'VELORA' }));

    const data = {
      hero: {
        eyebrow: store.name || 'VELORA',
        title: banners[0]?.name || 'Shop everyday essentials.',
        subtitle: names.length
          ? `Shop ${names.join(', ')}, and more.`
          : store.metaDescription || 'Simple products for daily use.',
        cta: 'Shop all',
        image: typeof heroImage === 'string' && heroImage.startsWith('http') ? heroImage : featured.data[0]?.image || '',
        bannerHtml: typeof banners[0]?.content === 'string' ? banners[0].content : '',
      },
      categories: shopCategories.slice(0, 5),
      featured: featured.data,
      newArrivals: arrivals.data,
      bestSellers: bestsellers.data,
      brands: (brands || []).slice(0, 8),
      banners,
      blogPosts: blog.data || [],
      navigation: nav,
      reviews: [],
    };

    setCache('home:v3', data, 60000);
    return data;
  }
}

module.exports = new HomeService();
