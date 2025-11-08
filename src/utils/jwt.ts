import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { AppError } from './errorHandler';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 days default

// Token payload interface
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  employeeId?: string;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'workzen-hrms',
    audience: 'workzen-users',
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'workzen-hrms',
      audience: 'workzen-users',
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token has expired. Please login again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token. Please login again.');
    }
    throw new AppError(401, 'Token verification failed.');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new AppError(401, 'No authorization header provided');
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError(401, 'Invalid authorization header format. Use: Bearer <token>');
  }

  return parts[1];
}