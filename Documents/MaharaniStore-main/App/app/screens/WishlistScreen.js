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
  const [sortBy, setSortBy] = useState(null); // 'price-asc', 'price-desc', null
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOnSale, setFilterOnSale] = useState(false);

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

  // Filter and Sort Handlers
  const handleSortByPrice = () => {
    if (sortBy === null) {
      setSortBy('price-asc');
    } else if (sortBy === 'price-asc') {
      setSortBy('price-desc');
    } else {
      setSortBy(null);
    }
  };

  const handleFilterInStock = () => {
    setFilterInStock(!filterInStock);
  };

  const handleFilterOnSale = () => {
    setFilterOnSale(!filterOnSale);
  };

  // Filter and Sort Logic
  const getFilteredAndSortedItems = () => {
    let filtered = [...items];

    // Filter by In Stock
    if (filterInStock) {
      filtered = filtered.filter(item => item.stock > 0);
    }

    // Filter by On Sale
    if (filterOnSale) {
      filtered = filtered.filter(item => {
        return item.originalPrice && item.originalPrice > item.price;
      });
    }

    // Sort by Price
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return filtered;
  };

  const filteredItems = getFilteredAndSortedItems();

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
          <TouchableOpacity 
            style={[
              styles.filterChip,
              sortBy && styles.filterChipActive
            ]}
            onPress={handleSortByPrice}
          >
            <Text style={[
              styles.filterChipText,
              sortBy && styles.filterChipTextActive
            ]}>
              Sort by Price
            </Text>
            <Text style={[
              styles.filterChipArrow,
              sortBy && styles.filterChipArrowActive
            ]}>
              {sortBy === 'price-asc' ? '▲' : sortBy === 'price-desc' ? '▼' : '▼'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterChip,
              filterInStock && styles.filterChipActive
            ]}
            onPress={handleFilterInStock}
          >
            <Text style={[
              styles.filterChipText,
              filterInStock && styles.filterChipTextActive
            ]}>
              In Stock
            </Text>
            <Text style={[
              styles.filterChipArrow,
              filterInStock && styles.filterChipArrowActive
            ]}>
              ▼
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterChip,
              filterOnSale && styles.filterChipActive
            ]}
            onPress={handleFilterOnSale}
          >
            <Text style={[
              styles.filterChipText,
              filterOnSale && styles.filterChipTextActive
            ]}>
              On Sale
            </Text>
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
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, index) => renderProductCard(item, index === 0))
        ) : items.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No items match your filters</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSortBy(null);
                setFilterInStock(false);
                setFilterOnSale(false);
              }}
            >
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
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
      {filteredItems.length > 0 && filteredItems.filter(item => item.stock > 0).length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addAllButton}
            onPress={() => {
              const inStockFiltered = filteredItems.filter(item => item.stock > 0);
              if (inStockFiltered.length === 0) {
                Alert.alert('No Items Available', 'All filtered items are out of stock.');
                return;
              }
              inStockFiltered.forEach(item => addToCart(item));
              Alert.alert('Added to Cart', `${inStockFiltered.length} item(s) added to your cart.`);
            }}
          >
            <Text style={styles.addAllButtonText}>
              Add All to Cart ({filteredItems.filter(item => item.stock > 0).length})
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
  filterChipActive: {
    backgroundColor: '#FF9933',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  filterChipTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterChipArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterChipArrowActive: {
    color: '#FFFFFF',
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
  clearFiltersButton: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
