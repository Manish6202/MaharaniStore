import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // 2 seconds ke baad check karo kahan jana hai
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
  }, [navigation, isAuthenticated, loading]);

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF9E8', '#FFDAB9']} // Radial gradient effect - from light cream to peach
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 1]}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            {/* Main Title */}
            <Text style={styles.title}>MAHARANI</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>Daily Store + Beauty Store</Text>
            
            {/* Divider Line */}
            <View style={styles.divider} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: height,
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F2C1D', // Dark brown color
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4F2C1D', // Dark brown color
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    width: 64,
    height: 1,
    backgroundColor: '#4F2C1D', // Dark brown color
    marginTop: 8,
  },
});
