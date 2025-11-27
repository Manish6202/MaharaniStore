import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wishlistAPI } from '../services/api';

const WishlistContext = createContext();

// Wishlist reducer for state management
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    
          case 'ADD_TO_WISHLIST':
            console.log('🔄 ADD_TO_WISHLIST reducer called with:', action.payload);
            const existingItem = state.items.find(item => item._id === action.payload._id);
            
            if (!existingItem) {
              const newItem = { ...action.payload, addedAt: new Date().toISOString() };
              console.log('✅ New wishlist item created:', newItem);
              return {
                ...state,
                items: [...state.items, newItem],
                totalItems: state.items.length + 1,
              };
            }
            console.log('⚠️ Item already exists in wishlist');
            return state;
    
    case 'REMOVE_FROM_WISHLIST':
      const filteredItems = state.items.filter(item => item._id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.length,
      };
    
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        totalItems: 0,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  loading: false,
  error: null,
};

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from AsyncStorage on app start
  useEffect(() => {
    loadWishlist();
  }, []);

  // Save wishlist to AsyncStorage whenever items change
  useEffect(() => {
    saveWishlist();
  }, [state.items]);

  const loadWishlist = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const wishlistData = await AsyncStorage.getItem('wishlist');
      if (wishlistData) {
        const items = JSON.parse(wishlistData);
        dispatch({ type: 'LOAD_WISHLIST', payload: items });
      } else {
        dispatch({ type: 'LOAD_WISHLIST', payload: [] });
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
    }
  };

  const saveWishlist = async () => {
    try {
      await AsyncStorage.setItem('wishlist', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

  const addToWishlist = async (product) => {
    try {
      console.log('💝 Adding product to wishlist:', {
        _id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        unit: product.unit,
        brand: product.brand,
        mainCategory: product.mainCategory,
        subcategory: product.subcategory,
        images: product.images
      });
      
      // Check if product is already in wishlist
      if (isInWishlist(product._id)) {
        console.log('⚠️ Product already in wishlist, skipping add');
        return { success: false, message: 'Product already in wishlist' };
      }
      
      // Add to local state immediately for better UX
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
      
      // Try to sync with backend if user is authenticated
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          await wishlistAPI.addToWishlist(product._id);
          console.log('✅ Product added to wishlist on backend');
          return { success: true, message: 'Product added to wishlist' };
        } catch (error) {
          console.log('⚠️ Backend sync failed, saved locally:', error.message);
          return { success: true, message: 'Product added locally' };
        }
      } else {
        console.log('User not authenticated, saved locally only');
        return { success: true, message: 'Product added locally' };
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to wishlist' });
      return { success: false, message: 'Failed to add to wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      console.log('🗑️ Removing product from wishlist:', productId);
      
      // Remove from local state immediately
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
      
      // Try to sync with backend if user is authenticated
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          await wishlistAPI.removeFromWishlist(productId);
          console.log('✅ Product removed from wishlist on backend');
          return { success: true, message: 'Product removed from wishlist' };
        } catch (error) {
          console.log('⚠️ Backend sync failed, removed locally:', error.message);
          return { success: true, message: 'Product removed locally' };
        }
      } else {
        console.log('User not authenticated, removed locally only');
        return { success: true, message: 'Product removed locally' };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove from wishlist' });
      return { success: false, message: 'Failed to remove from wishlist' };
    }
  };

  const clearWishlist = async () => {
    try {
      dispatch({ type: 'CLEAR_WISHLIST' });
      
      // Try to sync with backend
      try {
        await wishlistAPI.clearWishlist();
        console.log('✅ Wishlist cleared on backend');
      } catch (error) {
        console.log('⚠️ Backend sync failed, cleared locally:', error.message);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear wishlist' });
    }
  };

  const isInWishlist = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  const getWishlistItem = (productId) => {
    return state.items.find(item => item._id === productId);
  };

  const syncWithBackend = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('User not authenticated, using local wishlist only');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      const result = await wishlistAPI.getWishlist();
      console.log('📦 Wishlist API response:', result);
      
      if (result && result.success) {
        // Handle both 'items' and 'products' from backend
        const wishlistData = result.data || {};
        const items = wishlistData.items || wishlistData.products || [];
        
        // Extract product objects from items array
        const normalizedItems = items.map(item => {
          // If item has a nested product object, extract it
          if (item.product && typeof item.product === 'object') {
            return {
              ...item.product,
              _id: item.product._id || item.product,
              addedAt: item.addedAt || new Date().toISOString()
            };
          }
          // If item is already a product object
          return {
            ...item,
            _id: item._id || item.product,
            addedAt: item.addedAt || new Date().toISOString()
          };
        });
        
        console.log(`✅ Loaded ${normalizedItems.length} items from wishlist API`);
        dispatch({ type: 'LOAD_WISHLIST', payload: normalizedItems });
      } else {
        throw new Error(result?.message || 'Failed to get wishlist');
      }
    } catch (error) {
      console.error('Error syncing wishlist with backend:', error);
      
      // If it's an authentication error, just use local storage
      if (error.message && error.message.includes('Access denied')) {
        console.log('User not authenticated, using local wishlist only');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync wishlist' });
    }
  };

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItem,
    syncWithBackend,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
