const productService = require('../services/productService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');
const { getPagination } = require('../utils/pagination');

const getAll = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const result = await productService.getAll({
    page,
    limit,
    sort: req.query.sort,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    brandId: req.query.brandId,
    categoryId: req.query.categoryId,
    q: req.query.q,
    inStock: req.query.inStock,
  });
  success(res, result.data, 200, result.meta);
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  success(res, product);
});

const search = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const result = await productService.search({
    page,
    limit,
    q: req.query.q,
    sort: req.query.sort,
  });
  success(res, result.data, 200, result.meta);
});

const getFeatured = asyncHandler(async (req, res) => {
  const result = await productService.getFeatured(Number(req.query.limit) || 8);
  success(res, result.data);
});

const getNewArrivals = asyncHandler(async (req, res) => {
  const result = await productService.getNewArrivals(Number(req.query.limit) || 8);
  success(res, result.data);
});

const getBestSellers = asyncHandler(async (req, res) => {
  const result = await productService.getBestSellers(Number(req.query.limit) || 8);
  success(res, result.data);
});

const getRelated = asyncHandler(async (req, res) => {
  const products = await productService.getRelated(req.params.id);
  success(res, products);
});

const getReviews = asyncHandler(async (req, res) => {
  const reviews = await productService.getReviews(req.params.id, {
    page: req.query.page,
    limit: req.query.limit,
  });
  success(res, reviews);
});

module.exports = {
  getAll,
  getById,
  search,
  getFeatured,
  getNewArrivals,
  getBestSellers,
  getRelated,
  getReviews,
};
