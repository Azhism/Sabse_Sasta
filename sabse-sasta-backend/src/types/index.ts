import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export interface JWTPayload extends JwtPayload {
  userId: string;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  userType?: 'customer' | 'vendor';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProductSearchQuery {
  name?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

