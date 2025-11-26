const Offer = require('../models/Offer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, '../uploads/offers');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for offer images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `offer-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

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
        imageUrl: `/uploads/offers/${req.file.filename}`,
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
        // Delete old image
        const existingOffer = await Offer.findById(id);
        if (existingOffer && existingOffer.imageUrl) {
          const oldImagePath = path.join(__dirname, '..', existingOffer.imageUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.imageUrl = `/uploads/offers/${req.file.filename}`;
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

    // Delete image file
    if (offer.imageUrl) {
      const imagePath = path.join(__dirname, '..', offer.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
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
