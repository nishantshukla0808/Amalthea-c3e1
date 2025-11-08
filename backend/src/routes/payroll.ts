// routes/payroll.ts
// Comprehensive Payroll Management APIs

import { Router, Request, Response } from 'express';
import { PrismaClient, Role, AttendanceStatus, LeaveType } from '@prisma/client';
import { verifyTokenMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate all salary components from monthly wage
 */
function calculateSalaryComponents(monthlyWage: number) {
  const basic = monthlyWage * 0.50; // 50% of wage
  const hra = basic * 0.50; // 50% of basic
  const standardAllowance = 4167; // Fixed
  const performanceBonus = basic * 0.0833; // 8.33% of basic
  const leaveTravelAllowance = basic * 0.0833; // 8.33% of basic
  
  // Fixed allowance is the remaining amount to reach total wage
  const fixedAllowance = monthlyWage - (basic + hra + standardAllowance + performanceBonus + leaveTravelAllowance);
  
  return {
    basicSalary: Math.round(basic * 100) / 100,
    hra: Math.round(hra * 100) / 100,
    standardAllowance: Math.round(standardAllowance * 100) / 100,
    performanceBonus: Math.round(performanceBonus * 100) / 100,
    leaveTravelAllowance: Math.round(leaveTravelAllowance * 100) / 100,
    fixedAllowance: Math.round(fixedAllowance * 100) / 100,
  };
}

/**
 * Calculate payslip for an employee
 */
async function calculatePayslip(employeeId: string, payrunId: string, month: number, year: number) {
  // Get employee with salary structure
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      salaryStructure: true,
      user: true,
    },
  });
  
  if (!employee || !employee.salaryStructure) {
    throw new Error('Employee or salary structure not found');
  }
  
  const salary = employee.salaryStructure as any;
  
  // Get payrun
  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunId },
  }) as any;
  
  // Calculate worked days breakdown
  const daysBreakdown = await calculateWorkedDays(employeeId, month, year);
  
  // Calculate rate (pro-rata for partial month)
  const rate = daysBreakdown.workedDays / daysBreakdown.totalDaysInMonth;
  
  // Calculate earnings (using full salary structure amounts, then pro-rate)
  const basicSalary = salary.basicSalary * rate;
  const hra = salary.hra * rate;
  const standardAllowance = salary.standardAllowance * rate;
  const performanceBonus = salary.performanceBonus * rate;
  const leaveTravelAllowance = salary.leaveTravelAllowance * rate;
  const fixedAllowance = salary.fixedAllowance * rate;
  
  const grossSalary = basicSalary + hra + standardAllowance + performanceBonus + leaveTravelAllowance + fixedAllowance;
  
  // Calculate deductions
  const pfEmployee = basicSalary * (salary.pfPercentage / 100);
  const pfEmployer = basicSalary * (salary.pfPercentage / 100);
  const professionalTax = rate === 1 ? salary.professionalTax : salary.professionalTax * rate;
  
  // Calculate unpaid deduction
  const dailyWage = salary.monthlyWage / daysBreakdown.totalDaysInMonth;
  const unpaidDeduction = dailyWage * (daysBreakdown.unpaidLeaveDays + daysBreakdown.absentDays);
  
  const totalDeductions = pfEmployee + professionalTax + unpaidDeduction;
  const netSalary = grossSalary - totalDeductions;
  
  // Calculate rate percentage
  const ratePercentage = (daysBreakdown.workedDays / daysBreakdown.totalDaysInMonth) * 100;
  
  const employeeData = employee as any;
  
  return {
    employeeName: `${employee.firstName} ${employee.lastName}`,
    employeeCode: employee.employeeId,
    department: employee.department,
    designation: employee.designation || '',
    location: employeeData.location || '',
    panNumber: employee.panNumber || '',
    uanNumber: employeeData.uanNumber || '',
    bankAccountNo: employee.bankAccountNo || '',
    ifscCode: employee.ifscCode || '',
    dateOfJoining: employee.dateOfJoining,
    
    payPeriodStart: payrun?.payPeriodStart || new Date(year, month - 1, 1),
    payPeriodEnd: payrun?.payPeriodEnd || new Date(year, month, 0),
    
    basicSalary: Math.round(basicSalary * 100) / 100,
    hra: Math.round(hra * 100) / 100,
    standardAllowance: Math.round(standardAllowance * 100) / 100,
    performanceBonus: Math.round(performanceBonus * 100) / 100,
    leaveTravelAllowance: Math.round(leaveTravelAllowance * 100) / 100,
    fixedAllowance: Math.round(fixedAllowance * 100) / 100,
    grossSalary: Math.round(grossSalary * 100) / 100,
    
    pfEmployee: Math.round(pfEmployee * 100) / 100,
    pfEmployer: Math.round(pfEmployer * 100) / 100,
    professionalTax: Math.round(professionalTax * 100) / 100,
    tdsDeduction: 0, // Manual entry by Payroll Officer
    unpaidDeduction: Math.round(unpaidDeduction * 100) / 100,
    otherDeductions: 0, // Manual entry
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    
    netSalary: Math.round(netSalary * 100) / 100,
    netSalaryWords: numberToWords(Math.round(netSalary * 100) / 100),
    
    totalDaysInMonth: daysBreakdown.totalDaysInMonth,
    workingDaysInMonth: daysBreakdown.workingDaysInMonth,
    attendanceDays: daysBreakdown.attendanceDays,
    paidLeaveDays: daysBreakdown.paidLeaveDays,
    unpaidLeaveDays: daysBreakdown.unpaidLeaveDays,
    absentDays: daysBreakdown.absentDays,
    holidayDays: daysBreakdown.holidayDays,
    workedDays: daysBreakdown.workedDays,
    payableDays: daysBreakdown.workedDays,
    ratePercentage: Math.round(ratePercentage * 100) / 100,
  };
}

