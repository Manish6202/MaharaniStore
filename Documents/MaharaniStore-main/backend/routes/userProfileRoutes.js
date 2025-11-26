const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserStats
} = require('../controllers/userProfileController');

// User Profile Routes
router.get('/profile', verifyUserToken, getUserProfile);
router.put('/profile', verifyUserToken, updateUserProfile);
router.get('/stats', verifyUserToken, getUserStats);

// Address Management Routes
router.get('/addresses', verifyUserToken, getUserAddresses);
router.post('/addresses', verifyUserToken, addAddress);
router.put('/addresses/:addressId', verifyUserToken, updateAddress);
router.delete('/addresses/:addressId', verifyUserToken, deleteAddress);
router.patch('/addresses/:addressId/default', verifyUserToken, setDefaultAddress);

module.exports = router;
