const express = require('express');
const router = express.Router();
const {
  upload,
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  getProductsForLinking,
  getSubcategoriesForLinking,
  getOffersForLinking
} = require('../controllers/trendingBannerController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/active', getActiveBanners);

// Admin routes (protected)
router.get('/admin/all', verifyToken, adminOnly, getAllBanners);
router.get('/admin/products', verifyToken, adminOnly, getProductsForLinking);
router.get('/admin/subcategories', verifyToken, adminOnly, getSubcategoriesForLinking);
router.get('/admin/offers', verifyToken, adminOnly, getOffersForLinking);
router.post('/admin/create', verifyToken, adminOnly, upload.single('backgroundImage'), createBanner);
router.post('/admin/create-json', verifyToken, adminOnly, createBanner);
router.put('/admin/update/:id', verifyToken, adminOnly, upload.single('backgroundImage'), updateBanner);
router.delete('/admin/delete/:id', verifyToken, adminOnly, deleteBanner);
router.put('/admin/toggle/:id', verifyToken, adminOnly, toggleBannerStatus);

module.exports = router;
