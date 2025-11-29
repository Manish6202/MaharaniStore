import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [orderStats, setOrderStats] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchOrderData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch products from backend
      const productsResponse = await axios.get(getApiUrl('/api/products'));
      if (productsResponse.data.success) {
        const productsData = productsResponse.data.data;
        
        // Calculate stats
        setStats({
          totalProducts: productsData?.length || 0,
          totalOrders: orderStats?.totalOrders || 0,
          totalUsers: 0, // Will be fetched separately
          totalRevenue: orderStats?.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty stats instead of mock data
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
      });
    }
  };

  const fetchOrderData = async () => {
    try {
      // Fetch order statistics
      const statsResponse = await axios.get(getApiUrl('/api/orders/stats?period=today'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.data.success) {
        setOrderStats(statsResponse.data.data);
        setStats(prev => ({
          ...prev,
          totalOrders: statsResponse.data.data.totalOrders,
          totalRevenue: statsResponse.data.data.totalRevenue,
        }));
      }

      // Fetch order analytics
      const analyticsResponse = await axios.get(getApiUrl('/api/orders/analytics?period=month'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (analyticsResponse.data.success) {
        setOrderAnalytics(analyticsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  // Chart data with safe fallbacks
  const salesData = orderAnalytics?.dailyTrends?.map((day) => ({
    name: new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: day.revenue || 0,
    orders: day.count || 0
  })) || []; // Empty array instead of mock data

  // Status data with safe fallbacks
  const statusData = orderStats?.statusBreakdown?.map((status) => ({
    name: status._id?.charAt(0).toUpperCase() + status._id?.slice(1) || 'Unknown',
    value: status.count || 0,
    color: status._id === 'delivered' ? '#4CAF50' : 
           status._id === 'pending' ? '#FF9800' : 
           status._id === 'cancelled' ? '#F44336' : '#2196F3'
  })) || []; // Empty array instead of mock data

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="success.main">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" className="mb-8">
        Welcome to Maharani Store Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Inventory />}
          color="#4CAF50"
          subtitle="+12% from last month"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart />}
          color="#2196F3"
          subtitle="+8% from last month"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<People />}
          color="#FF9800"
          subtitle="+15% from last month"
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
          icon={<AttachMoney />}
          color="#9C27B0"
          subtitle="+22% from last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Sales Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-6">
                Monthly sales performance
              </Typography>
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#6200EE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No sales data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card className="h-fit">
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order Status Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-6">
                Orders by status
              </Typography>
              {statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {statusData.map((item) => (
                      <div key={item.name} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-sm mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <Typography variant="body2">
                          {item.name}: {item.value} orders
                        </Typography>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No order data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Activity
            </Typography>
            <div className="mt-4 space-y-4">
              {[
                { action: 'New order placed', time: '2 minutes ago', status: 'success' },
                { action: 'Product updated', time: '15 minutes ago', status: 'info' },
                { action: 'User registered', time: '1 hour ago', status: 'primary' },
                { action: 'Order delivered', time: '2 hours ago', status: 'success' },
              ].map((activity, index) => (
                <div key={index} className={`flex justify-between items-center py-2 ${index < 3 ? 'border-b border-gray-100' : ''}`}>
                  <Typography variant="body2">{activity.action}</Typography>
                  <div className="flex items-center gap-2">
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                    <Chip label={activity.status} size="small" color={activity.status} variant="outlined" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};

export default Dashboard;
