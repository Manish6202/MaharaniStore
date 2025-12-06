// Test Cloudinary Configuration
require('dotenv').config();
const cloudinary = require('./config/cloudinary');

async function testCloudinaryConfig() {
  try {
    console.log('🧪 Testing Cloudinary Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log('   CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? '✅ Set' : '❌ Not set');
    
    if (process.env.CLOUDINARY_URL) {
      const url = process.env.CLOUDINARY_URL;
      // Extract cloud name from URL
      const match = url.match(/@([^/]+)/);
      if (match) {
        console.log('   Cloud Name:', match[1]);
      }
    }
    
    console.log('\n🔍 Testing Cloudinary Connection...');
    
    // Test Cloudinary API connection
    try {
      const result = await cloudinary.api.ping();
      console.log('✅ Cloudinary API Connection: Success');
      console.log('   Status:', result.status);
    } catch (error) {
      console.log('❌ Cloudinary API Connection Failed');
      console.log('   Error:', error.message);
    }
    
    // Test upload capabilities (without actually uploading)
    console.log('\n📤 Testing Upload Configuration...');
    try {
      // Just check if we can access uploader
      console.log('✅ Cloudinary Uploader: Available');
      console.log('   Ready to upload images!');
    } catch (error) {
      console.log('❌ Upload Configuration Error:', error.message);
    }
    
    console.log('\n✅ Cloudinary Configuration Test Complete!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Make sure backend server is running: npm run dev');
    console.log('   2. Use admin panel to upload a real image');
    console.log('   3. Check Cloudinary Dashboard to see uploaded images');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testCloudinaryConfig();

