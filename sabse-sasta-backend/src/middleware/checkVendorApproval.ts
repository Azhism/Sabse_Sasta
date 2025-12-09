import { Response, NextFunction } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const checkVendorApproval = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get the vendor profile for this user
    const result = await pool.query(
      'SELECT vendor_id, is_approved FROM vendors WHERE user_id = $1',
      [parseInt(req.userId)]
    );

    const vendor = result.rows[0];

    if (!vendor) {
      return res.status(403).json({ 
        error: 'Vendor profile not found',
        approved: false 
      });
    }

    if (!vendor.is_approved) {
      return res.status(403).json({ 
        error: 'Your vendor account is pending admin approval. Please wait for approval before uploading catalogs.',
        approved: false,
        pending: true
      });
    }

    // Vendor is approved, continue
    next();
  } catch (error: any) {
    console.error('Vendor approval check error:', error);
    res.status(500).json({ error: 'Failed to verify vendor approval status' });
  }
};