/**
 * Validate payrun and return warnings
 */
async function validatePayrun(payrunId: string) {
  const warnings: any[] = [];
  
  // Get payrun
  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunId },
    include: {
      payslips: {
        include: {
          employee: true,
        },
      },
    },
  });
  
  if (!payrun) {
    throw new Error('Payrun not found');
  }
  
  // Get all employees with salary structures
  const employees = await prisma.employee.findMany({
    where: {
      salaryStructure: {
        isNot: null,
      },
    },
    include: {
      salaryStructure: true,
    },
  });
  
  // Check for employees without bank account
  for (const employee of employees) {
    const empData = employee as any;
    if (!employee.bankAccountNo) {
      warnings.push({
        type: 'missing_bank_account',
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        message: 'Bank account details missing',
      });
    }
    
    if (!empData.uanNumber) {
      warnings.push({
        type: 'missing_uan',
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        message: 'UAN number missing',
      });
    }
  }
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Convert number to words (English)
 */
function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (amount === 0) return 'Zero';
  
  const num = Math.floor(amount);
  const decimal = Math.round((amount - num) * 100);
  
  let words = '';
  
  // Lakhs
  if (num >= 100000) {
    const lakhs = Math.floor(num / 100000);
    words += convertHundreds(lakhs) + ' Lakh ';
  }
  
  // Thousands
  const remainder = num % 100000;
  if (remainder >= 1000) {
    const thousands = Math.floor(remainder / 1000);
    words += convertHundreds(thousands) + ' Thousand ';
  }
  
  // Hundreds
  const lastThree = num % 1000;
  if (lastThree > 0) {
    words += convertHundreds(lastThree);
  }
  
  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      str += teens[n - 10] + ' ';
      return str.trim();
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }
  
  words = words.trim();
  
  if (decimal > 0) {
    words += ' and ' + convertHundreds(decimal) + ' Paise';
  }
  
  return words.trim() + ' Only';
}

/**
 * Calculate worked days breakdown for an employee in a specific month
 */
