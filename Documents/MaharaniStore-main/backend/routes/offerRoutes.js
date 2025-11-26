const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/all', offerController.getAllOffers);

// Admin routes
router.post('/create', verifyToken, adminOnly, offerController.createOffer);
router.get('/admin/all', verifyToken, adminOnly, offerController.getAllOffersAdmin);
router.put('/update/:id', verifyToken, adminOnly, offerController.updateOffer);
router.delete('/delete/:id', verifyToken, adminOnly, offerController.deleteOffer);

module.exports = router;
