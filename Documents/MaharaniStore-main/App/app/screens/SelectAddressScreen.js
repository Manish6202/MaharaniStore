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
} from 'react-native';
import { userProfileAPI } from '../services/api';

const SelectAddressScreen = ({ navigation, route }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const result = await userProfileAPI.getAddresses();
      if (result.success && result.data.length > 0) {
        setAddresses(result.data);
        // Select default address or first address
        const defaultAddr = result.data.find(addr => addr.isDefault) || result.data[0];
        setSelectedAddress(defaultAddr._id);
      } else {
        // Sample addresses for demo
        setAddresses([
          {
            _id: '1',
            name: 'Priya Sharma',
            phone: '+91 98765 43210',
            address: 'C-1, 2nd Floor, Green Park Extension, New Delhi, Delhi 110016',
            addressType: 'Home',
            isDefault: true,
          },
          {
            _id: '2',
            name: 'Arjun Varma',
            phone: '+91 91234 56789',
            address: 'Flat 502, Orchid Heights, DLF Phase 5, Gurgaon, Haryana 122009',
            addressType: 'Work',
            isDefault: false,
          },
        ]);
        setSelectedAddress('1');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Use sample addresses on error
      setAddresses([
        {
          _id: '1',
          name: 'Priya Sharma',
          phone: '+91 98765 43210',
          address: 'C-1, 2nd Floor, Green Park Extension, New Delhi, Delhi 110016',
          addressType: 'Home',
          isDefault: true,
        },
        {
          _id: '2',
          name: 'Arjun Varma',
          phone: '+91 91234 56789',
          address: 'Flat 502, Orchid Heights, DLF Phase 5, Gurgaon, Haryana 122009',
          addressType: 'Work',
          isDefault: false,
        },
      ]);
      setSelectedAddress('1');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handleEditAddress = (address) => {
    navigation.navigate('AddEditAddress', { address });
  };

  const handleAddNewAddress = () => {
    navigation.navigate('AddEditAddress');
  };

  const handleDeliverToAddress = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }
    
    const address = addresses.find(addr => addr._id === selectedAddress);
    if (!address) {
      Alert.alert('Error', 'Address not found');
      return;
    }
    
    // Get total amount from route params
    const totalAmount = route.params?.totalAmount || 0;
    
    console.log('📍 Navigating to PaymentOptions with:', {
      totalAmount,
      address: address.name,
    });
    
    // Navigate to PaymentOptions
    navigation.navigate('PaymentOptions', {
      totalAmount,
      selectedAddress: address,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Address</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Address Cards */}
        {addresses.map((address) => (
          <TouchableOpacity
            key={address._id}
            style={[
              styles.addressCard,
              selectedAddress === address._id && styles.addressCardSelected
            ]}
            onPress={() => handleSelectAddress(address._id)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.addressTypeBadge,
              selectedAddress === address._id && styles.addressTypeBadgeSelected
            ]}>
              <Text style={[
                styles.addressTypeText,
                selectedAddress === address._id && styles.addressTypeTextSelected
              ]}>
                {address.addressType || 'Home'}
              </Text>
            </View>
            
            <View style={styles.addressContent}>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radio,
                  selectedAddress === address._id && styles.radioSelected
                ]}>
                  {selectedAddress === address._id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              
              <View style={styles.addressDetails}>
                <Text style={styles.addressName}>{address.name}</Text>
                <Text style={styles.addressText}>{address.address}</Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditAddress(address)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add New Address */}
        <TouchableOpacity
          style={styles.addAddressCard}
          onPress={handleAddNewAddress}
        >
          <View style={styles.addIconContainer}>
            <Text style={styles.addIcon}>+</Text>
          </View>
          <Text style={styles.addAddressText}>Add a New Address</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.deliverButton}
          onPress={handleDeliverToAddress}
        >
          <Text style={styles.deliverButtonText}>Deliver to this Address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FCFCFC',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  addressCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FCFCFC',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  addressCardSelected: {
    borderWidth: 2,
    borderColor: '#FF9933',
    backgroundColor: '#FCFCFC',
  },
  addressTypeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  addressTypeBadgeSelected: {
    backgroundColor: 'rgba(255, 153, 51, 0.1)',
  },
  addressTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888888',
  },
  addressTypeTextSelected: {
    color: '#FF9933',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 8,
  },
  radioContainer: {
    paddingTop: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderWidth: 6,
    borderColor: '#FF9933',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9933',
  },
  addressDetails: {
    flex: 1,
    gap: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingRight: 64,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888888',
    lineHeight: 20,
    marginTop: 8,
  },
  addressPhone: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888888',
    marginTop: 4,
  },
  editButton: {
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9933',
  },
  addAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    padding: 16,
    marginBottom: 16,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 153, 51, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#FF9933',
    fontWeight: '400',
  },
  addAddressText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  bottomSpacing: {
    height: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCFCFC',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deliverButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FF9933',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  deliverButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    color: '#888888',
  },
});

export default SelectAddressScreen;

