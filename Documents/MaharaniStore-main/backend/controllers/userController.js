const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

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

// Google Sign-In
const googleSignIn = async (req, res) => {
  try {
    console.log('Google Sign-In request received');
    const { idToken, email, name, photo } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID || '162510882944-3f13n50tfri94aa0it7r0vlfm8k6pvsh.apps.googleusercontent.com');

    // Verify the ID token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_WEB_CLIENT_ID || '162510882944-3f13n50tfri94aa0it7r0vlfm8k6pvsh.apps.googleusercontent.com',
      });
    } catch (error) {
      console.error('Google token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const googleEmail = payload.email || email;
    const googleName = payload.name || name;
    const googlePhoto = payload.picture || photo;

    console.log('Google user verified:', {
      googleId,
      email: googleEmail,
      name: googleName
    });

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: googleEmail },
        { firebaseUID: googleId }
      ]
    });

    if (!user) {
      // Create new user with Google account
      user = new User({
        name: googleName || 'Google User',
        email: googleEmail,
        phone: '', // Google users might not have phone
        firebaseUID: googleId,
        profileImage: googlePhoto || '',
        isVerified: true, // Google accounts are pre-verified
        isActive: true
      });
      await user.save();
      console.log('✅ New Google user created:', user._id);
    } else {
      // Update existing user
      if (!user.firebaseUID) {
        user.firebaseUID = googleId;
      }
      if (googlePhoto && !user.profileImage) {
        user.profileImage = googlePhoto;
      }
      if (googleName && user.name === `User_${user.phone}`) {
        user.name = googleName;
      }
      user.lastLogin = new Date();
      user.isVerified = true;
      await user.save();
      console.log('✅ Google user updated:', user._id);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        phone: user.phone 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Fetch complete user profile
    const completeUser = await User.findById(user._id).select('-otp -otpExpiry -__v');

    res.status(200).json({
      success: true,
      message: 'Google sign-in successful',
      data: {
        token,
        user: {
          id: completeUser._id,
          name: completeUser.name,
          phone: completeUser.phone,
          email: completeUser.email,
          profileImage: completeUser.profileImage,
          isVerified: completeUser.isVerified,
          preferences: completeUser.preferences
        }
      }
    });

  } catch (error) {
    console.error('Google Sign-In error:', error);
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
  googleSignIn,
  getUserProfile
};
