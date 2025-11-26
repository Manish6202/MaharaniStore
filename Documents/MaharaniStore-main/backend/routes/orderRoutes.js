const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getDashboardOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');
const { verifyToken, adminOnly, verifyUserToken } = require('../middleware/auth');

// PUBLIC ROUTES (No token required)
// None for orders - all require authentication

// USER ROUTES (User token required)
// POST /api/orders - Create new order
router.post('/', verifyUserToken, createOrder);

// GET /api/orders/user - Get user's orders
router.get('/user', verifyUserToken, getUserOrders);

// GET /api/orders/user/:id - Get single user order
router.get('/user/:id', verifyUserToken, getOrderById);

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', verifyUserToken, cancelOrder);

// ADMIN ROUTES (Admin token required)
// GET /api/orders - Get all orders (Admin)
router.get('/', verifyToken, adminOnly, getAllOrders);

// GET /api/orders/dashboard - Get dashboard orders (Admin)
router.get('/dashboard', verifyToken, adminOnly, getDashboardOrders);

// GET /api/orders/stats - Get order statistics (Admin)
router.get('/stats', verifyToken, adminOnly, getOrderStats);

// GET /api/orders/:id - Get single order (Admin)
router.get('/:id', verifyToken, adminOnly, getOrderById);

// PUT /api/orders/:id/status - Update order status (Admin)
router.put('/:id/status', verifyToken, adminOnly, updateOrderStatus);

module.exports = router;
