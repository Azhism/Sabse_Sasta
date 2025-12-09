import dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify critical env vars are loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL not found in .env file!');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
