const express = require('express');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/store', contentController.getStore);
router.get('/pages', contentController.getPages);
router.get('/pages/:id', contentController.getPage);
router.get('/blog/tags', contentController.getTags);
router.get('/blog', contentController.getPosts);
router.get('/blog/:id', contentController.getPost);
router.get('/redirects', contentController.getRedirects);

module.exports = router;
