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
} from 'react-native';
import { useCart } from '../context/CartContext';

const PaymentOptionsScreen = ({ navigation, route }) => {
  const { total, subtotal, deliveryCharge, tax } = useCart();
  const { totalAmount: routeTotalAmount, selectedAddress } = route.params || {};
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  
  // Use cart total if available and > 0, otherwise use route param
  const totalAmount = (total && total > 0) ? total : (routeTotalAmount || 0);
  
  useEffect(() => {
    console.log('💳 PaymentOptions - Total Amount:', {
      cartTotal: total,
      routeTotal: routeTotalAmount,
      finalTotal: totalAmount,
      subtotal,
      deliveryCharge,
      tax,
    });
  }, [total, routeTotalAmount, totalAmount, subtotal, deliveryCharge, tax]);

  const paymentMethods = [
    {
      id: 'UPI',
      name: 'UPI',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCejOJUN7NStpKCe-c0Xe7xF0f6dFRgmJyX7fJ9aq4mLmB0hYL-wu1U-0NkPCWM3f1w-FaaMbLjQ6ozRiCQuHUTohZuDt-0p5a8Ul9s3xCVWqM8AZpDz_DDiRABmZF0okJph3wEw3CNag23OKeS-9vUqsidqvtqX7WoEMwLL8TLEYA6cxgzcZfzQfz830Tb-58hTH4n9Fg-W1Kn7go5VqLw1s5LrBE6p8UNYVFle4CMbf2uk8JyZ6MCIEp4zsLJsCDcvc8fdThhlQ',
      isRecommended: true,
    },
    {
      id: 'Card',
      name: 'Credit & Debit Cards',
      icon: 'credit_card',
      isRecommended: false,
    },
    {
      id: 'Wallet',
      name: 'Wallets',
      icon: 'account_balance_wallet',
      isRecommended: false,
    },
    {
      id: 'NetBanking',
      name: 'Net Banking',
      icon: 'account_balance',
      isRecommended: false,
    },
    {
      id: 'COD',
      name: 'Cash on Delivery (COD)',
      icon: 'payments',
      isRecommended: false,
    },
  ];

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
  };

  const handlePay = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address first');
      navigation.navigate('SelectAddress', {
        totalAmount: total || 0,
      });
      return;
    }
    
    if (totalAmount === 0) {
      Alert.alert('Error', 'Cart is empty. Please add items to cart.');
      return;
    }
    
    // Navigate to review order
    navigation.navigate('ReviewOrder', {
      paymentMethod: selectedPayment,
      totalAmount,
      selectedAddress,
    });
  };

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
        <Text style={styles.headerTitle}>Payment Options</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Total Amount Banner */}
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>Total Amount to Pay</Text>
          <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        {/* Recommended Section */}
        <Text style={styles.sectionTitle}>Recommended</Text>
        <View style={styles.paymentMethodsList}>
          {paymentMethods
            .filter(method => method.isRecommended)
            .map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPayment === method.id && styles.paymentMethodCardSelected
                ]}
                onPress={() => handlePaymentSelect(method.id)}
              >
                <View style={styles.paymentIconContainer}>
                  {method.icon.startsWith('http') ? (
                    <Image
                      source={{ uri: method.icon }}
                      style={styles.paymentIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.paymentIconText}>{method.icon === 'credit_card' ? '💳' : method.icon === 'account_balance_wallet' ? '👛' : method.icon === 'account_balance' ? '🏦' : '💵'}</Text>
                  )}
                </View>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radio,
                    selectedPayment === method.id && styles.radioSelected
                  ]}>
                    {selectedPayment === method.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* All Options Section */}
        <Text style={[styles.sectionTitle, styles.allOptionsTitle]}>All Options</Text>
        <View style={styles.paymentMethodsList}>
          {paymentMethods
            .filter(method => !method.isRecommended)
            .map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPayment === method.id && styles.paymentMethodCardSelected
                ]}
                onPress={() => handlePaymentSelect(method.id)}
              >
                <View style={[styles.paymentIconContainer, styles.paymentIconContainerGray]}>
                  <Text style={styles.paymentIconText}>
                    {method.icon === 'credit_card' ? '💳' : 
                     method.icon === 'account_balance_wallet' ? '👛' : 
                     method.icon === 'account_balance' ? '🏦' : '💵'}
                  </Text>
                </View>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radio,
                    selectedPayment === method.id && styles.radioSelected
                  ]}>
                    {selectedPayment === method.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.securityInfo}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>100% Secure Payments</Text>
        </View>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePay}
        >
          <Text style={styles.payButtonText}>Pay ₹{totalAmount.toLocaleString('en-IN')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FDFDFD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#212121',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 200,
  },
  totalBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#616161',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF9933',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  allOptionsTitle: {
    paddingTop: 24,
  },
  paymentMethodsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentMethodCardSelected: {
    borderWidth: 1,
    borderColor: '#FF9933',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconContainerGray: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  paymentIcon: {
    width: 32,
    height: 32,
  },
  paymentIconText: {
    fontSize: 24,
  },
  paymentMethodName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  radioContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#FF9933',
    borderWidth: 6,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9933',
  },
  bottomSpacing: {
    height: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FDFDFD',
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#616161',
  },
  payButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FF9933',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PaymentOptionsScreen;

