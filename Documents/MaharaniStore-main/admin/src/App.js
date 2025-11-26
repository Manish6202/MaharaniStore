import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import MediaManagement from './pages/MediaManagement';
import OffersManagement from './pages/OffersManagement';
import UserManagement from './pages/UserManagement';
import TrendingBannerManagement from './pages/TrendingBannerManagement';
import AdminLayout from './components/AdminLayout';
import Login from './components/Login';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EE',
    },
    secondary: {
      main: '#03DAC6',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
};

// Main App Content Component
const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout>
              <Navigate to="/dashboard" replace />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute>
            <AdminLayout>
              <Products />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/trending-banner" element={
          <ProtectedRoute>
            <AdminLayout>
              <TrendingBannerManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/media" element={
          <ProtectedRoute>
            <AdminLayout>
              <MediaManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/offers" element={
          <ProtectedRoute>
            <AdminLayout>
              <OffersManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
