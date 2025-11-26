import { Router, Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { ProductSearchQuery } from '../types';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query: ProductSearchQuery = {
      name: req.query.name as string,
      category: req.query.category as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    };

    // Log the search query for debugging
    console.log('Search query received:', query);

    const result = await ProductService.searchProducts(query);
    
    // Log the result count for debugging
    console.log(`Search returned ${result.total} products for query:`, query.name);
    
    res.json(result);
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const products = await ProductService.getFeaturedProducts(limit);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/compare/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const brand = req.query.brand as string | undefined;
    const products = await ProductService.getProductPriceComparison(name, brand);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const products = await ProductService.getAllProducts(limit, offset);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/vendors', async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getVendorsForProduct(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

