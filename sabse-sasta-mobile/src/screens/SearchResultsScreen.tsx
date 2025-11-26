import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type SearchResultsScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type SearchResultsScreenRouteProp = {
  key: string;
  name: 'SearchResults';
  params?: { query?: string };
};

const SearchResultsScreen = () => {
  const route = useRoute<SearchResultsScreenRouteProp>();
  const navigation = useNavigation<SearchResultsScreenNavigationProp>();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState(route.params?.query || '');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const data = await productsAPI.search(searchTerm);
      return (data || []).map((item: any) => ({
        id: item.product_id?.toString() || item.id,
        product_id: item.product_id,
        name: item.product_name || item.base_product_name || item.name,
        product_name: item.product_name,
        base_product_name: item.base_product_name,
        category: item.category || item.category_id,
        brand: item.brand,
        variant_name: item.variant_name,
        size: item.package_size || item.size,
        package_size: item.package_size,
        price: item.price,
        vendor: item.vendor,
      }));
    },
    enabled: !!searchTerm,
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Trigger refetch with new search term
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

  const groupedProducts = products?.reduce((acc: any, product: any) => {
    const productName = product.name || product.product_name || product.base_product_name || 'Unknown';
    const brand = product.brand || 'Unknown';
    const size = product.package_size || product.size || 'Unknown';
    const key = `${productName}-${brand}-${size}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Search Bar */}
        <View className="flex-row gap-2 bg-white rounded-lg p-2 border border-gray-200 mb-4">
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
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

        {/* Results Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold mb-2">
            Search Results for "{searchTerm}"
          </Text>
          <Text className="text-muted-foreground">
            {isLoading ? 'Searching...' : `Found ${products?.length || 0} products`}
          </Text>
        </View>

        {/* Results */}
        {isLoading ? (
          <View className="py-12 items-center">
            <Text className="text-muted-foreground">Loading products...</Text>
          </View>
        ) : !products || products.length === 0 ? (
          <View className="py-12 items-center">
            <Text className="text-4xl mb-4">📦</Text>
            <Text className="text-xl font-semibold mb-2">No products found</Text>
            <Text className="text-muted-foreground text-center">
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          <View className="space-y-6">
            {Object.entries(groupedProducts || {}).map(([key, items]: [string, any[]]) => {
              const product = items[0];
              const productName = product.name || product.product_name || product.base_product_name || 'Unknown Product';
              const productPrices = items.map((p: any) => p.price || 0).filter((p: number) => p > 0);
              const lowestPrice = productPrices.length > 0 ? Math.min(...productPrices) : 0;
              const highestPrice = productPrices.length > 0 ? Math.max(...productPrices) : 0;
              const savings = highestPrice - lowestPrice;

              return (
                <View key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                  {/* Product Header */}
                  <View className="bg-muted/30 p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row gap-4 flex-1">
                        <View className="w-16 h-16 bg-primary rounded-lg items-center justify-center">
                          <Text className="text-white text-2xl">📦</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xl font-bold mb-2">{productName}</Text>
                          <View className="flex-row gap-2 flex-wrap">
                            {product.category && (
                              <View className="bg-gray-100 px-2 py-1 rounded">
                                <Text className="text-xs">{product.category}</Text>
                              </View>
                            )}
                            {product.brand && (
                              <View className="bg-gray-200 px-2 py-1 rounded">
                                <Text className="text-xs">{product.brand}</Text>
                              </View>
                            )}
                            {(product.package_size || product.size) && (
                              <View className="bg-primary/10 px-2 py-1 rounded">
                                <Text className="text-xs text-primary">{product.package_size || product.size}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      {savings > 0 && (
                        <View className="items-end">
                          <Text className="text-sm text-muted-foreground">Save up to</Text>
                          <Text className="text-2xl font-bold text-secondary">
                            ₨ {savings.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Vendor Prices */}
                  <View className="p-4">
                    <View className="flex-row flex-wrap gap-4">
                      {items.map((item: any) => {
                        const itemId = item.product_id?.toString() || item.id || '';
                        const itemPrice = item.price || 0;
                        const isBestPrice = itemPrice > 0 && itemPrice === lowestPrice;

                        return (
                          <View
                            key={itemId}
                            className={`p-4 rounded-lg border-2 flex-1 min-w-[150px] ${
                              isBestPrice ? 'border-primary bg-primary/5' : 'border-gray-200'
                            }`}
                          >
                            <View className="flex-row justify-between items-start mb-3">
                              <Text className="font-semibold">{item.vendor || 'N/A'}</Text>
                              {isBestPrice && (
                                <View className="bg-primary px-2 py-1 rounded">
                                  <Text className="text-xs text-white">Best Price</Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-3xl font-bold text-primary mb-3">
                              ₨ {itemPrice > 0 ? itemPrice.toFixed(2) : 'N/A'}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleAddToCart(item)}
                              disabled={itemPrice === 0}
                              className={`py-2 px-4 rounded-lg border ${
                                itemPrice === 0 ? 'bg-gray-100 border-gray-200' : 'border-primary'
                              }`}
                            >
                              <Text className={`text-center ${itemPrice === 0 ? 'text-gray-400' : 'text-primary'}`}>
                                Add to Cart
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SearchResultsScreen;

