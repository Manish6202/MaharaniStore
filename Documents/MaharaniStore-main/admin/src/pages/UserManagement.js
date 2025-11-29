import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar,
  Chip, IconButton, Tooltip, TextField, InputAdornment, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel,
  Grid, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  Search, Refresh, Delete, Visibility, Edit, Person, PersonAdd,
  Block, CheckCircle, Cancel, FilterList, Sort
} from '@mui/icons-material';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const { token: adminToken, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchUsers();
      fetchUserStats();
    }
  }, [isAuthenticated, adminToken, currentPage, searchTerm, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('👥 Fetching users...');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      const response = await axios.get(getApiUrl(`/api/admin/users?${params}`), {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalUsers(response.data.data.pagination.totalUsers);
        console.log('✅ Users loaded:', response.data.data.users.length);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(error.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      console.log('📊 Fetching user statistics...');
      const response = await axios.get(getApiUrl('/api/admin/users/stats'), {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setUserStats(response.data.data);
        console.log('✅ User stats loaded');
      }
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      console.log(`🔄 Toggling user status for user ${userId}...`);
      const response = await axios.put(`/api/admin/users/${userId}/status`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      if (response.data.success) {
        setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccess(null), 3000);
        fetchUsers(); // Refresh users list
        fetchUserStats(); // Refresh stats
        console.log('✅ User status updated');
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      setError(error.response?.data?.message || 'Error updating user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting user ${userId}...`);
      const response = await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setSuccess('User deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
        fetchUsers(); // Refresh users list
        fetchUserStats(); // Refresh stats
        console.log('✅ User deleted');
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      setError(error.response?.data?.message || 'Error deleting user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom color="text.secondary">
          Please Login to Access User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You need to be logged in as an admin to view and manage users.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor all registered users
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchUsers}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* User Statistics */}
      {userStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {userStats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {userStats.activeUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {userStats.inactiveUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inactive Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {userStats.weeklyUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {userStats.recentUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search users by name, phone, or email..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="createdAt">Registration Date</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="phone">Phone</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Order"
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Users ({totalUsers} total)
          </Typography>
          {loading ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>Loading users...</Typography>
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'No users have registered yet'}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell onClick={() => handleSort('createdAt')} sx={{ cursor: 'pointer' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Registration Date
                          <Sort sx={{ ml: 1 }} />
                        </Box>
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {user.name || 'No Name'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {user._id.slice(-8)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            📱 {user.phone}
                          </Typography>
                          {user.email && (
                            <Typography variant="body2" color="text.secondary">
                              📧 {user.email}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={user.isActive ? <CheckCircle /> : <Cancel />}
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewUser(user)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                color={user.isActive ? 'warning' : 'success'}
                              >
                                {user.isActive ? <Block /> : <CheckCircle />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user._id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1 }} />
            User Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.name || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedUser.email || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={selectedUser.isActive ? <CheckCircle /> : <Cancel />}
                    label={selectedUser.isActive ? 'Active' : 'Inactive'}
                    color={selectedUser.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedUser.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedUser.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedUser && (
            <Button
              onClick={() => handleToggleStatus(selectedUser._id, selectedUser.isActive)}
              color={selectedUser.isActive ? 'warning' : 'success'}
              variant="outlined"
            >
              {selectedUser.isActive ? 'Deactivate' : 'Activate'} User
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
