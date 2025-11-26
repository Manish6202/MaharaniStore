import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-specific base URL
const BASE_URL = Platform.select({
  ios: 'http://localhost:5001/api',
  android: 'http://10.0.2.2:5001/api',
});

// API utility function
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log('🚀 API Call:', url, options);
    
    // Get auth token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log('📥 API Response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error('❌ API Error:', error);
    throw new Error(error.message || 'Network error occurred');
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

    const baseImageUrl = Platform.select({
      ios: 'http://localhost:5001/',
      android: 'http://10.0.2.2:5001/',
    });

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
    return await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Get user's orders
  getUserOrders: async (status = '') => {
    const query = status ? `?status=${status}` : '';
    return await apiCall(`/orders/user${query}`);
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
