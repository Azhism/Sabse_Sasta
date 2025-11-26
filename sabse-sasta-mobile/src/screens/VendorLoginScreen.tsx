import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type VendorLoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const VendorLoginScreen = () => {
  const navigation = useNavigation<VendorLoginScreenNavigationProp>();

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Vendor Login</Text>
      <Text className="text-muted-foreground text-center mb-8">
        Please use the Auth screen to login as a vendor
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Auth')}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Go to Auth</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VendorLoginScreen;

