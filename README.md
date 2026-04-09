
# Sabse Sasta – Pakistan's Grocery Price Comparison Platform


---

##  Overview

**Sabse Sasta** (which means "cheapest" in Urdu) is a full-stack price comparison web application designed specifically for Pakistani consumers. It helps users find the lowest grocery prices across major supermarket chains like **Imtiaz**, **Bin Hashim**, **Max Budget**, and others.

Whether you're a customer looking to save money or a vendor wanting to showcase your products, Sabse Sasta provides an intuitive platform for price discovery, smart shopping list creation, and vendor management.

---

##  Features

### For Customers
-  **Product Search & Price Comparison** - Search any item and instantly compare prices across all vendor stores
-  **Smart Shopping Lists** - Create, manage, and share shopping lists with real-time price calculations per vendor
-  **Cart Management** - Add items to cart and checkout seamlessly
-  **User Authentication** - Secure registration and login with JWT & Google OAuth support
-  **Order Management** - View order history, track purchases, and manage reviews
-  **Availability Status** - Check real-time product availability across vendors
-  **Price Tracking** - See detailed vendor information and pricing

### For Vendors
-  **Vendor Dashboard** - Full control over product listings and inventory
-  **Bulk Product Upload** - Upload products via CSV/Excel files
- ✅ **Vendor Verification** - Apply for vendor status with approval workflow
-  **Sales & Analytics** - Monitor product performance and customer orders
- 🔐 **Secure Vendor Portal** - Dedicated login and management area

---

##  Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (lightning-fast development)
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: shadcn-ui (accessible, beautiful component library)
- **State Management**: React Context API + TanStack React Query
- **Authentication**: JWT tokens + Google OAuth
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Fetch API with TanStack Query caching

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google Auth Library
- **File Handling**: Multer for file uploads
- **Email**: Nodemailer for transactional emails
- **Data Processing**: CSV parsing and XLSX support for bulk uploads
- **Security**: bcryptjs for password hashing, CORS enabled
- **Database Migrations**: Prisma migrations

### Database
- **Primary**: PostgreSQL
- **ORM**: Prisma (type-safe database access)
- **Migrations**: Version-controlled schema changes

### DevOps & Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **CSS Processing**: PostCSS
- **Version Control**: Git

---

## 📁 Project Structure

```
sabse-sasta/
├── Sabse-Sasta/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   ├── ui/                 # shadcn-ui component library
│   │   │   ├── Navbar.tsx          # Navigation header
│   │   │   ├── Hero.tsx            # Landing page hero section
│   │   │   ├── HowItWorks.tsx      # Feature explanation
│   │   │   ├── FeaturedProducts.tsx # Product showcase
│   │   │   ├── VendorShowcase.tsx  # Vendor display
│   │   │   └── Footer.tsx          # Footer component
│   │   ├── pages/                  # Page-level components & routes
│   │   │   ├── Index.tsx           # Landing/home page
│   │   │   ├── Auth.tsx            # Login/registration
│   │   │   ├── SearchResults.tsx   # Search results page
│   │   │   ├── ProductVendors.tsx  # Vendor prices for product
│   │   │   ├── Cart.tsx            # Shopping cart
│   │   │   ├── Checkout.tsx        # Order checkout
│   │   │   ├── OrderReview.tsx     # Order confirmation
│   │   │   ├── ShoppingLists.tsx   # Shopping list management
│   │   │   ├── Profile.tsx         # User profile
│   │   │   ├── VendorDashboard.tsx # Vendor management
│   │   │   ├── VendorLogin.tsx     # Vendor authentication
│   │   │   └── ResetPassword.tsx   # Password recovery
│   │   ├── contexts/               # React Context for state
│   │   │   ├── AuthContext.tsx     # Authentication state
│   │   │   └── CartContext.tsx     # Shopping cart state
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API integration
│   │   │   └── api.ts              # Centralized API calls
│   │   ├── lib/                    # Utility functions
│   │   ├── App.tsx                 # Main App component with routing
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── vite.config.ts              # Vite build configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── package.json                # Frontend dependencies
│   └── index.html                  # HTML template

├── sabse-sasta-backend/            # Backend (Express + Node)
│   ├── src/
│   │   ├── routes/                 # API route handlers
│   │   │   ├── auth.ts             # Authentication endpoints
│   │   │   ├── products.ts         # Product search/retrieval
│   │   │   ├── vendors.ts          # Vendor management
│   │   │   ├── orders.ts           # Order management
│   │   │   ├── shoppingLists.ts    # Shopping list operations
│   │   │   └── profile.ts          # User profile endpoints
│   │   ├── services/               # Business logic layer
│   │   │   ├── authService.ts      # Auth logic (register, login, JWT)
│   │   │   ├── productService.ts   # Product operations
│   │   │   ├── emailService.ts     # Email notifications
│   │   │   └── shoppingListService.ts # List management
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.ts             # JWT verification
│   │   │   ├── checkVendorApproval.ts # Vendor authorization
│   │   │   └── errorHandler.ts     # Error handling
│   │   ├── config/
│   │   │   └── database.ts         # PostgreSQL pool config
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript type definitions
│   │   ├── server.ts               # Express app setup
│   │   └── loadEnv.ts              # Environment variable loader
│   ├── scripts/                    # Utility scripts
│   │   ├── create-vendor-profiles.ts # Initial setup
│   │   ├── full-db-check.ts        # Database validation
│   │   └── cleanup-orphaned-*.ts   # Data cleanup
│   ├── supabase/                   # Supabase configuration (optional)
│   ├── migrations/                 # Database migrations
│   ├── package.json                # Backend dependencies
│   └── tsconfig.json               # TypeScript configuration

└── README.md                        # Project documentation
```

