const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function testOrdersAPI() {
  console.log('🧪 Testing Orders API and MongoDB...\n');

  try {
    // Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get Order model
    const Order = mongoose.connection.db.collection('orders');

    // Check all orders in database
    console.log('2️⃣ Checking all orders in MongoDB...');
    const allOrders = await Order.find({}).toArray();
    console.log(`✅ Found ${allOrders.length} total orders in database\n`);

    if (allOrders.length > 0) {
      console.log('📋 Order Details:');
      allOrders.forEach((order, index) => {
        console.log(`\n   Order ${index + 1}:`);
        console.log(`      _id: ${order._id}`);
        console.log(`      orderNumber: ${order.orderNumber || 'N/A'}`);
        console.log(`      user: ${order.user}`);
        console.log(`      orderStatus: ${order.orderStatus || 'N/A'}`);
        console.log(`      totalAmount: ₹${order.totalAmount || 0}`);
        console.log(`      items: ${order.items?.length || 0}`);
        console.log(`      createdAt: ${order.createdAt || 'N/A'}`);
      });
    }

    // Test API with auth token
    console.log('\n3️⃣ Testing API endpoints...');
    const authToken = process.argv[2];
    
    if (!authToken) {
      console.log('⚠️ Please provide an auth token:');
      console.log('   node test-orders-api.js <auth_token>');
      console.log('\nTo get auth token:');
      console.log('   1. Login in mobile app');
      console.log('   2. Check AsyncStorage or backend logs for token\n');
      
      // Still show database info
      await mongoose.disconnect();
      return;
    }

    // Test Get User Orders
    console.log('\n4️⃣ Testing GET /api/orders/user...');
    try {
      const ordersResponse = await axios.get(
        `${BASE_URL}/orders/user`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data || [];
        console.log(`✅ API returned ${orders.length} orders`);
        
        if (orders.length > 0) {
          console.log('\n📋 API Orders:');
          orders.forEach((order, index) => {
            console.log(`\n   Order ${index + 1}:`);
            console.log(`      _id: ${order._id}`);
            console.log(`      orderNumber: ${order.orderNumber || 'N/A'}`);
            console.log(`      orderStatus: ${order.orderStatus || 'N/A'}`);
            console.log(`      totalAmount: ₹${order.totalAmount || 0}`);
            console.log(`      items: ${order.items?.length || 0}`);
          });

          // Test Get Order By ID
          console.log('\n5️⃣ Testing GET /api/orders/user/:id...');
          const firstOrderId = orders[0]._id;
          console.log(`   Testing with order ID: ${firstOrderId}`);
          
          try {
            const orderDetailsResponse = await axios.get(
              `${BASE_URL}/orders/user/${firstOrderId}`,
              {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (orderDetailsResponse.data.success) {
              console.log('✅ Order details retrieved successfully!');
              const order = orderDetailsResponse.data.data;
              console.log(`   Order Number: ${order.orderNumber}`);
              console.log(`   Status: ${order.orderStatus}`);
              console.log(`   Total: ₹${order.totalAmount}`);
            } else {
              console.error('❌ Failed to get order details:', orderDetailsResponse.data.message);
            }
          } catch (error) {
            console.error('❌ Order details API error:');
            console.error('   Status:', error.response?.status);
            console.error('   Message:', error.response?.data?.message || error.message);
          }
        } else {
          console.log('⚠️ No orders returned from API, but database has orders');
          console.log('   This might indicate a user ID mismatch issue');
        }
      } else {
        console.error('❌ API returned error:', ordersResponse.data.message);
      }
    } catch (error) {
      console.error('❌ Get orders API error:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      
      if (error.response?.data) {
        console.error('\n📋 Full error response:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Compare database vs API
    console.log('\n6️⃣ Comparing Database vs API...');
    if (allOrders.length > 0 && authToken) {
      try {
        const apiOrdersResponse = await axios.get(
          `${BASE_URL}/orders/user`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const apiOrders = apiOrdersResponse.data.data || [];
        console.log(`   Database orders: ${allOrders.length}`);
        console.log(`   API orders: ${apiOrders.length}`);
        
        if (allOrders.length !== apiOrders.length) {
          console.log('⚠️ Mismatch detected!');
          console.log('   This might indicate:');
          console.log('   - User ID mismatch between token and orders');
          console.log('   - Orders belong to different users');
        }
      } catch (error) {
        // Already logged above
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Testing Complete!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

// Run tests
testOrdersAPI();

