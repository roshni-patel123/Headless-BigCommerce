const catalogService = require('../services/catalogService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');

const getStatus = asyncHandler(async (req, res) => {
  const status = await catalogService.getStatus();
  success(res, status);
});

module.exports = {
  getStatus,
};
