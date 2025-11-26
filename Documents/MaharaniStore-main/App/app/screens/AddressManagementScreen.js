import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { userProfileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddressManagementScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  // Refresh addresses when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 AddressManagementScreen focused - refreshing addresses');
      loadAddresses();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const result = await userProfileAPI.getAddresses();
      console.log('📍 Addresses loaded:', result.data?.length || 0);
      setAddresses(result.data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      if (error.message && !error.message.includes('Access denied')) {
        Alert.alert('Error', 'Failed to load addresses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress', {});
  };

  const handleEditAddress = (address) => {
    navigation.navigate('EditAddress', { address });
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteAddress(addressId)
        }
      ]
    );
  };

  const deleteAddress = async (addressId) => {
    try {
      await userProfileAPI.deleteAddress(addressId);
      await loadAddresses();
      Alert.alert('Success', 'Address deleted successfully!', [
        { text: 'OK', onPress: () => {} }
      ]);
    } catch (error) {
      console.error('Error deleting address:', error);
      Alert.alert('Error', 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await userProfileAPI.setDefaultAddress(addressId);
      await loadAddresses();
      Alert.alert('Success', 'Default address updated!', [
        { text: 'OK', onPress: () => {} }
      ]);
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home': return '🏠';
      case 'work': return '🏢';
      default: return '📍';
    }
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'home': return '#10B981';
      case 'work': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const renderAddressCard = (address) => (
    <View key={address._id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <Text style={styles.addressTypeIcon}>
            {getAddressTypeIcon(address.type)}
          </Text>
          <Text style={styles.addressTypeText}>
            {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
          </Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteAddress(address._id)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.addressDetails}>
        <Text style={styles.addressName}>{address.name}</Text>
        <Text style={styles.addressPhone}>{address.phone}</Text>
        <Text style={styles.addressText}>{address.address}</Text>
        {address.landmark && (
          <Text style={styles.addressLandmark}>Near {address.landmark}</Text>
        )}
        <Text style={styles.addressLocation}>
          {address.city}, {address.state} - {address.pincode}
        </Text>
      </View>

      {!address.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(address._id)}
        >
          <Text style={styles.setDefaultButtonText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📍</Text>
      <Text style={styles.emptyTitle}>No Addresses Found</Text>
      <Text style={styles.emptyMessage}>
        Add your first address to get started with deliveries
      </Text>
      <TouchableOpacity
        style={styles.addFirstAddressButton}
        onPress={handleAddAddress}
      >
        <Text style={styles.addFirstAddressButtonText}>Add Address</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Addresses</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => navigation.navigate('Home', { screen: 'Profile' })}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddAddress}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {addresses.length === 0 ? (
        renderEmptyState()
      ) : (
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
          <View style={styles.addressesContainer}>
            {addresses.map(renderAddressCard)}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  addressesContainer: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addressTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  addressLandmark: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  addressLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  setDefaultButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
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
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstAddressButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  addFirstAddressButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AddressManagementScreen;
