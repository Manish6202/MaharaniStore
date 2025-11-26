/**
 * WISHLIST DATA ISSUE ANALYSIS SCRIPT
 * Analyzes why wishlist items show undefined data
 */

const testWishlistDataIssue = async () => {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 ANALYZING WISHLIST DATA ISSUE');
  console.log('=====================================');
  
  try {
    // Test 1: Check backend products
    console.log('📦 Test 1: Checking backend products...');
    const productsResponse = await fetch('http://localhost:5001/api/products');
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.data.length > 0) {
      const testProduct = productsData.data[0];
      console.log('✅ Backend product data:');
      console.log('   _id:', testProduct._id);
      console.log('   name:', testProduct.name);
      console.log('   price:', testProduct.price);
      console.log('   stock:', testProduct.stock);
      console.log('   unit:', testProduct.unit);
      console.log('   brand:', testProduct.brand);
      console.log('   mainCategory:', testProduct.mainCategory);
      console.log('   subcategory:', testProduct.subcategory);
      console.log('   images:', testProduct.images);
      console.log('   description:', testProduct.description);
      
      // Test 2: Simulate product detail screen data
      console.log('\n📱 Test 2: Simulating ProductDetailScreen data...');
      const productDetailData = {
        ...testProduct
      };
      
      console.log('✅ ProductDetailScreen product data:');
      console.log('   _id:', productDetailData._id);
      console.log('   name:', productDetailData.name);
      console.log('   price:', productDetailData.price);
      console.log('   stock:', productDetailData.stock);
      console.log('   unit:', productDetailData.unit);
      console.log('   brand:', productDetailData.brand);
      console.log('   mainCategory:', productDetailData.mainCategory);
      console.log('   subcategory:', productDetailData.subcategory);
      console.log('   images:', productDetailData.images);
      
      // Test 3: Simulate adding to wishlist
      console.log('\n💝 Test 3: Simulating addToWishlist...');
      const wishlistItem = {
        ...productDetailData,
        addedAt: new Date().toISOString()
      };
      
      console.log('✅ Wishlist item data (what gets stored):');
      console.log('   _id:', wishlistItem._id);
      console.log('   name:', wishlistItem.name);
      console.log('   price:', wishlistItem.price);
      console.log('   stock:', wishlistItem.stock);
      console.log('   unit:', wishlistItem.unit);
      console.log('   brand:', wishlistItem.brand);
      console.log('   mainCategory:', wishlistItem.mainCategory);
      console.log('   subcategory:', wishlistItem.subcategory);
      console.log('   images:', wishlistItem.images);
      console.log('   addedAt:', wishlistItem.addedAt);
      
      // Test 4: Test AsyncStorage simulation
      console.log('\n💾 Test 4: Simulating AsyncStorage storage...');
      const storageData = JSON.stringify([wishlistItem]);
      const parsedData = JSON.parse(storageData);
      
      console.log('✅ AsyncStorage stored data:');
      console.log('   Length:', parsedData.length);
      console.log('   First item keys:', Object.keys(parsedData[0]));
      console.log('   First item _id:', parsedData[0]._id);
      console.log('   First item name:', parsedData[0].name);
      console.log('   First item price:', parsedData[0].price);
      console.log('   First item stock:', parsedData[0].stock);
      console.log('   First item unit:', parsedData[0].unit);
      console.log('   First item brand:', parsedData[0].brand);
      console.log('   First item mainCategory:', parsedData[0].mainCategory);
      console.log('   First item subcategory:', parsedData[0].subcategory);
      console.log('   First item images:', parsedData[0].images);
      
      // Test 5: Test WishlistScreen rendering data
      console.log('\n🎨 Test 5: Testing WishlistScreen rendering data...');
      const renderItem = parsedData[0];
      
      console.log('✅ WishlistScreen render data:');
      console.log('   item.name:', renderItem.name);
      console.log('   item.price:', renderItem.price);
      console.log('   item.stock:', renderItem.stock);
      console.log('   item.unit:', renderItem.unit);
      console.log('   item.brand:', renderItem.brand);
      console.log('   item.mainCategory:', renderItem.mainCategory);
      console.log('   item.subcategory:', renderItem.subcategory);
      console.log('   item.images:', renderItem.images);
      console.log('   item.images?.[0]:', renderItem.images?.[0]);
      
      // Test 6: Test image URL generation
      console.log('\n🖼️ Test 6: Testing image URL generation...');
      if (renderItem.images && renderItem.images.length > 0) {
        const imageUrl = `http://localhost:5001/${renderItem.images[0]}`;
        console.log('✅ Image URL:', imageUrl);
        
        // Test image accessibility
        try {
          const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
          if (imgResponse.ok) {
            console.log('✅ Image is accessible');
          } else {
            console.log('⚠️ Image not accessible:', imgResponse.status);
          }
        } catch (error) {
          console.log('⚠️ Image test failed:', error.message);
        }
      } else {
        console.log('⚠️ No images available');
      }
      
      // Test 7: Check for undefined issues
      console.log('\n🚨 Test 7: Checking for undefined issues...');
      
      const issues = [];
      if (renderItem.name === undefined) issues.push('name is undefined');
      if (renderItem.price === undefined) issues.push('price is undefined');
      if (renderItem.stock === undefined) issues.push('stock is undefined');
      if (renderItem.unit === undefined) issues.push('unit is undefined');
      if (renderItem.brand === undefined) issues.push('brand is undefined');
      if (renderItem.mainCategory === undefined) issues.push('mainCategory is undefined');
      if (renderItem.subcategory === undefined) issues.push('subcategory is undefined');
      if (renderItem.images === undefined) issues.push('images is undefined');
      
      if (issues.length > 0) {
        console.log('❌ Issues found:');
        issues.forEach(issue => console.log('   -', issue));
      } else {
        console.log('✅ No undefined issues found');
      }
      
      // Test 8: Display simulation
      console.log('\n📱 Test 8: Display simulation...');
      console.log('WishlistScreen should display:');
      console.log(`   Name: "${renderItem.name}"`);
      console.log(`   Brand: "${renderItem.brand}"`);
      console.log(`   Category: "${renderItem.mainCategory} • ${renderItem.subcategory}"`);
      console.log(`   Price: "₹${renderItem.price}"`);
      console.log(`   Unit: "per ${renderItem.unit}"`);
      console.log(`   Stock: "${renderItem.stock === 0 ? 'Out of stock' : renderItem.stock < 5 ? `Only ${renderItem.stock} left` : `${renderItem.stock} available`}"`);
      console.log(`   Image: ${renderItem.images && renderItem.images.length > 0 ? 'Product image' : 'No image'}`);
      
    } else {
      console.log('❌ No products found in backend');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

// Run the test
testWishlistDataIssue();

module.exports = testWishlistDataIssue;
