import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderAPI } from '../services/api';
import websocketService from '../services/websocket';

const OrderContext = createContext();

// Order reducer for state management
const orderReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_ORDERS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        totalOrders: state.totalOrders + 1,
      };
    
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order => 
          order._id === action.payload._id ? action.payload : order
        ),
      };
    
    case 'CANCEL_ORDER':
      return {
        ...state,
        orders: state.orders.map(order => 
          order._id === action.payload ? 
            { ...order, orderStatus: 'cancelled' } : order
        ),
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
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

const initialState = {
  orders: [],
  totalOrders: 0,
  loading: true,
  error: null,
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  useEffect(() => {
    loadOrders();
    
    // Connect WebSocket
    websocketService.connect();
    
    // Listen for order status updates
    const unsubscribeStatus = websocketService.on('order-status-updated', (data) => {
      console.log('📦 Order status updated via WebSocket:', data);
      // Refresh orders to get updated status
      loadOrders();
    });
    
    // Listen for new orders
    const unsubscribeCreated = websocketService.on('order-created', (data) => {
      console.log('📦 New order created via WebSocket:', data);
      // Refresh orders to include new order
      loadOrders();
    });
    
    return () => {
      unsubscribeStatus();
      unsubscribeCreated();
      websocketService.disconnect();
    };
  }, []);

  // Save orders to AsyncStorage whenever orders change
  useEffect(() => {
    saveOrders();
  }, [state.orders]);

  const loadOrders = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('⚠️ User not authenticated, using local orders only');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      console.log('📦 Fetching orders from API...');
      const result = await orderAPI.getUserOrders();
      console.log('📦 Orders API response:', result);
      
      if (result && result.success) {
        const orders = result.data || [];
        console.log(`✅ Loaded ${orders.length} orders from API`);
        
        // Normalize order data - ensure orderStatus field exists
        const normalizedOrders = orders.map(order => ({
          ...order,
          orderStatus: order.orderStatus || order.status || 'pending',
          status: order.status || order.orderStatus || 'pending'
        }));
        
        dispatch({ type: 'LOAD_ORDERS', payload: normalizedOrders });
      } else {
        const errorMsg = result?.message || 'Failed to load orders';
        console.error('❌ Orders API error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // If it's an authentication error, just use local storage
      if (error.message && (error.message.includes('Access denied') || error.message.includes('401'))) {
        console.log('⚠️ User not authenticated, using local orders only');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load orders' });
    }
  };

  const saveOrders = async () => {
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(state.orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  const createOrder = async (orderData) => {
    try {
      console.log('📦 Creating order:', orderData);
      
      // Check authentication
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No auth token found');
        throw new Error('Please login to place an order');
      }
      
      console.log('✅ Auth token found, proceeding with order creation');
      
      const result = await orderAPI.createOrder(orderData);
      
      console.log('📦 Order API response:', result);
      
      if (result.success) {
        dispatch({ type: 'ADD_ORDER', payload: result.data });
        console.log('✅ Order created successfully:', result.data.orderNumber);
        return { success: true, data: result.data };
      } else {
        const errorMsg = result.message || 'Failed to create order';
        console.error('❌ Order creation failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to create order' });
      
      // Return detailed error
      return { 
        success: false, 
        message: error.message || 'Failed to create order. Please check your connection and try again.' 
      };
    }
  };

  const updateOrder = async (orderId, updateData) => {
    try {
      console.log('📦 Updating order:', orderId, updateData);
      
      const result = await orderAPI.updateOrderStatus(orderId, updateData);
      if (result.success) {
        dispatch({ type: 'UPDATE_ORDER', payload: result.data });
        console.log('✅ Order updated successfully');
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update order' });
      return { success: false, message: error.message };
    }
  };

  const cancelOrder = async (orderId, reason = '') => {
    try {
      console.log('📦 Cancelling order:', orderId, reason);
      
      const result = await orderAPI.cancelOrder(orderId, reason);
      if (result.success) {
        dispatch({ type: 'CANCEL_ORDER', payload: orderId });
        console.log('✅ Order cancelled successfully');
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel order' });
      return { success: false, message: error.message };
    }
  };

  const getOrderById = (orderId) => {
    return state.orders.find(order => order._id === orderId);
  };

  const getOrdersByStatus = (status) => {
    // Map UI status filters to backend status values
    const statusMap = {
      'all': null, // Show all
      'processing': ['pending', 'confirmed', 'preparing'],
      'shipped': ['out_for_delivery'],
      'delivered': ['delivered'],
      'cancelled': ['cancelled']
    };
    
    if (status === 'all') {
      return state.orders;
    }
    
    const statusesToMatch = statusMap[status] || [status];
    
    return state.orders.filter(order => {
      const orderStatus = (order.orderStatus || order.status || '').toLowerCase();
      return statusesToMatch.some(s => s.toLowerCase() === orderStatus);
    });
  };

  const getRecentOrders = (limit = 5) => {
    return state.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  const value = {
    ...state,
    createOrder,
    updateOrder,
    cancelOrder,
    getOrderById,
    getOrdersByStatus,
    getRecentOrders,
    clearError,
    refreshOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
