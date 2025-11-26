import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

// Cart reducer for state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        };
      } else {
        // Add new item to cart
        const newItem = { ...action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        };
      }
    
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item._id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item._id === action.payload.id
          ? { ...item, quantity: Math.max(0, Math.min(action.payload.quantity, item.stock)) }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    
    case 'CLEAR_CART':
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

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from AsyncStorage on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever items change
  useEffect(() => {
    saveCart();
  }, [state.items]);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const items = JSON.parse(cartData);
        dispatch({ type: 'LOAD_CART', payload: items });
      } else {
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  const getCartItem = (productId) => {
    return state.items.find(item => item._id === productId);
  };

  const getCartQuantity = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Calculate totals
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal >= 500 ? 0 : 30; // Free delivery above ₹500
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + deliveryCharge + tax;

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
    getCartQuantity,
    subtotal,
    deliveryCharge,
    tax,
    total,
    totalAmount: total, // For backward compatibility
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
