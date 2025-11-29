import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

// Async thunks for API calls
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { getState }) => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(getApiUrl('/api/products'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async ({ category, subcategory }, { getState }) => {
    const token = localStorage.getItem('adminToken');
    let url = `/api/products/${category}`;
    if (subcategory) {
      url += `/${subcategory}`;
    }
    const response = await axios.get(getApiUrl(url), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { getState }) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images' && key !== 'image') {
        formData.append(key, productData[key]);
      }
    });
    
    // Append image file
    if (productData.image) {
      formData.append('images', productData.image);
    }
    
    const response = await axios.post(getApiUrl('/api/products'), formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { getState }) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images' && key !== 'image') {
        formData.append(key, productData[key]);
      }
    });
    
    // Append image file if new one is provided
    if (productData.image) {
      formData.append('images', productData.image);
    }
    
    const response = await axios.put(getApiUrl(`/api/products/${id}`), formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { getState }) => {
    const token = localStorage.getItem('adminToken');
    await axios.delete(getApiUrl(`/api/products/${productId}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return productId;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    filteredProducts: [],
    loading: false,
    error: null,
    currentFilter: {
      category: 'all',
      subcategory: 'all',
      searchTerm: '',
      status: 'all'
    }
  },
  reducers: {
    setFilter: (state, action) => {
      state.currentFilter = { ...state.currentFilter, ...action.payload };
      // Apply filters to products
      state.filteredProducts = state.products.filter(product => {
        const matchesCategory = state.currentFilter.category === 'all' || 
                               product.mainCategory === state.currentFilter.category;
        const matchesSubcategory = state.currentFilter.subcategory === 'all' || 
                                  product.subcategory === state.currentFilter.subcategory;
        const matchesSearch = state.currentFilter.searchTerm === '' ||
                             product.name.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase()) ||
                             product.description.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase());
        const matchesStatus = state.currentFilter.status === 'all' ||
                             (state.currentFilter.status === 'active' && product.isActive) ||
                             (state.currentFilter.status === 'inactive' && !product.isActive);
        
        return matchesCategory && matchesSubcategory && matchesSearch && matchesStatus;
      });
    },
    clearFilters: (state) => {
      state.currentFilter = {
        category: 'all',
        subcategory: 'all',
        searchTerm: '',
        status: 'all'
      };
      state.filteredProducts = state.products;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        // Apply current filters to the fetched data
        state.filteredProducts = state.products.filter(product => {
          const matchesCategory = state.currentFilter.category === 'all' || 
                                 product.mainCategory === state.currentFilter.category;
          const matchesSubcategory = state.currentFilter.subcategory === 'all' || 
                                    product.subcategory === state.currentFilter.subcategory;
          const matchesSearch = state.currentFilter.searchTerm === '' ||
                               product.name.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase()) ||
                               product.description.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase());
          const matchesStatus = state.currentFilter.status === 'all' ||
                               (state.currentFilter.status === 'active' && product.isActive) ||
                               (state.currentFilter.status === 'inactive' && !product.isActive);
          
          return matchesCategory && matchesSubcategory && matchesSearch && matchesStatus;
        });
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Products by Category
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        // Apply current filters to the fetched data
        state.filteredProducts = state.products.filter(product => {
          const matchesCategory = state.currentFilter.category === 'all' || 
                                 product.mainCategory === state.currentFilter.category;
          const matchesSubcategory = state.currentFilter.subcategory === 'all' || 
                                    product.subcategory === state.currentFilter.subcategory;
          const matchesSearch = state.currentFilter.searchTerm === '' ||
                               product.name.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase()) ||
                               product.description.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase());
          const matchesStatus = state.currentFilter.status === 'all' ||
                               (state.currentFilter.status === 'active' && product.isActive) ||
                               (state.currentFilter.status === 'inactive' && !product.isActive);
          
          return matchesCategory && matchesSubcategory && matchesSearch && matchesStatus;
        });
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        const newProduct = action.payload.data;
        state.products.unshift(newProduct);
        
        // Check if the new product matches current filters
        const matchesCategory = state.currentFilter.category === 'all' || 
                               newProduct.mainCategory === state.currentFilter.category;
        const matchesSubcategory = state.currentFilter.subcategory === 'all' || 
                                  newProduct.subcategory === state.currentFilter.subcategory;
        const matchesSearch = state.currentFilter.searchTerm === '' ||
                             newProduct.name.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase()) ||
                             newProduct.description.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase());
        const matchesStatus = state.currentFilter.status === 'all' ||
                             (state.currentFilter.status === 'active' && newProduct.isActive) ||
                             (state.currentFilter.status === 'inactive' && !newProduct.isActive);
        
        if (matchesCategory && matchesSubcategory && matchesSearch && matchesStatus) {
          state.filteredProducts.unshift(newProduct);
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data;
        const index = state.products.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        
        // Reapply filters to update filteredProducts
        state.filteredProducts = state.products.filter(product => {
          const matchesCategory = state.currentFilter.category === 'all' || 
                                 product.mainCategory === state.currentFilter.category;
          const matchesSubcategory = state.currentFilter.subcategory === 'all' || 
                                    product.subcategory === state.currentFilter.subcategory;
          const matchesSearch = state.currentFilter.searchTerm === '' ||
                               product.name.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase()) ||
                               product.description.toLowerCase().includes(state.currentFilter.searchTerm.toLowerCase());
          const matchesStatus = state.currentFilter.status === 'all' ||
                               (state.currentFilter.status === 'active' && product.isActive) ||
                               (state.currentFilter.status === 'inactive' && !product.isActive);
          
          return matchesCategory && matchesSubcategory && matchesSearch && matchesStatus;
        });
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
        state.filteredProducts = state.filteredProducts.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setFilter, clearFilters, clearError } = productsSlice.actions;
export default productsSlice.reducer;
