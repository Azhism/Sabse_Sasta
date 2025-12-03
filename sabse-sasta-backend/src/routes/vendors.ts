import { Router, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireVendor, AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';
import * as XLSX from 'xlsx';

const router = Router();
const prisma = new PrismaClient();

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

// File upload route
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get vendor record for this user
    const vendor = await prisma.vendors.findUnique({
      where: {
        user_id: parseInt(req.userId!),
      },
    });

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

      if (!records || records.length === 0) {
        return res.status(400).json({
          error: 'No data rows found in the uploaded file. Please include at least one product row.',
        });
      }

      // Process each product in the CSV/Excel file
      for (const record of records) {
        try {
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

          if (!productName || isNaN(numericPrice)) {
            errors.push(`Skipped row: missing product name or invalid price`);
            continue;
          }

          // Find or create product
          let product = await prisma.products.findFirst({
            where: {
              product_name: productName,
              brand: brand,
            },
          });

          if (!product) {
            // Create new product
            product = await prisma.products.create({
              data: {
                product_name: productName,
                base_product_name: normalizedRecord['base_product_name'] || productName,
                variant_name: normalizedRecord['variant'] || normalizedRecord['variant_name'] || null,
                brand: brand,
                quantity_value: normalizedRecord['quantity'] ? parseFloat(normalizedRecord['quantity']) : null,
                quantity_unit: normalizedRecord['unit'] || normalizedRecord['quantity_unit'] || null,
                package_size: normalizedRecord['package_size'] || normalizedRecord['pack_size'] || null,
                category_id: normalizedRecord['category_id'] ? parseInt(normalizedRecord['category_id']) : null,
              },
            });
          }

          // Create or update vendor listing
          const existingListing = await prisma.vendor_listings.findFirst({
            where: {
              product_id: product.product_id,
              vendor_id: vendor.vendor_id,
            },
          });

          if (existingListing) {
            await prisma.vendor_listings.update({
              where: {
                listing_id: existingListing.listing_id,
              },
              data: {
                price: numericPrice,
                stock_quantity: numericStock,
                is_available: true,
              },
            });
          } else {
            await prisma.vendor_listings.create({
              data: {
                product_id: product.product_id,
                vendor_id: vendor.vendor_id,
                price: numericPrice,
                stock_quantity: numericStock,
                is_available: true,
              },
            });
          }

          productsCreated++;
        } catch (err: any) {
          errors.push(`Error processing product: ${err.message}`);
        }
      }
    } catch (parseError: any) {
      return res.status(400).json({ 
        error: 'Failed to parse CSV file. Please ensure it is a valid CSV format.',
        details: parseError.message 
      });
    }

    // Create upload record
    const vendorUpload = await prisma.vendor_uploads.create({
      data: {
        vendor_id: vendor.vendor_id,
        file_name: req.file.originalname,
        file_url: req.file.path,
        status: productsCreated > 0 ? 'processed' : 'failed',
        processed_at: new Date(),
        error_message: errors.length > 0 ? errors.join('; ') : null,
      },
    });

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
    const user = await prisma.user.findUnique({
      where: {
        user_id: req.userId!,
      },
    });

    const vendorName = user?.full_name || user?.email || 'Unknown Vendor';

    // Process and insert products
    const products = [];
    for (const record of records) {
      try {
        const product = await prisma.product.create({
          data: {
            name: record.name || record.product_name || '',
            category: record.category || '',
            subcategory: record.subcategory || null,
            brand: record.brand || null,
            variant: record.variant || null,
            size: record.size || 'N/A',
            price: parseFloat(record.price || '0'),
            vendor: vendorName,
            imageUrl: record.image_url || record.imageUrl || null,
            isFeatured: record.is_featured === 'true' || record.is_featured === true,
          },
        });
        products.push(product);
      } catch (error) {
        console.error('Error creating product:', error);
        // Continue with next product
      }
    }

    // Create upload record
    const vendorUpload = await prisma.vendorUpload.create({
      data: {
        vendorId: req.userId!,
        fileName: req.file.originalname,
        fileUrl: req.file.path,
        status: 'processed',
        processedAt: new Date(),
      },
    });

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.json({
      message: 'File processed successfully',
      productsCreated: products.length,
      upload: vendorUpload,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        user_id: req.userId!,
      },
    });

    const vendorName = user?.full_name || user?.email || 'Unknown Vendor';

    const products = await prisma.product.findMany({
      where: {
        vendor: {
          contains: vendorName,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/uploads', async (req: AuthRequest, res: Response) => {
  try {
    // Get vendor record for this user
    const vendor = await prisma.vendors.findUnique({
      where: {
        user_id: parseInt(req.userId!),
      },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const uploads = await prisma.vendor_uploads.findMany({
      where: {
        vendor_id: vendor.vendor_id,
      },
      orderBy: {
        uploaded_at: 'desc',
      },
    });

    res.json(uploads);
  } catch (error: any) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

