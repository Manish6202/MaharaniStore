const mongoose = require('mongoose');

const trendingBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
    trim: true
  },
  backgroundImage: {
    type: String,
    required: false,
    default: ''
  },
  linkType: {
    type: String,
    enum: ['product', 'subcategory', 'category', 'offer', 'none'],
    required: true
  },
  linkId: {
    type: String, // Product ID, Subcategory name, or Category name
    required: function() {
      return this.linkType !== 'none';
    }
  },
  linkLabel: {
    type: String, // Display name for the link
    required: function() {
      return this.linkType !== 'none';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
trendingBannerSchema.index({ isActive: 1, order: 1 });
trendingBannerSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('TrendingBanner', trendingBannerSchema);