---

## 🔒 Security & Environment Setup

### Environment Files
- **`.env.example`** - Template files showing required environment variables (safe to commit)
- **`.env`** - Your actual configuration (NEVER commit, automatically ignored by `.gitignore`)

### Setup Instructions
1. Copy `.env.example` to `.env` in each directory
2. Fill in your actual secrets and configuration
3. Never commit or share `.env` files
4. For team collaboration, use `.env.example` to document requirements

### Environment Variables Guide

**Frontend (.env):**
- `VITE_API_BASE_URL` - Backend API endpoint URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth application ID

**Backend (.env):**
- `DATABASE_URL` - PostgreSQL connection string (keep secure!)
- `JWT_SECRET` - Random secret key for signing tokens (generate strong random string)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `SMTP_*` - Email configuration (Gmail requires app-specific password)

---

### Prerequisites
- **Node.js** 16+ and npm 8+
- **PostgreSQL** 12+ installed and running
- **Git** for version control
- A **Google OAuth** application ID (optional, for OAuth login)

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd "sabse sasta"
```

### 2. Install Dependencies

#### Frontend Setup
```bash
cd Sabse-Sasta
npm install
```

#### Backend Setup
```bash
cd ../sabse-sasta-backend
npm install
```

### 3. Environment Configuration

Environment files (`.env`) are excluded from version control for security. Each directory has a `.env.example` template:

#### Frontend Setup (Sabse-Sasta/)
```bash
cd Sabse-Sasta
cp .env.example .env
# Edit .env and add your Google OAuth Client ID
```

**Frontend `.env` variables:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### Backend Setup (sabse-sasta-backend/)
```bash
cd sabse-sasta-backend
cp .env.example .env
# Edit .env and fill in all configuration value
```

**Backend `.env` variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sabse_sasta

# JWT (generate a strong random key for production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email (Gmail with app-specific password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=Sabse Sasta
```

**⚠️ Security Warning:** Never commit `.env` files to version control. The `.gitignore` is configured to exclude them automatically.

### 4. Database Setup

```bash
cd sabse-sasta-backend

# Create database
createdb sabse_sasta

# Run migration
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/manage data
npm run prisma:studio
```

### 5. Running the Application

#### Terminal 1 - Backend Server
```bash
cd sabse-sasta-backend
npm run dev
# Server runs at http://localhost:3000
```

#### Terminal 2 - Frontend Development Server
```bash
cd Sabse-Sasta
npm run dev
# Frontend runs at http://localhost:5173
```

Both servers will be running. The frontend will automatically proxy API requests to the backend.

---

##  Available Scripts

### Frontend (Sabse-Sasta/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Backend (sabse-sasta-backend/)
```bash
npm run dev                    # Start dev server with auto-reload
npm run build                  # Compile TypeScript to JavaScript
npm start                      # Run compiled production server
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Create/run database migrations
npm run prisma:studio          # Open Prisma visual database explorer
```

---

## 🔌 API Documentation

