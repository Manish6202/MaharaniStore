const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/headers/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'header-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
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

    const imageUrl = `/uploads/headers/${req.file.filename}`;
    
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
exports.getCurrentHeaderImage = async (req, res) => {
  try {
    const headerDir = 'uploads/headers/';
    
    if (!fs.existsSync(headerDir)) {
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: '/uploads/headers/default-header.jpg',
          isDefault: true
        }
      });
    }

    const files = fs.readdirSync(headerDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    if (imageFiles.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: '/uploads/headers/default-header.jpg',
          isDefault: true
        }
      });
    }

    // Get the most recent file
    const sortedFiles = imageFiles.sort((a, b) => {
      const statA = fs.statSync(path.join(headerDir, a));
      const statB = fs.statSync(path.join(headerDir, b));
      return statB.mtime - statA.mtime;
    });

    const latestFile = sortedFiles[0];
    
    res.status(200).json({
      success: true,
      data: {
        imageUrl: `/uploads/headers/${latestFile}`,
        filename: latestFile,
        isDefault: false
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
