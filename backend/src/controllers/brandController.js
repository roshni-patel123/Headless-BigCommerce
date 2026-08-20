const brandService = require('../services/brandService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');
const { getPagination } = require('../utils/pagination');

const getAll = asyncHandler(async (req, res) => {
  const brands = await brandService.getAll();
  success(res, brands);
});

const getById = asyncHandler(async (req, res) => {
  const brand = await brandService.getById(req.params.id);
  success(res, brand);
});

const getProducts = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const result = await brandService.getProducts(req.params.id, {
    page,
    limit,
    sort: req.query.sort,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    q: req.query.q,
  });
  success(res, { brand: result.brand, products: result.data }, 200, result.meta);
});

module.exports = {
  getAll,
  getById,
  getProducts,
};
