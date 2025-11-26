import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RegisterRequest, LoginRequest, JWTPayload } from '../types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  static async register(data: RegisterRequest) {
    const { email, password, fullName, phone, userType = 'customer' } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - UPDATED TO MATCH YOUR DATABASE
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,  // CHANGED: password → password_hash
        name: fullName,                 // CHANGED: fullName → name
        user_type: userType,            // UPDATED: use userType parameter (defaults to 'customer')
        // REMOVED: profile creation (since your DB doesn't have profiles table)
        // REMOVED: userRoles creation (since your DB doesn't have user_roles table)
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },  // CHANGED: user.id → user.user_id
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.user_id,        // CHANGED: user.id → user.user_id
        email: user.email,
        name: user.name,         // CHANGED: fullName → name
        phone: null,             // REMOVED: phone from profile
        role: user.user_type,    // CHANGED: userRoles → user_type
      },
      token,
    };
  }

  static async login(data: LoginRequest) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password - UPDATED to use password_hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },  // CHANGED: user.id → user.user_id
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.user_id,        // CHANGED: user.id → user.user_id
        email: user.email,
        name: user.name,         // CHANGED: fullName → name
        phone: null,             // REMOVED: phone
        role: user.user_type,    // CHANGED: userRoles → user_type
      },
      token,
    };
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}