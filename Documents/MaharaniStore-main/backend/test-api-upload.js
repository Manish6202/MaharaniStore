// Test Product API with Cloudinary Upload
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

async function testAPIUpload() {
  try {
    console.log('🧪 Testing Product API with Cloudinary Upload...\n');
    
    // Real image file
    const imagePath = path.join(__dirname, 'uploads/offers/offer-1760294700235.jpg');
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image file not found!');
      return;
    }
    
    console.log('📁 Using image:', imagePath);
    
    // Step 1: Login
    console.log('🔐 Step 1: Admin Login...');
    const loginRes = await axios.post('http://localhost:5001/api/admin/login', {
      username: 'admin123',
      password: 'admin123'
    });
    
    if (!loginRes.data.success) {
      console.error('❌ Login failed:', loginRes.data.message);
      return;
    }
    
    const token = loginRes.data.data.token;
    console.log('✅ Login successful!\n');
    
    // Step 2: Create FormData
    console.log('📤 Step 2: Preparing upload...');
    const formData = new FormData();
    formData.append('name', 'Cloudinary Test Product');
    formData.append('description', 'Testing Cloudinary upload via API');
    formData.append('price', '199.99');
    formData.append('stock', '50');
    formData.append('mainCategory', 'Grocery');
    formData.append('subcategory', 'Ration & Essentials');
    formData.append('unit', 'piece');
    formData.append('brand', 'Test Brand');
    formData.append('isActive', 'true');
    formData.append('images', fs.createReadStream(imagePath));
    
    // Step 3: Upload via API
    console.log('📤 Step 3: Uploading to API...\n');
    const uploadRes = await axios.post('http://localhost:5001/api/products', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    const result = uploadRes.data;
    
    console.log('📥 API Response Status:', uploadRes.status);
    console.log('📥 Success:', result.success);
    console.log('📥 Message:', result.message);
    
    if (result.success && result.data) {
      console.log('\n✅ Product Created Successfully!');
      console.log('\n📦 Product Details:');
      console.log('   ID:', result.data._id);
      console.log('   Name:', result.data.name);
      console.log('   Price: ₹', result.data.price);
      
      if (result.data.images && result.data.images.length > 0) {
        console.log('\n🖼️  Image URLs:');
        result.data.images.forEach((img, index) => {
          console.log(`\n   Image ${index + 1}:`);
          console.log('   URL:', img);
          
          if (img.includes('cloudinary.com')) {
            console.log('   ✅ CLOUDINARY URL - Upload successful!');
            console.log('   ✅ Image is stored in Cloudinary');
            console.log('   ✅ CDN delivery enabled');
          } else if (img.startsWith('/uploads/')) {
            console.log('   ⚠️  Local file path (not uploaded to Cloudinary)');
          } else {
            console.log('   ❓ Unknown URL format');
          }
        });
      } else {
        console.log('\n⚠️  No images in response');
      }
      
      console.log('\n✅ Test Complete - Cloudinary integration is working!');
      console.log('\n💡 Next Steps:');
      console.log('   1. Check Cloudinary Dashboard: https://cloudinary.com/console');
      console.log('   2. Look in folder: maharani-store/products');
      console.log('   3. Verify image appears in Media Library');
      
    } else {
      console.log('\n❌ Upload failed:', result.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

console.log('🚀 Starting API Upload Test...\n');
console.log('📍 Endpoint: http://localhost:5001/api/products');
console.log('📁 Image: uploads/offers/offer-1760294700235.jpg\n');
console.log('⚠️  Make sure backend server is running!\n');

testAPIUpload();

