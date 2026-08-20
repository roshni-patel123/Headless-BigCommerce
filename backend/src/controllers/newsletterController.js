const newsletterService = require('../services/newsletterService');
const asyncHandler = require('../helpers/asyncHandler');
const { created } = require('../helpers/response');

const subscribe = asyncHandler(async (req, res) => {
  const subscriber = await newsletterService.subscribe(req.body.email);
  created(res, subscriber);
});

module.exports = {
  subscribe,
};
