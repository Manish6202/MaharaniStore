// Simple Cloudinary Upload Test
// This will test if Cloudinary upload is working
require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');

async function testDirectCloudinaryUpload() {
  try {
    console.log('🧪 Testing Direct Cloudinary Upload...\n');
    
    // Check if we have a real image file
    // Try offers folder first (has real PNG image)
    let imagePath = path.join(__dirname, 'uploads/offers/offer-1760294700235.jpg');
    
    if (!fs.existsSync(imagePath)) {
      // Try products folder
      const uploadsDir = path.join(__dirname, 'uploads/products');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
        if (imageFiles.length > 0) {
          imagePath = path.join(uploadsDir, imageFiles[0]);
        }
      }
    }
    
    if (!imagePath) {
      console.log('⚠️  No image file found in uploads/products/');
      console.log('💡 Please place a real image file (jpg/png) in uploads/products/ folder');
      console.log('   Or test via admin panel upload feature\n');
      return;
    }
    
    console.log('📁 Using image:', imagePath);
    console.log('📤 Uploading to Cloudinary...\n');
    
    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'maharani-store/test',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    
    console.log('✅ Upload Successful!\n');
    console.log('📋 Upload Details:');
    console.log('   Public ID:', result.public_id);
    console.log('   Secure URL:', result.secure_url);
    console.log('   Format:', result.format);
    console.log('   Width:', result.width);
    console.log('   Height:', result.height);
    console.log('   Size:', (result.bytes / 1024).toFixed(2), 'KB');
    console.log('\n🌐 Image URL:', result.secure_url);
    console.log('\n✅ Cloudinary upload is working correctly!');
    console.log('💡 You can now use this URL in your app');
    
    // Clean up - delete test image
    console.log('\n🧹 Cleaning up test image...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test image deleted from Cloudinary');
    
  } catch (error) {
    console.error('❌ Upload Error:', error.message);
    if (error.http_code) {
      console.error('   HTTP Code:', error.http_code);
    }
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check CLOUDINARY_URL in .env file');
    console.error('   2. Verify Cloudinary credentials are correct');
    console.error('   3. Make sure image file is a valid image format');
  }
}

testDirectCloudinaryUpload();

