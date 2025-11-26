import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Try user_id first, then try id if that fails
    let user: any[] = [];
    try {
      user = await prisma.$queryRawUnsafe(`
        SELECT * FROM users 
        WHERE user_id = $1
        LIMIT 1
      `, req.userId!) as any[];
    } catch (error: any) {
      // If user_id doesn't exist, try id
      try {
        user = await prisma.$queryRawUnsafe(`
          SELECT * FROM users 
          WHERE id = $1
          LIMIT 1
        `, req.userId!) as any[];
      } catch (error2: any) {
        console.error('Failed to query users table:', error2.message);
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }
    }
    
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = user[0];

    // Get profile and roles if they exist
    let profile: any[] = [];
    let userRoles: any[] = [];
    
    try {
      profile = await prisma.$queryRawUnsafe(`
        SELECT * FROM profiles WHERE user_id = $1 LIMIT 1
      `, req.userId!) as any[];
    } catch (error: any) {
      // Profiles table might not exist or have different structure
      console.log('Profiles table query failed:', error.message);
    }
    
    try {
      userRoles = await prisma.$queryRawUnsafe(`
        SELECT * FROM user_roles WHERE user_id = $1
      `, req.userId!) as any[];
    } catch (error: any) {
      // user_roles table might not exist or have different structure
      console.log('User roles table query failed:', error.message);
    }

    res.json({
      id: userData.user_id || userData.id,
      email: userData.email,
      fullName: profile[0]?.full_name || profile[0]?.fullName || userData.name || null,
      phone: profile[0]?.phone || null,
      role: userRoles[0]?.role || userData.user_type || 'customer',
      vendorName: userRoles.find((r: any) => r.role === 'vendor')?.vendor_name || null,
    });
  } catch (error: any) {
    console.error('Profile route error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone } = req.body;

    // Check if user exists - try user_id first, then id
    let user: any[] = [];
    try {
      user = await prisma.$queryRawUnsafe(`
        SELECT * FROM users 
        WHERE user_id = $1
        LIMIT 1
      `, req.userId!) as any[];
    } catch (error: any) {
      // If user_id doesn't exist, try id
      try {
        user = await prisma.$queryRawUnsafe(`
          SELECT * FROM users 
          WHERE id = $1
          LIMIT 1
        `, req.userId!) as any[];
      } catch (error2: any) {
        console.error('Failed to query users table:', error2.message);
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }
    }
    
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = user[0];
    
    // Check if profile exists
    let existingProfile: any[] = [];
    try {
      existingProfile = await prisma.$queryRawUnsafe(`
        SELECT * FROM profiles WHERE user_id = $1 LIMIT 1
      `, req.userId!) as any[];
    } catch (error: any) {
      // Profiles table might not exist
      console.log('Profiles table query failed:', error.message);
    }

    let profile: any[] = [];
    if (existingProfile && existingProfile.length > 0) {
      // Update existing profile
      try {
        await prisma.$executeRawUnsafe(`
          UPDATE profiles 
          SET full_name = COALESCE($1, full_name),
              phone = COALESCE($2, phone)
          WHERE user_id = $3
        `, fullName, phone, req.userId!);
        
        profile = await prisma.$queryRawUnsafe(`
          SELECT * FROM profiles WHERE user_id = $1 LIMIT 1
        `, req.userId!) as any[];
      } catch (error: any) {
        console.error('Failed to update profile:', error.message);
        // If profile update fails, return user data without profile
        return res.json({
          id: userData.user_id || userData.id,
          email: userData.email,
          fullName: fullName || userData.name || null,
          phone: phone || null,
        });
      }
    } else {
      // Create new profile
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO profiles (user_id, full_name, phone)
          VALUES ($1, $2, $3)
        `, req.userId!, fullName || null, phone || null);
        
        profile = await prisma.$queryRawUnsafe(`
          SELECT * FROM profiles WHERE user_id = $1 LIMIT 1
        `, req.userId!) as any[];
      } catch (error: any) {
        console.error('Failed to create profile:', error.message);
        // If profile creation fails, return user data without profile
        return res.json({
          id: userData.user_id || userData.id,
          email: userData.email,
          fullName: fullName || userData.name || null,
          phone: phone || null,
        });
      }
    }

    res.json({
      id: userData.user_id || userData.id,
      email: userData.email,
      fullName: profile[0]?.full_name || profile[0]?.fullName || fullName || userData.name || null,
      phone: profile[0]?.phone || phone || null,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

