const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, getUserProfile } = require('../controllers/userController');
const { verifyUserToken } = require('../middleware/auth');

// POST /api/users/send-otp
router.post('/send-otp', sendOTP);

// POST /api/users/verify-otp
router.post('/verify-otp', verifyOTP);

// GET /api/users/profile
router.get('/profile', verifyUserToken, getUserProfile);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working!' });
});

module.exports = router;
