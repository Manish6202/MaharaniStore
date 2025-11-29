import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';

const ErrorScreen = ({ navigation, route }) => {
  const errorMessage = route?.params?.message || "We encountered an unexpected error. Please try again or go back to the previous page.";
  const onRetry = route?.params?.onRetry || null;

  const handleTryAgain = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default: go back
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home');
              }
            }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeD54G-8jNZZE-qb4GtpanwBFEI_x1yNy6OSn3DRoFCZU2S0KwAheOJdxqSYjwp7t4YGzYk8LyMeZXrXD0Oi4CLTmbtXk2G8XXDo4PB630VYiWl5tUl-iGIkKRiM8-VlM6eGZCjRuNky7ytNn8DyMzg5o6-34NGUx4e2BTdRU1qjMwh3BlbHTgPzOWfIWQfoyBSxIS5TNyBNb_Hl3LeGNEqR0_Yti4jRh2Ym_GlhN8MetmDW-pLXZ5Bk4glusxquxODxP0ToMZSw'
              }}
              style={styles.errorImage}
              resizeMode="contain"
            />
            <Text style={styles.errorTitle}>Oops! Something Went Wrong</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleTryAgain}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FDFDFD',
  },
  backButton: {
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
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginRight: 40, // Compensate for back button width
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  errorImage: {
    width: 256,
    height: 256,
    marginBottom: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  retryButton: {
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
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ErrorScreen;

