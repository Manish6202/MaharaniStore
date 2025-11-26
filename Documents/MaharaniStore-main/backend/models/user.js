const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  streetAddress: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{5}$/
  },
  landmark: {
    type: String,
    default: ''
  },
  addressType: {
    type: String,
    enum: ['Home', 'Office', 'Other'],
    default: 'Home'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  addresses: [addressSchema],
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  firebaseUID: {
    type: String,
    default: ''
  },
  deviceInfo: {
    deviceId: String,
    deviceType: String,
    osVersion: String,
    appVersion: String
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    },
    notifications: {
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      shareData: {
        type: Boolean,
        default: false
      },
      marketing: {
        type: Boolean,
        default: false
      }
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  loginHistory: [{
    loginTime: {
      type: Date,
      default: Date.now
    },
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      osVersion: String
    },
    location: {
      ip: String,
      city: String,
      state: String
    }
  }],
  blockedUntil: {
    type: Date,
    default: null
  },
  blockedReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full address
userSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

// Method to add new address
userSchema.methods.addAddress = function(addressData) {
  if (this.addresses.length === 0 || addressData.isDefault) {
    this.addresses.forEach(addr => addr.isDefault = false);
    addressData.isDefault = true;
  }
  
  this.addresses.push(addressData);
  return this.save();
};

// Method to update address
userSchema.methods.updateAddress = function(addressId, updateData) {
  const address = this.addresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }
  
  if (updateData.isDefault) {
    this.addresses.forEach(addr => addr.isDefault = false);
  }
  
  Object.assign(address, updateData);
  return this.save();
};

// Method to delete address
userSchema.methods.deleteAddress = function(addressId) {
  const address = this.addresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }
  
  const wasDefault = address.isDefault;
  address.remove();
  
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }
  
  return this.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = function(deviceInfo, location) {
  this.lastLogin = new Date();
  
  this.loginHistory.unshift({
    loginTime: this.lastLogin,
    deviceInfo,
    location
  });
  
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(0, 10);
  }
  
  return this.save();
};

// Method to block user
userSchema.methods.blockUser = function(blockUntil, reason) {
  this.isActive = false;
  this.blockedUntil = blockUntil;
  this.blockedReason = reason;
  return this.save();
};

// Method to unblock user
userSchema.methods.unblockUser = function() {
  this.isActive = true;
  this.blockedUntil = null;
  this.blockedReason = '';
  return this.save();
};

// Method to check if user is blocked
userSchema.methods.isBlocked = function() {
  if (!this.blockedUntil) return false;
  return new Date() < this.blockedUntil;
};

// Static method to find user by phone
userSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone, isActive: true });
};

// Static method to get user statistics
userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        blockedUsers: { $sum: { $cond: ['$blockedUntil', 1, 0] } }
      }
    }
  ]);
};

// Pre-save middleware to ensure only one default address
userSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      this.addresses.forEach((addr, index) => {
        addr.isDefault = index === 0;
      });
    }
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
