import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, shoppingListsAPI } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type CreateShoppingListScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CreateShoppingListScreen = () => {
  const navigation = useNavigation<CreateShoppingListScreenNavigationProp>();
  const [listName, setListName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Array<{ productId: string; name: string; quantity: number }>>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const data = await productsAPI.getAll();
      return (data || []).map((item: any) => ({
        id: item.product_id?.toString() || item.id,
        product_id: item.product_id,
        name: item.product_name || item.base_product_name || item.name,
        product_name: item.product_name,
        base_product_name: item.base_product_name,
        category: item.category || item.category_id,
        brand: item.brand,
        package_size: item.package_size,
        variant_name: item.variant_name,
      }));
    },
  });

  const filteredProducts = products?.filter((p: any) => {
    const searchLower = searchValue.toLowerCase();
    const name = (p.name || p.product_name || p.base_product_name || '').toLowerCase();
    const category = typeof p.category === 'string' 
      ? p.category.toLowerCase() 
      : typeof p.category === 'number' 
      ? p.category.toString().toLowerCase()
      : '';
    const brand = (p.brand || '').toLowerCase();
    const packageSize = (p.package_size || '').toLowerCase();
    const variant = (p.variant_name || '').toLowerCase();

    return name.includes(searchLower) ||
           category.includes(searchLower) ||
           brand.includes(searchLower) ||
           packageSize.includes(searchLower) ||
           variant.includes(searchLower);
  }) || [];

  const addProduct = (product: any) => {
    const productId = product.product_id?.toString() || product.id;
    const productName = product.name || product.product_name || product.base_product_name || 'Unknown Product';
    const exists = selectedProducts.find(p => p.productId === productId);
    if (!exists && productId) {
      setSelectedProducts([...selectedProducts, {
        productId: productId,
        name: productName,
        quantity: 1,
      }]);
    }
    setSearchValue('');
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedProducts(selectedProducts.map(p =>
      p.productId === productId ? { ...p, quantity } : p
    ));
  };

  const handleSubmit = async () => {
    if (!listName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one product');
      return;
    }

    setLoading(true);

    try {
      const list = await shoppingListsAPI.create({
        name: listName,
        items: selectedProducts.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      });

      Alert.alert('Success', 'Shopping list created', [
        { text: 'OK', onPress: () => navigation.navigate('ViewShoppingList', { id: list.id || list.list_id }) }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create shopping list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-6">Create Shopping List</Text>

        {/* List Name */}
        <View className="mb-6">
          <Text className="mb-2 font-medium">List Name</Text>
          <TextInput
            value={listName}
            onChangeText={setListName}
            placeholder="Enter list name"
            className="border border-gray-300 rounded-lg px-4 py-3"
          />
        </View>

        {/* Search Products */}
        <View className="mb-6">
          <Text className="mb-2 font-medium">Add Products</Text>
          <TextInput
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search for products..."
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          />
          
          {searchValue && (
            <View className="bg-white border border-gray-200 rounded-lg max-h-60">
              <ScrollView>
                {filteredProducts.map((product: any) => {
                  const productId = product.product_id?.toString() || product.id;
                  const productName = product.name || product.product_name || product.base_product_name || 'Unknown';
                  const isSelected = selectedProducts.some(p => p.productId === productId);

                  return (
                    <TouchableOpacity
                      key={productId}
                      onPress={() => addProduct(product)}
                      disabled={isSelected}
                      className={`p-3 border-b border-gray-100 ${isSelected ? 'bg-gray-50' : ''}`}
                    >
                      <Text className="font-medium">{productName}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {product.brand || 'N/A'} • {product.category || 'N/A'} {product.package_size ? `• ${product.package_size}` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Selected Products */}
        <View className="mb-6">
          <Text className="mb-2 font-medium">Selected Products ({selectedProducts.length})</Text>
          {selectedProducts.map((item) => (
            <View key={item.productId} className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold">{item.name}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="border border-gray-300 w-8 h-8 rounded items-center justify-center"
                  >
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text className="w-8 text-center">{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="border border-gray-300 w-8 h-8 rounded items-center justify-center"
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeProduct(item.productId)}
                    className="bg-red-100 px-3 py-1 rounded ml-2"
                  >
                    <Text className="text-red-600 text-xs">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="bg-primary py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? 'Creating...' : 'Create List'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateShoppingListScreen;

