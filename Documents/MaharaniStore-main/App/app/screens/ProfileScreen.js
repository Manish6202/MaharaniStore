import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { userProfileAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, user, token, logout, updateUserData } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      loadUserData();
    }
  }, [isAuthenticated, token]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 ProfileScreen focused - refreshing data');
      if (isAuthenticated && token) {
        loadUserData();
      }
    });
    return unsubscribe;
  }, [navigation, isAuthenticated, token]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      // Load user profile, addresses, and stats
      const [profileResult, addressesResult, statsResult] = await Promise.all([
        userProfileAPI.getProfile(),
        userProfileAPI.getAddresses(),
        userProfileAPI.getStats()
      ]);

      console.log('📊 Profile data loaded:', {
        addresses: addressesResult.data?.length || 0,
        stats: statsResult.data
      });

      // Update AuthContext with fresh user data (only if different)
      const freshUserData = profileResult.data;
      if (JSON.stringify(freshUserData) !== JSON.stringify(user)) {
        await updateUserData(freshUserData);
      }

      setAddresses(addressesResult.data || []);
      setStats(statsResult.data);
    } catch (error) {
      console.error('Error loading user data:', error);
      if (error.message && !error.message.includes('Access denied')) {
        Alert.alert('Error', 'Failed to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleManageAddresses = () => {
    navigation.navigate('AddressManagement');
  };

  const handleOrderHistory = () => {
    Alert.alert('Coming Soon', 'Order history will be available soon!');
  };

  const handleSettings = () => {
    Alert.alert('Coming Soon', 'Settings will be available soon!');
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editAvatarButton}>
          <Text style={styles.editAvatarText}>📷</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userPhone}>{user?.phone || 'No phone'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Account Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{addresses.length}</Text>
          <Text style={styles.statLabel}>Addresses</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>₹{stats?.totalSpent || 0}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {stats?.memberSince ? new Date(stats.memberSince).getFullYear() : '2024'}
          </Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
      </View>
    </View>
  );

  const renderMenuItems = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.sectionTitle}>Account</Text>
      
      <TouchableOpacity style={styles.menuItem} onPress={handleManageAddresses}>
        <View style={styles.menuItemLeft}>
          <Text style={styles.menuIcon}>📍</Text>
          <View>
            <Text style={styles.menuTitle}>Manage Addresses</Text>
            <Text style={styles.menuSubtitle}>{addresses.length} saved addresses</Text>
          </View>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleOrderHistory}>
        <View style={styles.menuItemLeft}>
          <Text style={styles.menuIcon}>📦</Text>
          <View>
            <Text style={styles.menuTitle}>Order History</Text>
            <Text style={styles.menuSubtitle}>View your past orders</Text>
          </View>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
        <View style={styles.menuItemLeft}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <View>
            <Text style={styles.menuTitle}>Settings</Text>
            <Text style={styles.menuSubtitle}>Notifications, preferences</Text>
          </View>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <View style={styles.menuItemLeft}>
          <Text style={styles.menuIcon}>🚪</Text>
          <View>
            <Text style={[styles.menuTitle, styles.logoutText]}>Logout</Text>
            <Text style={styles.menuSubtitle}>Sign out of your account</Text>
          </View>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>👤</Text>
          <Text style={styles.errorTitle}>Please Login</Text>
          <Text style={styles.errorMessage}>
            You need to be logged in to view your profile
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6200EE']}
            tintColor="#6200EE"
          />
        }
      >
        {renderProfileHeader()}
        {renderStats()}
        {renderMenuItems()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editAvatarText: {
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  logoutText: {
    color: '#EF4444',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
});

export default ProfileScreen;