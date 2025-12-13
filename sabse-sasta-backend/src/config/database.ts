import { Pool } from 'pg';

// Debug: Check if DATABASE_URL is loaded
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded ✅' : 'MISSING ❌');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log successful connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

// Log errors (but don't exit process - let the app handle errors gracefully)
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  // Don't exit - this allows the app to handle the error and potentially reconnect
});

export default pool;
