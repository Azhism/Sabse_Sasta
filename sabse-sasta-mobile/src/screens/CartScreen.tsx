import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  // Group items by vendor
  const itemsByVendor = items.reduce((acc: any, item: any) => {
    if (!acc[item.vendor]) {
      acc[item.vendor] = [];
    }
    acc[item.vendor].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const getVendorTotal = (vendor: string) => {
    return itemsByVendor[vendor].reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );
  };

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-6xl mb-6">🛒</Text>
        <Text className="text-2xl font-bold mb-4">Your Cart is Empty</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Start shopping to add items to your cart
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs')}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold mb-1">Shopping Cart</Text>
            <Text className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </Text>
          </View>
          <TouchableOpacity
            onPress={clearCart}
            className="border border-gray-300 px-4 py-2 rounded-lg"
          >
            <Text>Clear Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items by Vendor */}
        <View className="space-y-6 mb-6">
          {Object.entries(itemsByVendor).map(([vendor, vendorItems]: [string, any[]]) => (
            <View key={vendor} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Vendor Header */}
              <View className="bg-muted/30 p-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl">📦</Text>
                    <Text className="text-lg font-semibold">{vendor}</Text>
                  </View>
                  <View className="bg-gray-200 px-3 py-1 rounded">
                    <Text className="font-semibold">₨ {getVendorTotal(vendor).toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              {/* Items */}
              <View className="p-4 space-y-4">
                {vendorItems.map((item: any) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between pb-4 border-b border-gray-100 last:border-0"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-start gap-3">
                        <View className="w-12 h-12 bg-primary rounded-lg items-center justify-center">
                          <Text className="text-white text-xl">📦</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-semibold mb-1">{item.name}</Text>
                          <View className="flex-row gap-2 mb-1">
                            <View className="bg-gray-100 px-2 py-1 rounded">
                              <Text className="text-xs">{item.brand}</Text>
                            </View>
                            <View className="bg-gray-200 px-2 py-1 rounded">
                              <Text className="text-xs">{item.size}</Text>
                            </View>
                          </View>
                          <Text className="text-sm text-muted-foreground">
                            ₨ {item.price.toFixed(2)} each
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-end gap-2">
                      {/* Quantity Controls */}
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          className="border border-gray-300 w-8 h-8 rounded items-center justify-center"
                        >
                          <Text>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          value={item.quantity.toString()}
                          onChangeText={(text) => {
                            const qty = parseInt(text) || 1;
                            updateQuantity(item.id, qty);
                          }}
                          keyboardType="numeric"
                          className="w-12 h-8 text-center border border-gray-300 rounded"
                        />
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          className="border border-gray-300 w-8 h-8 rounded items-center justify-center"
                        >
                          <Text>+</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Price and Remove */}
                      <Text className="text-lg font-bold text-primary">
                        ₨ {(item.price * item.quantity).toFixed(2)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        className="bg-red-100 px-3 py-1 rounded"
                      >
                        <Text className="text-red-600 text-xs">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-lg border border-gray-200 p-4">
          <Text className="text-xl font-bold mb-4">Order Summary</Text>
          
          <View className="space-y-2 mb-4">
            {Object.entries(itemsByVendor).map(([vendor, vendorItems]: [string, any[]]) => (
              <View key={vendor} className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-muted-foreground">{vendor}</Text>
                <Text className="font-medium">₨ {getVendorTotal(vendor).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View className="pt-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">Total</Text>
              <Text className="text-2xl font-bold text-primary">
                ₨ {getTotalPrice().toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Checkout')}
              className="bg-primary py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CartScreen;

