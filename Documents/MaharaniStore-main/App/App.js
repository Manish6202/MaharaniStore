import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Context Providers
import { AuthProvider } from "./app/context/AuthContext";
import { CartProvider } from "./app/context/CartContext";
import { WishlistProvider } from "./app/context/WishlistContext";
import { OrderProvider } from "./app/context/OrderContext";

// Screens
import SplashScreen from "./app/screens/SplashScreen";
import OnboardingScreen from "./app/screens/OnboardingScreen";
import LoginScreen from "./app/screens/LoginScreen";
import BottomTabNavigator from "./app/navigation/BottomTabNavigator";
import ProductDetailScreen from "./app/screens/ProductDetailScreen";
import GroceryScreen from "./app/screens/GroceryScreen";
import CosmeticsScreen from "./app/screens/CosmeticsScreen";
import CartScreen from "./app/screens/CartScreen";
import CheckoutScreen from "./app/screens/CheckoutScreen";
import OrdersScreen from "./app/screens/OrdersScreen";
import OrderDetailScreen from "./app/screens/OrderDetailScreen";
import EditProfileScreen from "./app/screens/EditProfileScreen";
import AddressManagementScreen from "./app/screens/AddressManagementScreen";
import AddEditAddressScreen from "./app/screens/AddEditAddressScreen";
import SelectAddressScreen from "./app/screens/SelectAddressScreen";
import PaymentOptionsScreen from "./app/screens/PaymentOptionsScreen";
import ReviewOrderScreen from "./app/screens/ReviewOrderScreen";
import PaymentSuccessScreen from "./app/screens/PaymentSuccessScreen";
import NoInternetScreen from "./app/screens/NoInternetScreen";
import SearchScreen from "./app/screens/SearchScreen";
import ErrorScreen from "./app/screens/ErrorScreen";
import OrderTrackingScreen from "./app/screens/OrderTrackingScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          {/* Splash Screen */}
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />

          {/* Onboarding Screen */}
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />

          {/* Login Screen */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          {/* Main App with Bottom Tabs */}
          <Stack.Screen
            name="Home"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />

          {/* Product Detail Screen */}
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ headerShown: false }}
          />

          {/* Grocery Screen */}
          <Stack.Screen
            name="Grocery"
            component={GroceryScreen}
            options={{ headerShown: false }}
          />

          {/* Cosmetics Screen */}
          <Stack.Screen
            name="Cosmetics"
            component={CosmeticsScreen}
            options={{ headerShown: false }}
          />

          {/* Cart Screen */}
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ headerShown: false }}
          />

          {/* Checkout Screen */}
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />

          {/* Orders Screen */}
          <Stack.Screen
            name="Orders"
            component={OrdersScreen}
            options={{ headerShown: false }}
          />
          
          {/* Order Detail Screen */}
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{ headerShown: false }}
          />

          {/* Profile Management Screens */}
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddressManagement"
            component={AddressManagementScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddAddress"
            component={AddEditAddressScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditAddress"
            component={AddEditAddressScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddEditAddress"
            component={AddEditAddressScreen}
            options={{ headerShown: false }}
          />
          
          {/* Checkout Flow Screens */}
          <Stack.Screen
            name="SelectAddress"
            component={SelectAddressScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentOptions"
            component={PaymentOptionsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReviewOrder"
            component={ReviewOrderScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentSuccess"
            component={PaymentSuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NoInternet"
            component={NoInternetScreen}
            options={{ headerShown: false }}
          />
          
          {/* Search Screen */}
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ headerShown: false }}
          />
          
          {/* Error Screen */}
          <Stack.Screen
            name="Error"
            component={ErrorScreen}
            options={{ headerShown: false }}
          />
          
          {/* Order Tracking Screen */}
          <Stack.Screen
            name="OrderTracking"
            component={OrderTrackingScreen}
            options={{ headerShown: false }}
          />
          
        </Stack.Navigator>
            </NavigationContainer>
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
