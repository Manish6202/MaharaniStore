const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../middleware/auth');

// Import wishlist controller functions
const getWishlist = async (req, res) => {
  try {
    const Wishlist = require('../models/wishlist');
    const userId = req.user.userId;
    
    const wishlist = await Wishlist.getOrCreateWishlist(userId);
    
    res.json({
      success: true,
      data: wishlist,
      message: 'Wishlist retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist',
      error: error.message
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const Wishlist = require('../models/wishlist');
    const Product = require('../models/Product');
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(p => p.product.toString() === productId);
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist
    wishlist.products.push({ product: productId });
    await wishlist.save();

    // Populate product details
    await wishlist.populate('products.product', 'name price images brand mainCategory subcategory stock unit');

    res.json({
      success: true,
      data: wishlist,
      message: 'Product added to wishlist successfully'
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const Wishlist = require('../models/wishlist');
    const userId = req.user.userId;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(p => p.product.toString() !== productId);
    await wishlist.save();

    // Populate remaining products
    await wishlist.populate('products.product', 'name price images brand mainCategory subcategory stock unit');

    res.json({
      success: true,
      data: wishlist,
      message: 'Product removed from wishlist successfully'
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
};

const checkWishlistStatus = async (req, res) => {
  try {
    const Wishlist = require('../models/wishlist');
    const userId = req.user.userId;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    const isInWishlist = wishlist ? wishlist.hasProduct(productId) : false;

    res.json({
      success: true,
      data: { isInWishlist },
      message: 'Wishlist status checked successfully'
    });
  } catch (error) {
    console.error('❌ Error checking wishlist status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
      error: error.message
    });
  }
};

const getWishlistCount = async (req, res) => {
  try {
    const Wishlist = require('../models/wishlist');
    const userId = req.user.userId;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    const count = wishlist ? wishlist.products.length : 0;

    res.json({
      success: true,
      data: { count },
      message: 'Wishlist count retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting wishlist count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist count',
      error: error.message
    });
  }
};

const clearWishlist = async (req, res) => {
  try {
    const Wishlist = require('../models/wishlist');
    const userId = req.user.userId;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({
      success: true,
      data: wishlist,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

// Routes
router.get('/', verifyUserToken, getWishlist);
router.post('/add', verifyUserToken, addToWishlist);
router.delete('/remove/:productId', verifyUserToken, removeFromWishlist);
router.get('/check/:productId', verifyUserToken, checkWishlistStatus);
router.get('/count', verifyUserToken, getWishlistCount);
router.delete('/clear', verifyUserToken, clearWishlist);

module.exports = router;