async function calculateWorkedDays(employeeId: string, month: number, year: number) {
  // Get date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  const totalDaysInMonth = endDate.getDate();
  
  // Calculate working days (excluding weekends)
  let workingDaysInMonth = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      workingDaysInMonth++;
    }
  }
  
  // Fetch attendance records
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  
  // Fetch leave records
  const leaveRecords = await prisma.leave.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });
  
  // Calculate days breakdown
  let attendanceDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let holidayDays = 0;
  
  attendanceRecords.forEach(record => {
    switch (record.status) {
      case AttendanceStatus.PRESENT:
        attendanceDays += 1;
        break;
      case AttendanceStatus.ABSENT:
        absentDays += 1;
        break;
      case AttendanceStatus.HALF_DAY:
        attendanceDays += 0.5;
        halfDays += 0.5;
        break;
      case AttendanceStatus.HOLIDAY:
        holidayDays += 1;
        break;
      case AttendanceStatus.LEAVE:
        // Handled separately with leave records
        break;
    }
  });
  
  // Calculate leave days
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  
  // Get employee's leave balance to determine if leaves are exhausted
  const currentYearStart = new Date(year, 0, 1);
  const usedLeaves = await prisma.leave.groupBy({
    by: ['leaveType'],
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { gte: currentYearStart, lte: endDate },
    },
    _sum: {
      totalDays: true,
    },
  });
  
  const leaveBalances: { [key: string]: number } = {
    SICK: 12,
    CASUAL: 12,
    PAID: 18,
    MATERNITY: 180,
    PATERNITY: 7,
  };
  
  // Calculate used leaves by type
  const usedByType: { [key: string]: number } = {};
  usedLeaves.forEach(leave => {
    usedByType[leave.leaveType] = leave._sum.totalDays || 0;
  });
  
  leaveRecords.forEach(leave => {
    const leaveDays = leave.totalDays;
    const leaveType = leave.leaveType;
    
    if (leaveType === LeaveType.UNPAID) {
      unpaidLeaveDays += leaveDays;
    } else if (leaveType === LeaveType.PAID) {
      paidLeaveDays += leaveDays;
    } else {
      // Check if leave is exhausted
      const balance = leaveBalances[leaveType] || 0;
      const used = usedByType[leaveType] || 0;
      
      if (used <= balance) {
        paidLeaveDays += leaveDays;
      } else {
        // Partially paid, rest unpaid
        const remaining = balance - (used - leaveDays);
        if (remaining > 0) {
          paidLeaveDays += remaining;
          unpaidLeaveDays += leaveDays - remaining;
        } else {
          unpaidLeaveDays += leaveDays;
        }
      }
    }
  });
  
  // Calculate worked days and payable days
  let workedDays = attendanceDays + paidLeaveDays + holidayDays;
  
  // If no attendance records exist for this month, assume full attendance
  // (This handles the case where attendance tracking hasn't started yet)
  if (attendanceRecords.length === 0 && leaveRecords.length === 0) {
    workedDays = workingDaysInMonth;
    attendanceDays = workingDaysInMonth;
  }
  
  const payableDays = workedDays;
  
  return {
    totalDaysInMonth,
    workingDaysInMonth,
    attendanceDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    halfDays,
    holidayDays,
    workedDays,
    payableDays,
  };
}

// ============================================
// SALARY STRUCTURE APIs
// ============================================

/**
 * Create salary structure
 * POST /api/payroll/salary-structure
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER
 */
router.post('/salary-structure', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check permission
    if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const {
      employeeId,
      monthlyWage,
      basicPercentage = 50.0,
      hraPercentage = 50.0,
      performanceBonusPercent = 8.33,
      ltaPercentage = 8.33,
      pfPercentage = 12.0,
      professionalTax = 200.0,
      workingDaysPerWeek = 5,
      workingHoursPerDay = 8.0,
      effectiveFrom,
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !monthlyWage || !effectiveFrom) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if salary structure already exists
    const existing = await prisma.salaryStructure.findUnique({
      where: { employeeId },
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Salary structure already exists for this employee' });
    }
    
    // Calculate all components
    const components = calculateSalaryComponents(monthlyWage);
    
    // Create salary structure
    const salaryStructure = await prisma.salaryStructure.create({
      data: {
        employeeId,
        monthlyWage,
        basicSalary: components.basicSalary,
        basicPercentage,
        hra: components.hra,
        hraPercentage,
        standardAllowance: components.standardAllowance,
        performanceBonus: components.performanceBonus,
        performanceBonusPercent,
        leaveTravelAllowance: components.leaveTravelAllowance,
        ltaPercentage,
        fixedAllowance: components.fixedAllowance,
        pfPercentage,
        professionalTax,
        workingDaysPerWeek,
        workingHoursPerDay,
        effectiveFrom: new Date(effectiveFrom),
      },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });
    
    return res.status(201).json({
      message: 'Salary structure created successfully',
      data: salaryStructure,
    });
  } catch (error: any) {
    console.error('Error creating salary structure:', error);
    return res.status(500).json({ error: 'Failed to create salary structure' });
  }
});

