import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Progress bar animation (0% to 45% in 2 seconds)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // 2 sec ke baad check karo kahan jana hai
    const timer = setTimeout(async () => {
      try {
        // Wait for auth to finish loading
        if (loading) {
          // If still loading, wait a bit more
          setTimeout(async () => {
            await navigateToNextScreen();
          }, 500);
          return;
        }
        
        await navigateToNextScreen();
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Error case mein Login pe jao
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, progressAnim, isAuthenticated, loading]);

  const navigateToNextScreen = async () => {
    try {
      // Check if onboarding is completed
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      
      // Agar user logged in hai, to Home pe jao
      if (isAuthenticated) {
        navigation.replace('Home');
      }
      // Agar onboarding nahi hua hai, to onboarding pe jao
      else if (!onboardingCompleted) {
        navigation.replace('Onboarding');
      }
      // Warna Login pe jao
      else {
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error in navigateToNextScreen:', error);
      navigation.replace('Login');
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '45%'],
  });

  return (
    <LinearGradient
      colors={['#FADADD', '#E6E6FA']} // brand-blush to brand-lavender
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Logo with shadow effect */}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Maharani</Text>
        </View>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Everyday Royalty</Text>
      </View>

      {/* Loading Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              { width: progressWidth }
            ]} 
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5E4B56', // brand-plum
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(94, 75, 86, 0.8)', // brand-plum with opacity
    marginTop: 8,
    fontWeight: '400',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 64,
    width: width - 64,
    paddingHorizontal: 32,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(94, 75, 86, 0.1)', // brand-plum/10
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(94, 75, 86, 0.4)', // brand-plum/40
    borderRadius: 9999,
  },
});
