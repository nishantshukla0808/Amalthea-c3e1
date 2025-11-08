import { Router, Request, Response } from 'express';
import { verifyTokenMiddleware, requireRole } from '../middleware/auth';
import { generateLoginId } from '../utils/loginIdGenerator';
import { generateTemporaryPassword } from '../utils/passwordGenerator';
import { hashPassword } from '../utils/password';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/users
 * Create a new user/employee (Admin and HR Officer only)
 * 
 * Auto-generates:
 * - Login ID in format OIJODO20220001
 * - Temporary password
 * - Sets mustChangePassword = true
 */
router.post(
  '/',
  verifyTokenMiddleware,
  requireRole('ADMIN', 'HR_OFFICER'),
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        firstName,
        lastName,
        dateOfBirth,
        dateOfJoining,
        department,
        designation,
        phoneNumber,
        address,
        emergencyContact,
        bankAccountNo,
        ifscCode,
        panNumber,
        aadharNumber,
        role = 'EMPLOYEE',
      } = req.body;

      // Validate required fields
      if (!email || !firstName || !lastName || !dateOfJoining) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: email, firstName, lastName, dateOfJoining',
        });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Extract joining year
      const joiningDate = new Date(dateOfJoining);
      const joiningYear = joiningDate.getFullYear();

      // Generate login ID
      const loginId = await generateLoginId(firstName, lastName, joiningYear);

      // Generate temporary password
      const temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await hashPassword(temporaryPassword);

      // Create user and employee in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            loginId,
            email,
            password: hashedPassword,
            role,
            mustChangePassword: true,
            isActive: true,
          },
        });

        // Create employee
        const employee = await tx.employee.create({
          data: {
            userId: user.id,
            employeeId: loginId, // Same as login ID
            firstName,
            lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            dateOfJoining: joiningDate,
            joiningYear,
            department,
            designation,
            phoneNumber,
            address,
            emergencyContact,
            bankAccountNo,
            ifscCode,
            panNumber,
            aadharNumber,
          },
        });

        return { user, employee };
      });

      logger.info(`User created: ${loginId} by ${req.user?.email}`);

      // Return user info with temporary password
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          loginId: result.user.loginId,
          email: result.user.email,
          temporaryPassword, // Send this to the user securely
          role: result.user.role,
          mustChangePassword: true,
          employee: {
            employeeId: result.employee.employeeId,
            firstName: result.employee.firstName,
            lastName: result.employee.lastName,
            department: result.employee.department,
            designation: result.employee.designation,
          },
        },
      });
    } catch (error: any) {
      logger.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/users
 * Get all users (Admin and HR Officer only)
 */
router.get(
  '/',
  verifyTokenMiddleware,
  requireRole('ADMIN', 'HR_OFFICER'),
  async (_req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          loginId: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          employee: {
            select: {
              employeeId: true,
              firstName: true,
              lastName: true,
              department: true,
              designation: true,
              dateOfJoining: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      logger.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/users/:id
 * Get user by ID (Admin and HR Officer only)
 */
router.get(
  '/:id',
  verifyTokenMiddleware,
  requireRole('ADMIN', 'HR_OFFICER'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          loginId: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          lastPasswordChange: true,
          createdAt: true,
          updatedAt: true,
          employee: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      logger.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message,
      });
    }
  }
);

/**
 * PUT /api/users/:id/role
 * Update user role (Admin only)
 */
router.put(
  '/:id/role',
  verifyTokenMiddleware,
  requireRole('ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role is required',
        });
      }

      // Validate role
      const validRoles = ['EMPLOYEE', 'HR_OFFICER', 'PAYROLL_OFFICER', 'ADMIN'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: ' + validRoles.join(', '),
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          loginId: true,
          email: true,
          role: true,
          employee: {
            select: {
              employeeId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info(`User role updated: ${updatedUser.loginId} to ${role} by ${req.user?.email}`);

      return res.json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser,
      });
    } catch (error: any) {
      logger.error('Error updating user role:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user role',
        error: error.message,
      });
    }
  }
);

export default router;
