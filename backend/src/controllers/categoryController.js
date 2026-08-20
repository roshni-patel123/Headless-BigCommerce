const categoryService = require('../services/categoryService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');
const { getPagination } = require('../utils/pagination');

const getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAll();
  success(res, categories);
});

const getTree = asyncHandler(async (req, res) => {
  const tree = await categoryService.getTree();
  success(res, tree);
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  success(res, category);
});

const getProducts = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const result = await categoryService.getProducts(req.params.id, {
    page,
    limit,
    sort: req.query.sort,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    brandId: req.query.brandId,
    q: req.query.q,
    inStock: req.query.inStock,
  });
  success(res, { category: result.category, products: result.data }, 200, result.meta);
});

module.exports = {
  getAll,
  getTree,
  getById,
  getProducts,
};
