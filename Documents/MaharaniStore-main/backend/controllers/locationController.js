const User = require('../models/user');

// Reverse Geocode - Convert coordinates to address
const reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Using OpenStreetMap Nominatim API for reverse geocoding (free, no API key needed)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MaharaniStore/1.0' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();
    
    // Extract address components
    const address = data.address || {};
    const locationName = address.suburb || address.neighbourhood || address.village || address.town || address.city || 'Unknown Location';
    const city = address.city || address.town || address.county || 'Unknown City';
    const state = address.state || address.region || 'Unknown State';
    const pincode = address.postcode || '';
    const fullAddress = data.display_name || `${locationName}, ${city}`;

    res.json({
      success: true,
      data: {
        location: `${locationName}, ${city}`,
        fullLocation: fullAddress,
        city,
        state,
        pincode,
        coordinates: {
          latitude,
          longitude
        },
        addressComponents: address
      }
    });

  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location',
      error: error.message
    });
  }
};

// Update user's current location
const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { latitude, longitude, location, city, state, pincode } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store location in user preferences or create a location field
    user.currentLocation = {
      latitude,
      longitude,
      location: location || `${city || 'Unknown'}, ${state || 'Unknown'}`,
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      updatedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: user.currentLocation.location,
        city: user.currentLocation.city,
        state: user.currentLocation.state
      }
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Get user's current location
const getUserLocation = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('currentLocation');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.currentLocation || !user.currentLocation.location) {
      return res.json({
        success: true,
        data: {
          location: null,
          message: 'No location set'
        }
      });
    }

    res.json({
      success: true,
      data: {
        location: user.currentLocation.location,
        city: user.currentLocation.city,
        state: user.currentLocation.state,
        pincode: user.currentLocation.pincode,
        coordinates: {
          latitude: user.currentLocation.latitude,
          longitude: user.currentLocation.longitude
        }
      }
    });

  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location',
      error: error.message
    });
  }
};

module.exports = {
  reverseGeocode,
  updateUserLocation,
  getUserLocation
};

