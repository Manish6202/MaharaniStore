import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const PriceSummary = ({ 
  subtotal, 
  deliveryCharge, 
  tax, 
  total, 
  onProceedToCheckout,
  onContinueShopping,
  itemCount 
}) => {
  const isFreeDelivery = deliveryCharge === 0;

  return (
    <View style={styles.container}>
      {/* Price Breakdown */}
      <View style={styles.priceBreakdown}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal ({itemCount} items)</Text>
          <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charges</Text>
          <Text style={[
            styles.priceValue,
            isFreeDelivery && styles.freeDeliveryText
          ]}>
            {isFreeDelivery ? 'FREE' : `₹${deliveryCharge}`}
          </Text>
        </View>

        {isFreeDelivery && (
          <View style={styles.freeDeliveryNote}>
            <Text style={styles.freeDeliveryNoteText}>
              🎉 You saved ₹50 on delivery!
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>GST (18%)</Text>
          <Text style={styles.priceValue}>₹{tax.toFixed(2)}</Text>
        </View>

        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinueShopping}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={onProceedToCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        <Text style={styles.infoText}>
          💳 Secure payment with multiple options
        </Text>
        <Text style={styles.infoText}>
          🚚 Free delivery on orders above ₹500
        </Text>
        <Text style={styles.infoText}>
          🔄 Easy returns within 7 days
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  priceBreakdown: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  freeDeliveryText: {
    color: '#10B981',
    fontWeight: '600',
  },
  freeDeliveryNote: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  freeDeliveryNoteText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  checkoutButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#6200EE',
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  additionalInfo: {
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default PriceSummary;
