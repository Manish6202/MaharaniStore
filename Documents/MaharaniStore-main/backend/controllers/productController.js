const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Add Product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, mainCategory, subcategory, unit, brand, isActive } = req.body;
    
    // Get uploaded image paths
    let images = req.files ? req.files.map(file => file.path) : [];
    
    // If no images uploaded, use placeholder
    if (images.length === 0) {
      images = ['uploads/products/placeholder-image.jpg'];
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      mainCategory,
      subcategory,
      unit,
      brand,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
      images
    });

    await product.save();
    console.log('✅ Product added:', product.name);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });

  } catch (error) {
    console.error('❌ Add product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get All Products (Simple)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    
    console.log(`📦 Retrieved ${products.length} products`);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// 🚀 ENHANCED: Get All Products with Advanced Features
const getAllProductsAdvanced = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock = true
    } = req.query;

    console.log('🔍 Advanced product search:', { page, limit, search, category });

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.mainCategory = category;
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    console.log(`📦 Advanced search: ${products.length}/${totalProducts} products`);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Get products advanced error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// 🔍 ENHANCED: Search Products
const searchProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log(`🔍 Searching for: "${search}" in category: ${category || 'all'}`);

    let query = {
      isActive: true,
      $text: { $search: search }
    };

    if (category) {
      query.mainCategory = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(query);

    console.log(`🔍 Search results: ${products.length}/${totalProducts} products found`);

    res.status(200).json({
      success: true,
      searchQuery: search,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts
      }
    });

  } catch (error) {
    console.error('❌ Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// 📂 ENHANCED: Get Categories and Subcategories
const getCategories = async (req, res) => {
  try {
    const categories = {
      Grocery: [
        'Ration & Essentials',
        'Dairy & Bakery',
        'Fresh Vegetables',
        'Fresh Fruits',
        'Beverages & Drinks',
        'Instant Food & Snacks',
        'Sweets & Chocolates',
        'Tobacco Products'
      ],
      Cosmetics: [
        'Skincare Products',
        'Makeup & Beauty',
        'Hair Care',
        'Men\'s Grooming',
        'Bath & Body',
        'Fragrances',
        'Baby Care',
        'Health & Wellness'
      ]
    };

    // Get product counts for each category/subcategory
    const categoryCounts = {};
    
    for (const [mainCat, subCats] of Object.entries(categories)) {
      categoryCounts[mainCat] = {
        total: await Product.countDocuments({ mainCategory: mainCat, isActive: true }),
        subcategories: {}
      };
      
      for (const subCat of subCats) {
        categoryCounts[mainCat].subcategories[subCat] = await Product.countDocuments({
          mainCategory: mainCat,
          subcategory: subCat,
          isActive: true
        });
      }
    }

    console.log('📂 Categories retrieved with counts');

    res.status(200).json({
      success: true,
      data: {
        categories,
        counts: categoryCounts
      }
    });

  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Products by Main Category (Grocery/Cosmetics)
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    if (!['Grocery', 'Cosmetics'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Use Grocery or Cosmetics'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find({ 
      mainCategory: category, 
      isActive: true 
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments({ 
      mainCategory: category, 
      isActive: true 
    });
    
    console.log(`📂 ${category} products: ${products.length}/${totalProducts}`);
    
    res.status(200).json({
      success: true,
      category,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts
      }
    });

  } catch (error) {
    console.error('❌ Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Products by Subcategory
const getProductsBySubcategory = async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const decodedSubcategory = decodeURIComponent(subcategory);

    const products = await Product.find({ 
      mainCategory: category,
      subcategory: decodedSubcategory,
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments({ 
      mainCategory: category,
      subcategory: decodedSubcategory,
      isActive: true 
    });
    
    console.log(`📂 ${category}/${decodedSubcategory}: ${products.length}/${totalProducts} products`);
    
    res.status(200).json({
      success: true,
      category,
      subcategory: decodedSubcategory,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts
      }
    });

  } catch (error) {
    console.error('❌ Get products by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`📦 Product retrieved: ${product.name}`);

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('❌ Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getAllProductsAdvanced,    
  searchProducts,           
  getCategories,           
  getProductsByCategory,
  getProductsBySubcategory,
  getProductById,
  upload
};