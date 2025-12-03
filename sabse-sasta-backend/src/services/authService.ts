import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RegisterRequest, LoginRequest, JWTPayload } from '../types';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { EmailService } from './emailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export class AuthService {
  static async register(data: RegisterRequest) {
    const { email, password, fullName, phone, userType = 'customer' } = data;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        name: fullName,
        user_type: userType,
      }
    });

    // If user is a vendor, create vendor profile
    if (userType === 'vendor') {
      await prisma.vendors.create({
        data: {
          user_id: user.user_id,
          vendor_name: fullName,
          contact_email: email,
          is_verified: true,
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        phone: null,
        role: user.user_type,
      },
      token,
    };
  }

  static async login(data: LoginRequest) {
    const { email, password } = data;

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        phone: null,
        role: user.user_type,
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

  static async googleAuth(idToken: string, userType: 'customer' | 'vendor' = 'customer') {
    try {
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token');
      }

      const { email, name, picture } = payload;

      if (!email) {
        throw new Error('Email not provided by Google');
      }

      // Check if user already exists
      let user = await prisma.users.findUnique({
        where: { email },
      });

      // If user doesn't exist, create them
      if (!user) {
        user = await prisma.users.create({
          data: {
            email,
            password_hash: '', // Google users don't have passwords
            name: name || email.split('@')[0],
            user_type: userType,
          },
        });

        // If user is a vendor, create vendor profile
        if (userType === 'vendor') {
          await prisma.vendors.create({
            data: {
              user_id: user.user_id,
              vendor_name: name || email.split('@')[0],
              contact_email: email,
              is_verified: true,
            },
          });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name,
          phone: null,
          role: user.user_type,
        },
        token,
      };
    } catch (error: any) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  static async requestPasswordReset(email: string) {
    // Find user (do not reveal existence in responses)
    const user = await prisma.users.findUnique({ where: { email } });

    // Always respond with success to avoid user enumeration
    if (!user) {
      // still create no token, just return success
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Create token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.password_resets.create({
      data: {
        user_id: user.user_id,
        token,
        expires_at: expiresAt,
      },
    });

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    
    // Send email
    await EmailService.sendPasswordResetEmail(email, resetLink, user.name || undefined);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  static async resetPassword(token: string, newPassword: string) {
    const now = new Date();

    const reset = await prisma.password_resets.findUnique({
      where: { token },
    });

    if (!reset || reset.used || reset.expires_at < now) {
      throw new Error('Invalid or expired password reset token');
    }

    const user = await prisma.users.findUnique({ where: { user_id: reset.user_id } });
    if (!user) {
      throw new Error('User not found');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { password_hash: hashed },
    });

    await prisma.password_resets.update({
      where: { reset_id: reset.reset_id },
      data: { used: true },
    });

    return { message: 'Password has been reset successfully' };
  }
}