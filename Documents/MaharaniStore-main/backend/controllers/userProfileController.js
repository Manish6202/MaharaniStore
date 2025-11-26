const User = require('../models/user');
const Address = require('../models/address');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-otp -otpExpiry -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, dateOfBirth, gender } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender) updateData.gender = gender;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-otp -otpExpiry -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get user addresses
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const addresses = await Address.find({ user: userId, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      data: addresses,
      message: 'Addresses retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get addresses',
      error: error.message
    });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, name, phone, address, landmark, city, state, pincode, isDefault } = req.body;

    // Create new address
    const newAddress = new Address({
      user: userId,
      type,
      name,
      phone,
      address,
      landmark,
      city,
      state,
      pincode,
      isDefault: isDefault || false
    });

    await newAddress.save();

    res.json({
      success: true,
      data: newAddress,
      message: 'Address added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const updateData = req.body;

    // Remove isDefault from updateData to handle it separately
    const { isDefault, ...otherUpdates } = updateData;

    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      otherUpdates,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Handle default address setting
    if (isDefault !== undefined) {
      if (isDefault) {
        await address.setAsDefault();
      } else {
        address.isDefault = false;
        await address.save();
      }
    }

    res.json({
      success: true,
      data: address,
      message: 'Address updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      { isActive: false },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const address = await Address.findOne({ _id: addressId, user: userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.setAsDefault();

    res.json({
      success: true,
      data: address,
      message: 'Default address set successfully'
    });
  } catch (error) {
    console.error('❌ Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get basic user stats (can be extended with order data later)
    const user = await User.findById(userId).select('createdAt');
    const addresses = await Address.countDocuments({ user: userId, isActive: true });
    
    const stats = {
      memberSince: user.createdAt,
      totalAddresses: addresses,
      totalOrders: 0, // Will be implemented with order system
      totalSpent: 0   // Will be implemented with order system
    };

    res.json({
      success: true,
      data: stats,
      message: 'User statistics retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserStats
};
