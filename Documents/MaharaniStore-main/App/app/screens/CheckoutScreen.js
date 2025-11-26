import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { userProfileAPI } from '../services/api';

const CheckoutScreen = ({ navigation }) => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrder();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const result = await userProfileAPI.getAddresses();
      if (result.success && result.data.length > 0) {
        setAddresses(result.data);
        // Select default address or first address
        const defaultAddr = result.data.find(addr => addr.isDefault) || result.data[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          landmark: selectedAddress.landmark,
          pincode: selectedAddress.pincode,
          city: selectedAddress.city,
          state: selectedAddress.state,
          addressType: selectedAddress.addressType
        },
        orderNotes,
        paymentMethod: 'cod'
      };

      const result = await createOrder(orderData);
      
      if (result.success) {
        // Clear cart after successful order
        clearCart();
        
        Alert.alert(
          'Order Placed Successfully!',
          `Your order #${result.data.orderNumber} has been placed. You will receive a confirmation call soon.`,
          [
            {
              text: 'View Orders',
              onPress: () => navigation.navigate('Orders')
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAddressItem = (address) => (
    <TouchableOpacity
      key={address._id}
      style={[
        styles.addressItem,
        selectedAddress?._id === address._id && styles.selectedAddress
      ]}
      onPress={() => setSelectedAddress(address)}
    >
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{address.name}</Text>
        <Text style={styles.addressType}>{address.addressType}</Text>
      </View>
      <Text style={styles.addressText}>{address.address}</Text>
      {address.landmark && (
        <Text style={styles.landmarkText}>Near {address.landmark}</Text>
      )}
      <Text style={styles.addressDetails}>
        {address.city}, {address.state} - {address.pincode}
      </Text>
      <Text style={styles.phoneText}>{address.phone}</Text>
    </TouchableOpacity>
  );

  const renderOrderItem = (item) => (
    <View key={item._id} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          {item.unit} • Qty: {item.quantity}
        </Text>
      </View>
      <Text style={styles.itemPrice}>₹{item.total}</Text>
    </View>
  );

  const calculateDeliveryCharge = () => {
    return totalAmount >= 500 ? 0 : 30;
  };

  const calculateTax = () => {
    return Math.round(totalAmount * 0.05);
  };

  const calculateFinalTotal = () => {
    const deliveryCharge = calculateDeliveryCharge();
    const tax = calculateTax();
    return totalAmount + deliveryCharge + tax;
  };

  if (loadingAddresses) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.length > 0 ? (
            <View style={styles.addressesList}>
              {addresses.map(renderAddressItem)}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('AddAddress')}
            >
              <Text style={styles.addAddressButtonText}>+ Add Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {items.map(renderOrderItem)}
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special instructions for your order..."
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{totalAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charge</Text>
              <Text style={styles.summaryValue}>
                {calculateDeliveryCharge() === 0 ? 'FREE' : `₹${calculateDeliveryCharge()}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5% GST)</Text>
              <Text style={styles.summaryValue}>₹{calculateTax()}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{calculateFinalTotal()}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>Cash on Delivery (COD)</Text>
            <Text style={styles.paymentMethodSubtext}>
              Pay when your order is delivered
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.placeOrderContainer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!selectedAddress || loading) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={!selectedAddress || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order - ₹{calculateFinalTotal()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  addressesList: {
    gap: 12,
  },
  addressItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#F9FAFB',
  },
  selectedAddress: {
    borderColor: '#6200EE',
    backgroundColor: '#F3F0FF',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  addressType: {
    fontSize: 12,
    color: '#6200EE',
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  landmarkText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  addressDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#6B7280',
  },
  addAddressButton: {
    borderWidth: 2,
    borderColor: '#6200EE',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  addAddressButtonText: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
  },
  summaryContainer: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  paymentMethod: {
    padding: 15,
    backgroundColor: '#F3F0FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 2,
  },
  paymentMethodSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 100,
  },
  placeOrderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  placeOrderButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
