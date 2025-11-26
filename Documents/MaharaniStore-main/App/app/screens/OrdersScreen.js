import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useOrder } from '../context/OrderContext';
import { productAPI } from '../services/api';

const OrdersScreen = ({ navigation }) => {
  const {
    orders,
    loading,
    error,
    refreshOrders,
    getOrdersByStatus,
  } = useOrder();

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const statusTabs = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'pending', label: 'Pending', count: getOrdersByStatus('pending').length },
    { key: 'confirmed', label: 'Confirmed', count: getOrdersByStatus('confirmed').length },
    { key: 'preparing', label: 'Preparing', count: getOrdersByStatus('preparing').length },
    { key: 'ready', label: 'Ready', count: getOrdersByStatus('ready').length },
    { key: 'out_for_delivery', label: 'Out for Delivery', count: getOrdersByStatus('out_for_delivery').length },
    { key: 'delivered', label: 'Delivered', count: getOrdersByStatus('delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: getOrdersByStatus('cancelled').length },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      preparing: '#8B5CF6',
      ready: '#10B981',
      out_for_delivery: '#06B6D4',
      delivered: '#10B981',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusTexts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedStatus === tab.key && styles.activeTab
            ]}
            onPress={() => setSelectedStatus(tab.key)}
          >
            <Text style={[
              styles.tabText,
              selectedStatus === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabBadge,
                selectedStatus === tab.key && styles.activeTabBadge
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  selectedStatus === tab.key && styles.activeTabBadgeText
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOrderItem = ({ item }) => {
    const statusColor = getStatusColor(item.orderStatus);
    const statusText = getStatusText(item.orderStatus);

    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.itemPreview}>
              <View style={styles.itemImageContainer}>
                {orderItem.product.images && orderItem.product.images.length > 0 ? (
                  <Image
                    source={{ uri: productAPI.getImageUrl(orderItem.product.images[0]) }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.itemImage, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>📦</Text>
                  </View>
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {orderItem.product.name}
                </Text>
                <Text style={styles.itemQuantity}>
                  Qty: {orderItem.quantity} • ₹{orderItem.price}
                </Text>
              </View>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItemsText}>
              +{item.items.length - 2} more items
            </Text>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{item.items.length} items</Text>
          </View>
        </View>

        {/* Order Actions */}
        <View style={styles.orderActions}>
          {item.orderStatus === 'pending' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(item._id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
          {item.orderStatus === 'delivered' && (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleReorder(item)}
            >
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Implement cancel order logic
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
          }
        }
      ]
    );
  };

  const handleReorder = (order) => {
    Alert.alert(
      'Reorder',
      'Add all items from this order to cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            // Implement reorder logic
            Alert.alert('Added to Cart', 'Items have been added to your cart.');
            navigation.navigate('Cart');
          }
        }
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus === 'all' 
          ? "You haven't placed any orders yet"
          : `No ${selectedStatus} orders found`
        }
      </Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopNowButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const getFilteredOrders = () => {
    if (selectedStatus === 'all') {
      return orders;
    }
    return getOrdersByStatus(selectedStatus);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Text>
      </View>

      {/* Status Tabs */}
      {renderStatusTabs()}

      {/* Orders List */}
      {getFilteredOrders().length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={getFilteredOrders()}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6200EE']}
              tintColor="#6200EE"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#6200EE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#6200EE',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  reorderButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6200EE',
    backgroundColor: '#F3F0FF',
  },
  reorderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6200EE',
    textAlign: 'center',
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#6200EE',
  },
  viewDetailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopNowButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  shopNowButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
});

export default OrdersScreen;
