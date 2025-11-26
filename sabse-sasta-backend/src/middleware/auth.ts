import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/authService';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = AuthService.verifyToken(token);

    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: req.userId,
        role: 'vendor',
      },
    });

    if (!userRole) {
      return res.status(403).json({ error: 'Vendor access required' });
    }

    req.user = {
      ...req.user!,
      role: 'vendor',
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking vendor role' });
  }
};

