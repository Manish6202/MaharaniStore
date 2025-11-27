import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useOrder } from '../context/OrderContext';
import { productAPI } from '../services/api';

const OrdersScreen = ({ navigation }) => {
  const { orders, loading, refreshOrders, getOrdersByStatus } = useOrder();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Canceled' },
  ];

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return { bg: '#D1FAE5', text: '#16a34a' };
    if (statusLower.includes('shipped')) return { bg: '#DBEAFE', text: '#2563EB' };
    if (statusLower.includes('processing') || statusLower.includes('pending') || statusLower.includes('confirmed')) {
      return { bg: '#FED7AA', text: '#ea580c' };
    }
    if (statusLower.includes('cancelled')) return { bg: '#FEE2E2', text: '#dc2626' };
    return { bg: '#F3F4F6', text: '#666666' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = getOrdersByStatus(selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        const orderNumber = (order.orderNumber || order._id || '').toLowerCase();
        const productNames = (order.items || [])
          .map((item) => (item.product?.name || item.name || '').toLowerCase())
          .join(' ');
        return orderNumber.includes(query) || productNames.includes(query);
      });
    }

    return filtered;
  };

  const renderOrderCard = (order) => {
    // Handle both orderStatus and status fields
    const orderStatus = order.orderStatus || order.status || 'pending';
    const statusColors = getStatusColor(orderStatus);
    const orderItems = order.items || [];
    const firstThreeItems = orderItems.slice(0, 3);
    const totalItems = orderItems.length;
    const totalAmount = order.totalAmount || order.total || 0;

    const getItemImage = (item) => {
      if (item.product?.images?.[0]) {
        return productAPI.getImageUrl(item.product.images[0]);
      }
      if (item.image) {
        return productAPI.getImageUrl(item.image);
      }
      return 'https://via.placeholder.com/64';
    };

    const getButtonText = () => {
      const statusLower = orderStatus.toLowerCase();
      if (statusLower.includes('shipped') || statusLower.includes('out_for_delivery')) return 'Track Order';
      return 'View Details';
    };

    return (
      <TouchableOpacity
        key={order._id || order.id}
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: order._id || order.id })}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>
              Order #{order.orderNumber || order._id?.slice(-6) || 'N/A'}
            </Text>
            <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt || order.date)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {orderStatus || 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.orderImagesContainer}>
          {firstThreeItems.map((item, index) => (
            <Image
              key={index}
              source={{ uri: getItemImage(item) }}
              style={styles.orderImage}
              resizeMode="cover"
            />
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderSummary}>
            {totalItems} item{totalItems > 1 ? 's' : ''} -{' '}
            <Text style={styles.orderTotal}>₹{totalAmount}</Text>
          </Text>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: order._id || order.id })}
          >
            <Text style={styles.viewDetailsButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>My Orders</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order number or product"
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedStatus === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF9933']}
            tintColor="#FF9933"
          />
        }
      >
        {loading && filteredOrders.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9933" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => renderOrderCard(order))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtext}>
              You haven't placed any orders yet. Let's get shopping!
            </Text>
            <TouchableOpacity
              style={styles.startShoppingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  safeAreaTop: {
    backgroundColor: '#F6F7F8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F7F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#111827',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F7F8',
  },
  searchContainer: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  filtersContainer: {
    backgroundColor: '#F6F7F8',
    paddingVertical: 12,
    maxHeight: 56,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#FF9933',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingTop: 0,
    paddingBottom: 32,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderImagesContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  orderImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  orderSummary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  viewDetailsButton: {
    minWidth: 84,
    maxWidth: 480,
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#FF9933',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FF993310',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  startShoppingButton: {
    minWidth: 84,
    maxWidth: 480,
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FF9933',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startShoppingButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default OrdersScreen;
