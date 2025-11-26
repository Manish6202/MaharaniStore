const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// Public route to get current header image
router.get('/current-header', mediaController.getCurrentHeaderImage);

// Admin routes for media management
router.post('/upload-header', verifyToken, adminOnly, mediaController.uploadHeader, mediaController.uploadHeaderImage);

module.exports = router;
