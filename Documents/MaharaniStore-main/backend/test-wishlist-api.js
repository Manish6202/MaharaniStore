const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function testWishlistAPI() {
  console.log('🧪 Testing Wishlist API...\n');

  try {
    // Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get Wishlist collection
    const Wishlist = mongoose.connection.db.collection('wishlists');
    const Product = mongoose.connection.db.collection('products');

    // Check wishlists in database
    console.log('2️⃣ Checking wishlists in MongoDB...');
    const allWishlists = await Wishlist.find({}).toArray();
    console.log(`✅ Found ${allWishlists.length} wishlists in database\n`);

    if (allWishlists.length > 0) {
      console.log('📋 Wishlist Details:');
      allWishlists.forEach((wishlist, index) => {
        console.log(`\n   Wishlist ${index + 1}:`);
        console.log(`      _id: ${wishlist._id}`);
        console.log(`      user: ${wishlist.user}`);
        console.log(`      items: ${wishlist.items?.length || 0}`);
        if (wishlist.items && wishlist.items.length > 0) {
          console.log(`      Product IDs: ${wishlist.items.map(i => i.product || i).join(', ')}`);
        }
      });
    }

    // Test API with auth token
    console.log('\n3️⃣ Testing API endpoints...');
    const authToken = process.argv[2];
    
    if (!authToken) {
      console.log('⚠️ Please provide an auth token:');
      console.log('   node test-wishlist-api.js <auth_token>');
      console.log('\nTo get auth token:');
      console.log('   1. Login in mobile app');
      console.log('   2. Check AsyncStorage or backend logs for token\n');
      
      // Still show database info
      await mongoose.disconnect();
      return;
    }

    // Test Get Wishlist
    console.log('\n4️⃣ Testing GET /api/wishlist...');
    try {
      const wishlistResponse = await axios.get(
        `${BASE_URL}/wishlist`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (wishlistResponse.data.success) {
        const wishlist = wishlistResponse.data.data || {};
        const items = wishlist.items || [];
        console.log(`✅ Wishlist retrieved successfully!`);
        console.log(`   Items: ${items.length}`);
        
        if (items.length > 0) {
          console.log('\n📦 Wishlist Items:');
          items.forEach((item, index) => {
            const product = item.product || item;
            console.log(`   ${index + 1}. ${product.name || 'Product'} - ₹${product.price || 0}`);
          });
        } else {
          console.log('   Wishlist is empty');
        }
      } else {
        console.error('❌ Failed to get wishlist:', wishlistResponse.data.message);
      }
    } catch (error) {
      console.error('❌ Get wishlist API error:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      
      if (error.response?.data) {
        console.error('\n📋 Full error response:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test Add to Wishlist (if products available)
    console.log('\n5️⃣ Testing POST /api/wishlist...');
    try {
      // Get a product ID from database
      const products = await Product.find({}).limit(1).toArray();
      if (products.length > 0) {
        const productId = products[0]._id.toString();
        console.log(`   Testing with product ID: ${productId}`);
        
        const addResponse = await axios.post(
          `${BASE_URL}/wishlist`,
          { productId },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (addResponse.data.success) {
          console.log('✅ Product added to wishlist successfully!');
        } else {
          console.error('❌ Failed to add to wishlist:', addResponse.data.message);
        }
      } else {
        console.log('⚠️ No products found in database to test add functionality');
      }
    } catch (error) {
      console.error('❌ Add to wishlist API error:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
    }

    // Test Remove from Wishlist
    console.log('\n6️⃣ Testing DELETE /api/wishlist/:productId...');
    try {
      // Get wishlist first to find a product ID
      const wishlistResponse = await axios.get(
        `${BASE_URL}/wishlist`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (wishlistResponse.data.success) {
        const wishlist = wishlistResponse.data.data || {};
        const items = wishlist.items || [];
        
        if (items.length > 0) {
          const productId = items[0].product?._id || items[0].product || items[0]._id;
          console.log(`   Testing with product ID: ${productId}`);
          
          const removeResponse = await axios.delete(
            `${BASE_URL}/wishlist/${productId}`,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (removeResponse.data.success) {
            console.log('✅ Product removed from wishlist successfully!');
          } else {
            console.error('❌ Failed to remove from wishlist:', removeResponse.data.message);
          }
        } else {
          console.log('⚠️ Wishlist is empty, cannot test remove functionality');
        }
      }
    } catch (error) {
      console.error('❌ Remove from wishlist API error:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
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
testWishlistAPI();

