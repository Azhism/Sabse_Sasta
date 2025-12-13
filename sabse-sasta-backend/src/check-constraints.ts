import './loadEnv';
import pool from './config/database';

async function checkTableStructure() {
  try {
    // Check products table constraints
    const productsConstraints = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'products' AND constraint_type = 'UNIQUE'
    `);
    
    console.log('Products table unique constraints:', productsConstraints.rows);
    
    // Check vendor_listings table constraints
    const listingsConstraints = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'vendor_listings' AND constraint_type = 'UNIQUE'
    `);
    
    console.log('Vendor_listings table unique constraints:', listingsConstraints.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTableStructure();
