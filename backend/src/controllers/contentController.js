const contentService = require('../services/contentService');
const asyncHandler = require('../helpers/asyncHandler');
const { success } = require('../helpers/response');

const getStore = asyncHandler(async (req, res) => {
  const store = await contentService.getStore();
  success(res, store);
});

const getPages = asyncHandler(async (req, res) => {
  const pages = await contentService.getPages();
  success(res, pages);
});

const getPage = asyncHandler(async (req, res) => {
  const page = await contentService.getPageById(req.params.id);
  success(res, page);
});

const getPosts = asyncHandler(async (req, res) => {
  const result = await contentService.getBlogPosts({
    page: req.query.page,
    limit: req.query.limit,
    tag: req.query.tag,
  });
  success(res, result.data, 200, result.meta);
});

const getPost = asyncHandler(async (req, res) => {
  const post = await contentService.getBlogPostById(req.params.id);
  success(res, post);
});

const getTags = asyncHandler(async (req, res) => {
  const tags = await contentService.getBlogTags();
  success(res, tags);
});

const getRedirects = asyncHandler(async (req, res) => {
  const redirects = await contentService.getRedirects();
  success(res, redirects);
});

module.exports = {
  getStore,
  getPages,
  getPage,
  getPosts,
  getPost,
  getTags,
  getRedirects,
};
