const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
// Uses CLOUDINARY_URL environment variable if set
// Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
// Or individual environment variables

if (process.env.CLOUDINARY_URL) {
  // Cloudinary automatically parses CLOUDINARY_URL
  cloudinary.config();
} else {
  // Fallback to individual environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

module.exports = cloudinary;

