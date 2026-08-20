const express = require('express');

const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const brandRoutes = require('./brandRoutes');
const searchRoutes = require('./searchRoutes');
const homeRoutes = require('./homeRoutes');
const cartRoutes = require('./cartRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const customerRoutes = require('./customerRoutes');
const newsletterRoutes = require('./newsletterRoutes');
const catalogRoutes = require('./catalogRoutes');
const compareRoutes = require('./compareRoutes');
const contentRoutes = require('./contentRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const menuRoutes = require('./menuRoutes');

const router = express.Router();

router.use('/catalog', catalogRoutes);
router.use('/compare', compareRoutes);
router.use('/content', contentRoutes);
router.use('/menus', menuRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/home', homeRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/search', searchRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/customers', customerRoutes);
router.use('/newsletter', newsletterRoutes);

module.exports = router;
