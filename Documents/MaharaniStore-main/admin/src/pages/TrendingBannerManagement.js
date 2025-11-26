import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Grid, InputAdornment, IconButton as MuiIconButton
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, VisibilityOff, Image as ImageIcon,
  ShoppingCart, Category, Label, Link as LinkIcon, LocalOffer
} from '@mui/icons-material';
import axios from 'axios';

const TrendingBannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    linkType: 'none',
    linkId: '',
    linkLabel: '',
    order: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { token: adminToken, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchBanners();
      fetchProducts();
      fetchSubcategories();
      fetchOffers();
    }
  }, [isAuthenticated, adminToken]);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/trending-banner/admin/all', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setBanners(response.data.data);
      } else {
        setError('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError(error.response?.data?.message || 'Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/trending-banner/admin/products', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('/api/trending-banner/admin/subcategories', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setSubcategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axios.get('/api/trending-banner/admin/offers', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const handleCreateBanner = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      buttonText: 'Shop Now',
      linkType: 'none',
      linkId: '',
      linkLabel: '',
      order: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true
    });
    setSelectedImage(null);
    setImagePreview(null);
    setOpenDialog(true);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      linkType: banner.linkType,
      linkId: banner.linkId || '',
      linkLabel: banner.linkLabel || '',
      order: banner.order,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      isActive: banner.isActive
    });
    setImagePreview(banner.backgroundImage ? `http://localhost:5001/${banner.backgroundImage}` : null);
    setOpenDialog(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('linkType', formData.linkType);
      formDataToSend.append('linkId', formData.linkId);
      formDataToSend.append('linkLabel', formData.linkLabel);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      
      if (selectedImage) {
        formDataToSend.append('backgroundImage', selectedImage);
      }

      let response;
      if (editingBanner) {
        response = await axios.put(`/api/trending-banner/admin/update/${editingBanner._id}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.post('/api/trending-banner/admin/create', formDataToSend, {
          headers: { 
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data.success) {
        setSuccess(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
        setTimeout(() => setSuccess(null), 3000);
        setOpenDialog(false);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      setError(error.response?.data?.message || 'Error saving banner');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await axios.delete(`/api/trending-banner/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setSuccess('Banner deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      setError(error.response?.data?.message || 'Error deleting banner');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await axios.put(`/api/trending-banner/admin/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.success) {
        setSuccess('Banner status updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      setError(error.response?.data?.message || 'Error updating banner status');
    }
  };

  const getLinkTypeIcon = (linkType) => {
    switch (linkType) {
      case 'product': return <ShoppingCart />;
      case 'subcategory': return <Category />;
      case 'category': return <Label />;
      case 'offer': return <LocalOffer />;
      default: return <LinkIcon />;
    }
  };

  const getLinkTypeColor = (linkType) => {
    switch (linkType) {
      case 'product': return 'primary';
      case 'subcategory': return 'secondary';
      case 'category': return 'success';
      case 'offer': return 'warning';
      default: return 'default';
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom color="text.secondary">
          Please Login to Access Trending Banner Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You need to be logged in as an admin to manage trending banners.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Trending Banner Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage dynamic trending banners for the mobile app
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateBanner}
        >
          Create Banner
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {loading ? (
        <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : banners.length === 0 ? (
        <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No trending banners found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first trending banner to get started
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Banner</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Link</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <Avatar
                      src={banner.backgroundImage ? `http://localhost:5001/${banner.backgroundImage}` : ''}
                      alt={banner.title}
                      sx={{ width: 60, height: 40 }}
                      variant="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {banner.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {banner.subtitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {banner.linkType !== 'none' ? (
                      <Chip
                        icon={getLinkTypeIcon(banner.linkType)}
                        label={banner.linkLabel}
                        color={getLinkTypeColor(banner.linkType)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Link
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={banner.isActive ? <Visibility /> : <VisibilityOff />}
                      label={banner.isActive ? 'Active' : 'Inactive'}
                      color={banner.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{banner.order}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditBanner(banner)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(banner._id)}
                        color={banner.isActive ? 'warning' : 'success'}
                      >
                        {banner.isActive ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBanner(banner._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Banner Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBanner ? 'Edit Trending Banner' : 'Create Trending Banner'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Button Text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Link Type</InputLabel>
                  <Select
                    value={formData.linkType}
                    onChange={(e) => setFormData({ ...formData, linkType: e.target.value, linkId: '', linkLabel: '' })}
                    label="Link Type"
                  >
                    <MenuItem value="none">No Link</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="subcategory">Subcategory</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="offer">Offer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.linkType === 'product' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Product</InputLabel>
                    <Select
                      value={formData.linkId}
                      onChange={(e) => {
                        const product = products.find(p => p._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          linkId: e.target.value,
                          linkLabel: product ? product.name : ''
                        });
                      }}
                      label="Select Product"
                    >
                      {products.map((product) => (
                        <MenuItem key={product._id} value={product._id}>
                          {product.name} - ₹{product.price}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {formData.linkType === 'subcategory' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Subcategory</InputLabel>
                    <Select
                      value={formData.linkId}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        linkId: e.target.value,
                        linkLabel: e.target.value
                      })}
                      label="Select Subcategory"
                    >
                      {subcategories.map((sub) => (
                        <MenuItem key={sub.name} value={sub.name}>
                          {sub.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {formData.linkType === 'category' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Category</InputLabel>
                    <Select
                      value={formData.linkId}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        linkId: e.target.value,
                        linkLabel: e.target.value
                      })}
                      label="Select Category"
                    >
                      <MenuItem value="Grocery">Grocery</MenuItem>
                      <MenuItem value="Cosmetics">Cosmetics</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {formData.linkType === 'offer' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Offer</InputLabel>
                    <Select
                      value={formData.linkId}
                      onChange={(e) => {
                        const offer = offers.find(o => o._id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          linkId: e.target.value,
                          linkLabel: offer ? offer.title : ''
                        });
                      }}
                      label="Select Offer"
                    >
                      {offers.map((offer) => (
                        <MenuItem key={offer._id} value={offer._id}>
                          {offer.title} {offer.discount && `- ${offer.discount}% OFF`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date (Optional)"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="banner-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="banner-image-upload">
                    <Button variant="outlined" component="span" startIcon={<ImageIcon />}>
                      {selectedImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {imagePreview && (
                    <Box sx={{ ml: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBanner ? 'Update' : 'Create'} Banner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrendingBannerManagement;
