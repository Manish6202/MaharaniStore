import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const SearchScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState(route?.params?.initialQuery || '');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [popularTags, setPopularTags] = useState([
    'Sunscreens',
    'Lentils',
    'Atta',
    'Face Wash',
    'Spices',
  ]);
  const [selectedTag, setSelectedTag] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    loadRecentSearches();
    // If there's an initial query, search immediately
    if (route?.params?.initialQuery) {
      handleSearch(route.params.initialQuery);
    }
  }, [route?.params?.initialQuery]);

  const loadRecentSearches = async () => {
    try {
      const recent = await AsyncStorage.getItem('recentSearches');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query) => {
    if (!query.trim()) return;
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem('recentSearches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await productAPI.searchProducts(query);
      console.log('🔍 Search results:', result);
      if (result.success && result.data) {
        setSearchResults(Array.isArray(result.data) ? result.data : []);
        saveRecentSearch(query);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    // Generate suggestions based on query
    if (text.trim().length > 0) {
      const suggestionQueries = [
        `${text} for dry skin`,
        `face ${text}`,
        `${text} cream`,
        `${text} serum`,
      ];
      setSuggestions(suggestionQueries.slice(0, 2));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleTagPress = (tag) => {
    setSelectedTag(tag);
    setSearchQuery(tag);
    handleSearch(tag);
  };

  const handleRemoveRecentSearch = async (search) => {
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
  };

  const handleToggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      Alert.alert('Removed', 'Removed from wishlist');
    } else {
      addToWishlist(product);
      Alert.alert('Added', 'Added to wishlist');
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const renderProductCard = ({ item }) => {
    const imageUrl = item.images?.[0] 
      ? productAPI.getImageUrl(item.images[0])
      : item.image || 'https://via.placeholder.com/200';
    const inWishlist = isInWishlist(item._id);

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productImageContainer}
          onPress={() => handleProductPress(item)}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => handleToggleWishlist(item)}
          >
            <Text style={styles.wishlistIcon}>
              {inWishlist ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={styles.productInfo}>
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.unit && (
              <Text style={styles.productUnit}>{item.unit}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        {/* Sticky Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {searchQuery ? 'Search Results' : 'Search'}
            </Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for groceries, cosmetics..."
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
              autoFocus={true}
            />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suggestions</Text>
            </View>
            <View style={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <View style={styles.suggestionIconContainer}>
                    <Text style={styles.suggestionIcon}>⚡</Text>
                  </View>
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {suggestion}
                  </Text>
                  <Text style={styles.suggestionArrow}>↗</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearButton}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentSearchesList}>
              {recentSearches.map((search, index) => (
                <View key={index} style={styles.recentSearchItem}>
                  <Text style={styles.recentSearchText}>{search}</Text>
                  <TouchableOpacity onPress={() => handleRemoveRecentSearch(search)}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Popular Right Now */}
        {!searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Right Now</Text>
            <View style={styles.tagsContainer}>
              {popularTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    selectedTag === tag && styles.tagActive
                  ]}
                  onPress={() => handleTagPress(tag)}
                >
                  <Text style={[
                    styles.tagText,
                    selectedTag === tag && styles.tagTextActive
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <FlatList
              data={searchResults}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty State - Show when no search query */}
        {!searchQuery && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Start typing to search for products
            </Text>
          </View>
        )}

        {/* No Results Found - Show when search query exists but no results */}
        {searchQuery && searchResults.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyt_LxIe5o1hKtai9qD3BmS4zRG5SOfM8ljhS-VSkyMhDg88u42xJwgkO_Yist4ZuWKfJa35PhJjv368wsj5RSR534UVClXOjf69w9kSLQpLRGRxLRwvp52rvZ1-xCTMCtTjDW7ExAH2TWRKIxxhfHfmwpxWBmQGgj4CPJcZSP0CaFNnmSmRE6prI3tsIDtVZz8v3zubzBEVXt98BR0lsHXw84sJbSTOAmoWeRv7KBUT8JWlFIVJrz25f6jlfkUfgTsCLv6V8z_Q'
              }}
              style={styles.noResultsImage}
              resizeMode="contain"
            />
            <Text style={styles.noResultsTitle}>No Results Found</Text>
            <Text style={styles.noResultsDescription}>
              Sorry, we couldn't find any matches for your search. Please try searching for something else.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.exploreButtonText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  safeAreaTop: {
    backgroundColor: '#FCFCFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FCFCFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#212121',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 9999,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    color: '#A0A0A0',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    padding: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9933',
  },
  suggestionsList: {
    gap: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FF993310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 20,
    color: '#FF9933',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  suggestionArrow: {
    fontSize: 18,
    color: '#A0A0A0',
  },
  recentSearchesList: {
    gap: 0,
  },
  recentSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  closeIcon: {
    fontSize: 18,
    color: '#A0A0A0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FCFCFC',
  },
  tagActive: {
    borderColor: '#FF9933',
    backgroundColor: '#FF993310',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  tagTextActive: {
    fontWeight: '600',
    color: '#FF9933',
  },
  resultsSection: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    gap: 8,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(252, 252, 252, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistIcon: {
    fontSize: 16,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    lineHeight: 20,
  },
  productUnit: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    minHeight: 400,
  },
  noResultsImage: {
    width: '100%',
    maxWidth: 300,
    height: 200,
    marginBottom: 32,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsDescription: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  exploreButton: {
    width: '100%',
    maxWidth: 300,
    height: 56,
    backgroundColor: '#FF9933',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exploreButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SearchScreen;

