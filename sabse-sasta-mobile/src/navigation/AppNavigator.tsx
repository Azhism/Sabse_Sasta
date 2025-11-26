import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AuthScreen from '../screens/AuthScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ShoppingListsScreen from '../screens/ShoppingListsScreen';
import CreateShoppingListScreen from '../screens/CreateShoppingListScreen';
import ViewShoppingListScreen from '../screens/ViewShoppingListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VendorLoginScreen from '../screens/VendorLoginScreen';
import VendorDashboardScreen from '../screens/VendorDashboardScreen';
import NotFoundScreen from '../screens/NotFoundScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Auth: undefined;
  SearchResults: { query?: string };
  Cart: undefined;
  Checkout: undefined;
  ShoppingLists: undefined;
  CreateShoppingList: undefined;
  ViewShoppingList: { id: string };
  Profile: undefined;
  VendorLogin: undefined;
  VendorDashboard: undefined;
  NotFound: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  ShoppingLists: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const queryClient = new QueryClient();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchResultsScreen} />
      <Tab.Screen name="ShoppingLists" component={ShoppingListsScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="ShoppingLists" component={ShoppingListsScreen} />
              <Stack.Screen name="CreateShoppingList" component={CreateShoppingListScreen} />
              <Stack.Screen name="ViewShoppingList" component={ViewShoppingListScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="VendorLogin" component={VendorLoginScreen} />
            </>
          )}
          <Stack.Screen name="NotFound" component={NotFoundScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

export default AppNavigator;
