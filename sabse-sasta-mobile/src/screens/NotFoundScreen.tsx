import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NotFoundScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const NotFoundScreen = () => {
  const navigation = useNavigation<NotFoundScreenNavigationProp>();

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-6xl mb-4">404</Text>
      <Text className="text-2xl font-bold mb-2">Page Not Found</Text>
      <Text className="text-muted-foreground text-center mb-8">
        The page you're looking for doesn't exist
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('MainTabs')}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Go Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotFoundScreen;

