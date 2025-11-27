import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import websocketService from '../services/websocket';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
} from '@mui/material';
import { Refresh, Visibility } from '@mui/icons-material';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'secondary',
  ready: 'primary',
  out_for_delivery: 'info',
  delivered: 'success',
  cancelled: 'default',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const adminToken = localStorage.getItem('adminToken');

  const fetchOrders = useCallback(async (newPage = 1, status = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: newPage, limit: 20 });
      if (status && status !== '') {
        params.append('status', status);
      }
      
      console.log('📦 Fetching orders:', params.toString());
      
      const res = await axios.get(`/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      console.log('📦 Orders response:', res.data);
      
      if (res.data.success) {
        setOrders(res.data.data.orders || []);
        setPages(res.data.data.pagination?.pages || 1);
        setPage(res.data.data.pagination?.current || newPage);
      } else {
        setError(res.data.message || 'Failed to load orders');
      }
    } catch (e) {
      console.error('❌ Error fetching orders:', e);
      console.error('❌ Error response:', e.response?.data);
      setError(
        e.response?.data?.message || 
        e.response?.data?.error || 
        e.message || 
        'Failed to load orders. Please check backend server.'
      );
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    fetchOrders(1, '');
    
    // Connect WebSocket
    websocketService.connect();
    
    // Listen for new orders
    const unsubscribeNewOrder = websocketService.on('new-order', (data) => {
      console.log('📦 New order received via WebSocket:', data);
      // Refresh orders to show new order
      fetchOrders(page, statusFilter);
    });
    
    // Listen for order status changes
    const unsubscribeStatusChange = websocketService.on('order-status-changed', (data) => {
      console.log('📦 Order status changed via WebSocket:', data);
      // Refresh orders to show updated status
      fetchOrders(page, statusFilter);
    });
    
    return () => {
      unsubscribeNewOrder();
      unsubscribeStatusChange();
      websocketService.disconnect();
    };
  }, [fetchOrders, page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchOrders(page, statusFilter);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">Orders</Typography>
          <Typography variant="body1" color="text.secondary">Manage and track customer orders</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Select
            value={statusFilter}
            size="small"
            displayEmpty
            onChange={(e) => { setStatusFilter(e.target.value); fetchOrders(1, e.target.value); }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="preparing">Preparing</MenuItem>
            <MenuItem value="ready">Ready</MenuItem>
            <MenuItem value="out_for_delivery">Out for delivery</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={() => fetchOrders(page, statusFilter)} disabled={loading}>
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell align="right">Items</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="text.secondary">No orders found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map(order => (
                        <TableRow key={order._id} hover>
                          <TableCell>{order.orderNumber}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{order.user?.name || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.user?.phone || ''}</Typography>
                          </TableCell>
                          <TableCell align="right">{order.items?.length || 0}</TableCell>
                          <TableCell align="right">₹{order.subtotal?.toFixed(2)}</TableCell>
                          <TableCell align="right">₹{order.totalAmount?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip size="small" color={statusColors[order.orderStatus] || 'default'} label={order.orderStatus?.replaceAll('_',' ')}/>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Select
                              size="small"
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              sx={{ mr: 1, minWidth: 160 }}
                            >
                              {['pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'].map(s => (
                                <MenuItem key={s} value={s}>{s.replaceAll('_',' ')}</MenuItem>
                              ))}
                            </Select>
                            <Tooltip title="View">
                              <IconButton>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack alignItems="center" sx={{ mt: 2 }}>
                <Pagination count={pages} page={page} onChange={(_, p) => fetchOrders(p, statusFilter)} color="primary" />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Orders;


