import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { items, getTotalPrice, clearCart } = useCart();

  const handlePlaceOrder = () => {
    // TODO: Implement order placement
    Alert.alert('Order Placed', 'Your order has been placed successfully!');
    clearCart();
    navigation.navigate('MainTabs');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-6">Checkout</Text>
        
        <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <Text className="text-xl font-semibold mb-4">Order Summary</Text>
          <View className="space-y-2 mb-4">
            {items.map((item: any) => (
              <View key={item.id} className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="flex-1">{item.name} x{item.quantity}</Text>
                <Text className="font-medium">₨ {(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          <View className="pt-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold">Total</Text>
              <Text className="text-2xl font-bold text-primary">
                ₨ {getTotalPrice().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handlePlaceOrder}
          className="bg-primary py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CheckoutScreen;

