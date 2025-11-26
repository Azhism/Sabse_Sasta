import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { shoppingListsAPI } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type ViewShoppingListScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type ViewShoppingListScreenRouteProp = {
  key: string;
  name: 'ViewShoppingList';
  params: { id: string };
};

const ViewShoppingListScreen = () => {
  const route = useRoute<ViewShoppingListScreenRouteProp>();
  const navigation = useNavigation<ViewShoppingListScreenNavigationProp>();
  const { id } = route.params;
  const [list, setList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      const listData = await shoppingListsAPI.getById(id);
      setList(listData);
      setListName(listData.list_name || listData.name || listData.listName || 'Shopping List');

      if (listData.items) {
        setItems(listData.items.map((item: any) => {
          const product = item.product || {};
          return {
            id: item.id,
            product_id: item.product_id || item.productId,
            quantity: item.quantity_value || item.quantity || 1,
            product: {
              id: product.product_id?.toString() || product.id,
              product_id: product.product_id,
              name: product.product_name || product.base_product_name || product.name || '',
              category: product.category || product.category_id || '',
              brand: product.brand || '',
            },
          };
        }));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  const [listName, setListName] = useState('');

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-6">{listName}</Text>

        {loading ? (
          <Text className="text-center text-muted-foreground py-12">Loading...</Text>
        ) : items.length === 0 ? (
          <View className="py-12 items-center">
            <Text className="text-muted-foreground">No items in this list</Text>
          </View>
        ) : (
          <View className="space-y-4">
            {items.map((item: any) => (
              <View key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <Text className="font-semibold text-lg mb-2">{item.product.name}</Text>
                {item.product.brand && (
                  <Text className="text-sm text-muted-foreground mb-1">
                    Brand: {item.product.brand}
                  </Text>
                )}
                {item.product.category && (
                  <Text className="text-sm text-muted-foreground mb-2">
                    Category: {item.product.category}
                  </Text>
                )}
                <Text className="text-primary font-semibold">Quantity: {item.quantity}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ViewShoppingListScreen;

