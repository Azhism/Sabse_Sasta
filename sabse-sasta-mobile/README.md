# Sabse Sasta Mobile App

React Native mobile app for the Sabse Sasta price comparison platform built with Expo, TypeScript, React Navigation, and NativeWind.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API
- **API Client**: Axios
- **Storage**: AsyncStorage

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```
   
   For physical device testing, replace `localhost` with your computer's IP address:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/emulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## Project Structure

```
src/
├── screens/          # Screen components
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── ShoppingListScreen.tsx
│   ├── VendorPortalScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/       # Navigation configuration
│   └── AppNavigator.tsx
├── contexts/         # React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
└── services/         # API service functions
    ├── api.ts
    ├── authService.ts
    ├── productService.ts
    ├── shoppingListService.ts
    └── vendorService.ts
```

## Features

- **Authentication**: Email/password login and registration with JWT
- **Product Search**: Search and filter products by name, category, brand
- **Price Comparison**: Compare prices across different vendors
- **Shopping Lists**: Create and manage shopping lists
- **Vendor Portal**: Upload CSV files with product catalogs (vendor only)
- **User Profile**: View and edit user profile information
- **Shopping Cart**: Add products to cart with quantity management

## Screens

1. **LoginScreen**: User authentication (login/register)
2. **HomeScreen**: Featured products and search
3. **SearchScreen**: Product search with filters
4. **ProductDetailScreen**: Product details and price comparison
5. **ShoppingListScreen**: Manage shopping lists
6. **VendorPortalScreen**: CSV upload for vendors
7. **ProfileScreen**: User profile and settings

## API Integration

The app connects to the backend API at the URL specified in `EXPO_PUBLIC_API_URL`. Make sure the backend server is running before using the app.

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## License

ISC

