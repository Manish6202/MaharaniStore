import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';

const WishlistScreen = ({ navigation }) => {
  const { items, loading, syncWithBackend, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    syncWithBackend();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncWithBackend();
    setRefreshing(false);
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }
    addToCart(product);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((item) => item.stock > 0);
    if (inStockItems.length === 0) {
      Alert.alert('No Items Available', 'All items in your wishlist are out of stock.');
      return;
    }
    inStockItems.forEach((item) => addToCart(item));
    Alert.alert('Added to Cart', `${inStockItems.length} item(s) added to your cart.`);
  };

  const handleRemoveItem = (productId, productName) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${productName}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWishlist(productId),
        },
      ]
    );
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const renderProductCard = (item, isFirst = false) => {
    const imageUrl = item.images?.[0]
      ? productAPI.getImageUrl(item.images[0])
      : 'https://via.placeholder.com/96';
    const isOutOfStock = item.stock === 0;
    const hasDiscount = item.originalPrice && item.originalPrice > item.price;

    return (
      <View
        key={item._id}
        style={[
          styles.productCard,
          isOutOfStock && styles.productCardDisabled,
          isFirst && styles.firstProductCard,
        ]}
      >
        <TouchableOpacity
          style={styles.productImageContainer}
          onPress={() => handleProductPress(item)}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <Text style={styles.productBrand}>{item.brand || 'Brand'}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name || 'Product Name'}
            </Text>
            <View style={styles.priceContainer}>
              {hasDiscount ? (
                <>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                </>
              ) : (
                <Text style={styles.productPrice}>₹{item.price || '0'}</Text>
              )}
            </View>
          </TouchableOpacity>

          {isOutOfStock ? (
            <View style={styles.outOfStockButton}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addToCartIcon}>🛒</Text>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveItem(item._id, item.name)}
        >
          <Text style={styles.favoriteIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const inStockCount = items.filter((item) => item.stock > 0).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>My Wishlist</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filters/Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Sort by Price</Text>
            <Text style={styles.filterChipArrow}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>In Stock</Text>
            <Text style={styles.filterChipArrow}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>On Sale</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          items.length === 0 && styles.scrollContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF9933']}
            tintColor="#FF9933"
          />
        }
      >
        {loading && items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9933" />
            <Text style={styles.loadingText}>Loading wishlist...</Text>
          </View>
        ) : items.length > 0 ? (
          items.map((item, index) => renderProductCard(item, index === 0))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>❤️</Text>
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Let's find something you'll love!</Text>
            <TouchableOpacity
              style={styles.startShoppingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer CTA */}
      {items.length > 0 && inStockCount > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addAllButton}
            onPress={handleAddAllToCart}
          >
            <Text style={styles.addAllButtonText}>
              Add All to Cart ({inStockCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  safeAreaTop: {
    backgroundColor: '#F6F7F8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F7F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#111827',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 24,
    color: '#111827',
  },
  filtersContainer: {
    backgroundColor: '#F6F7F8',
    paddingTop: 8,
    paddingBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#E5E7EB',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  filterChipArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  scrollContentEmpty: {
    flexGrow: 1,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  firstProductCard: {
    marginTop: 16,
  },
  productCardDisabled: {
    opacity: 0.6,
  },
  productImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    gap: 8,
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingHorizontal: 12,
    maxWidth: 480,
    backgroundColor: '#FF993310',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addToCartIcon: {
    fontSize: 16,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9933',
  },
  outOfStockButton: {
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  outOfStockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FF993310',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startShoppingButton: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FF9933',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  startShoppingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F6F7F880',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addAllButton: {
    height: 56,
    width: '100%',
    backgroundColor: '#FF9933',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  addAllButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default WishlistScreen;
