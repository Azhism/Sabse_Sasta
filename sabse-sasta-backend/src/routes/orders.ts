import express, { Request, Response } from 'express';

const router = express.Router();

// Simple in-memory handler for creating orders.
// In the future this can be wired to a real orders table.
router.post('/', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    // For now, just echo back a mock order with a generated ID.
    const mockOrder = {
      id: Date.now(),
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('Received new order:', JSON.stringify(mockOrder, null, 2));

    return res.status(201).json(mockOrder);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;


