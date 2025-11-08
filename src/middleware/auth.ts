import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/errorHandler';
import { asyncHandler } from '../utils/errorHandler';
import prisma from '../config/database';
import { Role } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const verifyTokenMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    // Verify token and get payload
    const payload = verifyToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new AppError(401, 'User no longer exists');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Your account has been deactivated');
    }

    // Attach user payload to request
    req.user = payload;
    next();
  }
);

/**
 * Middleware to require specific roles
 * Usage: requireRole('ADMIN', 'HR')
 */
export function requireRole(...allowedRoles: Role[]) {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      throw new AppError(
        403,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  });
}