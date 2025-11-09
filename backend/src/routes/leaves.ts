// Leave Management Routes
// WorkZen HRMS - Leave/Time-Off APIs

import { Router, Request, Response } from 'express';
import { PrismaClient, LeaveStatus, LeaveType, AttendanceStatus } from '@prisma/client';
import { verifyTokenMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper: Calculate working days between two dates (excluding weekends)
function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

// Helper: Get employee's leave balance
async function getEmployeeLeaveBalance(employeeId: string) {
  const currentYear = new Date().getFullYear();
  
  // Get all approved leaves for this year
  const approvedLeaves = await prisma.leave.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`),
      },
    },
  });

  // Calculate total days used by type
  const leaveUsage = {
    SICK: 0,
    CASUAL: 0,
    PAID: 0,
    UNPAID: 0,
    MATERNITY: 0,
    PATERNITY: 0,
  };

  approvedLeaves.forEach((leave) => {
    leaveUsage[leave.leaveType] += leave.totalDays;
  });

  // Standard annual allowances (can be made configurable later)
  const leaveAllowances = {
    SICK: 12,
    CASUAL: 12,
    PAID: 18,
    UNPAID: 365, // Unlimited essentially
    MATERNITY: 180,
    PATERNITY: 7,
  };

  // Calculate remaining
  const leaveBalance = {
    SICK: {
      total: leaveAllowances.SICK,
      used: leaveUsage.SICK,
      remaining: leaveAllowances.SICK - leaveUsage.SICK,
    },
    CASUAL: {
      total: leaveAllowances.CASUAL,
      used: leaveUsage.CASUAL,
      remaining: leaveAllowances.CASUAL - leaveUsage.CASUAL,
    },
    PAID: {
      total: leaveAllowances.PAID,
      used: leaveUsage.PAID,
      remaining: leaveAllowances.PAID - leaveUsage.PAID,
    },
    UNPAID: {
      total: leaveAllowances.UNPAID,
      used: leaveUsage.UNPAID,
      remaining: leaveAllowances.UNPAID - leaveUsage.UNPAID,
    },
    MATERNITY: {
      total: leaveAllowances.MATERNITY,
      used: leaveUsage.MATERNITY,
      remaining: leaveAllowances.MATERNITY - leaveUsage.MATERNITY,
    },
    PATERNITY: {
      total: leaveAllowances.PATERNITY,
      used: leaveUsage.PATERNITY,
      remaining: leaveAllowances.PATERNITY - leaveUsage.PATERNITY,
    },
  };

  return leaveBalance;
}

// ============================================
// 1. POST /api/leaves - Apply for leave
// ============================================
router.post('/', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const { leaveType, startDate, endDate, reason, isHalfDay = false } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: leaveType, startDate, endDate, reason' 
      });
    }

    // Validate leave type
    const validLeaveTypes: LeaveType[] = ['SICK', 'CASUAL', 'PAID', 'UNPAID', 'MATERNITY', 'PATERNITY'];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ 
        error: `Invalid leave type. Must be one of: ${validLeaveTypes.join(', ')}` 
      });
    }

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Calculate total days
    let totalDays: number;
    if (isHalfDay && start.toDateString() === end.toDateString()) {
      totalDays = 0.5;
    } else {
      totalDays = calculateWorkingDays(start, end);
    }

    if (totalDays <= 0) {
      return res.status(400).json({ error: 'No working days in the selected date range' });
    }

    // Check for overlapping leaves
    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        employeeId: employee.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlappingLeaves.length > 0) {
      return res.status(400).json({ 
        error: 'You already have a leave request for overlapping dates' 
      });
    }

    // Check leave balance (except for UNPAID)
    if (leaveType !== 'UNPAID') {
      const balance = await getEmployeeLeaveBalance(employee.id);
      const remaining = balance[leaveType as keyof typeof balance].remaining;

      if (totalDays > remaining) {
        return res.status(400).json({ 
          error: `Insufficient ${leaveType} leave balance. You have ${remaining} days remaining.`,
          balance,
        });
      }
    }

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        employeeId: employee.id,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        status: 'PENDING',
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
                loginId: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Leave request submitted successfully',
      data: leave,
    });
  } catch (error: any) {
    console.error('Error applying for leave:', error);
    return res.status(500).json({ error: 'Failed to submit leave request' });
  }
});

// ============================================
// 2. GET /api/leaves - List leaves with filters
// ============================================
router.get('/', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    // Query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as LeaveStatus | undefined;
    const leaveType = req.query.leaveType as LeaveType | undefined;
    const employeeId = req.query.employeeId as string | undefined;
    const department = req.query.department as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const month = req.query.month as string | undefined;
    const year = req.query.year as string | undefined;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Role-based access
    if (userRole === 'EMPLOYEE' || userRole === 'PAYROLL_OFFICER') {
      // Employees and Payroll Officers can only see their own leaves
      if (!employee) {
        return res.status(404).json({ error: 'Employee record not found' });
      }
      where.employeeId = employee.id;
    } else if (userRole === 'HR_OFFICER' || userRole === 'ADMIN') {
      // HR/Admin can see all leaves, but can filter by employee
      if (employeeId) {
        where.employeeId = employeeId;
      }
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (leaveType) {
      where.leaveType = leaveType;
    }

    // Date filters
    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startDate = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.endDate = {
        lte: new Date(endDate),
      };
    }

    // Month/Year filter
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0);

      where.startDate = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    // Department filter (for HR/Admin)
    if (department && (userRole === 'HR_OFFICER' || userRole === 'ADMIN')) {
      where.employee = {
        department,
      };
    }

    // Get leaves with pagination
    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  email: true,
                  loginId: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.leave.count({ where }),
    ]);

    return res.json({
      data: leaves,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching leaves:', error);
    return res.status(500).json({ error: 'Failed to fetch leaves' });
  }
});

// ============================================
// 3. GET /api/leaves/balance/:employeeId - Get leave balance
// ============================================
router.get('/balance/:employeeId', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const { employeeId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get requesting user's employee record
    const requestingEmployee = await prisma.employee.findUnique({
      where: { userId },
    });

    // Authorization check
    if (userRole === 'EMPLOYEE' || userRole === 'PAYROLL_OFFICER') {
      // Employees and Payroll Officers can only view their own balance
      if (!requestingEmployee || requestingEmployee.id !== employeeId) {
        return res.status(403).json({ error: 'You can only view your own leave balance' });
      }
    } else if (userRole !== 'HR_OFFICER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get target employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            email: true,
            loginId: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get leave balance
    const balance = await getEmployeeLeaveBalance(employeeId);

    return res.json({
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.user.email,
      },
      balance,
      year: new Date().getFullYear(),
    });
  } catch (error: any) {
    console.error('Error fetching leave balance:', error);
    return res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
});

// ============================================
// 4. GET /api/leaves/:id - Get leave details
// ============================================
router.get('/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get leave
    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
                loginId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Authorization check
    const requestingEmployee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (userRole === 'EMPLOYEE' || userRole === 'PAYROLL_OFFICER') {
      if (!requestingEmployee || requestingEmployee.id !== leave.employeeId) {
        return res.status(403).json({ error: 'You can only view your own leave requests' });
      }
    } else if (userRole !== 'HR_OFFICER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return res.json({ data: leave });
  } catch (error: any) {
    console.error('Error fetching leave details:', error);
    return res.status(500).json({ error: 'Failed to fetch leave details' });
  }
});

// ============================================
// 5. PUT /api/leaves/:id/approve - Approve leave (HR/Admin only)
// ============================================
router.put('/:id/approve', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check permissions
    if (userRole !== 'HR_OFFICER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only HR Officers and Admins can approve leaves' });
    }

    // Get leave
    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Check if already processed
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ 
        error: `Leave is already ${leave.status.toLowerCase()}` 
      });
    }

    // HR Officers cannot approve leaves of other HR Officers, only Admin can
    if (userRole === 'HR_OFFICER' && leave.employee.user?.role === 'HR_OFFICER') {
      return res.status(403).json({ 
        error: 'HR Officers cannot approve leaves from other HR Officers. Only Admin can approve HR leaves.' 
      });
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
                loginId: true,
              },
            },
          },
        },
      },
    });

    // Create attendance records for leave days
    const attendanceRecords = [];
    const currentDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Check if attendance already exists
        const existingAttendance = await prisma.attendance.findUnique({
          where: {
            employeeId_date: {
              employeeId: leave.employeeId,
              date: new Date(currentDate),
            },
          },
        });

        if (!existingAttendance) {
          attendanceRecords.push({
            employeeId: leave.employeeId,
            date: new Date(currentDate),
            status: 'LEAVE' as AttendanceStatus,
            workingHours: 0,
            remarks: `${leave.leaveType} leave approved`,
            isManual: true,
          });
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Bulk create attendance records
    if (attendanceRecords.length > 0) {
      await prisma.attendance.createMany({
        data: attendanceRecords,
        skipDuplicates: true,
      });
    }

    return res.json({
      message: 'Leave approved successfully',
      data: updatedLeave,
      attendanceRecordsCreated: attendanceRecords.length,
    });
  } catch (error: any) {
    console.error('Error approving leave:', error);
    return res.status(500).json({ error: 'Failed to approve leave' });
  }
});

// ============================================
// 6. PUT /api/leaves/:id/reject - Reject leave (HR/Admin only)
// ============================================
router.put('/:id/reject', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check permissions
    if (userRole !== 'HR_OFFICER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only HR Officers and Admins can reject leaves' });
    }

    // Get leave
    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Check if already processed
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ 
        error: `Leave is already ${leave.status.toLowerCase()}` 
      });
    }

    // HR Officers cannot reject leaves of other HR Officers, only Admin can
    if (userRole === 'HR_OFFICER' && leave.employee.user?.role === 'HR_OFFICER') {
      return res.status(403).json({ 
        error: 'HR Officers cannot reject leaves from other HR Officers. Only Admin can reject HR leaves.' 
      });
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: userId,
        rejectedAt: new Date(),
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
                loginId: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      message: 'Leave rejected successfully',
      data: updatedLeave,
    });
  } catch (error: any) {
    console.error('Error rejecting leave:', error);
    return res.status(500).json({ error: 'Failed to reject leave' });
  }
});

// ============================================
// 7. DELETE /api/leaves/:id - Cancel/Delete leave request
// ============================================
router.delete('/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get leave
    const leave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Get requesting employee
    const requestingEmployee = await prisma.employee.findUnique({
      where: { userId },
    });

    // Authorization check
    if (userRole === 'EMPLOYEE' || userRole === 'PAYROLL_OFFICER') {
      // Employees and Payroll Officers can only cancel their own pending leaves
      if (!requestingEmployee || requestingEmployee.id !== leave.employeeId) {
        return res.status(403).json({ error: 'You can only cancel your own leave requests' });
      }
      
      if (leave.status !== 'PENDING') {
        return res.status(400).json({ 
          error: 'You can only cancel pending leave requests' 
        });
      }
    } else if (userRole !== 'HR_OFFICER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // If leave was approved, delete associated attendance records
    if (leave.status === 'APPROVED') {
      const currentDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const datesToDelete = [];

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          datesToDelete.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Delete attendance records marked as LEAVE for these dates
      await prisma.attendance.deleteMany({
        where: {
          employeeId: leave.employeeId,
          date: { in: datesToDelete },
          status: 'LEAVE',
        },
      });
    }

    // Delete leave
    await prisma.leave.delete({
      where: { id },
    });

    return res.json({
      message: 'Leave request cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error deleting leave:', error);
    return res.status(500).json({ error: 'Failed to cancel leave request' });
  }
});

export default router;



