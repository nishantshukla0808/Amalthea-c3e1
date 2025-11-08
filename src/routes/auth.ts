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
 * Register a new user
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role = 'EMPLOYEE' } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new AppError(400, passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as Role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken(user as any);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  })
);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
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
 * GET /api/auth/roles
 * Get all available roles
 */
router.get('/roles', (req: Request, res: Response) => {
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