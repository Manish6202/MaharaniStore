import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Welcome to Maharani',
    description: 'Discover a curated selection of premium cosmetics and the freshest groceries, delivered right to your doorstep.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIcnW8s38ZxOm-m-vmWsYG2xgbwd-SEhEBljDH7Dg4p5QpnFoKzhx24a8T3Hla-peW3ELH7XhgVTMyByEd6OrgL2I1aQIjexpaaalfk98ZYbKw6-8m00D09aT8RUnuJ273tp_uNBdvk6C9IuPEQNNPjvsV8DKkLqa0XFSLvM4o7Rl_Y36uTFTrZWzkBS_Gdr_VIpyDfMMX-QSAFXyC8OtQuHVBXn1SYEu3njjvCO6QwRXpie8b68vZz6X-Be-hK95qFNp2giVoOv8',
  },
  {
    id: 2,
    title: 'Premium Quality Products',
    description: 'Shop from a wide range of authentic cosmetics and fresh groceries, all carefully selected for quality.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIcnW8s38ZxOm-m-vmWsYG2xgbwd-SEhEBljDH7Dg4p5QpnFoKzhx24a8T3Hla-peW3ELH7XhgVTMyByEd6OrgL2I1aQIjexpaaalfk98ZYbKw6-8m00D09aT8RUnuJ273tp_uNBdvk6C9IuPEQNNPjvsV8DKkLqa0XFSLvM4o7Rl_Y36uTFTrZWzkBS_Gdr_VIpyDfMMX-QSAFXyC8OtQuHVBXn1SYEu3njjvCO6QwRXpie8b68vZz6X-Be-hK95qFNp2giVoOv8',
  },
  {
    id: 3,
    title: 'Fast & Easy Delivery',
    description: 'Get your favorite products delivered quickly and safely to your home with our reliable delivery service.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIcnW8s38ZxOm-m-vmWsYG2xgbwd-SEhEBljDH7Dg4p5QpnFoKzhx24a8T3Hla-peW3ELH7XhgVTMyByEd6OrgL2I1aQIjexpaaalfk98ZYbKw6-8m00D09aT8RUnuJ273tp_uNBdvk6C9IuPEQNNPjvsV8DKkLqa0XFSLvM4o7Rl_Y36uTFTrZWzkBS_Gdr_VIpyDfMMX-QSAFXyC8OtQuHVBXn1SYEu3njjvCO6QwRXpie8b68vZz6X-Be-hK95qFNp2giVoOv8',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  const handleNext = async () => {
    if (currentPage < ONBOARDING_DATA.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
    } else {
      // Last page - complete onboarding
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      navigation.replace('Login');
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollPosition / width);
    setCurrentPage(pageIndex);
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_DATA.map((item, index) => (
          <View key={item.id} style={styles.page}>
            {/* Illustration Container */}
            <View style={styles.illustrationContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.illustration}
                resizeMode="contain"
                onError={(error) => {
                  console.log('Image load error:', error);
                }}
              />
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
              {/* Text Block */}
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                {ONBOARDING_DATA.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentPage && styles.progressDotActive,
                      index < currentPage && styles.progressDotCompleted,
                    ]}
                  />
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>
                    {currentPage === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
                  </Text>
                </TouchableOpacity>

                {currentPage < ONBOARDING_DATA.length - 1 && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 320,
  },
  illustration: {
    width: '100%',
    height: '100%',
    maxHeight: height * 0.5,
  },
  contentSection: {
    flexShrink: 0,
    paddingBottom: 32,
  },
  textBlock: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6E0FF',
    opacity: 0.5,
  },
  progressDotActive: {
    opacity: 1,
    backgroundColor: '#E6E0FF',
  },
  progressDotCompleted: {
    opacity: 1,
    backgroundColor: '#E6E0FF',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  nextButton: {
    minHeight: 48,
    maxWidth: 480,
    width: '100%',
    backgroundColor: '#E6E0FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A4A',
    letterSpacing: 0.015,
  },
  skipButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
    opacity: 0.7,
  },
});

