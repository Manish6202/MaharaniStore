import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { userProfileAPI } from '../services/api';

const AddEditAddressScreen = ({ navigation, route }) => {
  const { address } = route.params || {};
  const isEdit = !!address;
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pincode: '',
    cityState: '',
    address: '',
    isDefault: false,
  });

  useEffect(() => {
    if (isEdit && address) {
      setFormData({
        name: address.name || '',
        phone: address.phone || '',
        pincode: address.pincode || '',
        cityState: `${address.city || ''}${address.state ? `, ${address.state}` : ''}`,
        address: address.address || '',
        isDefault: address.isDefault || false,
      });
    }
  }, [isEdit, address]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    if (!formData.cityState.trim()) {
      Alert.alert('Error', 'Please enter city & state');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter your full address');
      return;
    }

    setSaving(true);
    try {
      const addressData = {
        name: formData.name,
        phone: formData.phone,
        pincode: formData.pincode,
        city: formData.cityState.split(',')[0]?.trim() || '',
        state: formData.cityState.split(',')[1]?.trim() || '',
        address: formData.address,
        isDefault: formData.isDefault,
      };

      if (isEdit) {
        await userProfileAPI.updateAddress(address._id, addressData);
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        await userProfileAPI.addAddress(addressData);
        Alert.alert('Success', 'Address added successfully!');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('❌ Error saving address:', error);
      Alert.alert('Error', `Failed to ${isEdit ? 'update' : 'add'} address. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Address</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#888888"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>10-digit Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              placeholderTextColor="#888888"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Pincode and City & State */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Pincode"
                placeholderTextColor="#888888"
                value={formData.pincode}
                onChangeText={(text) => handleInputChange('pincode', text)}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>City & State</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter City & State"
                placeholderTextColor="#888888"
                value={formData.cityState}
                onChangeText={(text) => handleInputChange('cityState', text)}
              />
            </View>
          </View>

          {/* Full Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>House No., Building Name, Street, Landmark</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your full address"
              placeholderTextColor="#888888"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Default Address Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Make this my default address</Text>
            <Switch
              value={formData.isDefault}
              onValueChange={(value) => handleInputChange('isDefault', value)}
              trackColor={{ false: '#D1D5DB', true: '#FF9933' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
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
    color: '#212121',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    paddingRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E2DB',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#212121',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    width: '100%',
    minHeight: 128,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E2DB',
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#212121',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
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
    borderTopWidth: 1,
    borderTopColor: '#E6E2DB',
  },
  saveButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FF9933',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default AddEditAddressScreen;
