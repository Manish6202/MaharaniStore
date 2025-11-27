const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001/api';

async function testOrderDetailsAPI() {
  console.log('🧪 Testing Order Details API...\n');

  try {
    // Step 1: Get a list of orders to find an order ID
    console.log('1️⃣ Getting orders list...');
    
    // You need to provide a valid auth token
    const authToken = process.argv[2];
    
    if (!authToken) {
      console.log('⚠️ Please provide an auth token:');
      console.log('   node test-order-details-api.js <auth_token>');
      console.log('\nTo get auth token:');
      console.log('   1. Login in mobile app');
      console.log('   2. Check AsyncStorage or backend logs for token\n');
      return;
    }

    try {
      // Get user orders
      const ordersResponse = await axios.get(
        `${BASE_URL}/orders/user`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const orders = ordersResponse.data.data || [];
      console.log(`✅ Found ${orders.length} orders`);

      if (orders.length === 0) {
        console.log('⚠️ No orders found. Please create an order first.\n');
        return;
      }

      // Get first order ID
      const firstOrder = orders[0];
      const orderId = firstOrder._id || firstOrder.id;
      console.log(`\n📦 Testing with order ID: ${orderId}`);
      console.log(`   Order Number: ${firstOrder.orderNumber || 'N/A'}`);

      // Step 2: Test Get Order By ID
      console.log('\n2️⃣ Testing GET /api/orders/user/:id...');
      
      const orderDetailsResponse = await axios.get(
        `${BASE_URL}/orders/user/${orderId}`,
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
        console.log(`\n📋 Order Details:`);
        console.log(`   Order Number: ${order.orderNumber || 'N/A'}`);
        console.log(`   Status: ${order.orderStatus || order.status || 'N/A'}`);
        console.log(`   Total Amount: ₹${order.totalAmount || 0}`);
        console.log(`   Items: ${order.items?.length || 0}`);
        console.log(`   User: ${order.user?.name || 'N/A'}`);
        console.log(`   Address: ${order.deliveryAddress?.address || 'N/A'}`);
        
        if (order.items && order.items.length > 0) {
          console.log(`\n📦 Order Items:`);
          order.items.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.product?.name || 'Product'} x${item.quantity} = ₹${item.total || 0}`);
          });
        }
      } else {
        console.error('❌ Failed to get order details:', orderDetailsResponse.data.message);
      }

    } catch (error) {
      console.error('❌ API Error:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      
      if (error.response?.data) {
        console.error('\n📋 Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.response?.status === 401) {
        console.error('\n⚠️ Authentication failed. Please check your auth token.');
      } else if (error.response?.status === 404) {
        console.error('\n⚠️ Order not found. Please check the order ID.');
      } else if (error.response?.status === 403) {
        console.error('\n⚠️ Access denied. This order does not belong to you.');
      }
    }

    console.log('\n✅ API Testing Complete!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests
testOrderDetailsAPI();

