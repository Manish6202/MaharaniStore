import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Inventory,
  AttachMoney,
  Category,
  TrendingUp,
  GridView,
  TableView,
  FilterList,
  Image,
  Upload,
  Refresh,
} from '@mui/icons-material';
import {
  fetchProducts,
  fetchProductsByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  setFilter,
  clearFilters,
} from '../store/slices/productsSlice';
import {
  setViewMode,
  openModal,
  closeModal,
  setSelectedProduct,
  addNotification,
} from '../store/slices/uiSlice';

const Products = () => {
  const dispatch = useDispatch();
  const { products, filteredProducts, loading, error, currentFilter } = useSelector(state => state.products);
  const { viewMode, modals, selectedProduct } = useSelector(state => state.ui);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    mainCategory: '',
    subcategory: '',
    unit: '',
    brand: '',
    isActive: true,
    image: null,
  });

  // Category options matching your backend model
  const categoryOptions = {
    Grocery: [
      'Ration & Essentials',
      'Dairy & Bakery',
      'Fresh Vegetables',
      'Fresh Fruits',
      'Beverages & Drinks',
      'Instant Food & Snacks',
      'Sweets & Chocolates',
      'Tobacco Products',
    ],
    Cosmetics: [
      'Skincare Products',
      'Makeup & Beauty',
      'Hair Care',
      'Men\'s Grooming',
      'Bath & Body',
      'Fragrances',
      'Baby Care',
      'Health & Wellness',
    ],
  };

  // Unit options from your backend model
  const unitOptions = ['kg', 'gram', 'liter', 'ml', 'piece', 'pack', 'box', 'bottle'];

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      mainCategory: '',
      subcategory: '',
      unit: '',
      brand: '',
      isActive: true,
      image: null,
    });
    dispatch(setSelectedProduct(null));
    dispatch(openModal('addProduct'));
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      mainCategory: product.mainCategory,
      subcategory: product.subcategory,
      unit: product.unit,
      brand: product.brand || '',
      isActive: product.isActive,
      image: null,
    });
    dispatch(setSelectedProduct(product));
    dispatch(openModal('editProduct'));
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct._id, productData }));
        dispatch(addNotification({ type: 'success', message: 'Product updated successfully!' }));
      } else {
        await dispatch(addProduct(productData));
        dispatch(addNotification({ type: 'success', message: 'Product added successfully!' }));
      }

      dispatch(closeModal('addProduct'));
      dispatch(closeModal('editProduct'));
      
      // Refresh products and apply current filter
      if (currentFilter.category === 'all') {
        dispatch(fetchProducts());
      } else if (currentFilter.subcategory === 'all') {
        dispatch(fetchProductsByCategory({ category: currentFilter.category }));
      } else {
        dispatch(fetchProductsByCategory({ 
          category: currentFilter.category, 
          subcategory: currentFilter.subcategory 
        }));
      }
    } catch (error) {
      dispatch(addNotification({ type: 'error', message: 'Failed to save product!' }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId));
        dispatch(addNotification({ type: 'success', message: 'Product deleted successfully!' }));
        
        // Refresh products and apply current filter
        if (currentFilter.category === 'all') {
          dispatch(fetchProducts());
        } else if (currentFilter.subcategory === 'all') {
          dispatch(fetchProductsByCategory({ category: currentFilter.category }));
        } else {
          dispatch(fetchProductsByCategory({ 
            category: currentFilter.category, 
            subcategory: currentFilter.subcategory 
          }));
        }
      } catch (error) {
        dispatch(addNotification({ type: 'error', message: 'Failed to delete product!' }));
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilter({ [filterType]: value }));
  };

  const handleCategoryClick = (category) => {
    if (category === 'all') {
      dispatch(clearFilters());
      dispatch(fetchProducts());
    } else {
      dispatch(setFilter({ category, subcategory: 'all' }));
      dispatch(fetchProductsByCategory({ category }));
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    if (subcategory === 'all') {
      dispatch(setFilter({ subcategory: 'all' }));
      if (currentFilter.category !== 'all') {
        dispatch(fetchProductsByCategory({ category: currentFilter.category }));
      } else {
        dispatch(fetchProducts());
      }
    } else {
      dispatch(setFilter({ subcategory }));
      dispatch(fetchProductsByCategory({ 
        category: currentFilter.category, 
        subcategory 
      }));
    }
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    categories: new Set(products.map(p => p.mainCategory)).size,
    revenue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'All Products', value: 'all' }];
    
    if (currentFilter.category !== 'all') {
      breadcrumbs.push({ 
        label: currentFilter.category, 
        value: currentFilter.category 
      });
    }
    
    if (currentFilter.subcategory !== 'all') {
      breadcrumbs.push({ 
        label: currentFilter.subcategory, 
        value: currentFilter.subcategory 
      });
    }
    
    return breadcrumbs;
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Products Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your product catalog
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProduct}
          sx={{ height: '48px' }}
        >
          Add Product
        </Button>
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {getBreadcrumbs().map((breadcrumb, index) => (
            <Link
              key={index}
              component="button"
              variant="body2"
              onClick={() => {
                if (breadcrumb.value === 'all') {
                  handleCategoryClick('all');
                } else if (categoryOptions.Grocery.includes(breadcrumb.label) || 
                          categoryOptions.Cosmetics.includes(breadcrumb.label)) {
                  handleCategoryClick(breadcrumb.value);
                } else {
                  handleSubcategoryClick(breadcrumb.value);
                }
              }}
              sx={{ textDecoration: 'none' }}
            >
              {breadcrumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Category sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.categories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categories
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{stats.revenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Filter Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label="All Products"
              onClick={() => handleCategoryClick('all')}
              color={currentFilter.category === 'all' ? 'primary' : 'default'}
              variant={currentFilter.category === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Grocery"
              onClick={() => handleCategoryClick('Grocery')}
              color={currentFilter.category === 'Grocery' ? 'primary' : 'default'}
              variant={currentFilter.category === 'Grocery' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Cosmetics"
              onClick={() => handleCategoryClick('Cosmetics')}
              color={currentFilter.category === 'Cosmetics' ? 'primary' : 'default'}
              variant={currentFilter.category === 'Cosmetics' ? 'filled' : 'outlined'}
            />
          </Box>

          {/* Subcategory Filter */}
          {currentFilter.category !== 'all' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {currentFilter.category} Subcategories:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => handleSubcategoryClick('all')}
                  color={currentFilter.subcategory === 'all' ? 'secondary' : 'default'}
                  variant={currentFilter.subcategory === 'all' ? 'filled' : 'outlined'}
                  size="small"
                />
                {categoryOptions[currentFilter.category]?.map((sub) => (
                  <Chip
                    key={sub}
                    label={sub}
                    onClick={() => handleSubcategoryClick(sub)}
                    color={currentFilter.subcategory === sub ? 'secondary' : 'default'}
                    variant={currentFilter.subcategory === sub ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={currentFilter.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentFilter.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => dispatch(setViewMode(newMode))}
                aria-label="view mode"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <GridView />
                </ToggleButton>
                <ToggleButton value="table" aria-label="table view">
                  <TableView />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  // Refresh products and apply current filter
                  if (currentFilter.category === 'all') {
                    dispatch(fetchProducts());
                  } else if (currentFilter.subcategory === 'all') {
                    dispatch(fetchProductsByCategory({ category: currentFilter.category }));
                  } else {
                    dispatch(fetchProductsByCategory({ 
                      category: currentFilter.category, 
                      subcategory: currentFilter.subcategory 
                    }));
                  }
                }}
                disabled={loading}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearFilters())}>
          {error}
        </Alert>
      )}

      {/* Products Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'grid' ? (
        // Grid View
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={product.images?.[0]}
                    alt={product.name}
                    sx={{ width: '100%', height: 200 }}
                    variant="rounded"
                  >
                    <Image />
                  </Avatar>
                  <Chip
                    label={product.isActive ? 'Active' : 'Inactive'}
                    color={product.isActive ? 'success' : 'default'}
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.brand}
                  </Typography>
                  <Chip
                    label={product.mainCategory}
                    color={product.mainCategory === 'Grocery' ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {product.subcategory}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ₹{product.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per {product.unit}
                  </Typography>
                  <Typography variant="body2">
                    Stock: {product.stock} {product.unit}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <IconButton onClick={() => handleEditProduct(product)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product._id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Table View
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No products found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Avatar
                          src={product.images?.[0]}
                          alt={product.name}
                          sx={{ width: 56, height: 56 }}
                        >
                          <Image />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.brand}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.mainCategory}
                          color={product.mainCategory === 'Grocery' ? 'primary' : 'secondary'}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {product.subcategory}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          ₹{product.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          per {product.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {product.stock} {product.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.isActive ? 'Active' : 'Inactive'}
                          color={product.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditProduct(product)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteProduct(product._id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={modals.addProduct || modals.editProduct} 
        onClose={() => {
          dispatch(closeModal('addProduct'));
          dispatch(closeModal('editProduct'));
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  label="Unit"
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {unitOptions.map((unit) => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Main Category</InputLabel>
                <Select
                  value={formData.mainCategory}
                  label="Main Category"
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    mainCategory: e.target.value, 
                    subcategory: '' 
                  })}
                >
                  <MenuItem value="Grocery">Grocery</MenuItem>
                  <MenuItem value="Cosmetics">Cosmetics</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={formData.subcategory}
                  label="Subcategory"
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  disabled={!formData.mainCategory}
                >
                  {formData.mainCategory && categoryOptions[formData.mainCategory].map((sub) => (
                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ border: '2px dashed #ccc', p: 2, textAlign: 'center' }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="product-image-upload"
                  type="file"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                />
                <label htmlFor="product-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    sx={{ mb: 1 }}
                  >
                    Upload Product Image
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  {formData.image ? formData.image.name : 'No image selected'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active Product"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            dispatch(closeModal('addProduct'));
            dispatch(closeModal('editProduct'));
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {selectedProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
