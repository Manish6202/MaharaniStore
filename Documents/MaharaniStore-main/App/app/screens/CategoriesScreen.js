import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { productAPI } from '../services/api';

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await productAPI.getCategories();
      console.log('📂 Categories loaded:', result);
      setCategories(result.data);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName) => {
    if (categoryName === 'Grocery') {
      navigation.navigate('Grocery');
    } else {
      Alert.alert('Coming Soon', `${categoryName} products will be available soon!`);
    }
  };

  const handleSubcategoryPress = (categoryName, subcategoryName) => {
    Alert.alert('Coming Soon', `${subcategoryName} products will be available soon!`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!categories) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>Browse our products by category</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(categories.categories).map(([mainCategory, subcategories]) => (
          <View key={mainCategory} style={styles.categorySection}>
            <TouchableOpacity 
              style={styles.mainCategoryCard}
              onPress={() => handleCategoryPress(mainCategory)}
            >
              <View style={styles.mainCategoryContent}>
                <View style={styles.mainCategoryInfo}>
                  <Text style={styles.mainCategoryTitle}>{mainCategory.toUpperCase()}</Text>
                  <Text style={styles.mainCategorySubtitle}>
                    {categories.counts[mainCategory]?.total || 0} products
                  </Text>
                </View>
                <View style={styles.mainCategoryIcon}>
                  <Text style={styles.mainCategoryIconText}>
                    {mainCategory === 'Grocery' ? '🛒' : '💄'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.subcategoriesContainer}>
              {subcategories.map((subcategory, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.subcategoryCard}
                  onPress={() => handleSubcategoryPress(mainCategory, subcategory)}
                >
                  <Text style={styles.subcategoryText}>{subcategory}</Text>
                  <Text style={styles.subcategoryCount}>
                    {categories.counts[mainCategory]?.subcategories?.[subcategory] || 0}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 20,
  },
  mainCategoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  mainCategoryInfo: {
    flex: 1,
  },
  mainCategoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  mainCategorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  mainCategoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCategoryIconText: {
    fontSize: 24,
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subcategoryCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  subcategoryCount: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default CategoriesScreen;