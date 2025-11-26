const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
wishlistSchema.index({ user: 1 });

// Virtual for product count
wishlistSchema.virtual('productCount').get(function() {
  return this.products.length;
});

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  const existingProduct = this.products.find(p => p.product.toString() === productId.toString());
  if (!existingProduct) {
    this.products.push({ product: productId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(p => p.product.toString() !== productId.toString());
  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(p => p.product.toString() === productId.toString());
};

// Static method to get or create wishlist for user
wishlistSchema.statics.getOrCreateWishlist = function(userId) {
  return this.findOne({ user: userId })
    .populate('products.product', 'name price images brand mainCategory subcategory stock unit')
    .then(wishlist => {
      if (!wishlist) {
        return this.create({ user: userId, products: [] });
      }
      return wishlist;
    });
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
