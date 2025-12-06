const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { 
  addProduct, 
  getAllProducts,
  getAllProductsAdvanced,
  searchProducts,
  getCategories,
  getProductsByCategory, 
  getProductsBySubcategory, 
  getProductById,
  upload 
} = require('../controllers/productController');
const { verifyToken, adminOnly } = require('../middleware/auth');

// PUBLIC ROUTES (No token required)
// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/advanced - Enhanced products with filters
router.get('/advanced', getAllProductsAdvanced);

// GET /api/products/search - Search products
router.get('/search', searchProducts);

// GET /api/products/categories - Get categories
router.get('/categories', getCategories);

// GET /api/products/single/:id - Get single product by ID (MUST BE BEFORE :category routes)
router.get('/single/:id', getProductById);

// GET /api/products/:category - Get products by main category
router.get('/:category', getProductsByCategory);

// GET /api/products/:category/:subcategory - Get products by subcategory
router.get('/:category/:subcategory', getProductsBySubcategory);


// POST /api/products - Add new product (Admin only)
router.post('/', verifyToken, adminOnly, upload.array('images', 5), addProduct);

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', verifyToken, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, mainCategory, subcategory, unit, brand, isActive } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.stock = stock !== undefined ? parseInt(stock) : product.stock;
    product.mainCategory = mainCategory || product.mainCategory;
    product.subcategory = subcategory || product.subcategory;
    product.unit = unit || product.unit;
    product.brand = brand || product.brand;
    product.isActive = isActive !== undefined ? isActive === 'true' : product.isActive;

    // Update images if new ones are provided
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary if they are Cloudinary URLs
      if (product.images && product.images.length > 0) {
        for (const oldImageUrl of product.images) {
          if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
            try {
              const urlParts = oldImageUrl.split('/');
              const publicId = urlParts.slice(-2).join('/').split('.')[0];
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error('Error deleting old product image from Cloudinary:', error);
            }
          }
        }
      }
      // Set new images (Cloudinary returns secure_url in file.path)
      product.images = req.files.map(file => file.path);
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary if they are Cloudinary URLs
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        if (imageUrl && imageUrl.includes('cloudinary.com')) {
          try {
            const urlParts = imageUrl.split('/');
            const publicId = urlParts.slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error('Error deleting product image from Cloudinary:', error);
          }
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;