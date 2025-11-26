import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  ShoppingCart,
  People,
  PhotoLibrary,
  LocalOffer,
  Menu,
  Logout,
  Store,
  Notifications,
  Campaign,
} from '@mui/icons-material';
import { toggleSidebar, setCurrentPage } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Products', icon: <Inventory />, path: '/products' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
  { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Media', icon: <PhotoLibrary />, path: '/media' },
  { text: 'Offers', icon: <LocalOffer />, path: '/offers' },
  { text: 'Trending Banner', icon: <Campaign />, path: '/trending-banner' },
];

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { sidebarOpen, notifications } = useSelector(state => state.ui);
  const { isAuthenticated } = useSelector(state => state.auth);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigation = (path) => {
    dispatch(setCurrentPage(path));
    navigate(path);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Store sx={{ mr: 2 }} />
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Maharani Store
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          
          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Notifications />
            {notifications.length > 0 && (
              <Chip
                label={notifications.length}
                size="small"
                color="error"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  height: 16,
                  minWidth: 16,
                  fontSize: '0.75rem'
                }}
              />
            )}
          </IconButton>
          
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{ color: 'error.main' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { md: sidebarOpen ? drawerWidth : 0 }, 
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            },
          }}
          open={sidebarOpen}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' 
          },
          mt: '64px',
          backgroundColor: 'grey.50',
          minHeight: 'calc(100vh - 64px)',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
