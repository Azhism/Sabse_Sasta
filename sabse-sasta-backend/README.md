# Sabse Sasta Backend API

Backend API for the Sabse Sasta price comparison mobile app built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/sabse_sasta?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

3. **Set up the database**:
   - Make sure PostgreSQL is running
   - Update the `DATABASE_URL` in `.env` with your database credentials
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Generate Prisma client:
     ```bash
     npx prisma generate
     ```

4. **Run the server**:
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products/search` - Search products (query params: name, category, brand, minPrice, maxPrice, limit, offset)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/compare/:name` - Get price comparison for a product

### Shopping Lists (Protected)
- `POST /api/shopping-lists` - Create a new shopping list
- `GET /api/shopping-lists` - Get all user's shopping lists
- `GET /api/shopping-lists/:id` - Get shopping list by ID
- `PUT /api/shopping-lists/:id` - Update shopping list
- `DELETE /api/shopping-lists/:id` - Delete shopping list
- `POST /api/shopping-lists/:id/items` - Add item to list
- `PUT /api/shopping-lists/:id/items/:itemId` - Update list item
- `DELETE /api/shopping-lists/:id/items/:itemId` - Remove item from list

### Vendors (Protected - Vendor only)
- `POST /api/vendors/upload-csv` - Upload CSV file with products
- `GET /api/vendors/products` - Get all vendor's products
- `GET /api/vendors/uploads` - Get upload history

### Profile (Protected)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The database includes the following main tables:
- `users` - User accounts
- `profiles` - User profile information
- `products` - Product catalog
- `shopping_lists` - User shopping lists
- `shopping_list_items` - Items in shopping lists
- `orders` - Order records
- `order_items` - Order line items
- `user_roles` - User roles (customer/vendor)
- `vendor_uploads` - Vendor file upload records

## Development

- Run Prisma Studio to view/edit database:
  ```bash
  npm run prisma:studio
  ```

- Create a new migration:
  ```bash
  npx prisma migrate dev --name migration_name
  ```

## License

ISC

