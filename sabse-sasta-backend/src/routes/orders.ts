import express, { Request, Response } from 'express';

const router = express.Router();

// In-memory storage for orders (for demo purposes)
const orders = new Map<string, any>();

// Simple in-memory handler for creating orders.
// In the future this can be wired to a real orders table.
router.post('/', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    // For now, just echo back a mock order with a generated ID.
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mockOrder = {
      id: orderId,
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store the order in memory
    orders.set(orderId, mockOrder);

    console.log('Received new order:', JSON.stringify(mockOrder, null, 2));

    return res.status(201).json(mockOrder);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by ID
router.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Confirm order
router.post('/:orderId/confirm', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot confirm a cancelled order' });
    }

    if (order.status === 'confirmed') {
      return res.status(200).json({ message: 'Order already confirmed', order });
    }

    // Update order status to confirmed
    order.status = 'confirmed';
    order.confirmedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    orders.set(orderId, order);

    console.log(`Order ${orderId} confirmed at ${order.confirmedAt}`);

    return res.status(200).json({ 
      message: 'Order confirmed successfully', 
      order 
    });
  } catch (error: any) {
    console.error('Error confirming order:', error);
    return res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// Cancel order
router.post('/:orderId/cancel', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'confirmed') {
      return res.status(400).json({ error: 'Cannot cancel a confirmed order' });
    }

    if (order.status === 'cancelled') {
      return res.status(200).json({ message: 'Order already cancelled', order });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    orders.set(orderId, order);

    console.log(`Order ${orderId} cancelled at ${order.cancelledAt}`);

    return res.status(200).json({ 
      message: 'Order cancelled successfully', 
      order 
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;


