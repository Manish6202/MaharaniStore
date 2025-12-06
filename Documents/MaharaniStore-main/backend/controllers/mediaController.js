const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure multer with Cloudinary storage for header images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'maharani-store/headers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1920, height: 400, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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

// Upload header image
exports.uploadHeaderImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Cloudinary returns secure_url in file.path
    const imageUrl = req.file.path;
    
    res.status(200).json({
      success: true,
      message: 'Header image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        title: req.body.title || 'Header Image'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Get current header image
// Note: With Cloudinary, you'll need to store the latest header image URL in database
// For now, returning a message that header images are stored in Cloudinary
exports.getCurrentHeaderImage = async (req, res) => {
  try {
    // With Cloudinary, header images are stored in cloud
    // You may want to store the latest header image URL in database
    // For now, returning a default response
    res.status(200).json({
      success: true,
      data: {
        imageUrl: null,
        isDefault: true,
        message: 'Header images are stored in Cloudinary. Upload a new header image to set it.'
      }
    });
  } catch (error) {
    console.error('Error getting header image:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting header image',
      error: error.message
    });
  }
};

// Upload middleware
exports.uploadHeader = upload.single('headerImage');
