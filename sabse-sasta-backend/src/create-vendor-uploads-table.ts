import './loadEnv';
import pool from './config/database';

async function createVendorUploadsTable() {
  try {
    console.log('Creating vendor_uploads table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_uploads (
        upload_id SERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        status TEXT DEFAULT 'processed',
        uploaded_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP,
        error_message TEXT,
        products_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ vendor_uploads table created successfully');
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vendor_uploads_vendor_id ON vendor_uploads(vendor_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vendor_uploads_uploaded_at ON vendor_uploads(uploaded_at DESC)
    `);
    
    console.log('✅ Indexes created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createVendorUploadsTable();
