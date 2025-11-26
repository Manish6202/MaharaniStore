import React, { useState, useEffect, useCallback } from 'react';
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
  FlatList,
  Dimensions,
  TextInput,
  RefreshControl,
  Modal,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productAPI } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // 2 columns with padding

const GroceryScreenEnhanced = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTheme, setCurrentTheme] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    inStockOnly: false,
    brands: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Grocery subcategories with emoji icons and banner data
  const subcategories = [
    { 
      name: 'All', 
      icon: '🛒', 
      fullName: 'All',
      banner: {
        title: 'Welcome to Maharani Store',
        subtitle: 'Everything you need, delivered fresh',
        color: '#6200EE',
        textColor: '#FFFFFF'
      }
    },
    { 
      name: 'Ration', 
      icon: '🍞', 
      fullName: 'Ration & Essentials',
      banner: {
        title: 'Fresh Essentials',
        subtitle: 'Up to 20% OFF on all ration items',
        color: '#F59E0B',
        textColor: '#FFFFFF'
      }
    },
    { 
      name: 'Dairy', 
      icon: '🥛', 
      fullName: 'Dairy & Bakery',
      banner: {
        title: 'Fresh Milk & Dairy',
        subtitle: 'Daily delivery of fresh dairy products',
        color: '#3B82F6',
        textColor: '#FFFFFF'
      }
    },
    { 
      name: 'Vegetables', 
      icon: '🥬', 
      fullName: 'Fresh Vegetables',
      banner: {
        title: 'Farm Fresh Vegetables',
        subtitle: 'Organic quality, delivered daily',
        color: '#10B981',
        textColor: '#FFFFFF'
      }
    },
    { 
      name: 'Fruits', 
      icon: '🍎', 
      fullName: 'Fresh Fruits',
      banner: {
        title: 'Seasonal Fruits',
        subtitle: 'Sweet, juicy fruits at your doorstep',
        color: '#F97316',
        textColor: '#FFFFFF'
      }
    },
    { 
      name: 'Beverages', 
      icon: '🥤', 
      fullName: 'Beverages & Drinks',
      banner: {
        title: 'Cool Drinks',
        subtitle: 'Beat the heat with refreshing beverages',
        color: '#06B6D4',
        textColor: '#FFFFFF'
      }
    },
    { 
      name: 'Snacks', 
      icon: '🍿', 
      fullName: 'Instant Food & Snacks',
      banner: {
        title: 'Crunchy Snacks',
        subtitle: 'Perfect munching for any time',
        color: '#EAB308',
        textColor: '#000000'
      }
    },
    { 
      name: 'Sweets', 
      icon: '🍭', 
      fullName: 'Sweets & Chocolates',
      banner: {
        title: 'Sweet Treats',
        subtitle: 'Festival special sweets & chocolates',
        color: '#EC4899',
        textColor: '#FFFFFF'
      }
    },
    { 
      name: 'Tobacco', 
      icon: '⚠️', 
      fullName: 'Tobacco Products',
      banner: {
        title: '18+ Only',
        subtitle: 'Age verification required for purchase',
        color: '#EF4444',
        textColor: '#FFFFFF'
      }
    }
  ];

  useEffect(() => {
    loadGroceryProducts();
    loadWishlist();
    loadRecentlyViewed();
    setCurrentTheme(subcategories[0].banner);
  }, []);

  const loadWishlist = async () => {
    try {
      const wishlistData = await AsyncStorage.getItem('wishlist');
      if (wishlistData) {
        setWishlist(JSON.parse(wishlistData));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const recentData = await AsyncStorage.getItem('recentlyViewed');
      if (recentData) {
        setRecentlyViewed(JSON.parse(recentData));
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  const saveRecentlyViewed = async (product) => {
    try {
      const recent = recentlyViewed.filter(p => p._id !== product._id);
      recent.unshift(product);
      const updatedRecent = recent.slice(0, 10); // Keep only last 10
      setRecentlyViewed(updatedRecent);
      await AsyncStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  };

  const loadGroceryProducts = async (page = 1) => {
    try {
      setLoading(true);
      const result = await productAPI.getProductsByCategory('Grocery', { page, limit: 20 });
      console.log('🛒 Grocery products loaded:', result);
      
      if (page === 1) {
        setProducts(result.data || []);
        setFilteredProducts(result.data || []);
      } else {
        setProducts(prev => [...prev, ...(result.data || [])]);
        setFilteredProducts(prev => [...prev, ...(result.data || [])]);
      }
      
      setHasMore(result.data && result.data.length === 20);
    } catch (error) {
      console.error('❌ Error loading grocery products:', error);
      Alert.alert('Error', 'Failed to load grocery products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadGroceryProducts(1);
  }, []);

  const handleSubcategoryPress = (subcategory) => {
    setSelectedSubcategory(subcategory.name);
    setCurrentTheme(subcategory.banner);
    filterProducts(subcategory.fullName, searchQuery);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    const currentSubcategory = subcategories.find(s => s.name === selectedSubcategory);
    filterProducts(currentSubcategory?.fullName || 'All', text);
  };

  const filterProducts = (subcategory, search) => {
    let filtered = products;

    // Filter by subcategory
    if (subcategory !== 'All') {
      filtered = filtered.filter(product => 
        product.subcategory === subcategory
      );
    }

    // Filter by search query
    if (search.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply additional filters
    filtered = applyFilters(filtered);
    
    // Apply sorting
    filtered = applySorting(filtered);

    setFilteredProducts(filtered);
  };

  const applyFilters = (products) => {
    return products.filter(product => {
      // Price filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      
      // Stock filter
      if (filters.inStockOnly && product.stock === 0) {
        return false;
      }
      
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }
      
      return true;
    });
  };

  const applySorting = (products) => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return sorted;
    }
  };

  const handleProductPress = (product) => {
    saveRecentlyViewed(product);
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleAddToCart = (product) => {
    Alert.alert('Coming Soon', `${product.name} will be added to cart soon!`);
  };

  const toggleWishlist = async (product) => {
    try {
      const isInWishlist = wishlist.some(p => p._id === product._id);
      let updatedWishlist;
      
      if (isInWishlist) {
        updatedWishlist = wishlist.filter(p => p._id !== product._id);
      } else {
        updatedWishlist = [...wishlist, product];
      }
      
      setWishlist(updatedWishlist);
      await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const getProductBadge = (product) => {
    if (product.stock < 5) return { text: 'Limited', color: '#EF4444' };
    if (product.price < 100) return { text: 'Sale', color: '#10B981' };
    if (new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return { text: 'New', color: '#3B82F6' };
    }
    return null;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    while (stars.length < 5) {
      stars.push('☆');
    }
    return stars.join('');
  };

  const renderProductCard = ({ item }) => {
    const isInWishlist = wishlist.some(p => p._id === item._id);
    const badge = getProductBadge(item);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: productAPI.getImageUrl(item.images?.[0]) }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {badge && (
            <View style={[styles.productBadge, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeText}>{badge.text}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => toggleWishlist(item)}
          >
            <Text style={styles.wishlistIcon}>{isInWishlist ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productBrand}>{item.brand}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>{renderStars(4.2)}</Text>
            <Text style={styles.ratingText}>(4.2)</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <Text style={styles.productUnit}>per {item.unit}</Text>
          </View>

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

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              item.stock === 0 && styles.disabledButton
            ]}
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderSubcategoryTab = (subcategory) => {
    const isActive = selectedSubcategory === subcategory.name;

    return (
      <TouchableOpacity
        key={subcategory.name}
        style={styles.subcategoryTab}
        onPress={() => handleSubcategoryPress(subcategory)}
      >
        <View style={styles.subcategoryIconContainer}>
          <Text style={[
            styles.subcategoryIcon,
            isActive && { color: currentTheme?.color }
          ]}>
            {subcategory.icon}
          </Text>
        </View>
        <Text style={[
          styles.subcategoryTabText,
          isActive && styles.activeSubcategoryTabText,
          isActive && { color: currentTheme?.color }
        ]}>
          {subcategory.name}
        </Text>
        {isActive && <View style={[styles.activeUnderline, { backgroundColor: currentTheme?.color }]} />}
      </TouchableOpacity>
    );
  };

  const renderCategoryBanner = () => {
    const currentCategory = subcategories.find(s => s.name === selectedSubcategory);
    if (!currentCategory) return null;

    const { banner } = currentCategory;

    return (
      <View style={[styles.banner, { backgroundColor: banner.color }]}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: banner.textColor }]}>
              {banner.title}
            </Text>
            <Text style={[styles.bannerSubtitle, { color: banner.textColor }]}>
              {banner.subtitle}
            </Text>
          </View>
          <View style={styles.bannerIconContainer}>
            <Text style={styles.bannerIcon}>{currentCategory.icon}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bannerButton}>
          <Text style={[styles.bannerButtonText, { color: banner.color }]}>
            Shop Now
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceText}>₹{filters.minPrice}</Text>
                <Text style={styles.priceText}>₹{filters.maxPrice}</Text>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <View style={styles.switchContainer}>
                <Text style={styles.filterLabel}>In Stock Only</Text>
                <Switch
                  value={filters.inStockOnly}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, inStockOnly: value }))}
                />
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  { key: 'name', label: 'Name A-Z' },
                  { key: 'price_low', label: 'Price Low to High' },
                  { key: 'price_high', label: 'Price High to Low' },
                  { key: 'newest', label: 'Newest First' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortOption,
                      sortBy === option.key && styles.selectedSortOption
                    ]}
                    onPress={() => setSortBy(option.key)}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === option.key && styles.selectedSortOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setFilters({ minPrice: 0, maxPrice: 10000, inStockOnly: false, brands: [] });
                setSortBy('name');
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setShowFilters(false);
                filterProducts(selectedSubcategory, searchQuery);
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { backgroundColor: currentTheme?.color || '#6200EE' }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: currentTheme?.textColor || '#FFFFFF' }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme?.textColor || '#FFFFFF' }]}>Grocery</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading grocery products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme?.color || '#6200EE' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: currentTheme?.textColor || '#FFFFFF' }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme?.textColor || '#FFFFFF' }]}>Grocery</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Text style={[styles.filterButton, { color: currentTheme?.textColor || '#FFFFFF' }]}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Subcategory Container */}
      <View style={[styles.subcategoryContainer, { backgroundColor: currentTheme?.color ? `${currentTheme.color}15` : '#fff' }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { borderColor: currentTheme?.color || '#E5E7EB' }]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search grocery products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          <View style={styles.searchIcon}>
            <Text style={[styles.searchIconText, { color: currentTheme?.color || '#6B7280' }]}>🔍</Text>
          </View>
        </View>

        {/* Subcategory Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subcategoryContent}
        >
          {subcategories.map(renderSubcategoryTab)}
        </ScrollView>

        {/* Category Banner */}
        <View style={styles.bannerContainer}>
          {renderCategoryBanner()}
        </View>
      </View>

      {/* Products Grid */}
      <View style={styles.productsContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              Try selecting a different category or adjusting filters
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[currentTheme?.color || '#6200EE']}
                tintColor={currentTheme?.color || '#6200EE'}
              />
            }
            onEndReached={() => {
              if (hasMore && !loading) {
                setCurrentPage(prev => prev + 1);
                loadGroceryProducts(currentPage + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => 
              loading ? <ActivityIndicator size="small" color={currentTheme?.color || '#6200EE'} /> : null
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      {renderFilterModal()}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    fontSize: 20,
    padding: 5,
  },
  placeholder: {
    width: 50,
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
  subcategoryContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchIconText: {
    fontSize: 16,
  },
  subcategoryContent: {
    paddingHorizontal: 15,
    flexDirection: 'row',
  },
  subcategoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  subcategoryIconContainer: {
    marginBottom: 4,
  },
  subcategoryIcon: {
    fontSize: 20,
  },
  subcategoryTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeSubcategoryTabText: {
    fontWeight: '600',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  // Banner Styles
  bannerContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  banner: {
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  bannerIconContainer: {
    marginLeft: 12,
  },
  bannerIcon: {
    fontSize: 32,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  productsList: {
    paddingVertical: 15,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistIcon: {
    fontSize: 16,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingStars: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  productUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  stockContainer: {
    marginBottom: 10,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
  },
  addToCartButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 16,
    color: '#6B7280',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectedSortOption: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedSortOptionText: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6200EE',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default GroceryScreenEnhanced;
