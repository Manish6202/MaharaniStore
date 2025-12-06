const TrendingBanner = require('../models/TrendingBanner');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure multer with Cloudinary storage for trending banners
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'maharani-store/trending-banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all active trending banners (public)
const getActiveBanners = async (req, res) => {
  try {
    const banners = await TrendingBanner.find({
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    })
    .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all trending banners (admin)
const getAllBanners = async (req, res) => {
  try {
    const banners = await TrendingBanner.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Error fetching all banners:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new trending banner (admin)
const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      buttonText,
      linkType,
      linkId,
      linkLabel,
      order,
      startDate,
      endDate
    } = req.body;

    // Validate link based on type
    if (linkType === 'product') {
      const product = await Product.findById(linkId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product not found'
        });
      }
    } else if (linkType === 'offer') {
      const offer = await Offer.findById(linkId);
      if (!offer) {
        return res.status(400).json({
          success: false,
          message: 'Offer not found'
        });
      }
    }

    const banner = new TrendingBanner({
      title,
      subtitle,
      buttonText: buttonText || 'Shop Now',
      backgroundImage: req.file ? req.file.path : (req.body.backgroundImage || ''), // Cloudinary secure_url
      linkType,
      linkId: linkType !== 'none' ? linkId : undefined,
      linkLabel: linkType !== 'none' ? linkLabel : undefined,
      order: order || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: 'Trending banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update trending banner (admin)
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      const existingBanner = await TrendingBanner.findById(id);
      if (existingBanner && existingBanner.backgroundImage && existingBanner.backgroundImage.includes('cloudinary.com')) {
        try {
          const urlParts = existingBanner.backgroundImage.split('/');
          const publicId = urlParts.slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting old banner image from Cloudinary:', error);
        }
      }
      updateData.backgroundImage = req.file.path; // Cloudinary secure_url
    }

    // Validate link if provided
    if (updateData.linkType === 'product' && updateData.linkId) {
      const product = await Product.findById(updateData.linkId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product not found'
        });
      }
    } else if (updateData.linkType === 'offer' && updateData.linkId) {
      const offer = await Offer.findById(updateData.linkId);
      if (!offer) {
        return res.status(400).json({
          success: false,
          message: 'Offer not found'
        });
      }
    }

    const banner = await TrendingBanner.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete trending banner (admin)
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await TrendingBanner.findById(id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Delete image from Cloudinary if it's a Cloudinary URL
    if (banner.backgroundImage && banner.backgroundImage.includes('cloudinary.com')) {
      try {
        const urlParts = banner.backgroundImage.split('/');
        const publicId = urlParts.slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting banner image from Cloudinary:', error);
      }
    }

    await TrendingBanner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Toggle banner status (admin)
const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await TrendingBanner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: banner
    });
  } catch (error) {
    console.error('Error toggling banner status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get products for linking (admin)
const getProductsForLinking = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name price mainCategory subcategory images')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products for linking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get subcategories for linking (admin)
const getSubcategoriesForLinking = async (req, res) => {
  try {
    const subcategories = await Product.distinct('subcategory', { isActive: true });
    
    const subcategoryList = subcategories.map(sub => ({
      name: sub,
      category: 'Grocery' // You can enhance this to get the actual category
    }));

    res.status(200).json({
      success: true,
      data: subcategoryList
    });
  } catch (error) {
    console.error('Error fetching subcategories for linking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get offers for linking (admin)
const getOffersForLinking = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .select('title description discount images startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: offers
    });
  } catch (error) {
    console.error('Error fetching offers for linking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  upload,
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  getProductsForLinking,
  getSubcategoriesForLinking,
  getOffersForLinking
};
