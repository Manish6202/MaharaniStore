const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],
  deliveryAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    addressType: { type: String, enum: ['home', 'office', 'other'], default: 'home' }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'wallet'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderNotes: {
    type: String
  },
  deliveryTime: {
    type: String
  },
  deliveryBoy: {
    type: String
  },
  deliveryPhone: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Virtual for order count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => total + item.total, 0);
  
  // Free delivery above ₹500
  if (this.subtotal >= 500) {
    this.deliveryCharge = 0;
  } else {
    this.deliveryCharge = 30;
  }
  
  // Tax calculation (5% GST)
  this.tax = Math.round(this.subtotal * 0.05);
  
  this.totalAmount = this.subtotal + this.deliveryCharge + this.tax;
  
  return this;
};

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.orderStatus = newStatus;
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancellationReason = notes;
  }
  
  return this.save();
};

// Static method to generate order number
orderSchema.statics.generateOrderNumber = function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORD${year}${month}${day}${random}`;
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ orderStatus: status })
    .populate('user', 'name phone')
    .populate('items.product', 'name price images brand mainCategory subcategory')
    .sort({ createdAt: -1 });
};

// Static method to get orders for dashboard
orderSchema.statics.getDashboardOrders = function() {
  return this.find()
    .populate('user', 'name phone')
    .populate('items.product', 'name price images brand mainCategory subcategory')
    .sort({ createdAt: -1 })
    .limit(50);
};

module.exports = mongoose.model('Order', orderSchema);
