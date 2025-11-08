// frontend/lib/api/payroll.ts
import { apiRequest } from '../api';

// Types based on backend schema
export interface SalaryStructure {
  id: string;
  employeeId: string;
  monthlyWage: number;
  basicSalary: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  leaveTravelAllowance: number;
  fixedAllowance: number;
  pfPercentage: number;
  professionalTax: number;
  workingDaysPerWeek: number;
  workingHoursPerDay: number;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields from join
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
  };
}

export interface Payrun {
  id: string;
  month: number;
  year: number;
  status: 'DRAFT' | 'PROCESSING' | 'PROCESSED' | 'VALIDATED' | 'PAID';
  payPeriodStart: string;
  payPeriodEnd: string;
  employeeCount: number;
  totalGrossWage: number;
  totalNetWage: number;
  warnings?: string[];
  processedBy?: string;
  processedAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  paidBy?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  payslips?: Payslip[];
}

export interface Payslip {
  id: string;
  payrunId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  location: string;
  dateOfJoining: string;
  // Attendance fields
  daysInMonth: number;
  presentDays: number;
  absentDays: number;
  paidTimeOff: number;
  workedDays: number;
  pan?: string;
  uan?: string;
  bankAccount?: string;
  month: number;
  year: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  totalDaysInMonth: number;
  workingDays: number;
  attendanceDays: number;
  leaves: number;
  // Earnings
  basicSalary: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  lta: number; // alias for leaveTravelAllowance
  leaveTravelAllowance: number;
  fixedAllowance: number;
  grossSalary: number;
  // Deductions
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  tds: number; // alias for tdsDeduction
  tdsDeduction: number;
  otherDeductions: number;
  unpaidDeduction: number;
  totalDeductions: number;
  netSalary: number;
  netSalaryWords: string;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
  payrun?: Payrun;
}

// Salary Structure API
export const salaryStructureAPI = {
  // List all salary structures
  getAll: () => apiRequest('/payroll/salary-structure'),

  // Get salary structure by employee ID (or list endpoint based on backend)
  getByEmployee: (employeeId: string) =>
    apiRequest(`/payroll/salary-structure?employeeId=${employeeId}`),

  // Get single salary structure by ID
  getById: (id: string) => apiRequest(`/payroll/salary-structure/${id}`),

  // Create new salary structure
  create: (data: {
    employeeId: string;
    monthlyWage: number;
    effectiveFrom: string;
    basicPercentage?: number;
    hraPercentage?: number;
    performanceBonusPercent?: number;
    ltaPercentage?: number;
    pfPercentage?: number;
    professionalTax?: number;
    workingDaysPerWeek?: number;
    workingHoursPerDay?: number;
  }) =>
    apiRequest('/payroll/salary-structure', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update salary structure
  update: (
    id: string,
    data: {
      monthlyWage?: number;
      effectiveFrom?: string;
      basicPercentage?: number;
      hraPercentage?: number;
      performanceBonusPercent?: number;
      ltaPercentage?: number;
      pfPercentage?: number;
      professionalTax?: number;
      workingDaysPerWeek?: number;
      workingHoursPerDay?: number;
    }
  ) =>
    apiRequest(`/payroll/salary-structure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete salary structure
  delete: (id: string) =>
    apiRequest(`/payroll/salary-structure/${id}`, {
      method: 'DELETE',
    }),
};

// Payrun API
export const payrunAPI = {
  // List all payruns with filters
  getAll: (params?: {
    month?: number;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiRequest(`/payroll/payruns?${queryParams.toString()}`);
  },

  // Create new payrun
  create: (data: { month: number; year: number }) =>
    apiRequest('/payroll/payruns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get payrun by ID
  getById: (id: string) => apiRequest(`/payroll/payruns/${id}`),

  // Process payrun (calculate and generate payslips)
  process: (id: string) =>
    apiRequest(`/payroll/payruns/${id}/process`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  // Validate payrun
  validate: (id: string) =>
    apiRequest(`/payroll/payruns/${id}/validate`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  // Mark payrun as paid
  markPaid: (id: string) =>
    apiRequest(`/payroll/payruns/${id}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  // Delete payrun
  delete: (id: string) =>
    apiRequest(`/payroll/payruns/${id}`, {
      method: 'DELETE',
    }),
};

// Payslip API
export const payslipAPI = {
  // List all payslips with filters
  getAll: (params?: {
    payrunId?: string;
    employeeId?: string;
    status?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.payrunId) queryParams.append('payrunId', params.payrunId);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiRequest(`/payroll/payslips?${queryParams.toString()}`);
  },

  // Get payslip history for employee
  getByEmployee: (employeeId: string) =>
    apiRequest(`/payroll/payslips/employee/${employeeId}`),

  // Get single payslip
  getById: (id: string) => apiRequest(`/payroll/payslips/${id}`),

  // Update payslip deductions
  update: (
    id: string,
    data: {
      tdsDeduction?: number;
      otherDeductions?: number;
    }
  ) =>
    apiRequest(`/payroll/payslips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Recalculate payslip
  recalculate: (id: string) =>
    apiRequest(`/payroll/payslips/${id}/compute`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  // Download PDF (when implemented)
  downloadPDF: (id: string) => apiRequest(`/payroll/payslips/${id}/pdf`),

  // Send email (when implemented)
  sendEmail: (id: string) =>
    apiRequest(`/payroll/payslips/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // Delete payslip
  delete: (id: string) =>
    apiRequest(`/payroll/payslips/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const payrollDashboardAPI = {
  // Get warnings
  getWarnings: () => apiRequest('/payroll/dashboard/warnings'),

  // Get statistics (when implemented)
  getStatistics: (params?: { year?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    return apiRequest(`/payroll/dashboard/statistics?${queryParams.toString()}`);
  },
};
