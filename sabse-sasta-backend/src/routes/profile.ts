import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        user_id: parseInt(req.userId as string),
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.user_id,
      email: user.email,
      fullName: user.name,
      phone: null,
      role: user.user_type || 'customer',
    });
  } catch (error: any) {
    console.error('Profile route error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone } = req.body;

    const user = await prisma.users.update({
      where: {
        user_id: parseInt(req.userId as string),
      },
      data: {
        name: fullName || undefined,
      },
    });

    res.json({
      id: user.user_id,
      email: user.email,
      fullName: user.name,
      phone: null,
      role: user.user_type || 'customer',
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

