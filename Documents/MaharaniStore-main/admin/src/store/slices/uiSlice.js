
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    viewMode: 'grid', // 'grid' or 'table'
    sidebarOpen: true,
    currentPage: 'dashboard',
    notifications: [],
    modals: {
      addProduct: false,
      editProduct: false,
      deleteConfirm: false
    },
    selectedProduct: null,
    loading: false
  },
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: action.payload.type, // 'success', 'error', 'info', 'warning'
        message: action.payload.message,
        timestamp: new Date().toISOString()
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
      if (action.payload === 'editProduct') {
        state.selectedProduct = null;
      }
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setViewMode,
  toggleSidebar,
  setCurrentPage,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  setSelectedProduct,
  setLoading
} = uiSlice.actions;

export default uiSlice.reducer;
