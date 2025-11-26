import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import { productAPI } from '../services/api';

const WishlistScreen = ({ navigation }) => {
  const {
    items,
    totalItems,
    loading,
    error,
    removeFromWishlist,
    clearWishlist,
    syncWithBackend,
  } = useWishlist();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Only sync with backend if user is authenticated
    // The syncWithBackend function will handle auth errors gracefully
    syncWithBackend();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncWithBackend();
    setRefreshing(false);
  };

  const handleRemoveItem = (productId, productName) => {
    Alert.alert(
      'Remove from Wishlist',
      `Are you sure you want to remove "${productName}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => removeFromWishlist(productId) 
        }
      ]
    );
  };

  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: () => clearWishlist() 
        }
      ]
    );
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleAddToCart = (product) => {
    // Navigate to product detail where user can add to cart
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const renderEmptyWishlist = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💝</Text>
      <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
      <Text style={styles.emptySubtitle}>
        Save your favorite products to see them here!
      </Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopNowButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWishlistItem = ({ item }) => {
    // Debug logging
    console.log('🎨 Rendering wishlist item:', {
      _id: item._id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      unit: item.unit,
      brand: item.brand,
      mainCategory: item.mainCategory,
      subcategory: item.subcategory,
      images: item.images
    });

    return (
    <View style={styles.wishlistItem}>
      {/* Product Image */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => handleProductPress(item)}
      >
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: productAPI.getImageUrl(item.images[0]) }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              console.log('❌ Image failed to load for:', item.name);
              setImageError && setImageError(true);
            }}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || 'Product Name'}
          </Text>
          {item.brand && <Text style={styles.productBrand}>{item.brand}</Text>}
          <Text style={styles.productCategory}>
            {item.mainCategory || 'General'} • {item.subcategory || 'Category'}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{item.price || '0'}</Text>
            <Text style={styles.productUnit}>per {item.unit || 'piece'}</Text>
          </View>

          <View style={styles.stockContainer}>
            <Text style={[
              styles.stockText,
              { color: (item.stock || 0) > 0 ? ((item.stock || 0) < 5 ? '#F59E0B' : '#10B981') : '#EF4444' }
            ]}>
              {(item.stock || 0) === 0 ? 'Out of stock' : 
               (item.stock || 0) < 5 ? `Only ${item.stock} left` : 
               `${item.stock} available`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
            disabled={item.stock === 0}
          >
            <Text style={[
              styles.addToCartButtonText,
              item.stock === 0 && styles.disabledButtonText
            ]}>
              {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item._id, item.name)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSubtitle}>
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </Text>
      </View>
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearWishlist}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Only show error if it's not an authentication error
  if (error && !error.includes('Access denied')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => syncWithBackend()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {items.length === 0 ? (
        renderEmptyWishlist()
      ) : (
        <FlatList
          data={items}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6200EE']}
              tintColor="#6200EE"
            />
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  listContainer: {
    padding: 16,
  },
  wishlistItem: {
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
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#9CA3AF',
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
  productCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  productUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  stockContainer: {
    marginBottom: 12,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  shopNowButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WishlistScreen;