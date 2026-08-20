const customerService = require('../services/customerService');
const asyncHandler = require('../helpers/asyncHandler');
const { success, created } = require('../helpers/response');

const register = asyncHandler(async (req, res) => {
  const result = await customerService.register(req.body);
  created(res, result);
});

const login = asyncHandler(async (req, res) => {
  const result = await customerService.login(req.body);
  success(res, result);
});

const getProfile = asyncHandler(async (req, res) => {
  const customer = await customerService.getProfile(req.user.id);
  success(res, customer);
});

const updateProfile = asyncHandler(async (req, res) => {
  const customer = await customerService.updateProfile(req.user.id, req.body);
  success(res, customer);
});

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await customerService.getAddresses(req.user.id);
  success(res, addresses);
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await customerService.addAddress(req.user.id, req.body);
  created(res, address);
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await customerService.updateAddress(req.user.id, req.params.id, req.body);
  success(res, address);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const result = await customerService.deleteAddress(req.user.id, req.params.id);
  success(res, result);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await customerService.getOrders(req.user.id);
  success(res, orders);
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getOrders,
};
