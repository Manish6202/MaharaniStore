// Using native fetch (Node.js 18+)

const BASE_URL = 'http://localhost:5001/api';

// Test reverse geocode (public endpoint)
async function testReverseGeocode() {
  console.log('\n📍 Testing Reverse Geocode API...');
  
  // Test with Bengaluru coordinates
  const testData = {
    latitude: 12.9716,
    longitude: 77.5946
  };

  try {
    const response = await fetch(`${BASE_URL}/location/reverse-geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Reverse Geocode SUCCESS');
      console.log('Location:', result.data.location);
      console.log('City:', result.data.city);
      console.log('State:', result.data.state);
      console.log('Pincode:', result.data.pincode);
    } else {
      console.log('❌ Reverse Geocode FAILED');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.log('❌ Reverse Geocode ERROR:', error.message);
  }
}

// Test get user location (requires auth)
async function testGetUserLocation() {
  console.log('\n📍 Testing Get User Location API...');
  
  // You need to provide a valid token here
  const token = process.env.TEST_TOKEN || '';

  if (!token) {
    console.log('⚠️  Skipping - No token provided. Set TEST_TOKEN env variable.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/location/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Get User Location SUCCESS');
      console.log('Location:', result.data.location);
      console.log('City:', result.data.city);
      console.log('State:', result.data.state);
    } else {
      console.log('❌ Get User Location FAILED');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.log('❌ Get User Location ERROR:', error.message);
  }
}

// Test update user location (requires auth)
async function testUpdateUserLocation() {
  console.log('\n📍 Testing Update User Location API...');
  
  // You need to provide a valid token here
  const token = process.env.TEST_TOKEN || '';

  if (!token) {
    console.log('⚠️  Skipping - No token provided. Set TEST_TOKEN env variable.');
    return;
  }

  const testData = {
    latitude: 12.9716,
    longitude: 77.5946,
    location: 'Jayanagar, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560011'
  };

  try {
    const response = await fetch(`${BASE_URL}/location/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Update User Location SUCCESS');
      console.log('Location:', result.data.location);
      console.log('City:', result.data.city);
      console.log('State:', result.data.state);
    } else {
      console.log('❌ Update User Location FAILED');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.log('❌ Update User Location ERROR:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing Location APIs...\n');
  
  await testReverseGeocode();
  await testGetUserLocation();
  await testUpdateUserLocation();
  
  console.log('\n✅ Location API tests completed!');
}

runTests().catch(console.error);

