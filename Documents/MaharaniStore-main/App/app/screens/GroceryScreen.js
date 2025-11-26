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
  FlatList,
  Dimensions,
  TextInput
} from 'react-native';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // 2 columns with padding

const GroceryScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTheme, setCurrentTheme] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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
    // Set initial theme
    setCurrentTheme(subcategories[0].banner);
  }, []);

  const loadGroceryProducts = async () => {
    try {
      setLoading(true);
      const result = await productAPI.getProductsByCategory('Grocery');
      console.log('🛒 Grocery products loaded:', result);
      setProducts(result.data || []);
      setFilteredProducts(result.data || []);
    } catch (error) {
      console.error('❌ Error loading grocery products:', error);
      Alert.alert('Error', 'Failed to load grocery products');
    } finally {
      setLoading(false);
    }
  };

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

    setFilteredProducts(filtered);
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock');
      return;
    }
    
    addToCart(product);
    Alert.alert(
      'Added to Cart', 
      `${product.name} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  const handleToggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: productAPI.getImageUrl(item.images?.[0]) }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => handleToggleWishlist(item)}
        >
          <Text style={styles.wishlistIcon}>
            {isInWishlist(item._id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          <Text style={styles.productUnit}>per {item.unit}</Text>
        </View>

        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockText,
            { color: item.stock > 0 ? '#10B981' : '#EF4444' }
          ]}>
            {item.stock > 0 ? `${item.stock} available` : 'Out of stock'}
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

  if (loading) {
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
        <View style={styles.placeholder} />
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
              Try selecting a different category
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
          />
        )}
      </View>
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
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    marginBottom: 8,
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
});

export default GroceryScreen;