import express, { Request, Response } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { AppError } from '../utils/errorHandler';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { verifyTokenMiddleware } from '../middleware/auth';
import prisma from '../config/database';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * POST /api/auth/register
 * DISABLED: Public registration is not allowed
 * Users must be created by HR Officers or Admins via POST /api/users
 */
router.post(
  '/register',
  asyncHandler(async (_req: Request, _res: Response) => {
    throw new AppError(403, 'Public registration is disabled. Please contact HR to create your account.');
  })
);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 * Supports login with email OR loginId
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, loginId, password } = req.body;

    // Validate required fields
    if ((!email && !loginId) || !password) {
      throw new AppError(400, 'Email or loginId and password are required');
    }

    // Find user by email or loginId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || '' },
          { loginId: loginId || '' },
        ],
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      mustChangePassword: user.mustChangePassword,
    });
  })
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  verifyTokenMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      user,
    });
  })
);

/**
 * POST /api/auth/change-password
 * Change user password (authenticated users)
 */
router.post(
  '/change-password',
  verifyTokenMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'Current password and new password are required');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new AppError(400, passwordValidation.errors.join(', '));
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Check if new password is same as current
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError(400, 'New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        lastPasswordChange: new Date(),
      },
    });

    res.json({
      message: 'Password changed successfully',
    });
  })
);

/**
 * GET /api/auth/roles
 * Get all available roles
 */
router.get('/roles', (_req: Request, res: Response) => {
  const roles = Object.values(Role);

  res.json({
    roles,
    descriptions: {
      ADMIN: 'Full system access - can manage all resources',
      HR: 'HR management - can manage employees, attendance, and leave',
      PAYROLL: 'Payroll management - can manage salaries and payruns',
      EMPLOYEE: 'Standard employee - can view own information and apply for leave',
    },
  });
});

export default router;