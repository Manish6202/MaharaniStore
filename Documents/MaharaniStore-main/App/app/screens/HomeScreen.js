import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  StatusBar,
  RefreshControl
} from 'react-native';
import { productAPI } from '../services/api';

const { width } = Dimensions.get('window');

// Default offers fallback
const defaultOffers = [
  {
    id: '1',
    title: 'Daily Deals',
    subtitle: 'Up to 70% OFF on selected items!',
    timeText: 'Ends in: 12:34:56',
    timeIcon: '⏰',
    discount: '70%',
    gradient: ['#FF6B6B', '#FF8E53'],
    imageUrl: require('../assets/images/grocery_background.jpg')
  },
  {
    id: '2',
    title: 'Weekend Special',
    subtitle: 'Buy 1 Get 1 Free on snacks!',
    timeText: 'Valid till Sunday',
    timeIcon: '📅',
    discount: 'BOGO',
    gradient: ['#4ECDC4', '#44A08D'],
    imageUrl: require('../assets/images/cosmetic_background.jpg')
  }
];

const HomeScreen = ({ navigation }) => {
  const [user] = useState({ name: 'User', phone: '6202878516' });
  const [headerImage, setHeaderImage] = useState(require('../assets/images/herosection.png'));
  const [offers, setOffers] = useState([]);
  const [trendingBanner, setTrendingBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(Date.now()); // For countdown updates
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0); // For auto-sliding
  const offerScrollRef = useRef(null); // Ref for controlling scroll

  useEffect(() => {
    loadHeaderImage();
    loadOffers();
    loadTrendingBanner();
  }, []);

  // Countdown timer effect - updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTimer(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-slide effect - changes offer every 4 seconds
  useEffect(() => {
    if (offers.length <= 1) return; // Don't auto-slide if only one offer

    const slideTimer = setInterval(() => {
      setCurrentOfferIndex(prevIndex => {
        const nextIndex = prevIndex === offers.length - 1 ? 0 : prevIndex + 1;
        
        // Scroll to the next offer
        if (offerScrollRef.current) {
          offerScrollRef.current.scrollTo({
            x: nextIndex * width * 0.9 + (nextIndex * 15), // Card width + margin
            animated: true,
          });
        }
        
        return nextIndex;
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(slideTimer);
  }, [offers.length]);

  const loadHeaderImage = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5001/api/media/current-header');
      const result = await response.json();
      if (result.success && result.data && !result.data.isDefault) {
        // If there's a custom header image, use it
        setHeaderImage({ uri: `http://10.0.2.2:5001${result.data.imageUrl}` });
      }
    } catch (error) {
      console.error('Error loading header image:', error);
      // Keep default image if API fails
    }
  };

  const loadOffers = async () => {
    try {
      console.log('🔄 Loading offers from API...');
      const response = await fetch('http://10.0.2.2:5001/api/offers/all');
      const result = await response.json();
      console.log('📱 Offers API response:', result);
      if (result.success) {
        setOffers(result.data);
        console.log('✅ Loaded offers:', result.data.length);
      } else {
        // Fallback to default offers if API fails
        setOffers(defaultOffers);
        console.log('⚠️ Using fallback offers');
      }
    } catch (error) {
      console.error('❌ Error loading offers:', error);
      // Fallback to default offers
      setOffers(defaultOffers);
      console.log('⚠️ Using fallback offers due to error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTrendingBanner = async () => {
    try {
      console.log('🔥 Loading trending banner...');
      const response = await fetch('http://10.0.2.2:5001/api/trending-banner/active');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📱 Trending banner response:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        // Get the first active banner
        setTrendingBanner(result.data[0]);
        console.log('✅ Loaded trending banner:', result.data[0].title);
      } else {
        console.log('⚠️ No trending banner available');
        setTrendingBanner(null);
      }
    } catch (error) {
      console.error('❌ Error loading trending banner:', error);
      setTrendingBanner(null);
    }
  };

  const handleBannerPress = () => {
    console.log('🔥 Banner pressed!', trendingBanner);
    
    if (!trendingBanner) {
      console.log('❌ No trending banner available');
      return;
    }

    const { linkType, linkId } = trendingBanner;
    console.log('🔗 Link type:', linkType, 'Link ID:', linkId);
    
    switch (linkType) {
      case 'product':
        console.log('📱 Navigating to product:', linkId);
        navigation.navigate('ProductDetail', { productId: linkId });
        break;
      case 'subcategory':
        console.log('📱 Navigating to subcategory:', linkId);
        navigation.navigate('Grocery', { subcategory: linkId });
        break;
      case 'category':
        console.log('📱 Navigating to category:', linkId);
        navigation.navigate('Grocery', { category: linkId });
        break;
      case 'offer':
        console.log('📱 Navigating to offer:', linkId);
        // Navigate to offer detail or show offer modal
        // For now, you can navigate to a specific product or category linked to the offer
        // Or create an OfferDetail screen
        Alert.alert(
          'Offer Available!',
          'This offer is now active. Check the offers section for more details.',
          [{ text: 'OK' }]
        );
        break;
      default:
        console.log('📱 No action for link type:', linkType);
        // No action for 'none' or unknown types
        break;
    }
  };

  const onRefresh = () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    loadOffers();
    loadTrendingBanner();
  };

  // Handle manual scroll to update current index
  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / (width * 0.9 + 15));
    if (newIndex !== currentOfferIndex && newIndex >= 0 && newIndex < offers.length) {
      setCurrentOfferIndex(newIndex);
    }
  };

  const handleCategoryPress = (category) => {
    if (category === 'Grocery') {
      navigation.navigate('Grocery');
    } else if (category === 'Cosmetics') {
      navigation.navigate('Categories');
    } else {
      Alert.alert('Coming Soon', `${category} section is under development!`);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />
      
      {/* Header with Diwali Theme */}
      <View style={styles.header}>
        {/* Dynamic Background Image */}
        <Image 
          source={headerImage}
          style={styles.headerBackground}
          resizeMode="cover"
        />
        
        <View style={styles.headerOverlay}>
          {/* Top Navigation */}
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <Text style={styles.homeIcon}>🏠</Text>
              <Text style={styles.locationText}>Home</Text>
              <Text style={styles.expandIcon}>▼</Text>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.notificationIcon}>🔔</Text>
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <View style={styles.profileContainer}>
                <Image 
                  source={require('../assets/images/cosmetic_background.jpg')}
                  style={styles.profileImage}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#EF4444']}
            tintColor="#EF4444"
          />
        }
      >
        {/* Offers Carousel */}
        <View style={styles.offersSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EF4444" />
            </View>
          ) : (
            <ScrollView
              ref={offerScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width * 0.9}
              decelerationRate="fast"
              style={styles.offerScroll}
              contentContainerStyle={styles.offerScrollContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {offers.map((offer, index) => (
                <View key={offer.id || index} style={styles.offerCard}>
                  {/* Background Image */}
                  <Image 
                    source={
                      typeof offer.imageUrl === 'string' 
                        ? { uri: `http://10.0.2.2:5001${offer.imageUrl}` }
                        : offer.imageUrl
                    } 
                    style={styles.offerBackgroundImage}
                    resizeMode="cover"
                  />
                  
                  {/* Dark Overlay for better text readability */}
                  <View style={styles.offerOverlay} />
                  
                  {/* Content */}
                  <View style={styles.offerContent}>
                    <View style={styles.offerLeft}>
                      <Text style={styles.offerTitle}>{offer.title}</Text>
                      <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                      <View style={styles.offerTimeContainer}>
                        <Text style={styles.timerIcon}>{offer.timeIcon}</Text>
                        <Text style={styles.offerTime}>{offer.timeText}</Text>
                      </View>
                    </View>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{offer.discount}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          
          {/* Page Indicators */}
          {!loading && offers.length > 1 && (
            <View style={styles.pageIndicators}>
              {offers.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pageDot,
                    index === currentOfferIndex && styles.activePageDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoryGrid}>
            <View style={styles.categoryCardContainer}>
              <TouchableOpacity 
                style={styles.categoryCard}
                onPress={() => handleCategoryPress('Grocery')}
              >
                <Image 
                  source={require('../assets/images/grocery_background.jpg')}
                  style={styles.categoryImage}
                />
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>GROCERY</Text>
            </View>

            <View style={styles.categoryCardContainer}>
              <TouchableOpacity 
                style={styles.categoryCard}
                onPress={() => handleCategoryPress('Cosmetics')}
              >
                <Image 
                  source={require('../assets/images/cosmetic_background.jpg')}
                  style={styles.categoryImage}
                />
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>COSMETICS</Text>
            </View>
          </View>
        </View>

        {/* Trending Now Section */}
        {trendingBanner && (
          <View style={styles.trendingSection}>
            <View style={styles.trendingHeader}>
              <Text style={styles.trendingTitle}>🔥 Trending Now</Text>
            </View>

            <TouchableOpacity style={styles.trendingBanner} onPress={handleBannerPress}>
              <Image 
                source={
                  trendingBanner.backgroundImage && trendingBanner.backgroundImage.trim() !== ''
                    ? { uri: `http://10.0.2.2:5001/${trendingBanner.backgroundImage}` }
                    : require('../assets/images/grocery_background.jpg')
                }
                style={styles.trendingBannerImage}
                onError={() => console.log('Banner image load error')}
              />
              <View style={styles.trendingBannerOverlay}>
                <Text style={styles.trendingBannerTitle}>{trendingBanner.title}</Text>
                <Text style={styles.trendingBannerSubtitle}>{trendingBanner.subtitle}</Text>
                <View style={styles.exploreButton}>
                  <Text style={styles.exploreButtonText}>{trendingBanner.buttonText}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}


        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    position: 'relative',
    height: 280,
    marginBottom: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 16,
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#FDE047',
    borderRadius: 4,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  offersSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerScroll: {
    paddingLeft: 0,
  },
  offerScrollContent: {
    paddingHorizontal: 0,
  },
  offerCard: {
    width: width * 0.9,
    height: 160,
    borderRadius: 20,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  offerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  offerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  offerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
    zIndex: 1,
    height: '100%',
  },
  offerLeft: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  offerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  offerTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  offerTime: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: '#FDE047',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  pageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  activePageDot: {
    backgroundColor: '#FFD700',
    width: 16,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  categoryCardContainer: {
    flex: 1,
    alignItems: 'center',
  },
  categoryCard: {
    width: '100%',
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 8,
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  trendingSection: {
    marginBottom: 20,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  trendingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  trendingBanner: {
    height: 160,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  trendingBannerImage: {
    width: '100%',
    height: '100%',
  },
  trendingBannerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  trendingBannerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trendingBannerSubtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 15,
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;