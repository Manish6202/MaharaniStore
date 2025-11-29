const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../middleware/auth');
const {
  reverseGeocode,
  updateUserLocation,
  getUserLocation
} = require('../controllers/locationController');

// Reverse geocode - Convert coordinates to address (public endpoint)
router.post('/reverse-geocode', reverseGeocode);

// Get user's current location (requires auth)
router.get('/current', verifyUserToken, getUserLocation);

// Update user's current location (requires auth)
router.post('/update', verifyUserToken, updateUserLocation);

module.exports = router;

