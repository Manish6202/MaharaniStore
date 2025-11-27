import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('30ml');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const sizes = ['30ml', '50ml', '100ml'];

  // Sample product images for carousel
  const sampleImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbp4SAWT8aEwSmPv6ZR8HGjVzPn59qAIUwhGPF9Jk2lsohVvaG4PrH34CCSPPS4BwdJYsdJWnj-4RrtE6ftN4bMV0Xzz1l_OI7YqzUUv3KPYcbySTnJHe4Y7xAcU3_ph4AuoL2mG6Z7rZY07dzvH2ZPar59aB4QcH27OMZxg0hxCsMIH1SnCJUd31VKQZB-_OHjdlWCOO6bzsvyy69I8L-Qp3AJty3YqBCrtgdLf92TEufvhy5IqC9UlBtuU9PWJe_8NzhMsGNZA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDXFf665TKAEvGQRDwgI_KYgkJo5_RwZuXEibiMAvWaxR4TURG02ioCtp9hqnUQoKiRY-76Yhs93on662gqc_hDIKUYZ3aTfinb4kHAxusLtH_3g7ycSm33YoDix2BmGiF_w4KjP4ej7kVBx6MR3dqPRAkVTfBttHpzaa6-Ux31_a1FDZsQLdDEr8rUWIuRE7ersXBKVStapaf8RM9EB2qFa4e4WhAF8rohIpXbAURckT-9SHZkY7lp3rHzbPq-ndASl00Lgwbnxg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbyS0eB63BBTjLcCdXEewuY7Qx6A7GYNJlMFlkWXR21bgPRv9r3NcoRUzc_FL6jIsZ-62QsxuKXcb3HaoFG4VUAjwztLExE7OYFAe-ZNypUwO68j_GF9iMSDLmkuCp2FpsHqecZGS5UW63jZpZQPXW45px42Jq_xHQ3Pu_QIvfPCX5r51tbhExeKbX8huWzvXb5N8r7SIJbdKYDjxVdEOw0AhzCXjedrzbZg8_7w30KdkZG0pJS3xQDTLkokHZLC-8W8fFW43CJw',
  ];

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const result = await productAPI.getProductById(productId);
      
      if (result && result.success && result.data) {
        setProduct(result.data);
      } else {
        // Use sample data if API fails
        setProduct({
          _id: productId,
          name: 'MAHARANI Glow Serum',
          brand: 'Kesar Beauty',
          price: 1249,
          description: 'Unlock your inner radiance with the MAHARANI Glow Serum. Infused with pure saffron and a blend of traditional Ayurvedic herbs, this lightweight serum deeply nourishes the skin, reduces dark spots, and provides a luminous, even-toned complexion.',
          images: sampleImages,
        });
      }
    } catch (error) {
      console.error('❌ Error loading product:', error);
      // Use sample data on error
      setProduct({
        _id: productId,
        name: 'MAHARANI Glow Serum',
        brand: 'Kesar Beauty',
        price: 1249,
        description: 'Unlock your inner radiance with the MAHARANI Glow Serum. Infused with pure saffron and a blend of traditional Ayurvedic herbs, this lightweight serum deeply nourishes the skin, reduces dark spots, and provides a luminous, even-toned complexion.',
        images: sampleImages,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width * 0.85));
    setCurrentImageIndex(index);
  };

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigation.navigate('Cart');
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      Alert.alert('Removed', 'Product removed from wishlist');
    } else {
      addToWishlist(product);
      Alert.alert('Added', 'Product added to wishlist');
    }
  };

  const handleShare = () => {
    Alert.alert('Share', `Share ${product.name} with friends!`);
  };

  const productImages = product?.images?.length > 0 
    ? product.images.map(img => productAPI.getImageUrl(img))
    : sampleImages;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
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
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleToggleWishlist}
          >
            <Text style={[
              styles.headerIcon,
              isInWishlist(product._id) && styles.wishlistActive
            ]}>
              {isInWishlist(product._id) ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Text style={styles.headerIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={width * 0.85}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
          >
            {productImages.map((image, index) => (
              <View key={index} style={styles.imageSlide}>
                <Image 
                  source={{ uri: image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Page Indicators */}
        <View style={styles.indicators}>
          {productImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex && styles.indicatorActive
              ]}
            />
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>by {product.brand}</Text>
          <Text style={styles.productPrice}>₹{product.price?.toLocaleString('en-IN')}.00</Text>
        </View>

        {/* Size Selector */}
        <View style={styles.sizeSection}>
          <Text style={styles.sizeLabel}>Size:</Text>
          <View style={styles.sizeButtons}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  selectedSize === size && styles.sizeButtonActive
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.sizeButtonText,
                  selectedSize === size && styles.sizeButtonTextActive
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Ratings & Reviews */}
        <View style={styles.ratingsSection}>
          <View style={styles.ratingItem}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingValue}>4.8</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.ratingLink}>4,327 Ratings</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.ratingLink}>212 Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {product.description || 'No description available.'}
            <Text style={styles.readMore}> Read more</Text>
          </Text>
        </View>

        {/* Highlight Chips */}
        <View style={styles.chipsSection}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Organic</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Cruelty-Free</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Vegan</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Paraben Free</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.buyNowButton}
            onPress={handleBuyNow}
          >
            <Text style={styles.buyNowButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FCFCFC',
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#212121',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 96,
    justifyContent: 'flex-end',
  },
  headerIcon: {
    fontSize: 24,
    color: '#212121',
  },
  wishlistActive: {
    color: '#EF4444',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 200,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  carouselContent: {
    gap: 16,
  },
  imageSlide: {
    width: width * 0.85,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  indicatorActive: {
    width: 16,
    backgroundColor: '#FF9933',
  },
  productInfo: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    fontWeight: '400',
    color: '#757575',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    letterSpacing: -0.5,
  },
  sizeSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonActive: {
    borderWidth: 2,
    borderColor: '#FF9933',
    backgroundColor: 'rgba(255, 153, 51, 0.2)',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  sizeButtonTextActive: {
    fontWeight: '600',
    color: '#FF9933',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  ratingsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 20,
    color: '#FF9933',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  ratingLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textDecorationLine: 'underline',
  },
  descriptionSection: {
    paddingHorizontal: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#757575',
    lineHeight: 22,
  },
  readMore: {
    color: '#FF9933',
    fontWeight: '600',
  },
  chipsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  bottomSpacing: {
    height: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCFCFC',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FF9933',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9933',
  },
  buyNowButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buyNowButtonText: {
    fontSize: 16,
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
    color: '#757575',
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
    backgroundColor: '#FF9933',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
