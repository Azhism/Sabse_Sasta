import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { z } from 'zod';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { login, register, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  
  // Sign Up Form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  const handleSignUp = async () => {
    try {
      const validatedData = signUpSchema.parse({
        email: signUpEmail,
        password: signUpPassword,
        fullName,
        phone,
      });

      setLoading(true);

      await register(
        validatedData.email,
        validatedData.password,
        validatedData.fullName,
        validatedData.phone,
        userType
      );

      Alert.alert(
        'Account created!',
        userType === 'vendor'
          ? 'Vendor account created! Redirecting to vendor dashboard...'
          : "You've been signed up successfully. Redirecting...",
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        Alert.alert('Validation error', error.errors[0].message);
      } else {
        Alert.alert('Sign up failed', error.message || 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const validatedData = loginSchema.parse({
        email: loginEmail,
        password: loginPassword,
      });

      setLoading(true);

      await login(validatedData.email, validatedData.password);

      Alert.alert('Welcome back!', "You've been logged in successfully.", [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
      ]);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        Alert.alert('Validation error', error.errors[0].message);
      } else {
        Alert.alert('Login failed', error.message || 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center">
              <Text className="text-3xl font-bold text-white">₨</Text>
            </View>
            <Text className="text-2xl font-bold text-primary">Sabse Sasta</Text>
          </View>
          <Text className="text-muted-foreground text-center">
            Sign in to start comparing prices and saving money
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-6 bg-muted rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setActiveTab('login')}
            className={`flex-1 py-3 rounded-lg ${activeTab === 'login' ? 'bg-primary' : ''}`}
          >
            <Text className={`text-center font-semibold ${activeTab === 'login' ? 'text-white' : 'text-foreground'}`}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('signup')}
            className={`flex-1 py-3 rounded-lg ${activeTab === 'signup' ? 'bg-primary' : ''}`}
          >
            <Text className={`text-center font-semibold ${activeTab === 'signup' ? 'text-white' : 'text-foreground'}`}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        {activeTab === 'login' && (
          <View className="space-y-4">
            <View>
              <Text className="mb-2 font-medium">Email</Text>
              <TextInput
                value={loginEmail}
                onChangeText={setLoginEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-border rounded-lg px-4 py-3"
              />
            </View>
            <View>
              <Text className="mb-2 font-medium">Password</Text>
              <TextInput
                value={loginPassword}
                onChangeText={setLoginPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="border border-border rounded-lg px-4 py-3"
              />
            </View>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary py-3 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-semibold">
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <View className="space-y-4">
            <View>
              <Text className="mb-2 font-medium">Account Type</Text>
              <View className="flex-row gap-4 mb-2">
                <TouchableOpacity
                  onPress={() => setUserType('customer')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 ${userType === 'customer' ? 'border-primary bg-primary/10' : 'border-border'}`}
                >
                  <Text className={`text-center ${userType === 'customer' ? 'text-primary font-semibold' : 'text-foreground'}`}>
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUserType('vendor')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 ${userType === 'vendor' ? 'border-primary bg-primary/10' : 'border-border'}`}
                >
                  <Text className={`text-center ${userType === 'vendor' ? 'text-primary font-semibold' : 'text-foreground'}`}>
                    Vendor
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-muted-foreground">
                {userType === 'vendor'
                  ? 'Vendors can upload product catalogs and manage their listings'
                  : 'Customers can search and compare prices'}
              </Text>
            </View>
            <View>
              <Text className="mb-2 font-medium">Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                className="border border-border rounded-lg px-4 py-3"
              />
            </View>
            <View>
              <Text className="mb-2 font-medium">Email</Text>
              <TextInput
                value={signUpEmail}
                onChangeText={setSignUpEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-border rounded-lg px-4 py-3"
              />
            </View>
            <View>
              <Text className="mb-2 font-medium">Password</Text>
              <TextInput
                value={signUpPassword}
                onChangeText={setSignUpPassword}
                placeholder="Enter your password (min 6 characters)"
                secureTextEntry
                className="border border-border rounded-lg px-4 py-3"
              />
            </View>
            <View>
              <Text className="mb-2 font-medium">Phone (Optional)</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                className="border border-border rounded-lg px-4 py-3"
              />
            </View>
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="bg-primary py-3 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-semibold">
                {loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AuthScreen;

