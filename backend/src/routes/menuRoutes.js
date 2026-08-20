const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

router.get('/navigation', menuController.getNavigation);
router.get('/banners', menuController.getBanners);

module.exports = router;
