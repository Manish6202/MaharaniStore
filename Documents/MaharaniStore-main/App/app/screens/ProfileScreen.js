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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { orders } = useOrder();
  const { items: wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return '#16a34a'; // Green
    if (statusLower.includes('processing') || statusLower.includes('pending') || statusLower.includes('confirmed')) return '#ea580c'; // Orange
    if (statusLower.includes('cancelled')) return '#dc2626'; // Red
    return '#666666';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderOrderItem = (order) => {
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const itemImage = firstItem?.product?.images?.[0] || firstItem?.image || 'https://via.placeholder.com/64';
    const itemName = firstItem?.product?.name || firstItem?.name || 'Product';
    const itemCount = order.items?.length || 1;

    return (
      <View key={order._id || order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{order.orderNumber || order._id?.slice(-5) || 'N/A'}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt || order.date)}</Text>
          </View>
          <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
            {order.status || 'Pending'}
          </Text>
        </View>
        <View style={styles.orderContent}>
          <Image
            source={{ uri: itemImage }}
            style={styles.orderImage}
            resizeMode="cover"
          />
          <View style={styles.orderInfo}>
            <Text style={styles.orderItemName}>{itemName}</Text>
            <Text style={styles.orderItemCount}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total</Text>
            <Text style={styles.orderTotalAmount}>₹{order.totalAmount || order.total || 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayOrders = orders.slice(0, 10); // Show last 10 orders

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>My Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user.profilePicture ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuA9PEwoUpQkhIbSsHGSUa0MT68OviEvnc0Cp24xm6R_RyY8QhOua_Z3Wy7tjX4iaiCjhUnSjnqnSyum9tAa_1h4D_eBPMtFM3nXOQMu9lEt4G70FKVriTQ5ZNUCRHrd-YkOKWT0s3VbJd70f6c7RTbLBksom-KwmGi0uOxGZBtXuqBS1ijAS3kxxePWPZKunvnvVINuCQ7Syla5YuJN6ufvjKHUHGJflih0RzrWT8Y8Svv74dUfJ9YqdcCpkqgaYAgzBYwMcmMHn35z',
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email || 'user@example.com'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation List */}
          <View style={styles.navList}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.navItemLeft}>
                <View style={styles.navIconContainer}>
                  <Text style={styles.navIcon}>👤</Text>
                </View>
                <Text style={styles.navItemText}>Personal Details</Text>
              </View>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('AddressManagement')}
            >
              <View style={styles.navItemLeft}>
                <View style={styles.navIconContainer}>
                  <Text style={styles.navIcon}>📍</Text>
                </View>
                <Text style={styles.navItemText}>My Addresses</Text>
              </View>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon!')}
            >
              <View style={styles.navItemLeft}>
                <View style={styles.navIconContainer}>
                  <Text style={styles.navIcon}>💳</Text>
                </View>
                <Text style={styles.navItemText}>Payment Methods</Text>
              </View>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
              onPress={() => setActiveTab('orders')}
            >
              <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
                Order History
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
              onPress={() => setActiveTab('saved')}
            >
              <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
                Saved Items
              </Text>
            </TouchableOpacity>
          </View>

          {/* Order History List */}
          {activeTab === 'orders' && (
            <View style={styles.ordersList}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF9933" />
                </View>
              ) : displayOrders.length > 0 ? (
                displayOrders.map((order) => renderOrderItem(order))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No orders yet</Text>
                  <Text style={styles.emptyStateSubtext}>Your order history will appear here</Text>
                </View>
              )}
            </View>
          )}

          {/* Saved Items List */}
          {activeTab === 'saved' && (
            <View style={styles.ordersList}>
              {wishlistItems.length > 0 ? (
                <Text style={styles.savedItemsText}>
                  {wishlistItems.length} saved item{wishlistItems.length > 1 ? 's' : ''}
                </Text>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No saved items</Text>
                  <Text style={styles.emptyStateSubtext}>Items you save will appear here</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@maharani.com')}
          >
            <Text style={styles.helpLink}>Help & Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#111418',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111418',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#FF993320',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 64,
  },
  userInfo: {
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111418',
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '400',
    color: '#617589',
    textAlign: 'center',
  },
  editProfileButton: {
    width: '100%',
    maxWidth: 480,
    height: 40,
    backgroundColor: '#FF9933',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navList: {
    gap: 8,
    paddingTop: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FF993320',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: '#FF9933',
  },
  navItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
    flex: 1,
  },
  navArrow: {
    fontSize: 24,
    color: '#111418',
  },
  tabsSection: {
    flex: 1,
    backgroundColor: '#F6F7F8',
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
  },
  tabTextActive: {
    color: '#FF9933',
  },
  ordersList: {
    marginTop: 16,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111418',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666666',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  orderImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111418',
  },
  orderItemCount: {
    fontSize: 14,
    color: '#666666',
  },
  orderTotal: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderTotalLabel: {
    fontSize: 14,
    color: '#666666',
  },
  orderTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111418',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111418',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  savedItemsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 24,
  },
  footer: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 48,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  helpLink: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
});

export default ProfileScreen;
