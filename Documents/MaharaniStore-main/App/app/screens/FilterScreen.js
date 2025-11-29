import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Platform,
} from 'react-native';

const FilterScreen = ({ visible, onClose, onApply, initialFilters = {} }) => {
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [50, 5000]);
  const [selectedBrands, setSelectedBrands] = useState(initialFilters.brands || []);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'Skincare');
  const [availability, setAvailability] = useState(initialFilters.availability ?? true);
  const [selectedSkinType, setSelectedSkinType] = useState(initialFilters.skinType || 'Dry Skin');
  const [selectedDiet, setSelectedDiet] = useState(initialFilters.diet || 'Gluten-Free');

  const brands = ['Himalaya', 'Cetaphil', 'Nivea', 'The Face Shop'];
  const categories = ['Skincare', 'Haircare', 'Groceries'];
  const skinTypes = ['All Skin Types', 'Dry Skin', 'Oily Skin', 'Sensitive'];
  const diets = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Organic'];

  const toggleBrand = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleClearAll = () => {
    setPriceRange([50, 5000]);
    setSelectedBrands([]);
    setSelectedCategory('Skincare');
    setAvailability(true);
    setSelectedSkinType('Dry Skin');
    setSelectedDiet('Gluten-Free');
  };

  const handleApply = () => {
    const filters = {
      priceRange,
      brands: selectedBrands,
      category: selectedCategory,
      availability,
      skinType: selectedSkinType,
      diet: selectedDiet,
    };
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Filters</Text>
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={styles.clearButton}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceInputLabel}>Min:</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={priceRange[0].toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 50;
                        if (value >= 50 && value <= 5000) {
                          setPriceRange([value, priceRange[1]]);
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="50"
                    />
                  </View>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceInputLabel}>Max:</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={priceRange[1].toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 5000;
                        if (value >= 50 && value <= 5000) {
                          setPriceRange([priceRange[0], value]);
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="5000"
                    />
                  </View>
                </View>
                <View style={styles.priceLabels}>
                  <Text style={styles.priceLabel}>₹{priceRange[0]}</Text>
                  <Text style={styles.priceLabel}>₹{priceRange[1]}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Brand */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Brand</Text>
              <View style={styles.checkboxList}>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={styles.checkboxItem}
                    onPress={() => toggleBrand(brand)}
                  >
                    <View style={[
                      styles.checkbox,
                      selectedBrands.includes(brand) && styles.checkboxChecked
                    ]}>
                      {selectedBrands.includes(brand) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category && styles.categoryOptionActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategory === category && styles.categoryOptionTextActive
                    ]}>
                      {category}
                    </Text>
                    {selectedCategory === category && (
                      <Text style={styles.categoryCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Availability */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.sectionTitle}>Availability</Text>
                <Switch
                  value={availability}
                  onValueChange={setAvailability}
                  trackColor={{ false: '#E5E7EB', true: '#FF9933' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E7EB"
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Skin Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skin Type</Text>
              <View style={styles.chipsContainer}>
                {skinTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      selectedSkinType === type && styles.chipActive
                    ]}
                    onPress={() => setSelectedSkinType(type)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedSkinType === type && styles.chipTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Diet */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diet</Text>
              <View style={styles.chipsContainer}>
                {diets.map((diet) => (
                  <TouchableOpacity
                    key={diet}
                    style={[
                      styles.chip,
                      selectedDiet === diet && styles.chipActive
                    ]}
                    onPress={() => setSelectedDiet(diet)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedDiet === diet && styles.chipTextActive
                    ]}>
                      {diet}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCFCFC',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9933',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  sliderContainer: {
    marginTop: 8,
  },
  priceInputs: {
    gap: 12,
    marginBottom: 16,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    width: 50,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#212121',
    backgroundColor: '#FCFCFC',
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  checkboxList: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FCFCFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF9933',
    borderColor: '#FF9933',
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#212121',
  },
  categoryContainer: {
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryOptionActive: {
    backgroundColor: '#FF993310',
    borderColor: '#FF9933',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  categoryOptionTextActive: {
    fontWeight: '600',
    color: '#FF9933',
  },
  categoryCheckmark: {
    fontSize: 16,
    color: '#FF9933',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FCFCFC',
  },
  chipActive: {
    borderColor: '#FF9933',
    backgroundColor: '#FF993310',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  chipTextActive: {
    fontWeight: '600',
    color: '#FF9933',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  applyButton: {
    width: '100%',
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default FilterScreen;

