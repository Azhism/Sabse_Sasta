# Sabse Sasta - Complete Setup Instructions

This document provides step-by-step instructions to set up both the backend API and mobile app.

## Project Structure

```
D:\sabse sasta\
├── Sabse-Sasta\              (existing web app - unchanged)
├── sabse-sasta-backend\      (new Express + Prisma API)
└── sabse-sasta-mobile\       (new React Native + Expo app)
```

## Backend Setup (sabse-sasta-backend)

### 1. Install Dependencies

```bash
cd sabse-sasta-backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in `sabse-sasta-backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sabse_sasta?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
NODE_ENV=development
```

**Important**: Replace the `DATABASE_URL` with your actual PostgreSQL connection string.

### 3. Database Setup

You have two options:

#### Option A: Use Existing Database (Recommended if you have existing data)

1. Make sure your PostgreSQL database is running and accessible
2. Update the `DATABASE_URL` in `.env` to point to your existing database
3. Run Prisma introspection to sync schema:
   ```bash
   npx prisma db pull
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

**Note**: If your existing database uses Supabase's `auth.users` table, you'll need to create a separate `users` table for JWT authentication. The Prisma schema expects a `users` table in the public schema.

#### Option B: Create New Database with Prisma Migrations

1. Create a new PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. This will create all tables based on the Prisma schema

### 4. Start the Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Or build and run in production mode
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

### 5. Verify Backend is Running

Visit `http://localhost:3000/health` in your browser. You should see:
```json
{
  "status": "ok",
  "message": "Sabse Sasta API is running"
}
```

## Mobile App Setup (sabse-sasta-mobile)

### 1. Install Dependencies

```bash
cd sabse-sasta-mobile
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in `sabse-sasta-mobile/`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**For Physical Device Testing**:
- Replace `localhost` with your computer's IP address
- Find your IP: 
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` or `ip addr`
- Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api`

### 3. Start the Mobile App

```bash
npm start
```

This will:
- Start the Expo development server
- Show a QR code in the terminal
- Open Expo DevTools in your browser

### 4. Run on Device/Emulator

**Option A: Physical Device**
1. Install "Expo Go" app on your phone (iOS/Android)
2. Scan the QR code from the terminal
3. The app will load on your device

**Option B: iOS Simulator** (Mac only)
- Press `i` in the terminal
- Or run: `npm run ios`

**Option C: Android Emulator**
- Press `a` in the terminal
- Or run: `npm run android`
- Make sure Android Studio and an emulator are set up

## Testing the Setup

### 1. Test Backend API

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Mobile App

1. Open the app on your device/emulator
2. Try registering a new account
3. Login with your credentials
4. Browse products and test features

## Common Issues and Solutions

### Backend Issues

**Issue**: `PrismaClientInitializationError`
- **Solution**: Check your `DATABASE_URL` is correct and database is accessible

**Issue**: `JWT_SECRET` not set
- **Solution**: Make sure `.env` file exists with `JWT_SECRET` defined

**Issue**: Port already in use
- **Solution**: Change `PORT` in `.env` or kill the process using port 3000

### Mobile App Issues

**Issue**: Cannot connect to API
- **Solution**: 
  - Make sure backend is running
  - Check `EXPO_PUBLIC_API_URL` in `.env`
  - For physical device, use your computer's IP instead of `localhost`
  - Make sure your phone and computer are on the same network

**Issue**: Expo Go app not loading
- **Solution**: 
  - Make sure you're on the same network
  - Try restarting Expo dev server
  - Clear Expo Go app cache

**Issue**: NativeWind styles not working
- **Solution**: 
  - Make sure `babel.config.js` includes `nativewind/babel` plugin
  - Restart the Expo dev server

## Next Steps

1. **Create a vendor account**: Register and then manually add a vendor role in the database
2. **Upload products**: Use the vendor portal to upload CSV files with products
3. **Test features**: Try searching, comparing prices, creating shopping lists

## Database Schema Notes

The Prisma schema includes these main models:
- `User` - User accounts (separate from Supabase auth.users)
- `Profile` - User profile information
- `Product` - Product catalog
- `ShoppingList` - User shopping lists
- `ShoppingListItem` - Items in shopping lists
- `Order` - Order records
- `OrderItem` - Order line items
- `UserRole` - User roles (customer/vendor)
- `VendorUpload` - Vendor file upload records

## API Documentation

See `sabse-sasta-backend/README.md` for complete API endpoint documentation.

## Support

If you encounter issues:
1. Check the console/terminal for error messages
2. Verify all environment variables are set correctly
3. Ensure database is accessible and tables exist
4. Check that ports are not in use by other applications

