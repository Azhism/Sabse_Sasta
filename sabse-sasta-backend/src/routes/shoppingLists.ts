import { Router, Response } from 'express';
import { ShoppingListService } from '../services/shoppingListService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const list = await ShoppingListService.createList(req.userId!, name);
    res.status(201).json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const lists = await ShoppingListService.getUserLists(req.userId!);
    res.json(lists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const list = await ShoppingListService.getListById(
      req.params.id,
      req.userId!
    );
    res.json(list);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const list = await ShoppingListService.updateList(
      req.params.id,
      req.userId!,
      name
    );
    res.json(list);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await ShoppingListService.deleteList(req.params.id, req.userId!);
    res.json({ message: 'Shopping list deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/:id/items', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const item = await ShoppingListService.addItemToList(
      req.params.id,
      req.userId!,
      productId,
      quantity || 1
    );
    res.status(201).json(item);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    const item = await ShoppingListService.updateListItem(
      req.params.id,
      req.userId!,
      req.params.itemId,
      quantity
    );
    res.json(item);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    await ShoppingListService.removeItemFromList(
      req.params.id,
      req.userId!,
      req.params.itemId
    );
    res.json({ message: 'Item removed from list' });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/:id/calculate', async (req: AuthRequest, res: Response) => {
  try {
    const result = await ShoppingListService.calculateShoppingListCosts(
      req.params.id,
      req.userId!
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

