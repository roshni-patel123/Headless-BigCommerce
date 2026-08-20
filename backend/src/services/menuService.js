const menuRepository = require('../repositories/bigcommerce/menuRepository');
const { getCache, setCache } = require('../utils/cache');

class MenuService {
  async getNavigation() {
    const cached = getCache('menus:nav');
    if (cached) return cached;
    const data = await menuRepository.getNavigation();
    setCache('menus:nav', data, 120000);
    return data;
  }

  async getBanners() {
    const cached = getCache('menus:banners');
    if (cached) return cached;
    const data = await menuRepository.getBanners();
    setCache('menus:banners', data, 120000);
    return data;
  }
}

module.exports = new MenuService();
