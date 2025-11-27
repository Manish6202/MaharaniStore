import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get base URL
const getBaseURL = () => {
  return Platform.select({
    ios: 'http://localhost:5001',
    android: 'http://10.0.2.2:5001',
  });
};

// Check if backend is reachable
export const checkBackendConnection = async () => {
  try {
    const baseURL = getBaseURL();
    const url = `${baseURL}/api/products`;
    
    console.log('🔍 Checking backend connection:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });
    
    if (response.ok) {
      console.log('✅ Backend is reachable');
      return { success: true, message: 'Backend is reachable' };
    } else {
      console.warn('⚠️ Backend responded with error:', response.status);
      return { 
        success: false, 
        message: `Backend responded with status ${response.status}` 
      };
    }
  } catch (error) {
    console.error('❌ Backend connection check failed:', error);
    return { 
      success: false, 
      message: `Cannot reach backend server. Please ensure:\n1. Backend is running on port 5001\n2. Correct API URL configured\n3. Network connection is active` 
    };
  }
};

// Check if user is authenticated
export const checkAuthentication = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      return { 
        authenticated: false, 
        message: 'Please login to place an order' 
      };
    }
    return { authenticated: true, token };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { 
      authenticated: false, 
      message: 'Error checking authentication' 
    };
  }
};

