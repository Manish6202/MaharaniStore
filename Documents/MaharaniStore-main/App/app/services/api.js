import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, DEV_API_BASE_URL } from '@env';

// Environment-driven base URL
// Production: https://maharanistore.onrender.com
// Development: Use DEV_API_BASE_URL from .env or fallback to localhost
const getBaseURL = () => {
  const baseUrl = __DEV__ 
    ? (DEV_API_BASE_URL || 'http://localhost:5001')
    : (API_BASE_URL || 'https://maharanistore.onrender.com');
  
  // Ensure URL ends with /api
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const BASE_URL = getBaseURL();

// API utility function
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log('🚀 API Call:', url, options);
    
    // Get auth token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...(options.body && { body: options.body }),
    };

    console.log('📤 Request Config:', {
      url,
      method: config.method,
      headers: config.headers,
      hasBody: !!config.body
    });

    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.warn('⚠️ Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }
    
    console.log('📥 API Response:', response.status, data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP Error: ${response.status}`;
      console.error('❌ API Error Response:', errorMessage);
      throw new Error(errorMessage);
    }

    return data;

  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Better error messages
    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error('Network connection failed. Please check:\n1. Backend server is running\n2. Internet connection is active\n3. Correct API URL configured');
    }
    
    throw new Error(error.message || 'Network error occurred. Please try again.');
  }
};

// Auth API functions
export const authAPI = {
  // Send OTP
  sendOTP: async (phone) => {
    console.log('📱 Sending OTP to:', phone);
    const result = await apiCall('/users/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    console.log('📱 OTP API result:', result);
    return result;
  },

  // Verify OTP
  verifyOTP: async (phone, otp) => {
    console.log('🔐 Verifying OTP:', otp, 'for phone:', phone);
    const result = await apiCall('/users/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    console.log('🔐 OTP verification result:', result);
    return result;
  },

  // Google Sign-In
  googleSignIn: async (googleData) => {
    console.log('🔐 Google Sign-In with data:', { ...googleData, idToken: '***' });
    const result = await apiCall('/users/google-signin', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
    console.log('🔐 Google Sign-In result:', result);
    return result;
  },

  // Get user profile
  getUserProfile: async (token) => {
    return await apiCall('/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Update user profile
  updateUserProfile: async (token, profileData) => {
    return await apiCall('/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  },
};

// Product API functions - Enhanced
export const productAPI = {
  // Get all products (basic)
  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiCall(`/products${queryString ? '?' + queryString : ''}`);
  },

  // Get all products with advanced features (pagination, filters, sorting)
  getAllProductsAdvanced: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiCall(`/products/advanced${queryString ? '?' + queryString : ''}`);
  },

  // Get single product
  getProductById: async (productId) => {
    return await apiCall(`/products/single/${productId}`);
  },

  // Search products
  searchProducts: async (searchQuery, params = {}) => {
    const searchParams = { search: searchQuery, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    return await apiCall(`/products/search?${queryString}`);
  },

  // Get categories with product counts
  getCategories: async () => {
    return await apiCall('/products/categories');
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiCall(`/products/${category}${queryString ? '?' + queryString : ''}`);
  },

  // Get products by subcategory
  getProductsBySubcategory: async (category, subcategory, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiCall(`/products/${category}/${subcategory}${queryString ? '?' + queryString : ''}`);
  },

  // Get product image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    // Use environment variable for image base URL
    const baseUrl = __DEV__ 
      ? (DEV_API_BASE_URL || 'http://localhost:5001')
      : (API_BASE_URL || 'https://maharanistore.onrender.com');
    
    const baseImageUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    return `${baseImageUrl}${imagePath}`;
  },
};

// Wishlist API functions
export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async () => {
    return await apiCall('/wishlist');
  },

  // Add product to wishlist
  addToWishlist: async (productId) => {
    return await apiCall('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    return await apiCall(`/wishlist/remove/${productId}`, {
      method: 'DELETE'
    });
  },

  // Check if product is in wishlist
  checkWishlistStatus: async (productId) => {
    return await apiCall(`/wishlist/check/${productId}`);
  },

  // Get wishlist count
  getWishlistCount: async () => {
    return await apiCall('/wishlist/count');
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    return await apiCall('/wishlist/clear', {
      method: 'DELETE'
    });
  },
};

// User Profile API functions
export const userProfileAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiCall('/user/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Get user statistics
  getStats: async () => {
    return await apiCall('/user/stats');
  },

  // Address Management
  getAddresses: async () => {
    return await apiCall('/user/addresses');
  },

  addAddress: async (addressData) => {
    return await apiCall('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  },

  updateAddress: async (addressId, addressData) => {
    return await apiCall(`/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  },

  deleteAddress: async (addressId) => {
    return await apiCall(`/user/addresses/${addressId}`, {
      method: 'DELETE'
    });
  },

  setDefaultAddress: async (addressId) => {
    return await apiCall(`/user/addresses/${addressId}/default`, {
      method: 'PATCH'
    });
  },
};

// Order API functions
export const orderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    console.log('📦 OrderAPI.createOrder called with:', JSON.stringify(orderData, null, 2));
    try {
      const result = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      console.log('✅ OrderAPI.createOrder success:', result);
      return result;
    } catch (error) {
      console.error('❌ OrderAPI.createOrder error:', error);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async (status = '') => {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    console.log('📦 Fetching user orders with query:', query);
    const result = await apiCall(`/orders/user${query}`);
    console.log('📦 User orders API response:', result);
    return result;
  },

  // Get single order
  getOrderById: async (orderId) => {
    return await apiCall(`/orders/user/${orderId}`);
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    return await apiCall(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },

  // Get all orders (Admin)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiCall(`/orders${queryString ? '?' + queryString : ''}`);
  },

  // Get dashboard orders (Admin)
  getDashboardOrders: async () => {
    return await apiCall('/orders/dashboard');
  },

  // Get order statistics (Admin)
  getOrderStats: async () => {
    return await apiCall('/orders/stats');
  },

  // Update order status (Admin)
  updateOrderStatus: async (orderId, statusData) => {
    return await apiCall(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  },
};

// Location API functions
export const locationAPI = {
  // Reverse geocode - Convert coordinates to address
  reverseGeocode: async (latitude, longitude) => {
    return await apiCall('/location/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  // Get user's current location
  getUserLocation: async (token) => {
    return await apiCall('/location/current', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Update user's current location
  updateUserLocation: async (token, locationData) => {
    return await apiCall('/location/update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(locationData),
    });
  },
};
