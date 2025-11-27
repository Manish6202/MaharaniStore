import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { addToCart } = useCart();
  const [location] = useState('Jayanagar, Bengaluru');
  const [selectedCategory, setSelectedCategory] = useState('Vegetables');
  const [flashSaleProducts] = useState([
    {
      id: 1,
      name: 'Organic Coconut Oil',
      price: 199,
      originalPrice: 249,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASzo-Uv-8fd37j0b6zmKLWccqteTEgW9NhrWoUVU-S7HFAJnHhuhRm0_CKqAPRNIbeBmWeojHggP9SvKcrrm2frKHLtVJM-M0MrzQjzYIu8YKbf8pJ0Nw0ypKbZGA5Gk9MpGgGH1ckU6XQruC3V9Waw6fe9opl9qCew_Ykha6wr_90ibgl-XHlQ6fU0I6nC-B2YUbc245h1fno-sWDLzH7U0dgKcFpiQhRF3duSZkNTU351FbueXOqqF0q9-YzRoqf08_z_OkT1A',
      countdown: { hours: 2, minutes: 15, seconds: 45 },
    },
    {
      id: 2,
      name: 'Fresh Strawberries',
      price: 150,
      originalPrice: 200,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-18ZNel0vrmEyrmHyicSrA8anPGmoBD78iFhXaDBaWJ5HNKje6bVZLIWJvyIkbWI2WmLJ5su1EDifKBdFIyTLk-OouYCde3vVVW9VzSi_ftX-TEFjYvj9riE9MStvdedJ3qat5L5aPOQwqEoCM1hqO1LarfjcLXvaHSj3Lg78gLFYLFxf3eXzwDin0OgRkaI68eOvF6EHTrNaEiL9GbWk1cHM6I1VY1Fh8YzbXlxSFF4ER1M-ZRomm57EPfPwON-NIwtbHOtFRA',
      countdown: { hours: 1, minutes: 30, seconds: 10 },
    },
    {
      id: 3,
      name: 'Hydrating Face Serum',
      price: 499,
      originalPrice: 699,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnpa_7E741Q2uVLK5AZK2plr9FX1OeP7btYDTZ-O3GjFZc2wupRZoa6VwWpf8DBQzkEDjyWubvetF2Mau4xSEi8IxSMVpDlfmGWLYA5N32zKsEuWcxp5LGU4jqh6QFiRi25wXr2tz_cTJWVIm0fyw_TqcuxS2vXlkIHEL81PhtKcsR7C1tr4zAwCHO7GgWTI3TTrljtVrG2BdZgGzIuUHAP7vFlHDd5U11gSW5y2xe5KDD0SQ6rIUjx08cDRVYiQBY7KkUgHCT2A',
      countdown: { hours: 5, minutes: 5, seconds: 22 },
    },
  ]);

  const [trendingProducts] = useState([
    {
      id: 1,
      name: 'Almond Milk (Unsweetened)',
      price: 120,
      rating: 4.8,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkvm7QTpkfCnv3VE183ELaJqGi2o40lrMPYu04EnbDWmIHr__Lk1l-cvyD00w718XWWnYKn-HiD81jtaUgpZ-bQL2URu7jhYeXkAMj3itJy-kuGYLCErashQnLqhDCAvHGVnKru8_mbJXhbDStTzkkiA7kUhLvOWG8gkEqi0lUAfhe6Vz2HyCVj0I04LmK8izHpgJJ1ZKDdxHNRx0FaUq3hWmBqLbLsF7-b0vOIUoaN7daB6f1DeibjeCscluJHv2XdbJQ2LtdLw',
    },
    {
      id: 2,
      name: 'SPF 50+ Sunscreen',
      price: 350,
      rating: 4.9,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACKLNkJO4ZA7PHZWzM-_IIDTIBYvcjsA5kLsbMAD6usFqaBaFaipSo7nTrF71FGHjFSbcEgY76GLW3XxUp9KT0Ka9lmIqUzCJsY9nCfbPez4HzWZkJPHf0gJrOHC8tslIg-bI2Yv97yyOrQaqMuc93fb60Is_0yVtdDK1o1Oamty3Jv6FiuPgJwps_EF-4iP0oMbT2PjeK6Ui_g0vGdws2qCB1WCpPhF6etYwUD2vKGb_zTXZJdIB8rMXuj2NAunfwgq_XWhaFDw',
    },
    {
      id: 3,
      name: 'Organic Quinoa',
      price: 250,
      rating: 4.7,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7yoAC7TJBfHPxqCHiZlH5GwEBgjZaFfYQ4kgnkOXzloUswhXxKhSijztCOILDv4IgvfxbnFCCh2DDTt84ucPuCbJEbUM2uUqEQkC1G8pdtmIJU0DO-hVU3BDFcsr8SgEeyiUN1BM1T_yQa4R6DOIArlK2SC7kGS1KEvMrLKST_VtifvXOLXeaLfx5eAcDm9vhpjGmzpCIWNlMolsfIn_6SWyWChIzM29Pyo_agKB8yC07S2GoKxqUVPNzGQ9GprO71B73juH1Ng',
    },
  ]);

  const [countdowns, setCountdowns] = useState({});
  const countdownInterval = useRef(null);

  useEffect(() => {
    // Initialize countdowns
    const initialCountdowns = {};
    flashSaleProducts.forEach(product => {
      const totalSeconds = product.countdown.hours * 3600 + 
                          product.countdown.minutes * 60 + 
                          product.countdown.seconds;
      initialCountdowns[product.id] = totalSeconds;
    });
    setCountdowns(initialCountdowns);

    // Update countdown every second
    countdownInterval.current = setInterval(() => {
      setCountdowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          if (updated[id] > 0) {
            updated[id] -= 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  const formatCountdown = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const categories = ['Vegetables', 'Skincare', 'Snacks', 'Fruits', 'Makeup', 'Hair Care'];
  const promotionalBanners = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAUKlmMF0L8Z8bL_8ofrEZ3sBZViFUBW7-UdNZkunafp6mvmDlTblQleNpZfpJDKlYcIQJfLybZaJeXiRqZz6JBNRURbTeI-eixJZE859C7Qd_ln0BpSsaHXXcIwuN38IgMHhrqoEuDi1BRU1lkbJLKUooyK6zDIweQPISmrT7f3lIuMxeyuYuPB7BS-zVRxrA5znc8bFaRhCyHXuqUyEma3qPsqa-ks2OU2QRWwbIkCCaRaUjUR3mc_PgCvHcvVNxbo5X-_3XFeQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBT5HNBcvq8x0LnBsKjSGmacCblgahlofb8TiNWHUAnMXX-GuL0GoaPogRQNmWETxzIE7ZdfY1I-ob00gdkBIk0gkBERl9S67fPvdcsSng8QIrzp0u3IJK_3zPtSKnmNvNGbmh0ifVpPsKNCTqUB53WB3TjIrusV-JeeiapPPAz7KGi1To4_GeqYPX2zEqLjmKOKwDG5fD-VgxzfqPUUGBv6MkdfzGunnEQPq4bGOoCebW4wh7yczdvNzzvR9maBr-Y55QYKlmpGQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDpMvWK4cdV-elqo9rTpSPitx82EeBQlzB0yKpVvv-Gl6ji_IVvuqbyctS9wfW-hbiSKGRtkE1iOg1htCeCWaIFuuFJg5FHCAaljf2eP67-G02V4N0-1e0vX8k6U_00z5_OPxeAwf9RNEAQrLy3h7Gi4NbE_SUg9D-Rp8TL_QVQ8C7-BdL40OZQhLObhpDJPWxw6Dskqg3AMh-hPUAM1Owa0_Nz0j8z7u9wDBSMdtF-RnSBrVTrr22ctKfnBZ4WD4SCD9c0IKfQFw',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>🏠</Text>
            </View>
            <Text style={styles.logoTitle}>MAHARANI</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor="#666666"
          />
          <View style={styles.searchActions}>
            <TouchableOpacity style={styles.searchActionButton}>
              <Text style={styles.searchActionIcon}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchActionButton}>
              <Text style={styles.searchActionIcon}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            Delivering to: <Text style={styles.locationValue}>{location}</Text>
          </Text>
          <Text style={styles.expandIcon}>▼</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Promotional Banners */}
        <View style={styles.bannersSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bannersScrollContent}
          >
            {promotionalBanners.map((banner, index) => (
              <View key={index} style={styles.bannerCard}>
                <Image 
                  source={{ uri: banner }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Category Tiles */}
        <View style={styles.categoryTilesSection}>
          <TouchableOpacity 
            style={[styles.categoryTile, styles.groceryTile]}
            onPress={() => navigation.navigate('Grocery')}
          >
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu1nT_GcBYalh551j70vimz-YflrsgkFMav_EBpYGmz6x-BCPGeGdfJDM3s1qBnYxFGAsAq-x7oxocUZ9xFiww-McSOQqKD_ak6SdfSDKs4M6TL7yppfy-FpgjckS3a1jvGY6ORTkOu1Cwv0KNNZ7GZaCGm4BL2vX4k33Oer25WOoVqVKYcPgpPFit7m82jjP7maufqbtzg6RY0HzdCT6B3KveCfKsvN_d3LxEe4n0RjYjmUx-lS0ngTYzunlNvAZPuH7-VHErpQ' }}
              style={styles.categoryTileImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
              style={styles.categoryTileOverlay}
            />
            <Text style={styles.categoryTileTitle}>Grocery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.categoryTile, styles.cosmeticsTile]}
            onPress={() => navigation.navigate('Categories')}
          >
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcdtE4b7HIFKADBUvxxay5rBq3HaEMxhzcVyxZj3dYAPLY5-bXbyFNq7Iq0GsUwECoeLaLFge7VVgpXhZeVieE8b9bw4dmG0azfy89-lkVwDepjEe0Mh-K6q-7ilDdD-ezGf9FpII0XEAGB_22spLY0OCqnjdvx3Y1bpvj-r-CgLqnnD08Lj58twz3NhYMZofT9oJ0alAYCJoH2vYdD_Q2OSgYTrDMxuFUow7tmKqKSAFwbmmFE5-wtyCGSdB0pJaakEj1kYAAbQ' }}
              style={styles.categoryTileImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']}
              style={styles.categoryTileOverlay}
            />
            <Text style={styles.categoryTileTitle}>Cosmetics</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoryChipsSection}>
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
                onPress={() => setSelectedCategory(category)}
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

        {/* Flash Sale Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flash Sale</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScrollContent}
          >
            {flashSaleProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                activeOpacity={0.8}
              >
                <View style={styles.productImageContainer}>
                  <Image 
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.countdownBadge}>
                    <Text style={styles.countdownText}>
                      Ends in {formatCountdown(countdowns[product.id] || 0)}
                    </Text>
                  </View>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>₹{product.price}</Text>
                    <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Products</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScrollContent}
          >
            {trendingProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                activeOpacity={0.8}
              >
                <View style={styles.productImageContainer}>
                  <Image 
                    source={{ uri: product.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      const productData = {
                        _id: product.id,
                        name: product.name,
                        price: product.price,
                        images: [product.image],
                        stock: 10,
                      };
                      addToCart(productData);
                      Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
                    }}
                  >
                    <Text style={styles.addButtonIcon}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.trendingPrice}>₹{product.price}</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.starIcon}>⭐</Text>
                      <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    color: '#FF9933',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: '#666666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    height: 48,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 8,
  },
  searchIcon: {
    fontSize: 20,
    color: '#666666',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    padding: 0,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 4,
  },
  searchActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchActionIcon: {
    fontSize: 20,
    color: '#666666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 16,
    color: '#666666',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  locationValue: {
    fontWeight: '600',
    color: '#333333',
  },
  expandIcon: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  bannersSection: {
    paddingTop: 8,
  },
  bannersScrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 12,
  },
  bannerCard: {
    width: width * 0.75,
    minWidth: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  bannerImage: {
    width: '100%',
    aspectRatio: 2 / 1,
    borderRadius: 12,
  },
  categoryTilesSection: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  categoryTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  categoryTileImage: {
    width: '100%',
    height: '100%',
  },
  categoryTileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  categoryTileTitle: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryChipsSection: {
    marginTop: 24,
  },
  categoryChipsScrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 12,
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#FF9933',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productsScrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 16,
  },
  productCard: {
    width: 160,
  },
  productImageContainer: {
    position: 'relative',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  countdownBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    paddingTop: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9933',
  },
  originalPrice: {
    fontSize: 12,
    color: '#666666',
    textDecorationLine: 'line-through',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default HomeScreen;
