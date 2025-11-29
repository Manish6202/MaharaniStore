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
} from 'react-native';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const CosmeticsScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const categoryFromRoute = route?.params?.category || 'Skincare';
  const [selectedCategory, setSelectedCategory] = useState(categoryFromRoute);
  const [loading, setLoading] = useState(true);
  const { addToCart, totalItems } = useCart();

  const categories = [
    'All',
    'Skincare',
    'Makeup',
    'Hair Care',
    'Fragrances',
    'Body Care',
    'Men\'s Grooming',
    'Wellness',
  ];

  // Sample cosmetics products data
  const sampleProducts = [
    {
      _id: '101',
      name: 'MAHARANI Glow Serum',
      brand: 'Kesar Beauty',
      price: 1249,
      originalPrice: 1499,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnpa_7E741Q2uVLK5AZK2plr9FX1OeP7btYDTZ-O3GjFZc2wupRZoa6VwWpf8DBQzkEDjyWubvetF2Mau4xSEi8IxSMVpDlfmGWLYA5N32zKsEuWcxp5LGU4jqh6QFiRi25wXr2tz_cTJWVIm0fyw_TqcuxS2vXlkIHEL81PhtKcsR7C1tr4zAwCHO7GgWTI3TTrljtVrG2BdZgGzIuUHAP7vFlHDd5U11gSW5y2xe5KDD0SQ6rIUjx08cDRVYiQBY7KkUgHCT2A',
    },
    {
      _id: '102',
      name: 'Hydrating Face Cream',
      brand: 'Lakme',
      price: 599,
      originalPrice: 799,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-18ZNel0vrmEyrmHyicSrA8anPGmoBD78iFhXaDBaWJ5HNKje6bVZLIWJvyIkbWI2WmLJ5su1EDifKBdFIyTLk-OouYCde3vVVW9VzSi_ftX-TEFjYvj9riE9MStvdedJ3qat5L5aPOQwqEoCM1hqO1LarfjcLXvaHSj3Lg78gLFYLFxf3eXzwDin0OgRkaI68eOvF6EHTrNaEiL9GbWk1cHM6I1VY1Fh8YzbXlxSFF4ER1M-ZRomm57EPfPwON-NIwtbHOtFRA',
    },
    {
      _id: '103',
      name: 'Matte Lipstick - Red',
      brand: 'Maybelline',
      price: 299,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASzo-Uv-8fd37j0b6zmKLWccqteTEgW9NhrWoUVU-S7HFAJnHhuhRm0_CKqAPRNIbeBmWeojHggP9SvKcrrm2frKHLtVJM-M0MrzQjzYIu8YKbf8pJ0Nw0ypKbZGA5Gk9MpGgGH1ckU6XQruC3V9Waw6fe9opl9qCew_Ykha6wr_90ibgl-XHlQ6fU0I6nC-B2YUbc245h1fno-sWDLzH7U0dgKcFpiQhRF3duSZkNTU351FbueXOqqF0q9-YzRoqf08_z_OkT1A',
    },
    {
      _id: '104',
      name: 'Anti-Dandruff Shampoo',
      brand: 'Head & Shoulders',
      price: 199,
      originalPrice: 249,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPKg0cUzpGvwNpzWLUuwunbVOM5UvTN70JxZqVH0WfqitYH4B6tabIMjmAtf8BKmGD5SYPMVt65UD_eqNiJ8lxpTcr8RTddZwO4jWmg00gdBt5HpnNNayx9O9SgHwN-BN2mLvpemwwzbVGb_E3L0EPX8b65Apj1mXD-SY88ZweiS5LCG7sNEI2GRklwzctqW1ZpA4km1XbZGRXN39Dz9zHj6T38KP8WyMRgySeus4CSQzi-qXSVQljrlSeIx-fT38bTpEnIejucg',
    },
    {
      _id: '105',
      name: 'Perfume - Floral',
      brand: 'Fogg',
      price: 499,
      originalPrice: 699,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIKpTc4ajLPXGQXLRrG4T85nfrZOs0_NQ9YZ5VeVx35PwJyNTKzeL6qlqio5nK9kJnJPnaAPS-DudfIOOKnyIa81qMVbNw4ILKo_-NrwgE0O3PTiylqJHH8TpEQeHQkLin7Qiqq3a2OBd0nY1GjS35nmzVrnPVzoW6iP5dvyjgi5O0NFdvjFMBJwL14pJrc8Zu15W0aSvll8cFdi21Ll9k095UXlhor7eJTyYK86fxb-hm_3JqxYTJZpr3vN5fmtpdQzRJu-juVw',
    },
  ];

  useEffect(() => {
    loadCosmeticsProducts();
  }, []);

  const loadCosmeticsProducts = async () => {
    try {
      setLoading(true);
      const result = await productAPI.getProductsByCategory('Cosmetics');
      console.log('💄 Cosmetics products loaded:', result);
      if (result.success && result.data && result.data.length > 0) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      } else {
        // Try Beauty category
        const beautyResult = await productAPI.getProductsByCategory('Beauty');
        if (beautyResult.success && beautyResult.data && beautyResult.data.length > 0) {
          setProducts(beautyResult.data);
          setFilteredProducts(beautyResult.data);
        } else {
          // Use sample products if API returns empty
          setProducts(sampleProducts);
          setFilteredProducts(sampleProducts);
        }
      }
    } catch (error) {
      console.error('❌ Error loading cosmetics products:', error);
      // Use sample products on error
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      // Filter products by category
      const filtered = products.filter(product => {
        const productCategory = product.mainCategory || product.category || '';
        const productSubcategory = product.subcategory || '';
        const categoryLower = category.toLowerCase();
        
        // Match main category or subcategory
        return productCategory.toLowerCase().includes(categoryLower) ||
               productSubcategory.toLowerCase().includes(categoryLower) ||
               (category === 'Skincare' && (productCategory.includes('Skin') || productSubcategory.includes('Skin'))) ||
               (category === 'Makeup' && (productCategory.includes('Makeup') || productSubcategory.includes('Makeup'))) ||
               (category === 'Hair Care' && (productCategory.includes('Hair') || productSubcategory.includes('Hair'))) ||
               (category === 'Fragrances' && (productCategory.includes('Fragrance') || productSubcategory.includes('Perfume'))) ||
               (category === 'Body Care' && (productCategory.includes('Body') || productSubcategory.includes('Body'))) ||
               (category === 'Men\'s Grooming' && (productCategory.includes('Men') || productSubcategory.includes('Men'))) ||
               (category === 'Wellness' && (productCategory.includes('Wellness') || productSubcategory.includes('Wellness')));
      });
      setFilteredProducts(filtered);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ 
            uri: item.images?.[0] 
              ? productAPI.getImageUrl(item.images[0])
              : item.image 
          }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cosmetics</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.cartBadgeContainer}>
              <Text style={styles.headerIcon}>🛍️</Text>
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ 
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPKg0cUzpGvwNpzWLUuwunbVOM5UvTN70JxZqVH0WfqitYH4B6tabIMjmAtf8BKmGD5SYPMVt65UD_eqNiJ8lxpTcr8RTddZwO4jWmg00gdBt5HpnNNayx9O9SgHwN-BN2mLvpemwwzbVGb_E3L0EPX8b65Apj1mXD-SY88ZweiS5LCG7sNEI2GRklwzctqW1ZpA4km1XbZGRXN39Dz9zHj6T38KP8WyMRgySeus4CSQzi-qXSVQljrlSeIx-fT38bTpEnIejucg'
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoryChipsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsList}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3F0',
    backgroundColor: '#FEFDFB',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#333333',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIcon: {
    fontSize: 24,
    color: '#333333',
  },
  cartBadgeContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    height: 200,
    width: '100%',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  categoryChipsContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  categoryChipsScrollContent: {
    gap: 10,
    paddingBottom: 4,
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#FF9933',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A7A60',
  },
  categoryChipTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productsGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 12,
    paddingTop: 0,
    flex: 1,
    justifyContent: 'space-between',
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A7A60',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 20,
    height: 40,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  originalPrice: {
    fontSize: 12,
    color: '#8A7A60',
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    fontSize: 18,
    fontWeight: '700',
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
    color: '#8A7A60',
  },
});

export default CosmeticsScreen;

