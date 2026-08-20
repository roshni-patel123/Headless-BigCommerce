const menuService = require('../services/menuService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');

const getNavigation = asyncHandler(async (req, res) => {
  const nav = await menuService.getNavigation();
  success(res, nav);
});

const getBanners = asyncHandler(async (req, res) => {
  const banners = await menuService.getBanners();
  success(res, banners);
});

module.exports = {
  getNavigation,
  getBanners,
};