/**
 * Get all salary structures with filters
 * GET /api/payroll/salary-structure
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER
 */
router.get('/salary-structure', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check permission
    if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { department, search, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (department) {
      where.employee = {
        department: department as string,
      };
    }
    
    if (search) {
      where.employee = {
        ...where.employee,
        OR: [
          { firstName: { contains: search as string } },
          { lastName: { contains: search as string } },
          { employeeId: { contains: search as string } },
        ],
      };
    }
    
    const [salaryStructures, total] = await Promise.all([
      prisma.salaryStructure.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.salaryStructure.count({ where }),
    ]);
    
    return res.json({
      data: salaryStructures,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching salary structures:', error);
    return res.status(500).json({ error: 'Failed to fetch salary structures' });
  }
});

/**
 * Get salary structure by employee ID
 * GET /api/payroll/salary-structure/:employeeId
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE (own only)
 */
router.get('/salary-structure/:employeeId', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { employeeId } = req.params;
    
    // Check permission
    if (user.role === Role.EMPLOYEE) {
      // Employees can only view their own salary
      const employee = await prisma.employee.findFirst({
        where: { userId: user.userId },
      });
      
      if (!employee || employee.id !== employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const salaryStructure = await prisma.salaryStructure.findUnique({
      where: { employeeId },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
    
    if (!salaryStructure) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    return res.json({ data: salaryStructure });
  } catch (error: any) {
    console.error('Error fetching salary structure:', error);
    return res.status(500).json({ error: 'Failed to fetch salary structure' });
  }
});

/**
 * Update salary structure
 * PUT /api/payroll/salary-structure/:id
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER
 */
router.put('/salary-structure/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const {
      monthlyWage,
      basicPercentage,
      hraPercentage,
      performanceBonusPercent,
      ltaPercentage,
      pfPercentage,
      professionalTax,
      workingDaysPerWeek,
      workingHoursPerDay,
      effectiveFrom,
    } = req.body;
    
    // Get existing salary structure
    const existing = await prisma.salaryStructure.findUnique({
      where: { id },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    // Recalculate components if wage changed
    let components = {
      basicSalary: existing.basicSalary,
      hra: existing.hra,
      standardAllowance: existing.standardAllowance,
      performanceBonus: existing.performanceBonus,
      leaveTravelAllowance: existing.leaveTravelAllowance,
      fixedAllowance: existing.fixedAllowance,
    };
    
    if (monthlyWage && monthlyWage !== existing.monthlyWage) {
      components = calculateSalaryComponents(monthlyWage);
    }
    
    // Update salary structure
    const updated = await prisma.salaryStructure.update({
      where: { id },
      data: {
        ...(monthlyWage && { monthlyWage }),
        ...(monthlyWage && components),
        ...(basicPercentage && { basicPercentage }),
        ...(hraPercentage && { hraPercentage }),
        ...(performanceBonusPercent && { performanceBonusPercent }),
        ...(ltaPercentage && { ltaPercentage }),
        ...(pfPercentage && { pfPercentage }),
        ...(professionalTax !== undefined && { professionalTax }),
        ...(workingDaysPerWeek && { workingDaysPerWeek }),
        ...(workingHoursPerDay && { workingHoursPerDay }),
        ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) }),
      },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });
    
    return res.json({
      message: 'Salary structure updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating salary structure:', error);
    return res.status(500).json({ error: 'Failed to update salary structure' });
  }
});

/**
 * Delete salary structure
 * DELETE /api/payroll/salary-structure/:id
 * Access: Admin only
 */
