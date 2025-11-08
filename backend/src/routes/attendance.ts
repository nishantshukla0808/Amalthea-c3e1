// src/routes/attendance.ts
// Attendance Management API Routes

import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { verifyTokenMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errorHandler';
import { AppError } from '../utils/errorHandler';

const router = Router();

// ============================================
// ATTENDANCE ROUTES
// ============================================

/**
 * @route   POST /api/attendance/check-in
 * @desc    Record employee check-in
 * @access  Private (Employee, HR, Admin)
 */
router.post(
  '/check-in',
  verifyTokenMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.userId;
    const { remarks } = req.body;

    if (!userId) {
      throw new AppError(401, 'User not authenticated');
    }

    // Get employee record
    const employee = await prisma.employee.findFirst({
      where: { userId },
    });

    if (!employee) {
      throw new AppError(404, 'Employee record not found');
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAttendance) {
      throw new AppError(400, 'Attendance already marked for today');
    }

    // Create attendance record with date set to today at 00:00:00
    const attendanceDate = new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date: attendanceDate,
        checkIn: new Date(),
        remarks: remarks || null,
        status: 'PRESENT',
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Check-in successful',
      data: attendance,
    });
  })
);

/**
 * @route   POST /api/attendance/check-out
 * @desc    Record employee check-out
 * @access  Private (Employee, HR, Admin)
 */
router.post(
  '/check-out',
  verifyTokenMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.userId;
    const { remarks } = req.body;

    if (!userId) {
      throw new AppError(401, 'User not authenticated');
    }

    // Get employee record
    const employee = await prisma.employee.findFirst({
      where: { userId },
    });

    if (!employee) {
      throw new AppError(404, 'Employee record not found');
    }

    // Find the most recent check-in without a check-out
    // Allow checking out even if the check-in was from a previous day
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        checkOut: null,
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    if (!attendance) {
      throw new AppError(400, 'No active check-in found. Please check in first.');
    }

    // Calculate work hours
    const checkOutTime = new Date();
    const checkInTime = attendance.checkIn ? new Date(attendance.checkIn) : new Date();
    const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        workingHours: Number(workingHours.toFixed(2)),
        remarks: remarks ? `${attendance.remarks || ''}\nCheck-out: ${remarks}`.trim() : attendance.remarks,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });

    res.json({
      message: 'Check-out successful',
      data: updatedAttendance,
    });
  })
);

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records with filters
 * @access  Private (HR, Admin can see all; Employee sees own)
 */
router.get(
  '/',
  verifyTokenMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const {
      page = '1',
      limit = '10',
      department,
      status,
      startDate,
      endDate,
      month,
      year,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};

    // If regular employee, only show their own records
    if (userRole === 'EMPLOYEE') {
      const employee = await prisma.employee.findFirst({
        where: { userId },
      });
      if (!employee) {
        throw new AppError(404, 'Employee record not found');
      }
      where.employeeId = employee.id;
    }

    // Filter by department
    if (department && userRole !== 'EMPLOYEE') {
      where.employee = {
        department: department as string,
      };
    }

    // Filter by status
    if (status) {
      where.status = status as string;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    // Filter by month and year
    if (month && year) {
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
      
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    // Get attendance records
    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { date: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              department: true,
              designation: true,
            },
          },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({
      message: 'Attendance records retrieved successfully',
      data: attendances,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);

/**
 * @route   GET /api/attendance/employee/:employeeId
 * @desc    Get attendance records for specific employee
 * @access  Private (Employee can see own; HR/Admin can see any)
 */
router.get(
  '/employee/:employeeId',
  verifyTokenMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const { startDate, endDate, month, year } = req.query;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        userId: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        department: true,
      },
    });

    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    // Check authorization
    if (userRole === 'EMPLOYEE' && employee.userId !== userId) {
      throw new AppError(403, 'You can only view your own attendance records');
    }

    // Build date filter
    const where: any = { employeeId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    if (month && year) {
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
      
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    // Get attendance records with statistics
    const [attendances, stats] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    // Calculate statistics
    const totalHours = attendances.reduce((sum, att) => sum + (att.workingHours || 0), 0);
    const avgHours = attendances.length > 0 ? totalHours / attendances.length : 0;

    const statistics = {
      total: attendances.length,
      present: stats.find(s => s.status === 'PRESENT')?._count || 0,
      absent: stats.find(s => s.status === 'ABSENT')?._count || 0,
      halfDay: stats.find(s => s.status === 'HALF_DAY')?._count || 0,
      leave: stats.find(s => s.status === 'LEAVE')?._count || 0,
      totalHours: Number(totalHours.toFixed(2)),
      avgHours: Number(avgHours.toFixed(2)),
    };

    res.json({
      message: 'Employee attendance retrieved successfully',
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
      },
      statistics,
      data: attendances,
    });
  })
);

