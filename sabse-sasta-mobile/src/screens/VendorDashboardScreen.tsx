import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type VendorDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const VendorDashboardScreen = () => {
  const navigation = useNavigation<VendorDashboardScreenNavigationProp>();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-6">Vendor Dashboard</Text>
        <Text className="text-muted-foreground mb-4">
          Manage your product listings and uploads
        </Text>
        {/* TODO: Implement vendor dashboard functionality */}
        <View className="bg-white border border-gray-200 rounded-lg p-4">
          <Text className="text-center text-muted-foreground">
            Vendor dashboard features coming soon
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default VendorDashboardScreen;

