import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { shoppingListsAPI } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type ShoppingListsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ShoppingListsScreen = () => {
  const navigation = useNavigation<ShoppingListsScreenNavigationProp>();
  const { isAuthenticated } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    fetchLists();
  }, [isAuthenticated, navigation]);

  const fetchLists = async () => {
    try {
      const data = await shoppingListsAPI.getAll();
      const transformedLists = (data || []).map((list: any) => ({
        id: list.list_id?.toString() || list.id,
        list_id: list.list_id,
        name: list.list_name || list.name,
        list_name: list.list_name,
        created_at: list.createdAt || list.created_at,
        updated_at: list.updatedAt || list.updated_at,
      }));
      setLists(transformedLists);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load shopping lists');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Shopping List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await shoppingListsAPI.delete(id);
              Alert.alert('Success', 'Shopping list deleted');
              fetchLists();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete shopping list');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold">My Shopping Lists</Text>
            <Text className="text-muted-foreground mt-2">
              Create and manage your shopping lists
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateShoppingList')}
            className="bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">+ New</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text className="text-center text-muted-foreground py-12">Loading your lists...</Text>
        ) : lists.length === 0 ? (
          <View className="bg-white rounded-lg border border-gray-200 p-12 items-center">
            <Text className="text-muted-foreground mb-4 text-center">
              You don't have any shopping lists yet
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateShoppingList')}
              className="bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Create Your First List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {lists.map((list) => (
              <View key={list.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold mb-2">
                      {list.name || list.list_name || 'Untitled List'}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      Created {new Date(list.created_at || list.createdAt || Date.now()).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => navigation.navigate('ViewShoppingList', { id: list.id })}
                      className="border border-gray-300 px-3 py-2 rounded-lg"
                    >
                      <Text>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(list.id)}
                      className="bg-red-100 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-red-600">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ShoppingListsScreen;

