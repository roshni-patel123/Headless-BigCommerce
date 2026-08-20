const homeService = require('../services/homeService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');

const getHome = asyncHandler(async (req, res) => {
  const data = await homeService.getHomepage();
  success(res, data);
});

module.exports = {
  getHome,
};
