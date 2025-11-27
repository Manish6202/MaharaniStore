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

const GroceryScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const categoryFromRoute = route?.params?.category || 'Snacks & Beverages';
  const [selectedCategory, setSelectedCategory] = useState(categoryFromRoute);
  const [loading, setLoading] = useState(true);
  const { addToCart, totalItems } = useCart();

  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Dairy & Breads',
    'Snacks & Beverages',
    'Pantry Staples',
    'Frozen',
    'Household',
  ];

  // Sample products data matching HTML
  const sampleProducts = [
    {
      _id: '1',
      name: 'Classic Potato Chips',
      brand: 'Lays',
      price: 30,
      originalPrice: 35,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-41JdxF4twZU4pX8rncZPPgYqyu8J1Wx98HaObtnA525TB17M0HJqPQ27XOKk5q45ASREPUdSF951IcyGEpUpVJQoR6rg-zM3v7LUAzyt1IWBwpjdQ1VwBhmNYwCTx-xbE766XouXJchmFL3OfMQyzsKrcZKBtgavtMMSXVkTt8DpJ-7RsalUvWuhOf3uS1Zd3r5o7lriQ67N-OaWE9HfhFfvLupDVEjyYx9FGE76_vZKCHV2LNDzADbcx_bGvNuaecP8DBQvjQ',
    },
    {
      _id: '2',
      name: 'Classic Cola 750ml',
      brand: 'Coca-Cola',
      price: 40,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUzD-auCSW_CZEEh5qZIlzwYvubS8R6WRFil1db0XMIPAe12SA56lg3D9aWxEa-WpmHVVYZ0Nkjyr6VUnk4JgBd_5jdE0mTs29iKYLWQ2q9chadooJoaMnac694WtuaLuFUYFHn0CLznBxNXM3cEmxjKJNMLhh3TyhWHqB-R2rBSmJ8kS8Xr77EdZn7KsdW0r9gDjsHwJuppSUquhXcs0Be8v-60FR-pCcs1O74kxQPiKTar6uBnv1aHsUYSvSYMK2ppRqqgdA7g',
    },
    {
      _id: '3',
      name: 'Original Glucose Biscuits Family Pack',
      brand: 'Parle-G',
      price: 50,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH-rCLIqzy4-PLaDzFaiekki-Sf9HpyK3YgMtg2maKDE5xUGhw-OZabPtdgaWtk538c5C8Cwre_fzZ5TA0A04SkNQwB7Bjyjze7NcHYBdMyMIdogtxJ6yXpOMCzXTdr4OHOEczBCe7jlY2ptFRUYIOu2Twzv4SBX6pj-m7yQqQZOaUfRwKUmNiIz-l1FwqBCKCaNrCocVdBK9dUdZTDKZy2tKtgw2DlCql1onu3uagGHg0zWbe7DvEnUGRt_gbKegqEW5TrrDgUQ',
    },
    {
      _id: '4',
      name: 'Bhujia Sev Indian Snack',
      brand: "Haldiram's",
      price: 65,
      originalPrice: 70,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIQCxGyX7h6LdqoqO8P9zXlyqtT5tcsQlTgtJu39XfPdbKLvO0dibCTD08SeKEjyoJLCsNtHvp7QhA3Ewspn2WmWdHiXL9Ur8O4XNaSIJGR5tv371iyjOgGI1JECUz7RYIYbOOmFIaGO4yfi3VPvQ2Q4N8KDty6gO447aZuqlTGxddSrDhQ1xaan6i43JsmJK1G5UY5Q9_JUs41jOwwZmlhA9yjMWqwa4w2u_IuOYAx-cD0lPCoMFcXily37-ii_kAyaTv97Zn9A',
    },
    {
      _id: '5',
      name: 'Orange Delight Juice 1L',
      brand: 'Tropicana',
      price: 120,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcSKO3IXt-KXbHuv4Wl0kHkl3XTNoaYwduUUJK-JWzuWQwpDHNYUJnJeG4B-PEmr8-ZLl0h5aUiEK2NXCrqWRfVIFKFWJkLQSD9ZxlH0quUsJ-TBRtlMozk8qm2SdS-kOLvFC_Oy5HTKwLf2bcXyE_l-HygA9Xk08CFr4qdIC2dKpeCUnyE_Su3qeP-HG5-GvlwN1UjWvK959m-ONhXECAA8jCbFexSGdMLBcPOVgRlrcmvIZhWpBsBKe1V61Bgn_vsFQIPr4lqQ',
    },
  ];

  useEffect(() => {
    loadGroceryProducts();
  }, []);

  const loadGroceryProducts = async () => {
    try {
      setLoading(true);
      const result = await productAPI.getProductsByCategory('Grocery');
      console.log('🛒 Grocery products loaded:', result);
      if (result.success && result.data && result.data.length > 0) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      } else {
        // Use sample products if API returns empty
        setProducts(sampleProducts);
        setFilteredProducts(sampleProducts);
      }
    } catch (error) {
      console.error('❌ Error loading grocery products:', error);
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
               (category === 'Vegetables' && (productCategory.includes('Vegetable') || productSubcategory.includes('Vegetable'))) ||
               (category === 'Fruits' && (productCategory.includes('Fruit') || productSubcategory.includes('Fruit'))) ||
               (category === 'Dairy & Breads' && (productCategory.includes('Dairy') || productCategory.includes('Bakery'))) ||
               (category === 'Snacks & Beverages' && (productCategory.includes('Snack') || productCategory.includes('Beverage'))) ||
               (category === 'Pantry Staples' && (productCategory.includes('Staple') || productCategory.includes('Pantry'))) ||
               (category === 'Frozen' && productCategory.includes('Frozen')) ||
               (category === 'Household' && productCategory.includes('Household'));
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
        <Text style={styles.headerTitle}>Grocery</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {/* Handle search */}}
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
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDprHGCaNs6zBVY4vqd7sRIjw0xkkGWMGNBxrKPswygXcBTrXDWQloq4ncD6TkgSOC5_zJdv9lY4JnusH0wZAvnAVsowYAWygwQE6iL-v3fKF8Lgn3Hs5i4ne0LIWKjcI--VyghSAa5R3jgr1zYM9cThBh3GETLrDvObsKTHJKbGom6Dv0fQ71Puj-xSA7vB0V5dC1agDXYgQMq3CyQ9IaM9asp6ZDUMvXtmZoRqBes2SiqL_U3vbOddv9Isg4bkwri2V6EcSPJMQ'
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

export default GroceryScreen;
