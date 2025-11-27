import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';

const NoInternetScreen = ({ navigation, onRetry }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default: navigate to Home
      navigation?.navigate('Home');
    }
  };

  const handleNavPress = (screen) => {
    if (navigation) {
      navigation.navigate('Home', { screen });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contentWrapper}>
          {/* Illustration */}
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEBfLvXBS9k9vQDng1r08QHUdWneyTF6e3AC0tA0WJblJxcq8FvqbZTNBKssOUG4gmEZ_1FewlV_e6ql2LGw-qDA-KzaTleiX0ElZ6gVxmgqjhnuwL86vhis_9Yc_qp2Y-hUyBX-sd7vgRC2w0y7j5C2GHVbBYi25KIOzQogikL7PlROzkhmiNDkOMFmiKgZLoprZS8yg73wBqJ-kAUvpVBrK-B_FA8kimHbV5DjDgEsNUslBxyCNNYZzPiIVqRkLNaSTioWnUIg',
            }}
            style={styles.illustration}
            resizeMode="contain"
          />

          {/* Headline */}
          <Text style={styles.headline}>No Internet Connection</Text>

          {/* Body Text */}
          <Text style={styles.bodyText}>
            Please check your internet connection and try again.
          </Text>

          {/* Retry Button */}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryIcon}>🔄</Text>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavPress('Home')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavPress('Categories')}
        >
          <Text style={styles.navIcon}>📂</Text>
          <Text style={styles.navLabel}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavPress('Cart')}
        >
          <Text style={styles.navIcon}>🛍️</Text>
          <Text style={styles.navLabel}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavPress('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  contentWrapper: {
    alignItems: 'center',
    maxWidth: 400,
  },
  illustration: {
    width: 256,
    height: 256,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginTop: 32,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#888888',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 300,
    height: 56,
    backgroundColor: '#FF9933',
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  retryIcon: {
    fontSize: 20,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 24,
    color: '#888888',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#888888',
  },
});

export default NoInternetScreen;