router.delete('/salary-structure/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (user.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    // Check if salary structure exists
    const existing = await prisma.salaryStructure.findUnique({
      where: { id },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    // Delete salary structure
    await prisma.salaryStructure.delete({
      where: { id },
    });
    
    return res.json({ message: 'Salary structure deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting salary structure:', error);
    return res.status(500).json({ error: 'Failed to delete salary structure' });
  }
});

// ============================================
// PAYRUN APIs
// ============================================

/**
 * Create payrun
 * POST /api/payroll/payruns
 * Access: Admin, PAYROLL_OFFICER
 */
router.post('/payruns', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check permission
    if (![Role.ADMIN, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { month, year } = req.body;
    
    // Validate
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    
    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid month' });
    }
    
    // Check if payrun already exists
    const existing = await prisma.payrun.findUnique({
      where: {
        month_year: {
          month: Number(month),
          year: Number(year),
        },
      },
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Payrun already exists for this period' });
    }
    
    // Calculate date range
    const payPeriodStart = new Date(Number(year), Number(month) - 1, 1);
    const payPeriodEnd = new Date(Number(year), Number(month), 0); // Last day of month
    
    // Create payrun
    const payrun = await prisma.payrun.create({
      data: {
        month: Number(month),
        year: Number(year),
        payPeriodStart,
        payPeriodEnd,
        status: 'DRAFT',
      },
    });
    
    // Get validation warnings
    const validation = await validatePayrun(payrun.id);
    
    // Update payrun with warnings
    const updated = await prisma.payrun.update({
      where: { id: payrun.id },
      data: {
        warnings: validation.warnings.length > 0 ? JSON.stringify(validation.warnings) : null,
      },
    });
    
    return res.status(201).json({
      message: 'Payrun created successfully',
      data: updated,
      warnings: validation.warnings,
    });
  } catch (error: any) {
    console.error('Error creating payrun:', error);
    return res.status(500).json({ error: 'Failed to create payrun' });
  }
});

/**
 * Get all payruns with filters
 * GET /api/payroll/payruns
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER
 */
router.get('/payruns', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check permission
    if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { status, year, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (status) {
      where.status = status as string;
    }
    
    if (year) {
      where.year = Number(year);
    }
    
    const [payruns, total] = await Promise.all([
      prisma.payrun.findMany({
        where,
        include: {
          _count: {
            select: { payslips: true },
          },
        },
        skip,
        take: Number(limit),
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.payrun.count({ where }),
    ]);
    
    return res.json({
      data: payruns,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payruns:', error);
    return res.status(500).json({ error: 'Failed to fetch payruns' });
  }
});

/**
 * Get payrun details with all payslips
 * GET /api/payroll/payruns/:id
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER
 */
router.get('/payruns/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const payrun = await prisma.payrun.findUnique({
      where: { id },
      include: {
        payslips: {
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
          orderBy: { employeeName: 'asc' },
        },
      },
    });
    
    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }
    
    // Parse warnings safely
    let warnings: string[] = [];
    try {
      warnings = payrun.warnings ? JSON.parse(payrun.warnings) : [];
    } catch (e) {
      console.error('Error parsing warnings:', e);
      warnings = [];
    }
    
    return res.json({
      data: {
        ...payrun,
        warnings,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payrun:', error);
    return res.status(500).json({ error: 'Failed to fetch payrun' });
  }
});

/**
 * Process payrun - Calculate all payslips
 * PUT /api/payroll/payruns/:id/process
 * Access: Admin, PAYROLL_OFFICER
 */
router.put('/payruns/:id/process', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (![Role.ADMIN, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get payrun
    const payrun = await prisma.payrun.findUnique({
      where: { id },
    });
    
    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }
    
    // Check status
    if (payrun.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Can only process payrun in DRAFT status' });
    }
    
    // Update status to PROCESSING
    await prisma.payrun.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        processedBy: user.userId,
        processedAt: new Date(),
      },
    });
    
    // Get all employees with salary structures
    const employees = await prisma.employee.findMany({
      where: {
        salaryStructure: {
          isNot: null,
        },
      },
      include: {
        salaryStructure: true,
      },
    });
    
    // Calculate payslips for all employees
    const payslipsData = [];
    let totalEmployerCost = 0;
    let totalBasicWage = 0;
    let totalGrossWage = 0;
    let totalNetWage = 0;
    
    for (const employee of employees) {
      try {
        const payslipData = await calculatePayslip(employee.id, payrun.id, payrun.month, payrun.year);
        
        // Check if payslip already exists
        const existing = await prisma.payslip.findUnique({
          where: {
            payrunId_employeeId: {
              payrunId: payrun.id,
              employeeId: employee.id,
            },
          },
        });
        
        if (existing) {
          // Update existing
          await prisma.payslip.update({
            where: { id: existing.id },
            data: {
              ...payslipData,
              month: payrun.month,
              year: payrun.year,
              status: 'DRAFT',
              isEditable: true,
            },
          });
        } else {
          // Create new
          await prisma.payslip.create({
            data: {
              payrunId: payrun.id,
              employeeId: employee.id,
              month: payrun.month,
              year: payrun.year,
              ...payslipData,
              status: 'DRAFT',
              isEditable: true,
            },
          });
        }
        
        // Accumulate totals
        totalEmployerCost += employee.salaryStructure!.monthlyWage;
        totalBasicWage += payslipData.basicSalary;
        totalGrossWage += payslipData.grossSalary;
        totalNetWage += payslipData.netSalary;
      } catch (error: any) {
        console.error(`Error calculating payslip for employee ${employee.id}:`, error);
      }
    }
    
    // Update payrun with totals and status
    const updatedPayrun = await prisma.payrun.update({
      where: { id },
      data: {
        status: 'DRAFT', // Back to DRAFT after processing
        employeeCount: employees.length,
        totalEmployerCost: Math.round(totalEmployerCost * 100) / 100,
        totalBasicWage: Math.round(totalBasicWage * 100) / 100,
        totalGrossWage: Math.round(totalGrossWage * 100) / 100,
        totalNetWage: Math.round(totalNetWage * 100) / 100,
      },
      include: {
        payslips: {
          include: {
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                department: true,
              },
            },
          },
        },
      },
    });
    
    return res.json({
      message: 'Payrun processed successfully',
      data: updatedPayrun,
    });
  } catch (error: any) {
    console.error('Error processing payrun:', error);
    return res.status(500).json({ error: 'Failed to process payrun' });
  }
});

