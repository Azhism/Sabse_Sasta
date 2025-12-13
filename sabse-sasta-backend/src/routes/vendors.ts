import { Router, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import pool from '../config/database';
import { authenticate, requireVendor, AuthRequest } from '../middleware/auth';
import { checkVendorApproval } from '../middleware/checkVendorApproval';
import path from 'path';
import fs from 'fs/promises';
import * as XLSX from 'xlsx';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// All routes require vendor authentication
router.use(authenticate);
router.use(requireVendor);

// Get vendor approval status
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT vendor_id, vendor_name, is_approved, is_verified, created_at
       FROM vendors
       WHERE user_id = $1`,
      [parseInt(req.userId!)]
    );

    const vendor = result.rows[0];

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    res.json({
      approved: vendor.is_approved || false,
      verified: vendor.is_verified || false,
      vendorName: vendor.vendor_name,
      createdAt: vendor.created_at,
    });
  } catch (error: any) {
    console.error('Error fetching vendor status:', error);
    res.status(500).json({ error: 'Failed to fetch vendor status' });
  }
});

// File upload route - Approval check removed for testing
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get vendor record for this user
    const vendorResult = await pool.query(
      'SELECT vendor_id FROM vendors WHERE user_id = $1',
      [parseInt(req.userId!)]
    );

    const vendor = vendorResult.rows[0];

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const filePath = req.file.path;
    let productsCreated = 0;
    let errors: string[] = [];

    let records: any[] = [];

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();

      if (ext === '.xlsx' || ext === '.xls') {
        const buffer = await fs.readFile(filePath);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          throw new Error('Excel file does not contain any sheets');
        }

        const sheet = workbook.Sheets[sheetName];
        records = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      } else {
        // Read and parse CSV/TSV file
        const fileContent = await fs.readFile(filePath, 'utf-8');

        // Detect delimiter (comma or tab)
        const delimiter = fileContent.includes('\t') ? '\t' : ',';

        records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter,
        });
      }

      console.log(`Parsing ${records.length} products from upload`);
      console.log('First record sample:', records[0]);

      if (!records || records.length === 0) {
        return res.status(400).json({
          error: 'No data rows found in the uploaded file. Please include at least one product row.',
        });
      }

      // Optimized bulk processing with transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Prepare all product data first
        const productsData: any[] = [];

        for (const record of records) {
          const normalizedRecord = Object.keys(record).reduce<Record<string, any>>((acc, key) => {
            if (!key) return acc;
            acc[key.toString().trim().toLowerCase()] = record[key];
            return acc;
          }, {});

          const productName = normalizedRecord['product_name'] || normalizedRecord['name'] || normalizedRecord['product'];
          const rawPrice = normalizedRecord['price'] || normalizedRecord['unit_price'];
          const brand = normalizedRecord['brand'] || null;
          const stock = normalizedRecord['stock'] || normalizedRecord['stock_quantity'] || normalizedRecord['qty'] || '0';

          const numericPrice = typeof rawPrice === 'number'
            ? rawPrice
            : parseFloat(String(rawPrice || '').replace(/[^0-9.\-]/g, ''));
          const numericStock = typeof stock === 'number'
            ? stock
            : parseInt(String(stock || '').replace(/[^0-9\-]/g, '')) || 0;

          console.log(`Processing row - Name: ${productName}, Price: ${rawPrice} (${numericPrice}), Brand: ${brand}`);

          if (!productName || isNaN(numericPrice)) {
            const errorMsg = `Skipped row: ${!productName ? 'missing product name' : ''} ${isNaN(numericPrice) ? 'invalid price (' + rawPrice + ')' : ''}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            continue;
          }

          productsData.push({
            productName,
            baseProductName: normalizedRecord['base_product_name'] || productName,
            variant: normalizedRecord['variant'] || normalizedRecord['variant_name'] || null,
            brand,
            quantity: normalizedRecord['quantity'] ? parseFloat(normalizedRecord['quantity']) : null,
            unit: normalizedRecord['unit'] || normalizedRecord['quantity_unit'] || null,
            packageSize: normalizedRecord['package_size'] || normalizedRecord['pack_size'] || null,
            categoryId: normalizedRecord['category_id'] ? parseInt(normalizedRecord['category_id']) : null,
            price: numericPrice,
            stock: numericStock,
          });
        }

        // Process in smaller batches for better performance
        for (const item of productsData) {
          try {
            // Insert product if it doesn't exist
            const productResult = await client.query(
              `INSERT INTO products (product_name, base_product_name, variant_name, brand, quantity_value, quantity_unit, package_size, category_id, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
               ON CONFLICT ON CONSTRAINT unique_product_brand
               DO NOTHING
               RETURNING product_id`,
              [item.productName, item.baseProductName, item.variant, item.brand, item.quantity, item.unit, item.packageSize, item.categoryId]
            );

            let productId = productResult.rows[0]?.product_id;

            // If product already exists, get its ID
            if (!productId) {
              const existingProduct = await client.query(
                'SELECT product_id FROM products WHERE product_name = $1 AND (brand = $2 OR (brand IS NULL AND $2 IS NULL)) LIMIT 1',
                [item.productName, item.brand]
              );
              productId = existingProduct.rows[0]?.product_id;
            }

            if (productId) {
              // Insert or update vendor listing
              await client.query(
                `INSERT INTO vendor_listings (product_id, vendor_id, price, stock_quantity, is_available, created_at)
                 VALUES ($1, $2, $3, $4, true, NOW())
                 ON CONFLICT ON CONSTRAINT unique_product_vendor
                 DO UPDATE SET price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity, is_available = true`,
                [productId, vendor.vendor_id, item.price, item.stock]
              );
              productsCreated++;
            }
          } catch (err: any) {
            console.error(`Error processing ${item.productName}:`, err);
            errors.push(`Error processing ${item.productName}: ${err.message}`);
          }
        }

        await client.query('COMMIT');
        console.log(`✅ Upload completed: ${productsCreated} products created`);
        console.log(`Errors: ${errors.length > 0 ? errors.join('; ') : 'None'}`);
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('Transaction error:', err);
        throw err;
      } finally {
        client.release();
      }
    } catch (parseError: any) {
      console.error('Parse error:', parseError);
      return res.status(400).json({ 
        error: 'Failed to parse CSV file. Please ensure it is a valid CSV format.',
        details: parseError.message 
      });
    }

    // Save upload history to database
    const uploadResult = await pool.query(
      `INSERT INTO vendor_uploads (vendor_id, file_name, file_url, status, processed_at, error_message, products_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        vendor.vendor_id,
        req.file.originalname,
        req.file.path,
        productsCreated > 0 ? 'processed' : 'failed',
        errors.length > 0 ? errors.join('; ') : null,
        productsCreated
      ]
    );

    const vendorUpload = uploadResult.rows[0];

    res.json({
      message: `File uploaded successfully. ${productsCreated} products imported.`,
      upload: vendorUpload,
      productsCreated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload-csv', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let fileContent: string;
    
    try {
      fileContent = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      // If file is binary (Excel), return error asking for CSV
      return res.status(400).json({ error: 'Please upload a CSV file. Excel files are not supported yet.' });
    }

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Get vendor name from user
    const userResult = await pool.query(
      'SELECT name, email FROM users WHERE user_id = $1',
      [parseInt(req.userId!)]
    );

    const user = userResult.rows[0];
    const vendorName = user?.name || user?.email || 'Unknown Vendor';

    // Process and insert products
    const products = [];
    for (const record of records) {
      try {
        const productResult = await pool.query(
          `INSERT INTO products (product_name, category_name, brand, variant_name, package_size, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING *`,
          [
            record.name || record.product_name || '',
            record.category || '',
            record.brand || null,
            record.variant || null,
            record.size || 'N/A'
          ]
        );
        products.push(productResult.rows[0]);
      } catch (error) {
        console.error('Error creating product:', error);
        // Continue with next product
      }
    }

    // Clean up uploaded file
    await fs.unlink(filePath);

    // Note: vendor_uploads table tracking removed as table doesn't exist
    res.json({
      message: 'File processed successfully',
      productsCreated: products.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products', async (req: AuthRequest, res: Response) => {
  try {
    const userResult = await pool.query(
      'SELECT name, email FROM users WHERE user_id = $1',
      [parseInt(req.userId!)]
    );

    const user = userResult.rows[0];
    const vendorName = user?.name || user?.email || 'Unknown Vendor';

    const productsResult = await pool.query(
      `SELECT * FROM products
       WHERE product_name ILIKE $1 OR brand ILIKE $1
       ORDER BY created_at DESC`,
      [`%${vendorName}%`]
    );

    res.json(productsResult.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/uploads', async (req: AuthRequest, res: Response) => {
  try {
    // Get vendor record for this user
    const vendorResult = await pool.query(
      'SELECT vendor_id FROM vendors WHERE user_id = $1',
      [parseInt(req.userId!)]
    );

    const vendor = vendorResult.rows[0];

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Get upload history
    const uploadsResult = await pool.query(
      `SELECT upload_id, file_name, status, uploaded_at, processed_at, products_count, error_message
       FROM vendor_uploads
       WHERE vendor_id = $1
       ORDER BY uploaded_at DESC
       LIMIT 20`,
      [vendor.vendor_id]
    );
    
    res.json(uploadsResult.rows);
  } catch (error: any) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

