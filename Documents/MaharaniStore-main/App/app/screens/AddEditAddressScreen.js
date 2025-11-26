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
} from 'react-native';
import { userProfileAPI } from '../services/api';

const AddEditAddressScreen = ({ navigation, route }) => {
  const { address } = route.params || {};
  const isEdit = !!address;
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Address types
  const addressTypes = [
    { label: 'Home', value: 'home', icon: '🏠' },
    { label: 'Work', value: 'work', icon: '🏢' },
    { label: 'Other', value: 'other', icon: '📍' },
  ];

  // Indian states
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry', 'Lakshadweep',
    'Daman and Diu', 'Dadra and Nagar Haveli', 'Andaman and Nicobar Islands'
  ];

  useEffect(() => {
    if (isEdit && address) {
      setFormData({
        type: address.type || 'home',
        name: address.name || '',
        phone: address.phone || '',
        address: address.address || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
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
      Alert.alert('Error', 'Please enter the contact name');
      return;
    }

    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter the address');
      return;
    }

    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter the city');
      return;
    }

    if (!formData.state.trim()) {
      Alert.alert('Error', 'Please select the state');
      return;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await userProfileAPI.updateAddress(address._id, formData);
        console.log('✅ Address updated');
      } else {
        await userProfileAPI.addAddress(formData);
        console.log('✅ Address added');
      }
      
      Alert.alert(
        'Success',
        `Address ${isEdit ? 'updated' : 'added'} successfully!`,
        [
          { 
            text: 'Done', 
            onPress: () => {
              // Navigate to Home screen (which contains BottomTabNavigator with Profile tab)
              navigation.navigate('Home', { screen: 'Profile' });
            }
          },
          { 
            text: 'Add More', 
            onPress: () => {
              // Stay on current screen to add more addresses
              setFormData({
                type: 'home',
                name: '',
                phone: '',
                address: '',
                landmark: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: false,
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error saving address:', error);
      Alert.alert('Error', `Failed to ${isEdit ? 'update' : 'add'} address. Please try again.`);
    }
    setSaving(false);
  };

  const renderAddressTypeSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Address Type</Text>
      <View style={styles.typeContainer}>
        {addressTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeOption,
              formData.type === type.value && styles.typeOptionSelected
            ]}
            onPress={() => handleInputChange('type', type.value)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={[
              styles.typeText,
              formData.type === type.value && styles.typeTextSelected
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStateSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>State *</Text>
      <ScrollView style={styles.stateContainer} nestedScrollEnabled>
        {states.map((state) => (
          <TouchableOpacity
            key={state}
            style={[
              styles.stateOption,
              formData.state === state && styles.stateOptionSelected
            ]}
            onPress={() => handleInputChange('state', state)}
          >
            <Text style={[
              styles.stateText,
              formData.state === state && styles.stateTextSelected
            ]}>
              {state}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

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
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </Text>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Address Type */}
          {renderAddressTypeSelector()}

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter contact name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Address Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter complete address"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.landmark}
                onChangeText={(text) => handleInputChange('landmark', text)}
                placeholder="e.g., Near Metro Station"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.city}
                  onChangeText={(text) => handleInputChange('city', text)}
                  placeholder="Enter city"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.pincode}
                  onChangeText={(text) => handleInputChange('pincode', text)}
                  placeholder="Enter pincode"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            {/* State Selector */}
            {renderStateSelector()}
          </View>

          {/* Default Address Option */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.defaultOption}
              onPress={() => handleInputChange('isDefault', !formData.isDefault)}
            >
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  formData.isDefault && styles.checkboxSelected
                ]}>
                  {formData.isDefault && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxTitle}>Set as Default Address</Text>
                  <Text style={styles.checkboxSubtitle}>
                    This will be used for all future deliveries
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
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
  saveButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  typeOptionSelected: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  stateContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  stateOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stateOptionSelected: {
    backgroundColor: '#F3F4F6',
  },
  stateText: {
    fontSize: 14,
    color: '#374151',
  },
  stateTextSelected: {
    color: '#6200EE',
    fontWeight: '600',
  },
  defaultOption: {
    paddingVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  checkboxSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default AddEditAddressScreen;
