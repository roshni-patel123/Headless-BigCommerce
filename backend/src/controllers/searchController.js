const searchService = require('../services/searchService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');
const { getPagination } = require('../utils/pagination');

const search = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const result = await searchService.searchAll({
    q: req.query.q,
    page,
    limit,
    sort: req.query.sort,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    categoryId: req.query.categoryId,
    brandId: req.query.brandId,
    inStock: req.query.inStock,
  });
  success(res, result, 200, result.meta);
});

const suggest = asyncHandler(async (req, res) => {
  const suggestions = await searchService.suggest(req.query.q || '');
  success(res, suggestions);
});

module.exports = {
  search,
  suggest,
};
