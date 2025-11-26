import { Router, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireVendor, AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';

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

    // Get vendor name from user role
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: req.userId!,
        role: 'vendor',
      },
    });

    const vendorName = userRole?.vendorName || 'Unknown Vendor';

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
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: req.userId!,
        role: 'vendor',
      },
    });

    const vendorName = userRole?.vendorName || 'Unknown Vendor';

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
    const uploads = await prisma.vendorUpload.findMany({
      where: {
        vendorId: req.userId!,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    res.json(uploads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

