import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { productAPI } from '../services/api';
import { checkBackendConnection, checkAuthentication } from '../utils/networkCheck';

const ReviewOrderScreen = ({ navigation, route }) => {
  const { items, subtotal, deliveryCharge, total } = useCart();
  const { createOrder } = useOrder();
  const { paymentMethod = 'UPI', selectedAddress } = route.params || {};
  const [loading, setLoading] = useState(false);

  // Sample address if not provided
  const address = selectedAddress || {
    name: 'Riya Sharma',
    phone: '+91 98765 43210',
    address: '12B, Coral Heights, Linking Road, Bandra West, Mumbai, 400050',
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!items || items.length === 0) {
      Alert.alert('Error', 'Your cart is empty. Please add items to cart.');
      return;
    }

    setLoading(true);
    try {
      // Pre-flight checks
      console.log('🔍 Running pre-flight checks...');
      
      // Check authentication
      const authCheck = await checkAuthentication();
      if (!authCheck.authenticated) {
        Alert.alert('Authentication Required', authCheck.message || 'Please login to place an order');
        setLoading(false);
        return;
      }
      
      // Check backend connection (optional, can be skipped if slow)
      // const connectionCheck = await checkBackendConnection();
      // if (!connectionCheck.success) {
      //   Alert.alert('Connection Error', connectionCheck.message);
      //   setLoading(false);
      //   return;
      // }

      console.log('📦 Creating order with data:', {
        itemsCount: items.length,
        totalAmount: total,
        paymentMethod,
        hasAddress: !!selectedAddress
      });

      // Format address properly for backend
      // Parse address string to extract pincode, city, state if not provided
      const addressString = selectedAddress.address || selectedAddress.fullAddress || '';
      let parsedPincode = selectedAddress.pincode || selectedAddress.pinCode || '';
      let parsedCity = selectedAddress.city || '';
      let parsedState = selectedAddress.state || '';

      // Try to extract pincode from address string (6-digit number at the end)
      if (!parsedPincode && addressString) {
        const pincodeMatch = addressString.match(/\b\d{6}\b/);
        if (pincodeMatch) {
          parsedPincode = pincodeMatch[0];
        }
      }

      // Try to extract city and state from address string
      if (!parsedCity || !parsedState) {
        const addressParts = addressString.split(',').map(part => part.trim());
        // Usually format: "Street, Area, City, State, Pincode"
        if (addressParts.length >= 2) {
          if (!parsedCity && addressParts.length >= 3) {
            parsedCity = addressParts[addressParts.length - 2];
          }
          if (!parsedState && addressParts.length >= 2) {
            // Check if last part is pincode, then state is second last
            const lastPart = addressParts[addressParts.length - 1];
            if (lastPart.match(/^\d{6}$/)) {
              parsedState = addressParts[addressParts.length - 2] || 'Unknown';
              parsedCity = addressParts[addressParts.length - 3] || 'Unknown';
            } else {
              parsedState = addressParts[addressParts.length - 1] || 'Unknown';
            }
          }
        }
      }

      // Map addressType to backend enum (home, office, other)
      const addressTypeMap = {
        'Home': 'home',
        'Work': 'office',
        'Office': 'office',
        'Other': 'other',
        'home': 'home',
        'work': 'office',
        'office': 'office',
        'other': 'other'
      };

      const formattedAddress = {
        name: selectedAddress.name || selectedAddress.fullName || 'User',
        phone: (selectedAddress.phone || selectedAddress.mobile || '').replace(/[^0-9+]/g, ''), // Remove spaces
        address: addressString,
        pincode: parsedPincode || '000000',
        city: parsedCity || 'Unknown',
        state: parsedState || 'Unknown',
        landmark: selectedAddress.landmark || '',
        addressType: addressTypeMap[selectedAddress.addressType || selectedAddress.type] || 'home'
      };

      console.log('📍 Formatted address:', formattedAddress);

      // Ensure all required fields
      if (!formattedAddress.name || !formattedAddress.phone || !formattedAddress.address) {
        Alert.alert('Error', 'Please provide complete address details (name, phone, address)');
        setLoading(false);
        return;
      }

      const orderData = {
        items: items.map(item => {
          // Include full product data for demo products (those without proper ObjectIds)
          const itemData = {
            productId: item._id || item.productId || item.id,
            quantity: parseInt(item.quantity) || 1,
          };
          
          // If productId looks like a simple ID (not ObjectId), include product details
          const productIdStr = String(itemData.productId);
          if (productIdStr.length < 24 || !/^[0-9a-fA-F]{24}$/.test(productIdStr)) {
            // This is a demo product - include all product details
            itemData.productName = item.name;
            itemData.price = item.price;
            itemData.stock = item.stock || 999;
            itemData.images = item.images || (item.image ? [item.image] : []);
            itemData.brand = item.brand;
            itemData.mainCategory = item.mainCategory || item.category;
            itemData.subcategory = item.subcategory;
            console.log(`📦 Including demo product data for: ${item.name}`);
          }
          
          return itemData;
        }),
        deliveryAddress: formattedAddress,
        paymentMethod: paymentMethod || 'COD',
        orderNotes: `Payment via ${paymentMethod || 'COD'}`,
      };

      console.log('📦 Formatted order data:', JSON.stringify(orderData, null, 2));

      console.log('📦 Order Data:', JSON.stringify(orderData, null, 2));

      const result = await createOrder(orderData);
      
      console.log('✅ Order creation result:', result);
      
      if (result.success) {
        // Clear cart after successful order
        // This will be handled by PaymentSuccessScreen
        
        navigation.replace('PaymentSuccess', {
          orderId: result.data?.orderNumber || result.data?._id || 'MH' + Date.now(),
          totalAmount: total,
        });
      } else {
        Alert.alert(
          'Order Failed', 
          result.message || 'Failed to place order. Please try again.',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Retry', 
              onPress: () => handleConfirmOrder(),
              style: 'default'
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      
      // Show detailed error message
      let errorMessage = error.message || 'Failed to place order. Please try again.';
      
      // Provide helpful suggestions based on error
      if (errorMessage.includes('Network request failed') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed.\n\nPlease check:\n• Backend server is running\n• Internet connection is active\n• Correct API URL configured\n\nFor physical devices, use your computer\'s IP address instead of localhost.';
      }
      
      Alert.alert(
        'Order Failed',
        errorMessage,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Retry', 
            onPress: () => handleConfirmOrder(),
            style: 'default'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case 'UPI':
        return { name: 'UPI', details: 'ID ending in ••••1234' };
      case 'Card':
        return { name: 'Credit & Debit Cards', details: 'Card ending in ••••5678' };
      case 'Wallet':
        return { name: 'Wallets', details: 'Paytm Wallet' };
      case 'NetBanking':
        return { name: 'Net Banking', details: 'HDFC Bank' };
      case 'COD':
        return { name: 'Cash on Delivery', details: 'Pay on delivery' };
      default:
        return { name: 'UPI', details: 'ID ending in ••••1234' };
    }
  };

  const paymentDisplay = getPaymentMethodDisplay();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Delivery Address Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressName}>{address.name}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SelectAddress')}>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText}>{address.address}</Text>
            <Text style={styles.addressPhone}>{address.phone}</Text>
          </View>
        </View>

        {/* Payment Method Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentIconContainer}>
                {paymentMethod === 'UPI' ? (
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqTzEDuscuV8CnSq12YnoJRcJC3nxAiQbM4EiAQW7gqs82nmAtZRsLSmUayiHKTZ1gPlcU3i5IW8szTMraYUy_lDATTiArerIySZqTku0dHdQCoAtDzO3II0XMYkMm_mWht_sGI1XyHfdvhCLzFe0AN-uOiKxoHL9hAK27U8dfoeadRNYtUtFn7OUro760Owll9tfk-k8jxcrKWnS8RiexV_upIOBiHY3-ZHBOQw0gys2skerC51hOdAkrBfMYZBAj4Od0jE04BQ' }}
                    style={styles.paymentIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.paymentIconText}>
                    {paymentMethod === 'Card' ? '💳' : 
                     paymentMethod === 'Wallet' ? '👛' : 
                     paymentMethod === 'NetBanking' ? '🏦' : '💵'}
                  </Text>
                )}
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentMethodName}>{paymentDisplay.name}</Text>
                <Text style={styles.paymentMethodDetails}>{paymentDisplay.details}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('PaymentOptions', { totalAmount: total })}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummaryCard}>
            {/* Order Items */}
            <View style={styles.orderItems}>
              {items.map((item) => (
                <View key={item._id} style={styles.orderItem}>
                  <Image
                    source={{ uri: productAPI.getImageUrl(item.images?.[0]) }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Price Breakdown */}
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>₹{subtotal.toFixed(0)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery Fee</Text>
                <Text style={styles.priceValue}>₹{deliveryCharge.toFixed(0)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#333333',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    paddingRight: 24,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
    lineHeight: 20,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9933',
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  paymentIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 32,
    height: 32,
  },
  paymentIconText: {
    fontSize: 24,
  },
  paymentDetails: {
    flex: 1,
    gap: 2,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  paymentMethodDetails: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
  },
  orderSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  orderItems: {
    gap: 16,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  itemQuantity: {
    fontSize: 12,
    fontWeight: '400',
    color: '#808080',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  priceBreakdown: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9933',
  },
  bottomSpacing: {
    height: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FF9933',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ReviewOrderScreen;