/**
 * Validate/Finalize payrun
 * PUT /api/payroll/payruns/:id/validate
 * Access: Admin, PAYROLL_OFFICER
 */
router.put('/payruns/:id/validate', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (![Role.ADMIN, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get payrun
    const payrun = await prisma.payrun.findUnique({
      where: { id },
      include: {
        payslips: true,
      },
    });
    
    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }
    
    // Check status
    if (payrun.status === 'VALIDATED') {
      return res.status(400).json({ error: 'Payrun already validated' });
    }
    
    if (payrun.status === 'PAID') {
      return res.status(400).json({ error: 'Cannot validate a paid payrun' });
    }
    
    // Check if payslips exist
    if (payrun.payslips.length === 0) {
      return res.status(400).json({ error: 'No payslips found. Process the payrun first.' });
    }
    
    // Update payrun status to VALIDATED
    const updated = await prisma.payrun.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        validatedBy: user.userId,
        validatedAt: new Date(),
      },
    });
    
    // Update all payslips to VALIDATED and make them non-editable
    await prisma.payslip.updateMany({
      where: { payrunId: id },
      data: {
        status: 'VALIDATED',
        isEditable: false,
      },
    });
    
    return res.json({
      message: 'Payrun validated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error validating payrun:', error);
    return res.status(500).json({ error: 'Failed to validate payrun' });
  }
});

/**
 * Mark payrun as paid
 * PUT /api/payroll/payruns/:id/mark-paid
 * Access: Admin only
 */
