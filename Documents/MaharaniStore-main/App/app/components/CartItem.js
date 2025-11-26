import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { productAPI } from '../services/api';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => onRemoveItem(item._id) }
        ]
      );
    } else if (newQuantity > item.stock) {
      Alert.alert('Stock Limit', `Only ${item.stock} items available in stock`);
    } else {
      onUpdateQuantity(item._id, newQuantity);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: productAPI.getImageUrl(item.images?.[0]) }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productUnit}>per {item.unit}</Text>
        
        {/* Stock Status */}
        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockText,
            { color: item.stock > 0 ? (item.stock < 5 ? '#F59E0B' : '#10B981') : '#EF4444' }
          ]}>
            {item.stock === 0 ? 'Out of stock' : 
             item.stock < 5 ? `Only ${item.stock} left` : 
             `${item.stock} available`}
          </Text>
        </View>

        {/* Price and Quantity Controls */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
            <Text style={styles.itemTotal}>Total: ₹{itemTotal}</Text>
          </View>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
              onPress={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Text style={[
                styles.quantityButtonText,
                item.quantity <= 1 && styles.disabledButtonText
              ]}>-</Text>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>

            <TouchableOpacity
              style={[styles.quantityButton, item.quantity >= item.stock && styles.disabledButton]}
              onPress={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.stock}
            >
              <Text style={[
                styles.quantityButtonText,
                item.quantity >= item.stock && styles.disabledButtonText
              ]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemoveItem(item._id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  productUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  stockContainer: {
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: 'bold',
  },
});

export default CartItem;
