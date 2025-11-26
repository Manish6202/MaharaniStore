require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const orderRoutes = require('./routes/orderRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const offerRoutes = require('./routes/offerRoutes');
const trendingBannerRoutes = require('./routes/trendingBannerRoutes');
const PORT = process.env.PORT || 5001;

const app = express();
connectDB();

// CORS Middleware - Add this
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Maharani Store Backend is running!' });
});

// routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/trending-banner', trendingBannerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});