/**
 * @route   POST /api/attendance/manual
 * @desc    Manually add/mark attendance (HR/Admin only)
 * @access  Private (HR, Admin)
 */
router.post(
  '/manual',
  verifyTokenMiddleware,
  requireRole('HR_OFFICER', 'ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      employeeId,
      date,
      status,
      checkIn,
      checkOut,
      workingHours,
      remarks,
    } = req.body;

    // Validate required fields
    if (!employeeId || !date || !status) {
      throw new AppError(400, 'Employee ID, date, and status are required');
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    // Check if attendance already exists for this date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employeeId,
        date: new Date(date),
      },
    });

    if (existingAttendance) {
      throw new AppError(400, 'Attendance record already exists for this date');
    }

    // Create manual attendance record
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employeeId,
        date: new Date(date),
        status: status as any,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        workingHours: workingHours ? parseFloat(workingHours) : 0,
        remarks: remarks || 'Manually added by HR/Admin',
        isManual: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Attendance record created successfully',
      data: attendance,
    });
  })
);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (HR, Admin)
 */
router.put(
  '/:id',
  verifyTokenMiddleware,
  requireRole('HR_OFFICER', 'ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      status,
      checkIn,
      checkOut,
      workingHours,
      remarks,
    } = req.body;

    // Check if attendance exists
    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new AppError(404, 'Attendance record not found');
    }

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        status: status || attendance.status,
        checkIn: checkIn ? new Date(checkIn) : attendance.checkIn,
        checkOut: checkOut ? new Date(checkOut) : attendance.checkOut,
        workingHours: workingHours !== undefined ? parseFloat(workingHours) : attendance.workingHours,
        remarks: remarks !== undefined ? remarks : attendance.remarks,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });

    res.json({
      message: 'Attendance record updated successfully',
      data: updatedAttendance,
    });
  })
);

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Delete attendance record
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  verifyTokenMiddleware,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if attendance exists
    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new AppError(404, 'Attendance record not found');
    }

    // Delete attendance record
    await prisma.attendance.delete({
      where: { id },
    });

    res.json({
      message: 'Attendance record deleted successfully',
    });
  })
);

/**
 * @route   GET /api/attendance/report
 * @desc    Get attendance report/summary
 * @access  Private (HR, Admin)
 */
router.get(
  '/report',
  verifyTokenMiddleware,
  requireRole('HR_OFFICER', 'ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const { department, month, year } = req.query;

    // Build filter
    const where: any = {};

    if (department) {
      where.employee = {
        department: department as string,
      };
    }

    if (month && year) {
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
      
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    // Get attendance statistics
    const [totalRecords, statusBreakdown, hourStats] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.attendance.aggregate({
        where,
        _avg: {
          workingHours: true,
        },
        _sum: {
          workingHours: true,
        },
      }),
    ]);

    const report = {
      summary: {
        totalRecords,
        totalHours: Number((hourStats._sum.workingHours || 0).toFixed(2)),
        avgHours: Number((hourStats._avg.workingHours || 0).toFixed(2)),
      },
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s._count,
        percentage: Number(((s._count / totalRecords) * 100).toFixed(2)),
      })),
    };

    res.json({
      message: 'Attendance report generated successfully',
      data: report,
    });
  })
);

export default router;
