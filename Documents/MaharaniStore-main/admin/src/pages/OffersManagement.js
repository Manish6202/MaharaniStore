import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Grid, Card, CardContent,
  CardMedia, Chip, Switch, FormControl, FormLabel, TextField, FormControlLabel,
  ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Add, Edit, Delete, Image as ImageIcon, Visibility, VisibilityOff, Refresh,
  GridView, TableView
} from '@mui/icons-material';
import axios from 'axios';
import { getApiUrl, getImageUrl } from '../config/api';

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    discount: '',
    timeIcon: '⏰',
    timeText: '',
    gradient: ['#FF6B6B', '#FF8E53'],
    order: 0,
    isActive: true,
    linkType: 'none',
    linkId: '',
    linkLabel: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const { token: adminToken, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchOffers();
      fetchProducts();
    }
  }, [isAuthenticated, adminToken]);

  const fetchOffers = async () => {
    if (!isAuthenticated || !adminToken) {
      setError('Please login to view offers');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching offers with token:', adminToken ? 'Present' : 'Missing');
      const res = await axios.get(getApiUrl('/api/offers/admin/all'), {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Offers fetched successfully:', res.data.data.length, 'offers');
      setOffers(res.data.data);
      setSuccess(`Loaded ${res.data.data.length} offers successfully`);
    } catch (e) {
      console.error('❌ Error fetching offers:', e);
      setError(`Error fetching offers: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/products'));
      console.log('📦 Products response:', response.data);
      const productsData = response.data.data || response.data.products || [];
      console.log('📦 Total products fetched:', productsData.length);
      if (response.data.success) {
        setAllProducts(productsData); // Store all products
        setProducts([]); // Initially empty, will be filtered
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  // All subcategories defined in backend
  const allSubcategories = {
    Grocery: [
      'Ration & Essentials',
      'Dairy & Bakery',
      'Instant Food & Snacks',
      'Sweets & Chocolates',
      'Beverages & Drinks',
      'Fresh Vegetables',
      'Fresh Fruits',
      'Tobacco Products'
    ],
    Cosmetics: [
      'Face Care',
      'Body Care',
      'Hair Care',
      'Makeup',
      'Fragrances',
      'Men\'s Grooming',
      'Bath & Shower',
      'Hygiene & Personal Care'
    ]
  };

  // Handle category selection - show all subcategories
  const handleCategoryChange = (category) => {
    console.log('📁 Category selected:', category);
    setSelectedCategory(category);
    
    // Get all subcategories for this category (from predefined list)
    const categorySubcategories = allSubcategories[category] || [];
    console.log('📂 All Subcategories for', category, ':', categorySubcategories);
    setSubcategories(categorySubcategories);
    
    // Reset subcategory, products and form fields
    setSelectedSubcategory('');
    setProducts([]);
    setFormData(prev => ({ ...prev, linkId: '', linkLabel: '' }));
  };

  // Handle subcategory selection - filter products
  const handleSubcategoryChange = (subcategory) => {
    console.log('📂 Subcategory selected:', subcategory);
    
    // Filter products for this subcategory
    const subcategoryProducts = allProducts.filter(p => 
      p.mainCategory === selectedCategory && p.subcategory === subcategory
    );
    console.log('📦 Products for', subcategory, ':', subcategoryProducts.length);
    setProducts(subcategoryProducts);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.subtitle || !formData.discount || !formData.timeText) {
      setError('Please fill all required fields');
      return;
    }


    if (!editingOffer && !selectedFile) {
      setError('Please select an image for the offer');
      return;
    }

    setLoading(true);
    setError(null);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('subtitle', formData.subtitle);
    submitData.append('discount', formData.discount);
    submitData.append('timeIcon', formData.timeIcon);
    submitData.append('timeText', formData.timeText);
    submitData.append('gradient', JSON.stringify(formData.gradient));
    submitData.append('order', formData.order);
    submitData.append('isActive', formData.isActive);
    submitData.append('linkType', formData.linkType);
    if (formData.linkType !== 'none') {
      submitData.append('linkId', formData.linkId);
      submitData.append('linkLabel', formData.linkLabel);
    }

    if (selectedFile) {
      submitData.append('offerImage', selectedFile);
    }

    try {
      const url = editingOffer 
        ? getApiUrl(`/api/offers/update/${editingOffer._id}`)
        : getApiUrl('/api/offers/create');

      console.log(`🔄 ${editingOffer ? 'Updating' : 'Creating'} offer...`);
      const res = await axios[editingOffer ? 'put' : 'post'](url, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      console.log('✅ Offer saved successfully:', res.data.message);
      setSuccess(res.data.message);
      setOpenDialog(false);
      resetForm();
      fetchOffers();
    } catch (e) {
      console.error('❌ Error saving offer:', e);
      setError(e.response?.data?.message || 'Error saving offer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ Deleting offer:', id);
      await axios.delete(getApiUrl(`/api/offers/delete/${id}`), {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Offer deleted successfully');
      setSuccess('Offer deleted successfully');
      fetchOffers();
    } catch (e) {
      console.error('❌ Error deleting offer:', e);
      setError(`Error deleting offer: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      subtitle: offer.subtitle,
      discount: offer.discount,
      timeIcon: offer.timeIcon,
      timeText: offer.timeText,
      gradient: offer.gradient,
      order: offer.order,
      isActive: offer.isActive,
      linkType: offer.linkType || 'none',
      linkId: offer.linkId || '',
      linkLabel: offer.linkLabel || ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      discount: '',
      timeIcon: '⏰',
      timeText: '',
      gradient: ['#FF6B6B', '#FF8E53'],
      order: 0,
      isActive: true,
      linkType: 'none',
      linkId: '',
      linkLabel: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingOffer(null);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSubcategories([]);
    setProducts([]);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom color="text.secondary">
          Please Login to Access Offers Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You need to be logged in as an admin to view and manage offers.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">Offers Management</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage promotional offers for the mobile app
          </Typography>
          {offers.length > 0 && (
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              📱 {offers.length} Active Offers Found
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridView />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableView />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOffers}
            disabled={loading}
            sx={{ color: 'primary.main', borderColor: 'primary.main' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Add New Offer
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      
      {loading && !editingOffer ? (
        <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : offers.length === 0 ? (
        <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No offers found. Create your first offer!
          </Typography>
        </Box>
      ) : viewMode === 'grid' ? (
        // Grid View
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {offers.map((offer) => (
            <Box key={offer._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }, minWidth: 300 }}>
              <Card sx={{ 
                height: '100%', 
                position: 'relative', 
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { boxShadow: 3 } 
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(offer.imageUrl)}
                  alt={offer.title}
                  sx={{ 
                    objectFit: 'cover',
                    width: '100%'
                  }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {offer.title}
                    </Typography>
                    <Chip
                      icon={offer.isActive ? <Visibility /> : <VisibilityOff />}
                      label={offer.isActive ? 'Active' : 'Inactive'}
                      color={offer.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {offer.subtitle}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {offer.discount} OFF
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>{offer.timeIcon}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {offer.timeText}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Order: {offer.order} | Created: {new Date(offer.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(offer)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(offer._id)}
                      sx={{ flex: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        // Table View
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Subtitle</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer._id}>
                    <TableCell>
                      <Avatar
                        src={getImageUrl(offer.imageUrl)}
                        alt={offer.title}
                        sx={{ width: 56, height: 56 }}
                      >
                        {offer.title.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {offer.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {offer.subtitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={offer.discount}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>{offer.timeIcon}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {offer.timeText}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {offer.order}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={offer.isActive ? <Visibility /> : <VisibilityOff />}
                        label={offer.isActive ? 'Active' : 'Inactive'}
                        color={offer.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(offer)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(offer._id)}
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
        </Card>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOffer ? 'Edit Offer' : 'Add New Offer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', e.target.value)}
                placeholder="70%"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time Icon"
                value={formData.timeIcon}
                onChange={(e) => handleInputChange('timeIcon', e.target.value)}
                placeholder="⏰"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time Text"
                value={formData.timeText}
                onChange={(e) => handleInputChange('timeText', e.target.value)}
                placeholder="Ends in: 12:34:56"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
            
            {/* Link Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Link To</InputLabel>
                <Select
                  value={formData.linkType}
                  onChange={(e) => setFormData({ ...formData, linkType: e.target.value, linkId: '', linkLabel: '' })}
                  label="Link To"
                >
                  <MenuItem value="none">No Link</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                  <MenuItem value="subcategory">Subcategory</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Product Selection - Cascading */}
            {formData.linkType === 'product' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      label="Select Category"
                    >
                      <MenuItem value="Grocery">Grocery</MenuItem>
                      <MenuItem value="Cosmetics">Cosmetics</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!selectedCategory}>
                    <InputLabel>Select Subcategory</InputLabel>
                    <Select
                      value={selectedSubcategory}
                      onChange={(e) => {
                        setSelectedSubcategory(e.target.value);
                        handleSubcategoryChange(e.target.value);
                        setFormData({ ...formData, linkId: '', linkLabel: '' });
                      }}
                      label="Select Subcategory"
                    >
                      {subcategories.length === 0 && (
                        <MenuItem disabled>Select category first</MenuItem>
                      )}
                      {subcategories.map((sub) => (
                        <MenuItem key={sub} value={sub}>
                          {sub}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth disabled={products.length === 0}>
                    <InputLabel>Select Product</InputLabel>
                    <Select
                      value={formData.linkId}
                      onChange={(e) => {
                        const product = products.find(p => p._id === e.target.value);
                        console.log('🎯 Selected product:', product);
                        setFormData({ 
                          ...formData, 
                          linkId: e.target.value,
                          linkLabel: product ? product.name : ''
                        });
                      }}
                      label="Select Product"
                    >
                      {products.length === 0 && (
                        <MenuItem disabled>Select subcategory first</MenuItem>
                      )}
                      {products.map((product) => (
                        <MenuItem key={product._id} value={product._id}>
                          {product.name} - ₹{product.price}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Subcategory Selection - Cascading */}
            {formData.linkType === 'subcategory' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      label="Select Category"
                    >
                      <MenuItem value="Grocery">Grocery</MenuItem>
                      <MenuItem value="Cosmetics">Cosmetics</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!selectedCategory}>
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
                      {subcategories.length === 0 && (
                        <MenuItem disabled>Select category first</MenuItem>
                      )}
                      {subcategories.map((sub) => (
                        <MenuItem key={sub} value={sub}>
                          {sub}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Category Selection */}
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
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="offer-image-upload"
              />
              <label htmlFor="offer-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                  sx={{ mb: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Select Offer Image'}
                </Button>
              </label>
              {previewUrl && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      height: 200, 
                      objectFit: 'cover', 
                      borderRadius: 8 
                    }} 
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editingOffer ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OffersManagement;

