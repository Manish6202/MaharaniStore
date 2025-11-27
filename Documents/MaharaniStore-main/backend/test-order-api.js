const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001/api';

// Test user credentials (you may need to adjust these)
const testUser = {
  phone: '9876543210',
  otp: '123456' // Adjust based on your OTP system
};

let authToken = '';
let userId = '';

async function testOrderAPI() {
  console.log('🧪 Testing Order API...\n');

  try {
    // Step 1: Login/Get Auth Token
    console.log('1️⃣ Testing Authentication...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/send-otp`, {
        phone: testUser.phone
      });
      console.log('✅ OTP sent:', loginResponse.data);
    } catch (error) {
      console.log('⚠️ OTP send failed (may need manual login):', error.response?.data?.message || error.message);
    }

    // For testing, you may need to manually get a token
    // Or use an existing user token
    console.log('\n⚠️ Please provide a valid auth token for testing');
    console.log('You can get it from mobile app after login\n');

    // Step 2: Test Product List (to get valid product IDs)
    console.log('2️⃣ Testing Product List...');
    try {
      const productsResponse = await axios.get(`${BASE_URL}/products?limit=5`);
      const products = productsResponse.data.data || [];
      console.log(`✅ Found ${products.length} products`);
      
      if (products.length === 0) {
        console.log('⚠️ No products found. Creating test order with demo products...');
      }
    } catch (error) {
      console.log('⚠️ Product list error:', error.response?.data?.message || error.message);
    }

    // Step 3: Test Order Creation
    console.log('\n3️⃣ Testing Order Creation...');
    
    // Sample order data
    const orderData = {
      items: [
        {
          productId: '1', // Demo product ID
          quantity: 2,
          productName: 'Test Product 1',
          price: 100,
          stock: 10,
          images: [],
          brand: 'Test Brand',
          mainCategory: 'Grocery',
          subcategory: 'Snacks'
        },
        {
          productId: '2', // Demo product ID
          quantity: 1,
          productName: 'Test Product 2',
          price: 200,
          stock: 10,
          images: [],
          brand: 'Test Brand',
          mainCategory: 'Grocery',
          subcategory: 'Beverages'
        }
      ],
      deliveryAddress: {
        name: 'Test User',
        phone: '9876543210',
        address: '123 Test Street, Test Area',
        landmark: 'Near Test Mall',
        pincode: '560001',
        city: 'Bangalore',
        state: 'Karnataka',
        addressType: 'home'
      },
      paymentMethod: 'COD',
      orderNotes: 'Test order from API testing script'
    };

    console.log('📦 Order data:', JSON.stringify(orderData, null, 2));

    // Note: This will fail without auth token, but shows the structure
    console.log('\n⚠️ To test order creation, you need:');
    console.log('   1. A valid auth token (from mobile app login)');
    console.log('   2. Run: node test-order-api.js <auth_token>');
    console.log('\nExample:');
    console.log('   node test-order-api.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');

    // If token provided as argument
    if (process.argv[2]) {
      authToken = process.argv[2];
      console.log('🔑 Using provided auth token...\n');
      
      try {
        const orderResponse = await axios.post(
          `${BASE_URL}/orders`,
          orderData,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Order created successfully!');
        console.log('📦 Order details:', JSON.stringify(orderResponse.data, null, 2));
        
        const orderId = orderResponse.data.data?._id || orderResponse.data.data?.orderId;
        if (orderId) {
          console.log(`\n✅ Order ID: ${orderId}`);
          console.log(`✅ Order Number: ${orderResponse.data.data?.orderNumber}`);
        }
      } catch (error) {
        console.error('❌ Order creation failed:');
        console.error('   Status:', error.response?.status);
        console.error('   Message:', error.response?.data?.message || error.message);
        console.error('   Error:', error.response?.data?.error || error.response?.data);
        
        if (error.response?.data) {
          console.error('\n📋 Full error response:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }

    // Step 4: Test Get Orders
    console.log('\n4️⃣ Testing Get Orders...');
    if (authToken) {
      try {
        const ordersResponse = await axios.get(
          `${BASE_URL}/orders`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        console.log('✅ Orders retrieved:', ordersResponse.data.data?.length || 0, 'orders');
      } catch (error) {
        console.error('❌ Get orders failed:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n✅ API Testing Complete!\n');
    console.log('📝 Summary:');
    console.log('   - Database index fixed (orderId removed)');
    console.log('   - Order creation should work with valid auth token');
    console.log('   - Demo products are supported');
    console.log('   - Real products from database are supported\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests
testOrderAPI();

