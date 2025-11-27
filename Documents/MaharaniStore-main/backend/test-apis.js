/**
 * API Testing Script
 * Run this to test all order-related APIs
 * Usage: node test-apis.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test data
const testUserToken = 'YOUR_USER_TOKEN_HERE'; // Replace with actual token
const testAdminToken = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual token

async function testAPIs() {
  console.log('🧪 Starting API Tests...\n');

  // Test 1: Get Products
  try {
    console.log('1️⃣ Testing GET /api/products');
    const productsRes = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products API:', productsRes.data.count || 0, 'products found\n');
  } catch (error) {
    console.error('❌ Products API Error:', error.message, '\n');
  }

  // Test 2: Get User Orders (requires auth)
  try {
    console.log('2️⃣ Testing GET /api/orders/user');
    const ordersRes = await axios.get(`${BASE_URL}/orders/user`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    console.log('✅ User Orders API:', ordersRes.data.data?.length || 0, 'orders found\n');
  } catch (error) {
    console.error('❌ User Orders API Error:', error.response?.data?.message || error.message, '\n');
  }

  // Test 3: Create Order (requires auth)
  try {
    console.log('3️⃣ Testing POST /api/orders');
    const orderData = {
      items: [
        { productId: 'PRODUCT_ID_HERE', quantity: 1 }
      ],
      deliveryAddress: {
        name: 'Test User',
        phone: '9876543210',
        address: '123 Test Street',
        pincode: '123456',
        city: 'Test City',
        state: 'Test State'
      },
      paymentMethod: 'COD',
      orderNotes: 'Test order'
    };
    
    const createRes = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    console.log('✅ Create Order API: Order created:', createRes.data.data?.orderNumber, '\n');
  } catch (error) {
    console.error('❌ Create Order API Error:', error.response?.data?.message || error.message, '\n');
  }

  // Test 4: Get All Orders (Admin - requires admin token)
  try {
    console.log('4️⃣ Testing GET /api/orders (Admin)');
    const adminOrdersRes = await axios.get(`${BASE_URL}/orders?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${testAdminToken}` }
    });
    console.log('✅ Admin Orders API:', adminOrdersRes.data.data?.orders?.length || 0, 'orders found\n');
  } catch (error) {
    console.error('❌ Admin Orders API Error:', error.response?.data?.message || error.message, '\n');
  }

  console.log('✅ API Tests Complete!');
}

// Run tests
testAPIs().catch(console.error);

