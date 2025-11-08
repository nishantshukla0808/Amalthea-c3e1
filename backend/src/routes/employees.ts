// src/routes/employees.ts
// Employee Management API endpoints

import { Router, Request, Response } from 'express';
import { verifyTokenMiddleware, requireRole } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errorHandler';
import { Role } from '@prisma/client';

const router = Router();

// ============================================
// GET /api/employees - List all employees
// ============================================
router.get(
  '/',
  verifyTokenMiddleware,
  requireRole(Role.ADMIN, Role.HR_OFFICER),
  async (req: Request, res: Response) => {
    const { 
      page = '1', 
      limit = '10', 
      department, 
      search,
      isActive 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (department) {
      where.department = department;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { employeeId: { contains: search as string, mode: 'insensitive' } },
        { designation: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.user = {
        isActive: isActive === 'true'
      };
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
              loginId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.employee.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }
);

// ============================================
// GET /api/employees/:id - Get employee details
// ============================================
router.get(
  '/:id',
  verifyTokenMiddleware,
  requireRole(Role.ADMIN, Role.HR_OFFICER, Role.EMPLOYEE),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            loginId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    // Employees can only view their own data
    if (userRole === Role.EMPLOYEE && employee.userId !== userId) {
      throw new AppError(403, 'You can only view your own profile');
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  }
);

// ============================================
// GET /api/employees/:id/profile - Get full employee profile
// ============================================
router.get(
  '/:id/profile',
  verifyTokenMiddleware,
  requireRole(Role.ADMIN, Role.HR_OFFICER, Role.EMPLOYEE),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            loginId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        salaryStructure: true,
        attendances: {
          take: 10,
          orderBy: { checkIn: 'desc' },
        },
        leaves: {
          take: 10,
          orderBy: { startDate: 'desc' },
        },
        payslips: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    // Employees can only view their own profile
    if (userRole === Role.EMPLOYEE && employee.userId !== userId) {
      throw new AppError(403, 'You can only view your own profile');
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  }
);

// ============================================
// PUT /api/employees/:id - Update employee
// ============================================
router.put(
  '/:id',
  verifyTokenMiddleware,
  requireRole(Role.ADMIN, Role.HR_OFFICER),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      dateOfBirth,
      department,
      designation,
      phoneNumber,
      address,
      emergencyContact,
      bankAccountNo,
      ifscCode,
      panNumber,
      aadharNumber,
    } = req.body;

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      throw new AppError(404, 'Employee not found');
    }

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
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
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            loginId: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  }
);

// ============================================
// DELETE /api/employees/:id - Delete employee
// ============================================
router.delete(
  '/:id',
  verifyTokenMiddleware,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    // Delete employee (cascade will delete user)
    await prisma.user.delete({
      where: { id: employee.userId },
    });

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  }
);

export default router;
