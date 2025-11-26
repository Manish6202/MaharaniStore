import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image, View, StyleSheet, Animated, Platform } from 'react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Icon mapping for different tabs
const iconMap = {
  home: { type: 'image', source: require('../assets/images/home_icon.png') },
  categories: { type: 'emoji', emoji: '📂' },
  cart: { type: 'image', source: require('../assets/images/shopping_icon.png') },
  wishlist: { type: 'emoji', emoji: '❤️' },
  orders: { type: 'emoji', emoji: '📦' },
  profile: { type: 'emoji', emoji: '👤' },
};

// Custom Icon Component with Animation
const AnimatedIcon = ({ focused, iconKey, color, inactiveColor, size = 26 }) => {
  const scaleAnim = React.useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  const iconConfig = iconMap[iconKey];

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
  }, [focused]);

  const iconColor = focused ? color : inactiveColor;
  const iconOpacity = focused ? 1 : 0.6;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {iconConfig.type === 'image' ? (
        <Image
          source={iconConfig.source}
          style={{
            width: size,
            height: size,
            tintColor: iconColor,
            opacity: iconOpacity,
          }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ fontSize: size, color: iconColor, opacity: iconOpacity }}>
          {iconConfig.emoji}
        </Text>
      )}
    </Animated.View>
  );
};

// Badge Component
const Badge = ({ count }) => {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

// Tab Icon Wrapper
const TabIcon = ({ focused, iconKey, color, inactiveColor, badgeCount }) => {
  return (
    <View style={styles.iconContainer}>
      <AnimatedIcon
        focused={focused}
        iconKey={iconKey}
        color={color}
        inactiveColor={inactiveColor}
        size={26}
      />
      {badgeCount > 0 && <Badge count={badgeCount} />}
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

const BottomTabNavigator = () => {
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#5E4B56', // brand-plum
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              iconKey="home"
              color={color}
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              iconKey="categories"
              color={color}
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              iconKey="cart"
              color={color}
              inactiveColor="#9CA3AF"
              badgeCount={totalItems}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favourite"
        component={WishlistScreen}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              iconKey="wishlist"
              color={color}
              inactiveColor="#9CA3AF"
              badgeCount={wishlistItems}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              iconKey="orders"
              color={color}
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              iconKey="profile"
              color={color}
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    position: 'absolute',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5E4B56', // brand-plum
  },
});

export default BottomTabNavigator;