The backend provides a RESTful API with the following main endpoints:

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /google-auth` - Google OAuth flow
- `POST /reset-password` - Password reset request
- `POST /verify-reset-token` - Verify reset token

### Products (`/api/products`)
- `GET /search?q=item` - Search products
- `GET /:id` - Get product details
- `GET /:id/prices` - Get all vendor prices for a product
- `POST /` - Create product (vendor)
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product

### Vendors (`/api/vendors`)
- `GET /` - List all approved vendors
- `GET /:id` - Get vendor profile
- `POST /apply` - Apply as vendor
- `POST /upload-products` - Bulk product upload
- `GET /:id/uploads` - View vendor uploads
- `PUT /:id/products/:productId` - Update vendor product

### Shopping Lists (`/api/shopping-lists`)
- `GET /` - Get user's shopping lists
- `POST /` - Create new list
- `GET /:id` - Get list details
- `PUT /:id` - Update list
- `DELETE /:id` - Delete list
- `POST /:id/share` - Share list with others

### Orders (`/api/orders`)
- `GET /` - Get user's orders
- `POST /` - Create new order
- `GET /:id` - Get order details
- `PUT /:id/status` - Update order status

### Profile (`/api/profile`)
- `GET /` - Get user profile
- `PUT /` - Update user profile
- `POST /change-password` - Change password

All endpoints (except `/auth/register` and `/auth/login`) require JWT authentication via `Authorization: Bearer <token>` header.

---

##  Authentication Flow

### Customer Authentication
1. User registers with email/password or Google OAuth
2. System sends verification email (optional)
3. JWT token issued on successful login
4. Token stored in browser localStorage
5. Token included in all API requests as Bearer token

### Vendor Authentication
1. Vendor registers with business details
2. Vendor profile created with `is_approved: false`
3. Admin review pending (shown on `/vendor-pending-approval`)
4. Once approved, vendor can access dashboard
5. Vendor can upload products via CSV/Excel

---

##  Key Database Tables

### Users
- `user_id` - Primary key
- `email` - Unique email
- `password_hash` - Bcrypt hashed password
- `name` - Full name
- `phone` - Phone number
- `user_type` - 'customer' or 'vendor'
- `created_at` - Registration timestamp

### Vendors
- `vendor_id` - Primary key
- `user_id` - Foreign key to users
- `vendor_name` - Business name
- `contact_email` - Contact email
- `is_verified` - Email verification status
- `is_approved` - Admin approval status
- `created_at` - Vendor creation timestamp

### Products
- `product_id` - Primary key
- `name` - Product name
- `category` - Product category
- `description` - Product description
- `created_by_vendor_id` - Creating vendor

### Product_Prices
- `price_id` - Primary key
- `product_id` - Foreign key
- `vendor_id` - Foreign key
- `price` - Current price
- `availability` - In stock / Out of stock
- `last_updated` - Last price update

### Shopping_Lists
- `list_id` - Primary key
- `user_id` - Owner user ID
- `title` - List name
- `items` - JSON array of items
- `shared_with` - JSON array of shared user IDs
- `created_at` - Creation timestamp

---

##  UI/UX Features

- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Dark Mode Support** - Tailwind CSS dark mode configuration
- **Accessible Components** - WCAG compliant shadcn-ui components
- **Smooth Animations** - Tailwind transitions and CSS animations
- **Toast Notifications** - User-friendly feedback messages
- **Form Validation** - Client-side with React Hook Form
- **Loading States** - Optimistic UI updates with TanStack Query
- **Error Handling** - Comprehensive error messages and recovery

---

##  Testing & Validation

### Database Validation
```bash
cd sabse-sasta-backend
npm run full-db-check  # Comprehensive database integrity check
```

### Cleanup Utilities
```bash
npm run cleanup-orphaned-users     # Remove users without profiles
npm run cleanup-orphaned-vendors   # Remove vendor records
```

---

##  Deployment

### Building for Production

#### Frontend
```bash
cd Sabse-Sasta
npm run build
# Output in 'dist/' folder - deploy to Vercel, Netlify, or any static host
```

#### Backend
```bash
cd sabse-sasta-backend
npm run build
npm run prisma:generate
# Output in 'dist/' folder - deploy to Heroku, Railway, or any Node.js host
```

### Environment Variables for Production
- Update all URLs to production domains
- Use strong, randomly generated JWT_SECRET
- Configure production PostgreSQL database
- Set NODE_ENV=production
- Enable HTTPS
- Configure CORS for production frontend URL

---

##  Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 💬 Support & Questions

For issues, bug reports, or feature requests, please open a GitHub issue or contact the development team.

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time inventory sync
- [ ] Machine learning price predictions
- [ ] Loyalty program integration
- [ ] Payment gateway integration
- [ ] Live chat vendor support
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---


**Frontend:**

```sh
cd Sabse-Sasta
npm run dev
```
- Runs on [http://localhost:8080](http://localhost:8080) by default.

**Backend:**

```sh
cd sabse-sasta-backend
npm run dev
```
- Runs on [http://localhost:3000](http://localhost:3000) by default.

---

## Database Setup (To Do)

- The backend requires a PostgreSQL database.
- You must set up your own database and configure the `.env` file in `sabse-sasta-backend` (see backend README for details).
- **Note:** The app will not be fully functional until the database is connected.

---

## Project Structure

```
Sabse-Sasta/           # Frontend (React)
sabse-sasta-backend/   # Backend (Express, TypeScript)
```

---

## API Overview

- **/api/auth/** – User authentication (register, login)
- **/api/products/** – Product search, details, comparison
- **/api/shopping-lists/** – Manage shopping lists
- **/api/vendors/** – Vendor product uploads, management
- **/api/profile/** – User profile

See `sabse-sasta-backend/README.md` for full API docs.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

ISC
