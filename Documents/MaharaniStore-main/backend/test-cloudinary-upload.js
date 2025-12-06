const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Test Cloudinary upload via Product API
async function testCloudinaryUpload() {
  try {
    console.log('🧪 Testing Cloudinary Upload...\n');

    // Check if test image exists - use real product image
    let testImagePath = path.join(__dirname, 'uploads/products/product-1757715532801-225637884.jpg');
    if (!fs.existsSync(testImagePath)) {
      // Try test-image.jpg as fallback
      testImagePath = path.join(__dirname, 'test-image.jpg');
      if (!fs.existsSync(testImagePath)) {
        console.error('❌ Test image not found!');
        return;
      }
    }

    console.log('✅ Test image found:', testImagePath);
    console.log('📤 Preparing upload...\n');

    // Create form data
    const formData = new FormData();
    
    // Add product data
    formData.append('name', 'Test Product - Cloudinary Upload');
    formData.append('description', 'Testing Cloudinary image upload');
    formData.append('price', '99.99');
    formData.append('stock', '10');
    formData.append('mainCategory', 'Grocery');
    formData.append('subcategory', 'Ration & Essentials');
    formData.append('unit', 'piece');
    formData.append('brand', 'Test Brand');
    formData.append('isActive', 'true');
    
    // Add image file
    formData.append('images', fs.createReadStream(testImagePath));

    // Get admin token (you may need to login first)
    // For testing, you can use a token from your admin login
    const adminToken = process.env.ADMIN_TOKEN || '';
    
    if (!adminToken) {
      console.log('⚠️  No admin token found. Please login first and set ADMIN_TOKEN in .env');
      console.log('   Or you can manually get token from admin login API\n');
      
      // Try to login first
      try {
        console.log('🔐 Attempting admin login...');
        const loginResponse = await axios.post('http://localhost:5001/api/admin/login', {
          username: 'admin123',
          password: 'admin123'
        });

        if (loginResponse.data.success && loginResponse.data.data.token) {
          const token = loginResponse.data.data.token;
          console.log('✅ Login successful!\n');
          
          // Now try upload with this token
          console.log('📤 Uploading image to Cloudinary...\n');
          const uploadResponse = await axios.post('http://localhost:5001/api/products', formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              ...formData.getHeaders()
            }
          });

          const result = uploadResponse.data;
            
          console.log('📥 Response Status:', uploadResponse.status);
          console.log('📥 Response Data:', JSON.stringify(result, null, 2));
          
          if (result.success && result.data) {
            console.log('\n✅ Upload Successful!');
            console.log('\n📦 Product Details:');
            console.log('   Name:', result.data.name);
            console.log('   ID:', result.data._id);
            
            if (result.data.images && result.data.images.length > 0) {
              console.log('\n🖼️  Image URLs:');
              result.data.images.forEach((img, index) => {
                console.log(`   Image ${index + 1}:`, img);
                
                // Check if it's a Cloudinary URL
                if (img.includes('cloudinary.com')) {
                  console.log('   ✅ Cloudinary URL detected!');
                  console.log('   ✅ Upload to Cloudinary successful!');
                } else if (img.startsWith('/uploads/')) {
                  console.log('   ⚠️  Local file path (not Cloudinary)');
                } else {
                  console.log('   ❓ Unknown URL format');
                }
              });
            }
          } else {
            console.log('\n❌ Upload failed:', result.message || 'Unknown error');
          }
        } else {
          console.log('❌ Login failed:', loginResponse.data.message);
        }
      } catch (loginError) {
        console.log('❌ Login request failed');
        console.log('Error:', loginError.response?.data || loginError.message);
      }
    } else {
      // Use provided token
      console.log('📤 Uploading image with provided token...\n');
      const uploadResponse = await axios.post('http://localhost:5001/api/products', formData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          ...formData.getHeaders()
        }
      });

      const result = uploadResponse.data;
      console.log('📥 Response:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data.images) {
        result.data.images.forEach((img, index) => {
          console.log(`\n🖼️  Image ${index + 1}:`, img);
          if (img.includes('cloudinary.com')) {
            console.log('   ✅ Cloudinary URL detected!');
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
console.log('🚀 Starting Cloudinary Upload Test...\n');
console.log('📍 API Endpoint: http://localhost:5001/api/products');
console.log('📁 Test Image: test-image.jpg\n');
console.log('⚠️  Make sure backend server is running on port 5001\n');

testCloudinaryUpload();

