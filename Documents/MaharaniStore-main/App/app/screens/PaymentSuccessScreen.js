import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useCart } from '../context/CartContext';

const PaymentSuccessScreen = ({ navigation, route }) => {
  const { clearCart } = useCart();
  const { orderId = 'MH120923', totalAmount = 1249 } = route.params || {};
  
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Clear cart on success
    clearCart();
    
    // Animate success icon
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleViewOrderDetails = () => {
    navigation.navigate('Orders');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleContinueShopping}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>
        </Animated.View>

        {/* Headline */}
        <Text style={styles.headline}>Order Placed!</Text>

        {/* Body Text */}
        <Text style={styles.bodyText}>
          Thank you for your purchase! Your Order ID is #{orderId}. A confirmation receipt has been sent to your email.
        </Text>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValue}>#{orderId}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total Amount</Text>
            <Text style={styles.orderValue}>₹{totalAmount.toLocaleString('en-IN')}.00</Text>
          </View>
        </View>

        {/* Primary Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinueShopping}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>

        {/* Secondary Link */}
        <TouchableOpacity
          style={styles.secondaryLink}
          onPress={handleViewOrderDetails}
        >
          <Text style={styles.secondaryLinkText}>View Order Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#212121',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255, 153, 51, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#616161',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
    lineHeight: 24,
  },
  orderCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  orderLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#616161',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#FF9933',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.015,
  },
  secondaryLink: {
    width: '100%',
    maxWidth: 400,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9933',
    letterSpacing: 0.015,
  },
});

export default PaymentSuccessScreen;

