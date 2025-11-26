import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  TextInput
} from 'react-native';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { addToCart, isInCart, getCartQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Delivery information
  const deliveryInfo = {
    deliveryRadius: '10km',
    freeDeliveryAbove: 500,
    deliveryCharge: 30
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading product:', productId);
      
      const result = await productAPI.getProductById(productId);
      console.log('📦 API Response:', result);
      
      if (result && result.success && result.data) {
        const productData = result.data;
        console.log('✅ Product loaded successfully:', {
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          category: `${productData.mainCategory} - ${productData.subcategory}`,
          images: productData.images?.length || 0
        });
        
        setProduct(productData);
      } else {
        throw new Error(result?.message || 'Product data not found');
      }
    } catch (error) {
      console.error('❌ Error loading product:', error);
      Alert.alert(
        'Error', 
        `Failed to load product details: ${error.message}`,
        [
          { text: 'Retry', onPress: loadProduct },
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const stock = product?.stock || 0;
    if (stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock');
      return;
    }
    
    if (!deliveryAvailable) {
      Alert.alert('Delivery Not Available', 'This product is not available for delivery in your area. Please call the shop directly.');
      return;
    }
    
    addToCart(product);
    Alert.alert(
      'Added to Cart', 
      `${product.name || 'Product'} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  const handleAddToWishlist = async () => {
    try {
      if (isInWishlist(product._id)) {
        console.log('🗑️ Removing product from wishlist');
        const result = await removeFromWishlist(product._id);
        if (result.success) {
          Alert.alert('Removed', `${product.name || 'Product'} has been removed from your wishlist!`);
        } else {
          Alert.alert('Error', result.message || 'Failed to remove from wishlist');
        }
      } else {
        console.log('💝 Adding product to wishlist');
        const result = await addToWishlist(product);
        if (result.success) {
          Alert.alert('Added to Wishlist', `${product.name || 'Product'} has been added to your wishlist!`);
        } else {
          Alert.alert('Error', result.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
    }
  };


  const handleShare = () => {
    Alert.alert('Share Product', `Share ${product.name} with friends!`);
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      // Simple pincode validation for demo
      const validPincodes = ['110001', '110002', '110003', '400001', '400002'];
      const isAvailable = validPincodes.includes(pincode);
      setDeliveryAvailable(isAvailable);
      
      if (isAvailable) {
        Alert.alert('Delivery Available', 'We deliver to your area!');
      } else {
        Alert.alert('Delivery Not Available', 'We don\'t deliver to this pincode yet. Please call the shop directly.');
      }
    } else {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode');
    }
  };

  const getDeliveryTime = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 18) {
      return '30 mins';
    } else if (hour >= 18 && hour < 21) {
      return '1 hour';
    } else {
      return '2 hours';
    }
  };

  const getStockStatus = () => {
    const stock = product?.stock || 0;
    if (stock === 0) return { text: 'Out of stock', color: '#EF4444', badge: 'Out of Stock' };
    if (stock <= 5) return { text: `Only ${stock} left`, color: '#F59E0B', badge: 'Limited' };
    return { text: `${stock} available`, color: '#10B981', badge: 'In Stock' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stockStatus = getStockStatus();

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
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistButton} onPress={handleAddToWishlist}>
            <Text style={[
              styles.wishlistButtonText,
              isInWishlist(product._id) && styles.wishlistActive
            ]}>
              {isInWishlist(product._id) ? '❤️' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image with Badges */}
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 && !imageError ? (
            <Image
              source={{ uri: productAPI.getImageUrl(product.images[0]) }}
              style={styles.productImage}
              resizeMode="cover"
              onError={() => {
                console.log('Image failed to load, showing placeholder');
                setImageError(true);
              }}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📦</Text>
              <Text style={styles.placeholderSubtext}>
                {imageError ? 'Image Failed to Load' : 'No Image Available'}
              </Text>
            </View>
          )}
          
          {/* Stock Badge */}
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.stockBadgeText}>{stockStatus.badge}</Text>
          </View>

          {/* Freshness Badge */}
          <View style={styles.freshnessBadge}>
            <Text style={styles.freshnessBadgeText}>Fresh Today</Text>
          </View>

          {/* Local Badge */}
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>Local Product</Text>
          </View>
        </View>


        {/* Delivery Information */}
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryTitle}>🚚 Delivery Information</Text>
          
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Delivery Time:</Text>
              <Text style={styles.deliveryValue}>{getDeliveryTime()}</Text>
            </View>
            
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Delivery Area:</Text>
              <Text style={styles.deliveryValue}>Within {deliveryInfo.deliveryRadius}</Text>
            </View>
            
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Delivery Charge:</Text>
              <Text style={styles.deliveryValue}>
                {deliveryInfo.freeDeliveryAbove ? `Free above ₹${deliveryInfo.freeDeliveryAbove}` : `₹${deliveryInfo.deliveryCharge}`}
              </Text>
            </View>
          </View>

          {/* Pincode Check */}
          <View style={styles.pincodeContainer}>
            <Text style={styles.pincodeLabel}>Check delivery to your area:</Text>
            <View style={styles.pincodeInputContainer}>
              <TextInput
                style={styles.pincodeInput}
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={styles.checkButton} onPress={checkDelivery}>
                <Text style={styles.checkButtonText}>Check</Text>
              </TouchableOpacity>
            </View>
            {pincode.length === 6 && (
              <Text style={[
                styles.deliveryStatus,
                { color: deliveryAvailable ? '#10B981' : '#EF4444' }
              ]}>
                {deliveryAvailable ? '✅ Delivery Available' : '❌ Delivery Not Available'}
              </Text>
            )}
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name || 'Product Name'}</Text>
          {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price || '0'}</Text>
            <Text style={styles.unit}>per {product.unit || 'piece'}</Text>
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category:</Text>
            <Text style={styles.categoryText}>
              {product.mainCategory || 'General'} - {product.subcategory || 'Category'}
            </Text>
          </View>

          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Stock:</Text>
            <Text style={[styles.stockText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>

          {product.description && (
            <>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              ((product?.stock || 0) === 0 || !deliveryAvailable) && styles.disabledButton
            ]}
            onPress={handleAddToCart}
            disabled={(product?.stock || 0) === 0 || !deliveryAvailable}
          >
            <Text style={[
              styles.addToCartButtonText,
              ((product?.stock || 0) === 0 || !deliveryAvailable) && styles.disabledButtonText
            ]}>
              {(product?.stock || 0) === 0 ? 'Out of Stock' : 
               !deliveryAvailable ? 'Delivery Not Available' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    padding: 5,
    marginRight: 10,
  },
  shareButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  wishlistButton: {
    padding: 5,
  },
  wishlistButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  wishlistActive: {
    color: '#EF4444',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#fff',
    marginBottom: 10,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  stockBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  freshnessBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  freshnessBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  localBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: '#6200EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  localBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deliveryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  deliveryInfo: {
    marginBottom: 20,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deliveryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  deliveryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pincodeContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  pincodeLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  pincodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pincodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },
  checkButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deliveryStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  unit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  stockContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stockLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actionButtons: {
    padding: 20,
  },
  addToCartButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProductDetailScreen;
