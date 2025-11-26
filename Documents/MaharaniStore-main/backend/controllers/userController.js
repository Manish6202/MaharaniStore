const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    console.log('Send OTP request received:', req.body);
    const { phone } = req.body;

    // Validate phone number
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({
        phone,
        name: `User_${phone}`, // Default name
        isVerified: false
      });
    }

    // Store OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Log OTP for testing
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        otp: otp // Remove this in production
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    console.log('Verify OTP request received:', req.body);
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check OTP
    console.log('🔍 OTP Comparison:', {
      storedOTP: user.otp,
      receivedOTP: otp,
      storedType: typeof user.otp,
      receivedType: typeof otp,
      areEqual: user.otp === otp,
      strictEqual: user.otp === otp.toString(),
      looseEqual: user.otp == otp
    });
    
    // Convert both to strings for comparison
    if (user.otp.toString() !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update user
    user.isVerified = true;
    user.lastLogin = new Date();
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Fetch complete user profile after update
    const completeUser = await User.findById(user._id).select('-otp -otpExpiry -__v');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        phone: user.phone 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    console.log('✅ Login successful for:', phone);
    console.log('📊 Complete user data:', {
      id: completeUser._id,
      name: completeUser.name,
      phone: completeUser.phone,
      email: completeUser.email,
      isVerified: completeUser.isVerified
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: completeUser._id,
          name: completeUser.name,
          phone: completeUser.phone,
          email: completeUser.email,
          profileImage: completeUser.profileImage,
          dateOfBirth: completeUser.dateOfBirth,
          gender: completeUser.gender,
          isVerified: completeUser.isVerified,
          preferences: completeUser.preferences
        }
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-otp -otpExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          isVerified: user.isVerified,
          addresses: user.addresses
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  getUserProfile
};
