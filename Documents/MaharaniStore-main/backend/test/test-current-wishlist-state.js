/**
 * CURRENT WISHLIST STATE TEST SCRIPT
 * Tests the current wishlist state and data flow
 */

const testCurrentWishlistState = async () => {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 TESTING CURRENT WISHLIST STATE');
  console.log('=====================================');
  
  try {
    // Test 1: Check what's in AsyncStorage (simulation)
    console.log('💾 Test 1: Checking AsyncStorage simulation...');
    
    // Get a product from backend
    const productsResponse = await fetch('http://localhost:5001/api/products');
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.data.length > 0) {
      const testProduct = productsData.data[0];
      console.log('✅ Product from backend:', testProduct.name);
      
      // Simulate what gets stored in AsyncStorage
      const wishlistItem = {
        ...testProduct,
        addedAt: new Date().toISOString()
      };
      
      const storageData = JSON.stringify([wishlistItem]);
      const parsedData = JSON.parse(storageData);
      
      console.log('✅ Simulated AsyncStorage data:');
      console.log('   Items count:', parsedData.length);
      console.log('   First item data:');
      console.log('     _id:', parsedData[0]._id);
      console.log('     name:', parsedData[0].name);
      console.log('     price:', parsedData[0].price);
      console.log('     stock:', parsedData[0].stock);
      console.log('     unit:', parsedData[0].unit);
      console.log('     brand:', parsedData[0].brand);
      console.log('     mainCategory:', parsedData[0].mainCategory);
      console.log('     subcategory:', parsedData[0].subcategory);
      console.log('     images:', parsedData[0].images);
      
      // Test 2: Simulate WishlistContext loadWishlist
      console.log('\n📱 Test 2: Simulating WishlistContext loadWishlist...');
      
      const loadedItems = parsedData;
      console.log('✅ Loaded items from AsyncStorage:');
      console.log('   Items count:', loadedItems.length);
      
      if (loadedItems.length > 0) {
        const item = loadedItems[0];
        console.log('   First item details:');
        console.log('     _id:', item._id);
        console.log('     name:', item.name);
        console.log('     price:', item.price);
        console.log('     stock:', item.stock);
        console.log('     unit:', item.unit);
        console.log('     brand:', item.brand);
        console.log('     mainCategory:', item.mainCategory);
        console.log('     subcategory:', item.subcategory);
        console.log('     images:', item.images);
        
        // Test 3: Simulate WishlistScreen rendering
        console.log('\n🎨 Test 3: Simulating WishlistScreen rendering...');
        
        console.log('✅ WishlistScreen should render:');
        console.log('   Header: "My Wishlist - 1 item"');
        console.log('   Product card with:');
        console.log('     Name:', item.name);
        console.log('     Brand:', item.brand);
        console.log('     Category:', `${item.mainCategory} • ${item.subcategory}`);
        console.log('     Price:', `₹${item.price}`);
        console.log('     Unit:', `per ${item.unit}`);
        console.log('     Stock:', item.stock === 0 ? 'Out of stock' : 
                   item.stock < 5 ? `Only ${item.stock} left` : 
                   `${item.stock} available`);
        console.log('     Image:', item.images && item.images.length > 0 ? 'Product image' : 'No image');
        
        // Test 4: Check for potential issues
        console.log('\n🚨 Test 4: Checking for potential issues...');
        
        const issues = [];
        if (item.name === undefined) issues.push('name is undefined');
        if (item.price === undefined) issues.push('price is undefined');
        if (item.stock === undefined) issues.push('stock is undefined');
        if (item.unit === undefined) issues.push('unit is undefined');
        if (item.brand === undefined) issues.push('brand is undefined');
        if (item.mainCategory === undefined) issues.push('mainCategory is undefined');
        if (item.subcategory === undefined) issues.push('subcategory is undefined');
        if (item.images === undefined) issues.push('images is undefined');
        
        if (issues.length > 0) {
          console.log('❌ Issues found:');
          issues.forEach(issue => console.log('   -', issue));
        } else {
          console.log('✅ No issues found - data should display correctly');
        }
        
        // Test 5: Image URL test
        console.log('\n🖼️ Test 5: Testing image URL...');
        if (item.images && item.images.length > 0) {
          const imageUrl = `http://localhost:5001/${item.images[0]}`;
          console.log('✅ Image URL:', imageUrl);
          
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
        
      } else {
        console.log('❌ No items in wishlist');
      }
      
    } else {
      console.log('❌ No products found in backend');
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    console.log('If wishlist shows "undefined", the issue is likely:');
    console.log('1. Product data not being passed correctly from ProductDetailScreen');
    console.log('2. WishlistContext not storing data correctly');
    console.log('3. AsyncStorage corruption');
    console.log('4. WishlistScreen not receiving correct data');
    
    console.log('\n🔧 SOLUTION:');
    console.log('1. Check console logs when adding to wishlist');
    console.log('2. Check console logs when rendering wishlist items');
    console.log('3. Verify product data in ProductDetailScreen');
    console.log('4. Check AsyncStorage data');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

// Run the test
testCurrentWishlistState();

module.exports = testCurrentWishlistState;
