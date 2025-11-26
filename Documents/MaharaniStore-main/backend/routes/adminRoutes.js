const express = require('express');
const router = express.Router();
const { 
  registerAdmin, 
  loginAdmin, 
  getAllUsers, 
  getUserById, 
  updateUserStatus, 
  deleteUser, 
  getUserStats 
} = require('../controllers/adminController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected admin routes
router.get('/users', verifyToken, adminOnly, getAllUsers);
router.get('/users/stats', verifyToken, adminOnly, getUserStats);
router.get('/users/:id', verifyToken, adminOnly, getUserById);
router.put('/users/:id/status', verifyToken, adminOnly, updateUserStatus);
router.delete('/users/:id', verifyToken, adminOnly, deleteUser);

module.exports = router;