router.put('/payruns/:id/mark-paid', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { payDate } = req.body;
    
    // Check permission
    if (user.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    // Get payrun
    const payrun = await prisma.payrun.findUnique({
      where: { id },
    });
    
    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }
    
    // Check status
    if (payrun.status !== 'VALIDATED') {
      return res.status(400).json({ error: 'Can only mark validated payruns as paid' });
    }
    
    // Update payrun status to PAID
    const updated = await prisma.payrun.update({
      where: { id },
      data: {
        status: 'PAID',
        paidBy: user.userId,
        paidAt: new Date(),
        payDate: payDate ? new Date(payDate) : new Date(),
      },
    });
    
    // Update all payslips to PAID
    await prisma.payslip.updateMany({
      where: { payrunId: id },
      data: {
        status: 'PAID',
        payDate: payDate ? new Date(payDate) : new Date(),
      },
    });
    
    return res.json({
      message: 'Payrun marked as paid successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error marking payrun as paid:', error);
    return res.status(500).json({ error: 'Failed to mark payrun as paid' });
  }
});

/**
 * Delete payrun
 * DELETE /api/payroll/payruns/:id
 * Access: Admin only
 */
router.delete('/payruns/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (user.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    // Get payrun
    const payrun = await prisma.payrun.findUnique({
      where: { id },
    });
    
    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }
    
    // Can only delete DRAFT payruns
    if (payrun.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Can only delete payruns in DRAFT status' });
    }
    
    // Delete payrun (will cascade delete payslips)
    await prisma.payrun.delete({
      where: { id },
    });
    
    return res.json({ message: 'Payrun deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payrun:', error);
    return res.status(500).json({ error: 'Failed to delete payrun' });
  }
});

// ============================================
// PAYSLIP APIs
// ============================================

/**
 * Get all payslips with filters (role-based access)
 * GET /api/payroll/payslips
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER (all), EMPLOYEE (own only)
 */
router.get('/payslips', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { payrunId, employeeId, status, month, year, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    // Role-based filtering
    if (user.role === Role.EMPLOYEE) {
      // Employees can only see their own payslips
      const employee = await prisma.employee.findFirst({
        where: { userId: user.userId },
      });
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }
      
      where.employeeId = employee.id;
    } else if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Apply filters
    if (payrunId) where.payrunId = payrunId as string;
    if (employeeId && user.role !== Role.EMPLOYEE) where.employeeId = employeeId as string;
    if (status) where.status = status as string;
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    
    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
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
          payrun: {
            select: {
              id: true,
              month: true,
              year: true,
              status: true,
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { employeeName: 'asc' }],
      }),
      prisma.payslip.count({ where }),
    ]);
    
    return res.json({
      data: payslips,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payslips:', error);
    return res.status(500).json({ error: 'Failed to fetch payslips' });
  }
});

/**
 * Get employee's all payslips
 * GET /api/payroll/payslips/employee/:employeeId
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER (all), EMPLOYEE (own only)
 */
router.get('/payslips/employee/:employeeId', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { employeeId } = req.params;
    
    // Check permission
    if (user.role === Role.EMPLOYEE) {
      const employee = await prisma.employee.findFirst({
        where: { userId: user.userId },
      });
      
      if (!employee || employee.id !== employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const payslips = await prisma.payslip.findMany({
      where: { employeeId },
      include: {
        payrun: {
          select: {
            id: true,
            month: true,
            year: true,
            status: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    
    return res.json({ data: payslips });
  } catch (error: any) {
    console.error('Error fetching employee payslips:', error);
    return res.status(500).json({ error: 'Failed to fetch employee payslips' });
  }
});

/**
 * Get single payslip details
 * GET /api/payroll/payslips/:id
 * Access: Admin, HR_OFFICER, PAYROLL_OFFICER (all), EMPLOYEE (own only)
 */
router.get('/payslips/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
        payrun: true,
      },
    });
    
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }
    
    // Check permission
    if (user.role === Role.EMPLOYEE) {
      const employee = await prisma.employee.findFirst({
        where: { userId: user.userId },
      });
      
      if (!employee || employee.id !== payslip.employeeId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (![Role.ADMIN, Role.HR_OFFICER, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    return res.json({ data: payslip });
  } catch (error: any) {
    console.error('Error fetching payslip:', error);
    return res.status(500).json({ error: 'Failed to fetch payslip' });
  }
});

/**
 * Update payslip (only in DRAFT status)
 * PUT /api/payroll/payslips/:id
 * Access: Admin, PAYROLL_OFFICER
 */
router.put('/payslips/:id', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (![Role.ADMIN, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { tdsDeduction, otherDeductions } = req.body;
    
    // Get payslip
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        payrun: true,
      },
    });
    
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }
    
    // Check if editable
    if (!payslip.isEditable || payslip.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Payslip is not editable' });
    }
    
    // Recalculate total deductions and net salary
    const newTdsDeduction = tdsDeduction !== undefined ? Number(tdsDeduction) : payslip.tdsDeduction;
    const newOtherDeductions = otherDeductions !== undefined ? Number(otherDeductions) : payslip.otherDeductions;
    
    const totalDeductions = payslip.pfEmployee + payslip.professionalTax + payslip.unpaidDeduction + newTdsDeduction + newOtherDeductions;
    const netSalary = payslip.grossSalary - totalDeductions;
    
    // Update payslip
    const updated = await prisma.payslip.update({
      where: { id },
      data: {
        ...(tdsDeduction !== undefined && { tdsDeduction: newTdsDeduction }),
        ...(otherDeductions !== undefined && { otherDeductions: newOtherDeductions }),
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netSalary: Math.round(netSalary * 100) / 100,
        netSalaryWords: numberToWords(Math.round(netSalary * 100) / 100),
      },
      include: {
        employee: true,
        payrun: true,
      },
    });
    
    return res.json({
      message: 'Payslip updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating payslip:', error);
    return res.status(500).json({ error: 'Failed to update payslip' });
  }
});

