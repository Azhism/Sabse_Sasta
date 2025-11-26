import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const data = await productsAPI.getFeatured();
      return (data || []).map((item: any) => ({
        id: item.product_id?.toString() || item.id,
        product_id: item.product_id,
        name: item.product_name || item.base_product_name || item.name,
        product_name: item.product_name,
        base_product_name: item.base_product_name,
        category: item.category,
        brand: item.brand,
        size: item.package_size || item.size,
        package_size: item.package_size,
        price: item.price,
        vendor: item.vendor,
      }));
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery.trim() });
    }
  };

  const handleAddToCart = (product: any) => {
    const productId = product.product_id?.toString() || product.id || '';
    const productName = product.name || product.product_name || product.base_product_name || 'Unknown Product';
    
    addToCart({
      id: productId,
      productId: productId,
      name: productName,
      category: product.category || '',
      brand: product.brand || '',
      size: product.package_size || product.size || '',
      price: product.price || 0,
      vendor: product.vendor || '',
    });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-white">₨</Text>
            <Text className="text-xl font-bold text-white">Sabse Sasta</Text>
          </View>
          {isAuthenticated && (
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
              <Text className="text-white">Cart</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View className="flex-row gap-2 bg-white rounded-lg p-2">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for products..."
            className="flex-1 px-3 py-2"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View className="p-4 bg-gradient-to-br from-accent/20 to-white">
        <View className="bg-accent rounded-full px-4 py-2 self-start mb-4">
          <Text className="text-sm font-medium text-accent-foreground">Save up to 30% on groceries</Text>
        </View>
        
        <Text className="text-3xl font-bold mb-2">
          Find the <Text className="text-primary">Lowest Prices</Text> Across All Supermarkets
        </Text>
        
        <Text className="text-muted-foreground mb-6">
          Compare prices instantly from Imtiaz, Bin Hashim, Max Budget, and more.
        </Text>

        {/* Stats */}
        <View className="flex-row justify-around mt-6">
          <View>
            <Text className="text-2xl font-bold text-primary">5+</Text>
            <Text className="text-sm text-muted-foreground">Vendors</Text>
          </View>
          <View>
            <Text className="text-2xl font-bold text-primary">1000+</Text>
            <Text className="text-sm text-muted-foreground">Products</Text>
          </View>
          <View>
            <Text className="text-2xl font-bold text-primary">30%</Text>
            <Text className="text-sm text-muted-foreground">Avg Savings</Text>
          </View>
        </View>
      </View>

      {/* Featured Products */}
      <View className="p-4 bg-muted/30">
        <Text className="text-2xl font-bold mb-4">Featured Products</Text>
        
        {isLoading ? (
          <Text className="text-center text-muted-foreground py-8">Loading products...</Text>
        ) : products && products.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.map((product: any) => (
              <View key={product.id} className="bg-white rounded-lg p-4 mr-4 w-48 shadow-sm">
                <View className="w-16 h-16 bg-primary rounded-lg items-center justify-center mb-3">
                  <Text className="text-white text-2xl">📦</Text>
                </View>
                <Text className="font-semibold mb-2" numberOfLines={2}>
                  {product.name || product.product_name || 'Unknown Product'}
                </Text>
                {product.brand && (
                  <Text className="text-sm text-muted-foreground mb-2">{product.brand}</Text>
                )}
                <Text className="text-xl font-bold text-primary mb-3">
                  ₨ {product.price ? product.price.toFixed(2) : 'N/A'}
                </Text>
                <TouchableOpacity
                  onPress={() => handleAddToCart(product)}
                  className="bg-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">Add to Cart</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text className="text-center text-muted-foreground py-8">No featured products available</Text>
        )}
      </View>

      {/* CTA Section */}
      <View className="p-4 items-center">
        <Text className="text-xl font-bold mb-2">Start Saving Today</Text>
        <Text className="text-muted-foreground text-center mb-4">
          Create shopping lists and compare prices across vendors
        </Text>
        {!isAuthenticated && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Auth')}
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
