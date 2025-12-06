const Offer = require('../models/Offer');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure multer with Cloudinary storage for offer images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'maharani-store/offers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed!'));
  },
}).single('offerImage');

// Create new offer
exports.createOffer = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { title, subtitle, discount, timeIcon, timeText, gradient, order } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Offer image is required' });
      }

      const offerData = {
        title,
        subtitle,
        discount,
        timeIcon: timeIcon || '⏰',
        timeText,
        imageUrl: req.file.path, // Cloudinary returns secure_url in file.path
        gradient: gradient ? JSON.parse(gradient) : ['#FF6B6B', '#FF8E53'],
        order: order || 0
      };

      const offer = new Offer(offerData);
      await offer.save();

      res.status(201).json({
        success: true,
        message: 'Offer created successfully',
        data: offer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating offer',
        error: error.message
      });
    }
  });
};

// Get all offers
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message
    });
  }
};

// Get all offers (admin - including inactive)
exports.getAllOffersAdmin = async (req, res) => {
  try {
    const offers = await Offer.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message
    });
  }
};

// Update offer
exports.updateOffer = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { id } = req.params;
      const { title, subtitle, discount, timeIcon, timeText, gradient, order, isActive } = req.body;

      const updateData = {
        title,
        subtitle,
        discount,
        timeIcon: timeIcon || '⏰',
        timeText,
        gradient: gradient ? JSON.parse(gradient) : undefined,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      };

      // If new image is uploaded
      if (req.file) {
        // Delete old image from Cloudinary if it's a Cloudinary URL
        const existingOffer = await Offer.findById(id);
        if (existingOffer && existingOffer.imageUrl) {
          // Extract public_id from Cloudinary URL if it's a Cloudinary URL
          if (existingOffer.imageUrl.includes('cloudinary.com')) {
            try {
              const urlParts = existingOffer.imageUrl.split('/');
              const publicId = urlParts.slice(-2).join('/').split('.')[0];
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error('Error deleting old image from Cloudinary:', error);
            }
          }
        }
        updateData.imageUrl = req.file.path; // Cloudinary secure_url
      }

      const offer = await Offer.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: 'Offer not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Offer updated successfully',
        data: offer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating offer',
        error: error.message
      });
    }
  });
};

// Delete offer
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Delete image from Cloudinary if it's a Cloudinary URL
    if (offer.imageUrl && offer.imageUrl.includes('cloudinary.com')) {
      try {
        const urlParts = offer.imageUrl.split('/');
        const publicId = urlParts.slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Offer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting offer',
      error: error.message
    });
  }
};
