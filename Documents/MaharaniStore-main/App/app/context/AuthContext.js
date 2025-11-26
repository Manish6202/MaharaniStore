import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Context
const AuthContext = createContext();

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token,
        loading: false,
      };
    case 'UPDATE_USER_DATA':
      return {
        ...state,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

// Initial State
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore token on app start
  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: {
            token,
            user: JSON.parse(userData),
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error restoring token:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (userData, token) => {
    try {
      // Store in AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData, token },
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUserData = async (userData) => {
    try {
      // Update AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      dispatch({
        type: 'UPDATE_USER_DATA',
        payload: { user: userData },
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    restoreToken,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
