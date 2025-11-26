const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  mainCategory: {
    type: String,
    required: true,
    enum: ['Grocery', 'Cosmetics']
  },
  subcategory: {
    type: String,
    required: true,
    enum: [
      // Grocery Subcategories
      'Ration & Essentials',
      'Dairy & Bakery',
      'Fresh Vegetables',
      'Fresh Fruits',
      'Beverages & Drinks',
      'Instant Food & Snacks',
      'Sweets & Chocolates',
      'Tobacco Products',
      // Cosmetics Subcategories
      'Skincare Products',
      'Makeup & Beauty',
      'Hair Care',
      'Men\'s Grooming',
      'Bath & Body',
      'Fragrances',
      'Baby Care',
      'Health & Wellness'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'gram', 'liter', 'ml', 'piece', 'pack', 'box', 'bottle']
  },
  brand: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ mainCategory: 1, subcategory: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);