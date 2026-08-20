const compareService = require('../services/compareService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');

const compare = asyncHandler(async (req, res) => {
  const result = await compareService.compare(req.query.ids);
  success(res, result);
});

module.exports = {
  compare,
};
