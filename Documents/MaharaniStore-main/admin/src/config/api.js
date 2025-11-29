// API Configuration for Admin Panel
// Fully environment-driven configuration
// Set REACT_APP_API_BASE_URL in .env file or Vercel environment variables

/**
 * Get API Base URL from environment variables
 * Priority:
 * 1. REACT_APP_API_BASE_URL (explicitly set)
 * 2. REACT_APP_DEV_API_BASE_URL (for development)
 * 3. Development: empty string (uses proxy from package.json)
 * 4. Production fallback: https://maharanistore.onrender.com
 */
const getApiBaseUrl = () => {
  // Explicit production API URL (highest priority)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Development API URL (if explicitly set)
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEV_API_BASE_URL) {
    return process.env.REACT_APP_DEV_API_BASE_URL;
  }
  
  // Development: Use proxy (empty string for relative paths)
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  
  // Production fallback (if no env variable set)
  return 'https://maharanistore.onrender.com';
};

/**
 * Get WebSocket Base URL from environment variables
 */
const getWebSocketBaseUrl = () => {
  // Explicit WebSocket URL (highest priority)
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }
  
  // Development WebSocket URL
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEV_WS_URL) {
    return process.env.REACT_APP_DEV_WS_URL;
  }
  
  // Use API base URL for WebSocket if available
  const apiUrl = getApiBaseUrl();
  if (apiUrl) {
    return apiUrl;
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  
  // Production fallback
  return 'https://maharanistore.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWebSocketBaseUrl();

/**
 * Helper function to get full API URL
 * @param {string} endpoint - API endpoint (e.g., '/api/products' or 'api/products')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If baseUrl is empty (development with proxy), return relative path
  if (!baseUrl) {
    return cleanEndpoint;
  }
  
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Ensure endpoint starts with /
  const finalEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
  
  return `${cleanBaseUrl}${finalEndpoint}`;
};

/**
 * Helper function for image URLs
 * @param {string} imagePath - Image path from backend
 * @returns {string|null} Full image URL or null
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const baseUrl = API_BASE_URL;
  
  // If no baseUrl (development), return relative path
  if (!baseUrl) {
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  }
  
  // Clean base URL
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Clean image path
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${cleanBaseUrl}/${cleanPath}`;
};

// Export for use in other files
export default {
  API_BASE_URL,
  WS_BASE_URL,
  getApiUrl,
  getImageUrl,
};

