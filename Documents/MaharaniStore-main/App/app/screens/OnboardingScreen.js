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
    title: 'Fresh & Reliable',
    description: 'Get farm-fresh essentials and trusted cosmetic brands delivered right to your doorstep, every single time.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvkV3Fz-9oufvoA1UNTgS72CjjMjmQPpKRExK_W10pkDYhLojroF1RXmDL9zkqWbvc5vaTvEOM8m0Sgw6GiRrInptH4AR61YYesGuDUydqegIMVdx4k0Cr5nrabZSv1ZoNkk9BwDGEQc677gSgt3B2xF3jk1nF7m6hdcXXaF47nwJUV5cxYReFsNIrNBQRe5K2LamK2TkqXTSkda5WS3Jn-6zvO2bIABRsK80qi1tZM2-t5bsdZ6mXhYQbA2SkON-LCMz3qtIsrg',
  },
  {
    id: 2,
    title: 'Quick Delivery',
    description: 'Get your daily essentials and favourite cosmetics delivered to your doorstep in minutes.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpX4oGrKzF0efZGx_2NgkO17VEEBXLNAak-w_9pnte8V7ifP0nfKzrKBSkbitFPr3mb8GDFfJVntu0tPpVnywxR0BmY_6ijqR41ZvIwcm_8Sc0TYt1Tv3PXdXi_q9eAZQdDILfs_A2LNsPulbdzdHSXlAMTS2kd3Qk5MiteePxLRMzkM6ozeSaWcKhv7gW0zX1U8qbAiWM0iwD6YHbxfUKNYVFAyfVBlAIb8DnvDYgBW2dYpCkKILTxFjCAcCh0nyaHZusIGLyxQ',
  },
  {
    id: 3,
    title: 'Beauty + Grocery in One App',
    description: 'All your daily essentials, delivered with care.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPKg0cUzpGvwNpzWLUuwunbVOM5UvTN70JxZqVH0WfqitYH4B6tabIMjmAtf8BKmGD5SYPMVt65UD_eqNiJ8lxpTcr8RTddZwO4jWmg00gdBt5HpnNNayx9O9SgHwN-BN2mLvpemwwzbVGb_E3L0EPX8b65Apj1mXD-SY88ZweiS5LCG7sNEI2GRklwzctqW1ZpA4km1XbZGRXN39Dz9zHj6T38KP8WyMRgySeus4CSQzi-qXSVQljrlSeIx-fT38bTpEnIejucg',
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
    backgroundColor: '#FCFCFC',
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
    fontSize: 30,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
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
    backgroundColor: '#FF9933',
    opacity: 0.2,
  },
  progressDotActive: {
    width: 8,
    opacity: 1,
    backgroundColor: '#FF9933',
  },
  progressDotCompleted: {
    opacity: 0.2,
    backgroundColor: '#FF9933',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  nextButton: {
    minHeight: 56,
    maxWidth: 480,
    width: '100%',
    backgroundColor: '#FF9933',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#FF9933',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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

