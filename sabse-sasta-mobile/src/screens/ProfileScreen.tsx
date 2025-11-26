import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { z } from 'zod';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional(),
});

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    checkUserAndLoadProfile();
  }, [isAuthenticated, navigation, user]);

  const checkUserAndLoadProfile = async () => {
    if (!user) return;

    try {
      setEmail(user.email || '');
      const profile = await profileAPI.get();
      setFullName(profile.fullName || profile.name || '');
      setPhone(profile.phone || '');
    } catch (error: any) {
      Alert.alert('Error loading profile', error.message || 'Failed to load profile');
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);

    try {
      const validatedData = profileSchema.parse({ full_name: fullName, phone });

      if (!isAuthenticated) {
        navigation.navigate('Auth');
        return;
      }

      await profileAPI.update({
        fullName: validatedData.full_name,
        phone: validatedData.phone || undefined,
      });

      await refreshUser();

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        Alert.alert('Validation Error', error.errors[0].message);
      } else {
        Alert.alert('Error', error.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-6">Profile Settings</Text>

        <View className="space-y-4">
          <View>
            <Text className="mb-2 font-medium">Email</Text>
            <TextInput
              value={email}
              editable={false}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-100"
            />
            <Text className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </Text>
          </View>

          <View>
            <Text className="mb-2 font-medium">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
          </View>

          <View>
            <Text className="mb-2 font-medium">Phone Number (Optional)</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={loading}
            className="bg-primary py-3 rounded-lg mt-4"
          >
            <Text className="text-white text-center font-semibold">
              {loading ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
