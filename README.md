
# Sabse Sasta – Price Comparison App

Sabse Sasta is a full-stack web application for comparing product prices across vendors, managing shopping lists, and more. It consists of a React + Vite frontend and an Express/TypeScript backend. The backend uses PostgreSQL (database setup required separately).

---

## Features

- **User Authentication** (JWT, Google OAuth)
- **Product Search & Comparison**
- **Shopping Lists** (create, update, share)
- **Vendor Dashboard** (upload products, view uploads)
- **Order Management**
- **Responsive UI** (React, Tailwind CSS, shadcn-ui)

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn-ui
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL (setup required)
- **Auth:** JWT, Google OAuth

---

## Getting Started

### 1. Clone the Repository

```sh
git clone <YOUR_GITHUB_REPO_URL>
cd Sabse-Sasta
```

### 2. Install Dependencies

Install dependencies in both frontend and backend folders:

```sh
cd Sabse-Sasta
npm install

cd ../sabse-sasta-backend
npm install
```

### 3. Running the App

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