/**
 * Recompute/regenerate single payslip
 * PUT /api/payroll/payslips/:id/compute
 * Access: Admin, PAYROLL_OFFICER
 */
router.put('/payslips/:id/compute', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check permission
    if (![Role.ADMIN, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get payslip
    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        payrun: true,
      },
    });
    
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }
    
    // Check if editable
    if (!payslip.isEditable || payslip.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Payslip is not editable' });
    }
    
    // Recalculate payslip
    const payslipData = await calculatePayslip(payslip.employeeId, payslip.payrunId, payslip.month, payslip.year);
    
    // Keep manual entries (TDS, otherDeductions)
    const tdsDeduction = payslip.tdsDeduction;
    const otherDeductions = payslip.otherDeductions;
    
    // Recalculate with manual deductions
    const totalDeductions = payslipData.totalDeductions + tdsDeduction + otherDeductions;
    const netSalary = payslipData.grossSalary - totalDeductions;
    
    // Update payslip
    const updated = await prisma.payslip.update({
      where: { id },
      data: {
        ...payslipData,
        tdsDeduction,
        otherDeductions,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netSalary: Math.round(netSalary * 100) / 100,
        netSalaryWords: numberToWords(Math.round(netSalary * 100) / 100),
      },
      include: {
        employee: true,
        payrun: true,
      },
    });
    
    return res.json({
      message: 'Payslip recomputed successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error recomputing payslip:', error);
    return res.status(500).json({ error: 'Failed to recompute payslip' });
  }
});

// ============================================
// DASHBOARD APIs
// ============================================

/**
 * Dashboard warnings
 * GET /api/payroll/dashboard/warnings
 * Access: Admin, PAYROLL_OFFICER
 */
router.get('/dashboard/warnings', verifyTokenMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check permission
    if (![Role.ADMIN, Role.PAYROLL_OFFICER].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const warnings = [];
    
    // Check employees without bank account
    const employeesWithoutBank = await prisma.employee.count({
      where: {
        bankAccountNo: null,
        salaryStructure: {
          isNot: null,
        },
      },
    });
    
    if (employeesWithoutBank > 0) {
      warnings.push({
        type: 'missing_bank_account',
        message: `${employeesWithoutBank} employee(s) without bank account`,
        count: employeesWithoutBank,
      });
    }
    
    // Check employees without salary structure
    const employeesWithoutSalary = await prisma.employee.count({
      where: {
        salaryStructure: null,
      },
    });
    
    if (employeesWithoutSalary > 0) {
      warnings.push({
        type: 'missing_salary_structure',
        message: `${employeesWithoutSalary} employee(s) without salary structure`,
        count: employeesWithoutSalary,
      });
    }
    
    return res.json({ data: warnings });
  } catch (error: any) {
    console.error('Error fetching dashboard warnings:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard warnings' });
  }
});

export default router;
