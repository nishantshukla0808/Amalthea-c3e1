# 💼 Payroll Management - Frontend Integration Guide

## 📋 Table of Contents
1. [Database Migration Status](#database-migration-status)
2. [API Endpoints Overview](#api-endpoints-overview)
3. [Frontend Pages Required](#frontend-pages-required)
4. [Step-by-Step Integration](#step-by-step-integration)
5. [Component Structure](#component-structure)
6. [API Service Layer](#api-service-layer)
7. [UI/UX Guidelines](#uiux-guidelines)
8. [Testing Checklist](#testing-checklist)

---

## ✅ Database Migration Status

### Already Completed (Backend Team)
- ✅ Database schema updated with payroll tables
- ✅ Migration files created and applied
- ✅ Prisma client regenerated
- ✅ Seed data updated with sample salary structures
- ✅ All 22 API endpoints tested and working

### ⚠️ Frontend Team - NO DATABASE MIGRATIONS NEEDED
**You do NOT need to run any database migrations!**

The backend team has already:
1. Created migration files in `backend/prisma/migrations/`
2. Applied migrations to the database
3. Updated the schema with:
   - `SalaryStructure` model (new 13 fields)
   - `Payrun` model (new)
   - `Payslip` model (new)
   - `PayrunStatus` enum (new)

**All you need to do is:**
```bash
cd frontend
npm install  # Install any new dependencies if needed
npm run dev  # Start development server
```

---

## 🔌 API Endpoints Overview

### Base URL
```
http://localhost:5000/api/payroll
```

### Authentication
All endpoints require JWT token in Authorization header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Role-Based Access Control (RBAC)

| Endpoint Category | Admin | HR_OFFICER | PAYROLL_OFFICER | EMPLOYEE |
|------------------|-------|------------|-----------------|----------|
| Salary Structure | ✅ All | ✅ All | ✅ All | ❌ None |
| Payrun Management | ✅ All | ❌ None | ✅ All | ❌ None |
| Payslip Management | ✅ All | ❌ None | ✅ All | ✅ Own only |
| Dashboard | ✅ All | ❌ None | ✅ All | ❌ None |

---

## 📊 API Endpoints Detailed

### 1️⃣ Salary Structure APIs (5 endpoints)

#### Create Salary Structure
```typescript
POST /api/payroll/salary-structure
Body: {
  employeeId: string;        // Required
  monthlyWage: number;       // Required (will auto-calculate components)
  pfPercentage?: number;     // Optional (default: 12)
  professionalTax?: number;  // Optional (default: 200)
  effectiveFrom?: string;    // Optional (default: today)
}

Response: {
  message: "Salary structure created successfully",
  data: {
    id: string,
    employeeId: string,
    monthlyWage: 50000,
    basicSalary: 25000,      // Auto-calculated (50%)
    hra: 12500,               // Auto-calculated (25%)
    standardAllowance: 5000,  // Auto-calculated (10%)
    performanceBonus: 2500,   // Auto-calculated (5%)
    leaveTravelAllowance: 2500, // Auto-calculated (5%)
    fixedAllowance: 2500,     // Auto-calculated (5%)
    pfPercentage: 12,
    professionalTax: 200,
    effectiveFrom: "2025-11-09T00:00:00.000Z",
    createdAt: "2025-11-09T10:30:00.000Z",
    updatedAt: "2025-11-09T10:30:00.000Z"
  }
}
```

#### List All Salary Structures
```typescript
GET /api/payroll/salary-structure
Query Params:
  - page?: number (default: 1)
  - limit?: number (default: 10)
  - department?: string (e.g., "IT", "Finance")
  - search?: string (employee name search)

Response: {
  data: SalaryStructure[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

#### Get Salary Structure by Employee
```typescript
GET /api/payroll/salary-structure/:employeeId

Response: {
  data: SalaryStructure
}
```

#### Update Salary Structure
```typescript
PUT /api/payroll/salary-structure/:id
Body: {
  monthlyWage?: number,      // Will recalculate all components
  pfPercentage?: number,
  professionalTax?: number,
  effectiveFrom?: string
}

Response: {
  message: "Salary structure updated successfully",
  data: SalaryStructure
}
```

#### Delete Salary Structure
```typescript
DELETE /api/payroll/salary-structure/:id
Access: Admin only

Response: {
  message: "Salary structure deleted successfully"
}
```

---

### 2️⃣ Payrun Management APIs (7 endpoints)

#### Create Payrun
```typescript
POST /api/payroll/payruns
Body: {
  month: number,          // 1-12
  year: number,           // e.g., 2025
  payPeriodStart?: string, // Optional
  payPeriodEnd?: string    // Optional
}

Response: {
  message: "Payrun created successfully",
  data: {
    id: string,
    month: 11,
    year: 2025,
    status: "DRAFT",
    payPeriodStart: "2025-11-01T00:00:00.000Z",
    payPeriodEnd: "2025-11-30T23:59:59.999Z",
    employeeCount: 0,
    totalEmployerCost: 0,
    totalBasicWage: 0,
    totalGrossWage: 0,
    totalNetWage: 0,
    createdAt: "2025-11-09T10:30:00.000Z"
  }
}
```

#### List Payruns
```typescript
GET /api/payroll/payruns
Query Params:
  - page?: number
  - limit?: number
  - status?: "DRAFT" | "PROCESSED" | "VALIDATED" | "PAID"
  - year?: number
  - month?: number

Response: {
  data: Payrun[],
  pagination: { total, page, limit, totalPages }
}
```

#### Get Payrun Details
```typescript
GET /api/payroll/payruns/:id

Response: {
  data: {
    ...payrun,
    payslips: [
      {
        id: string,
        employeeName: string,
        grossSalary: number,
        netSalary: number,
        employee: {
          employeeId: string,
          firstName: string,
          lastName: string,
          department: string
        }
      }
    ]
  }
}
```

#### Process Payrun (Calculate all payslips)
```typescript
PUT /api/payroll/payruns/:id/process

⚠️ Important: This endpoint:
- Fetches all employees with salary structures
- Calculates payslips based on attendance data
- If no attendance exists, assumes full attendance
- Creates/updates payslip records
- Updates payrun totals

Response: {
  message: "Payrun processed successfully",
  data: {
    ...payrun,
    employeeCount: 3,
    totalGrossWage: 83333.33,
    totalNetWage: 77933.34,
    payslips: [...]
  }
}
```

#### Validate/Finalize Payrun
```typescript
PUT /api/payroll/payruns/:id/validate

⚠️ This checks for warnings:
- Employees without salary structure
- Negative deductions
- Zero net salaries
- Missing attendance data

Response: {
  message: "Payrun validated successfully",
  data: {
    ...payrun,
    status: "VALIDATED",
    warnings: [
      "3 employee(s) without salary structure",
      "Employee John Doe has negative deductions"
    ]
  }
}
```

#### Mark Payrun as Paid
```typescript
PUT /api/payroll/payruns/:id/mark-paid

Response: {
  message: "Payrun marked as paid",
  data: {
    ...payrun,
    status: "PAID"
  }
}
```

#### Delete Payrun
```typescript
DELETE /api/payroll/payruns/:id

Response: {
  message: "Payrun deleted successfully"
}
```

---

### 3️⃣ Payslip Management APIs (8 endpoints)

#### List All Payslips
```typescript
GET /api/payroll/payslips
Query Params:
  - page?: number
  - limit?: number
  - payrunId?: string
  - employeeId?: string
  - department?: string
  - month?: number
  - year?: number

Response: {
  data: Payslip[],
  pagination: { total, page, limit, totalPages }
}
```

#### Get Employee Payslip History
```typescript
GET /api/payroll/payslips/employee/:employeeId
Query Params:
  - year?: number
  - limit?: number

⚠️ RBAC: Employees can only view their own payslips

Response: {
  data: [
    {
      id: string,
      month: 11,
      year: 2025,
      grossSalary: 33333.33,
      netSalary: 31200,
      status: "DRAFT",
      isEditable: true,
      createdAt: "2025-11-09T10:30:00.000Z"
    }
  ]
}
```

#### Get Single Payslip
```typescript
GET /api/payroll/payslips/:id

Response: {
  data: {
    id: string,
    payrunId: string,
    employeeId: string,
    
    // Employee Info
    employeeName: "Alice Smith",
    employeeCode: "OIALSM20210002",
    department: "IT",
    designation: "Software Engineer",
    location: "Mumbai",
    panNumber: "ABCDE1234F",
    uanNumber: "123456789012",
    bankAccountNo: "1234567890",
    ifscCode: "HDFC0001234",
    dateOfJoining: "2021-03-15T00:00:00.000Z",
    
    // Pay Period
    month: 11,
    year: 2025,
    payPeriodStart: "2025-11-01T00:00:00.000Z",
    payPeriodEnd: "2025-11-30T23:59:59.999Z",
    
    // Earnings
    basicSalary: 16666.67,
    hra: 8333.33,
    standardAllowance: 3333.33,
    performanceBonus: 1666.67,
    leaveTravelAllowance: 1666.67,
    fixedAllowance: 1666.67,
    grossSalary: 33333.33,
    
    // Deductions
    pfEmployee: 2000,
    pfEmployer: 2000,
    professionalTax: 200,
    tdsDeduction: 0,
    unpaidDeduction: 0,
    otherDeductions: 0,
    totalDeductions: 2200,
    
    // Net
    netSalary: 31133.33,
    netSalaryWords: "Thirty One Thousand One Hundred Thirty Three Only",
    
    // Attendance Breakdown
    totalDaysInMonth: 30,
    workingDaysInMonth: 21,
    attendanceDays: 21,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    absentDays: 0,
    holidayDays: 0,
    workedDays: 21,
    payableDays: 21,
    ratePercentage: 100,
    
    // Status
    status: "DRAFT",
    isEditable: true,
    createdAt: "2025-11-09T10:30:00.000Z",
    updatedAt: "2025-11-09T10:30:00.000Z"
  }
}
```

#### Update Payslip (Manual Adjustments)
```typescript
PUT /api/payroll/payslips/:id
Body: {
  tdsDeduction?: number,
  otherDeductions?: number
}

⚠️ Can only edit if status is "DRAFT" and isEditable is true

Response: {
  message: "Payslip updated successfully",
  data: Payslip
}
```

#### Recalculate Payslip
```typescript
PUT /api/payroll/payslips/:id/compute

⚠️ Recalculates entire payslip from scratch based on:
- Current salary structure
- Latest attendance data
- Current leave records

Response: {
  message: "Payslip recalculated successfully",
  data: Payslip
}
```

#### Download Payslip PDF
```typescript
GET /api/payroll/payslips/:id/pdf

⚠️ TO BE IMPLEMENTED - Returns PDF buffer

Response: PDF file download
```

#### Email Payslip
```typescript
POST /api/payroll/payslips/:id/send-email

⚠️ TO BE IMPLEMENTED - Sends payslip to employee's email

Response: {
  message: "Payslip sent to employee email"
}
```

#### Delete Payslip
```typescript
DELETE /api/payroll/payslips/:id

Response: {
  message: "Payslip deleted successfully"
}
```

---

### 4️⃣ Dashboard APIs (2 endpoints)

#### Get Dashboard Warnings
```typescript
GET /api/payroll/dashboard/warnings

Response: {
  data: {
    warnings: [
      "3 employee(s) without salary structure",
      "Payrun for 10/2025 has not been processed",
      "5 payslips have negative deductions"
    ]
  }
}
```

#### Get Dashboard Statistics
```typescript
GET /api/payroll/dashboard/statistics
Query Params:
  - month?: number
  - year?: number

⚠️ TO BE IMPLEMENTED

Response: {
  data: {
    totalEmployees: 5,
    employeesWithSalaryStructure: 2,
    currentMonthPayroll: 125000,
    averageSalary: 41666.67,
    pendingPayruns: 1
  }
}
```

---

## 🎨 Frontend Pages Required

### 1. Salary Structure Management Page
**Route:** `/dashboard/payroll/salary-structures`

**Features:**
- ✅ List all salary structures (table view)
- ✅ Filter by department
- ✅ Search by employee name
- ✅ Create new salary structure (modal/form)
- ✅ Edit existing structure (modal/form)
- ✅ Delete structure (Admin only)
- ✅ View structure details (modal)

**Key UI Elements:**
```
┌─────────────────────────────────────────────────────────┐
│  Salary Structures                    [+ Create]        │
├─────────────────────────────────────────────────────────┤
│  [Department ▼] [Search: ___________] [Filter]          │
├─────────────────────────────────────────────────────────┤
│  Employee          │ Dept    │ Monthly Wage │ Actions  │
│  ─────────────────────────────────────────────────────  │
│  Alice Smith       │ IT      │ ₹50,000      │ 👁 ✏ 🗑   │
│  Bob Williams      │ Finance │ ₹30,000      │ 👁 ✏ 🗑   │
│  Charlie Brown     │ HR      │ ₹45,000      │ 👁 ✏ 🗑   │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Payrun Management Page
**Route:** `/dashboard/payroll/payruns`

**Features:**
- ✅ List all payruns (card/table view)
- ✅ Filter by status, month, year
- ✅ Create new payrun
- ✅ View payrun details
- ✅ Process payrun (calculate payslips)
- ✅ Validate payrun (check for warnings)
- ✅ Mark as paid
- ✅ Delete payrun

**Key UI Elements:**
```
┌─────────────────────────────────────────────────────────┐
│  Payrun Management                    [+ Create Payrun] │
├─────────────────────────────────────────────────────────┤
│  [Status ▼] [Month ▼] [Year ▼]                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │  November 2025                      [DRAFT]      │  │
│  │  ─────────────────────────────────────────────── │  │
│  │  Employees: 3        Gross: ₹83,333.33          │  │
│  │  Payslips: 3         Net: ₹77,933.34            │  │
│  │                                                   │  │
│  │  [Process] [Validate] [Mark Paid] [View Details] │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Payrun Details Page
**Route:** `/dashboard/payroll/payruns/:id`

**Features:**
- ✅ Show payrun summary
- ✅ List all payslips in this payrun
- ✅ Show warnings (if any)
- ✅ Download all payslips (bulk)
- ✅ Email all payslips (bulk)
- ✅ Actions: Process, Validate, Mark Paid

**Key UI Elements:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back  |  Payrun: November 2025                      │
├─────────────────────────────────────────────────────────┤
│  Status: [DRAFT]     Period: 1 Nov - 30 Nov 2025       │
│                                                          │
│  📊 Summary                                             │
│  ┌─────────────┬─────────────┬─────────────┐           │
│  │ Employees   │ Gross Wage  │ Net Wage    │           │
│  │ 3           │ ₹83,333.33  │ ₹77,933.34  │           │
│  └─────────────┴─────────────┴─────────────┘           │
│                                                          │
│  ⚠️ Warnings                                            │
│  • 3 employee(s) without salary structure               │
│                                                          │
│  📄 Payslips                                            │
│  Employee          │ Gross      │ Net       │ Status    │
│  ──────────────────────────────────────────────────────│
│  Alice Smith       │ ₹33,333.33 │ ₹31,200   │ DRAFT    │
│  Bob Williams      │ ₹20,000    │ ₹18,733   │ DRAFT    │
│  Charlie Brown     │ ₹30,000    │ ₹28,000   │ DRAFT    │
│                                                          │
│  [Process Payrun] [Validate] [Mark as Paid]             │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Payslips List Page
**Route:** `/dashboard/payroll/payslips`

**Features:**
- ✅ List all payslips (table view)
- ✅ Filter by employee, department, month, year
- ✅ Search by employee name
- ✅ View payslip details
- ✅ Download PDF
- ✅ Email payslip
- ✅ Edit/Recalculate

**Key UI Elements:**
```
┌─────────────────────────────────────────────────────────┐
│  Payslips                                                │
├─────────────────────────────────────────────────────────┤
│  [Employee ▼] [Dept ▼] [Month ▼] [Year ▼] [Search]     │
├─────────────────────────────────────────────────────────┤
│  Employee    │ Month/Year │ Gross    │ Net     │ Action │
│  ──────────────────────────────────────────────────────│
│  Alice Smith │ Nov 2025   │ ₹33,333  │ ₹31,200 │ 👁 📥 ✉│
│  Bob Williams│ Nov 2025   │ ₹20,000  │ ₹18,733 │ 👁 📥 ✉│
│  Alice Smith │ Oct 2025   │ ₹33,333  │ ₹31,200 │ 👁 📥 ✉│
└─────────────────────────────────────────────────────────┘
```

---

### 5. Payslip Details Page
**Route:** `/dashboard/payroll/payslips/:id`

**Features:**
- ✅ Show complete payslip (professional format)
- ✅ Employee information
- ✅ Earnings breakdown
- ✅ Deductions breakdown
- ✅ Attendance breakdown
- ✅ Net salary in words
- ✅ Download PDF
- ✅ Email payslip
- ✅ Edit deductions (if editable)
- ✅ Recalculate

**Key UI Elements:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back  |  Payslip                     [📥 PDF] [✉ Email]│
├─────────────────────────────────────────────────────────┤
│  🏢 WorkZen HRMS                                        │
│  Payslip for the month of November 2025                │
│                                                          │
│  👤 Employee Details                                    │
│  Name: Alice Smith              Code: OIALSM20210002    │
│  Department: IT                 Designation: Sr. Eng    │
│  PAN: ABCDE1234F               UAN: 123456789012        │
│  Bank: 1234567890              IFSC: HDFC0001234        │
│                                                          │
│  💰 Earnings                    💸 Deductions           │
│  ┌──────────────────────┐      ┌──────────────────┐    │
│  │ Basic Salary  16,667 │      │ PF (Employee) 2,000│  │
│  │ HRA           8,333  │      │ Prof. Tax      200│   │
│  │ Std Allow.    3,333  │      │ TDS            0  │   │
│  │ Perf. Bonus   1,667  │      │ Unpaid Ded.    0  │   │
│  │ LTA           1,667  │      │ Other          0  │   │
│  │ Fixed Allow.  1,667  │      │                   │   │
│  │ ──────────────────── │      │ ──────────────────│   │
│  │ Gross      33,333.33 │      │ Total    2,200.00 │   │
│  └──────────────────────┘      └──────────────────┘    │
│                                                          │
│  💵 Net Salary: ₹31,133.33                              │
│  In Words: Thirty One Thousand One Hundred Thirty       │
│            Three Only                                    │
│                                                          │
│  📅 Attendance (Nov 2025)                               │
│  Total Days: 30  │  Working Days: 21  │  Worked: 21    │
│  Present: 21     │  Paid Leave: 0     │  Unpaid: 0     │
│  Absent: 0       │  Holidays: 0       │  Rate: 100%    │
│                                                          │
│  [Edit Deductions] [Recalculate] [Download PDF]         │
└─────────────────────────────────────────────────────────┘
```

---

### 6. Employee Payslip History Page (Employee View)
**Route:** `/dashboard/payroll/my-payslips`

**Features:**
- ✅ Show logged-in employee's payslips only
- ✅ Filter by year
- ✅ View payslip details
- ✅ Download PDF

**Key UI Elements:**
```
┌─────────────────────────────────────────────────────────┐
│  My Payslips                                             │
├─────────────────────────────────────────────────────────┤
│  [Year: 2025 ▼]                                         │
├─────────────────────────────────────────────────────────┤
│  Month/Year     │ Gross Salary  │ Net Salary  │ Action  │
│  ───────────────────────────────────────────────────────│
│  November 2025  │ ₹33,333.33    │ ₹31,200     │ 👁 📥   │
│  October 2025   │ ₹33,333.33    │ ₹31,200     │ 👁 📥   │
│  September 2025 │ ₹33,333.33    │ ₹31,200     │ 👁 📥   │
└─────────────────────────────────────────────────────────┘
```

---

### 7. Payroll Dashboard Page
**Route:** `/dashboard/payroll`

**Features:**
- ✅ Show key metrics (cards)
- ✅ Show warnings
- ✅ Recent payruns
- ✅ Quick actions

**Key UI Elements:**
```
┌─────────────────────────────────────────────────────────┐
│  Payroll Dashboard                                       │
├─────────────────────────────────────────────────────────┤
│  📊 Key Metrics                                         │
│  ┌─────────┬─────────┬─────────┬─────────┐             │
│  │ Total   │ With    │ Current │ Pending │             │
│  │ Emp: 5  │ Sal: 3  │ Pay: 125k│ Runs: 1│             │
│  └─────────┴─────────┴─────────┴─────────┘             │
│                                                          │
│  ⚠️ Warnings                                            │
│  • 3 employee(s) without salary structure               │
│  • Payrun for October 2025 not processed                │
│                                                          │
│  📅 Recent Payruns                                      │
│  November 2025  │ DRAFT     │ [Process] [View]          │
│  October 2025   │ PAID      │           [View]          │
│                                                          │
│  🚀 Quick Actions                                       │
│  [+ Create Payrun] [Manage Salary Structures]           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 Step-by-Step Integration

### Step 1: Create API Service Layer
**File:** `frontend/lib/api/payroll.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ============================================
// Salary Structure APIs
// ============================================

export const salaryStructureAPI = {
  // Create salary structure
  create: async (data: {
    employeeId: string;
    monthlyWage: number;
    pfPercentage?: number;
    professionalTax?: number;
    effectiveFrom?: string;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/payroll/salary-structure`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // List all salary structures
  list: async (params?: {
    page?: number;
    limit?: number;
    department?: string;
    search?: string;
  }) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/salary-structure`,
      {
        headers: getAuthHeaders(),
        params
      }
    );
    return response.data;
  },

  // Get by employee ID
  getByEmployee: async (employeeId: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/salary-structure/${employeeId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Update salary structure
  update: async (id: string, data: {
    monthlyWage?: number;
    pfPercentage?: number;
    professionalTax?: number;
    effectiveFrom?: string;
  }) => {
    const response = await axios.put(
      `${API_BASE_URL}/payroll/salary-structure/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Delete salary structure
  delete: async (id: string) => {
    const response = await axios.delete(
      `${API_BASE_URL}/payroll/salary-structure/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

// ============================================
// Payrun APIs
// ============================================

export const payrunAPI = {
  // Create payrun
  create: async (data: {
    month: number;
    year: number;
    payPeriodStart?: string;
    payPeriodEnd?: string;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/payroll/payruns`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // List payruns
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    year?: number;
    month?: number;
  }) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/payruns`,
      {
        headers: getAuthHeaders(),
        params
      }
    );
    return response.data;
  },

  // Get payrun details
  get: async (id: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/payruns/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Process payrun (calculate all payslips)
  process: async (id: string) => {
    const response = await axios.put(
      `${API_BASE_URL}/payroll/payruns/${id}/process`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Validate payrun
  validate: async (id: string) => {
    const response = await axios.put(
      `${API_BASE_URL}/payroll/payruns/${id}/validate`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Mark as paid
  markPaid: async (id: string) => {
    const response = await axios.put(
      `${API_BASE_URL}/payroll/payruns/${id}/mark-paid`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Delete payrun
  delete: async (id: string) => {
    const response = await axios.delete(
      `${API_BASE_URL}/payroll/payruns/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

// ============================================
// Payslip APIs
// ============================================

export const payslipAPI = {
  // List all payslips
  list: async (params?: {
    page?: number;
    limit?: number;
    payrunId?: string;
    employeeId?: string;
    department?: string;
    month?: number;
    year?: number;
  }) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/payslips`,
      {
        headers: getAuthHeaders(),
        params
      }
    );
    return response.data;
  },

  // Get employee payslip history
  getEmployeeHistory: async (employeeId: string, params?: {
    year?: number;
    limit?: number;
  }) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/payslips/employee/${employeeId}`,
      {
        headers: getAuthHeaders(),
        params
      }
    );
    return response.data;
  },

  // Get single payslip
  get: async (id: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/payslips/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Update payslip (manual adjustments)
  update: async (id: string, data: {
    tdsDeduction?: number;
    otherDeductions?: number;
  }) => {
    const response = await axios.put(
      `${API_BASE_URL}/payroll/payslips/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Recalculate payslip
  recalculate: async (id: string) => {
    const response = await axios.put(
      `${API_BASE_URL}/payroll/payslips/${id}/compute`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Download PDF (TO BE IMPLEMENTED)
  downloadPDF: async (id: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/payslips/${id}/pdf`,
      {
        headers: getAuthHeaders(),
        responseType: 'blob'
      }
    );
    return response.data;
  },

  // Email payslip (TO BE IMPLEMENTED)
  sendEmail: async (id: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/payroll/payslips/${id}/send-email`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Delete payslip
  delete: async (id: string) => {
    const response = await axios.delete(
      `${API_BASE_URL}/payroll/payslips/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

// ============================================
// Dashboard APIs
// ============================================

export const payrollDashboardAPI = {
  // Get warnings
  getWarnings: async () => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/dashboard/warnings`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Get statistics (TO BE IMPLEMENTED)
  getStatistics: async (params?: {
    month?: number;
    year?: number;
  }) => {
    const response = await axios.get(
      `${API_BASE_URL}/payroll/dashboard/statistics`,
      {
        headers: getAuthHeaders(),
        params
      }
    );
    return response.data;
  }
};
```

---

### Step 2: Create TypeScript Interfaces
**File:** `frontend/types/payroll.ts`

```typescript
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
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    department: string;
  };
}

export type PayrunStatus = 'DRAFT' | 'PROCESSED' | 'VALIDATED' | 'PAID';

export interface Payrun {
  id: string;
  month: number;
  year: number;
  status: PayrunStatus;
  payPeriodStart: string;
  payPeriodEnd: string;
  employeeCount: number;
  totalEmployerCost: number;
  totalBasicWage: number;
  totalGrossWage: number;
  totalNetWage: number;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  payslips?: Payslip[];
  warnings?: string[];
}

export interface Payslip {
  id: string;
  payrunId: string;
  employeeId: string;
  
  // Employee Info
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  location: string;
  panNumber: string;
  uanNumber: string;
  bankAccountNo: string;
  ifscCode: string;
  dateOfJoining: string;
  
  // Pay Period
  month: number;
  year: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  
  // Earnings
  basicSalary: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  leaveTravelAllowance: number;
  fixedAllowance: number;
  grossSalary: number;
  
  // Deductions
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  tdsDeduction: number;
  unpaidDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Net
  netSalary: number;
  netSalaryWords: string;
  
  // Attendance
  totalDaysInMonth: number;
  workingDaysInMonth: number;
  attendanceDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  holidayDays: number;
  workedDays: number;
  payableDays: number;
  ratePercentage: number;
  
  // Status
  status: string;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  payrun?: Payrun;
  employee?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    department: string;
  };
}

export interface PayrollDashboardWarnings {
  warnings: string[];
}

export interface PayrollDashboardStatistics {
  totalEmployees: number;
  employeesWithSalaryStructure: number;
  currentMonthPayroll: number;
  averageSalary: number;
  pendingPayruns: number;
}
```

---

### Step 3: Create Page Components (Priority Order)

#### 3.1 Start with Salary Structure Management
**File:** `frontend/app/dashboard/payroll/salary-structures/page.tsx`

**Why start here?**
- It's the foundation - employees need salary structures before payruns
- Simplest CRUD operations
- No dependencies on other payroll features

**Implementation tips:**
1. Create a table with employee name, department, monthly wage
2. Add "Create" button that opens a modal
3. In the modal, show employee dropdown, monthly wage input
4. Show auto-calculated components (read-only)
5. Add Edit and Delete actions
6. Test with existing 3 employees from seed data

---

#### 3.2 Then Payroll Dashboard
**File:** `frontend/app/dashboard/payroll/page.tsx`

**Why next?**
- Provides overview of the system
- Shows warnings (helps identify issues)
- Entry point for other features

**Implementation tips:**
1. Fetch dashboard warnings on page load
2. Show key metrics cards
3. Add quick action buttons
4. Link to other payroll pages

---

#### 3.3 Then Payrun Management
**File:** `frontend/app/dashboard/payroll/payruns/page.tsx`

**Why third?**
- Requires salary structures to be set up
- Core payroll workflow

**Implementation tips:**
1. List payruns as cards
2. Add status badges (color-coded)
3. Add action buttons: Process, Validate, Mark Paid
4. Show confirmation dialogs before actions
5. Refresh data after actions

---

#### 3.4 Then Payrun Details Page
**File:** `frontend/app/dashboard/payroll/payruns/[id]/page.tsx`

**Implementation tips:**
1. Fetch payrun with payslips included
2. Show summary metrics
3. List payslips in a table
4. Add bulk actions (download all, email all)

---

#### 3.5 Then Payslips List
**File:** `frontend/app/dashboard/payroll/payslips/page.tsx`

**Implementation tips:**
1. Add multiple filters (employee, department, month, year)
2. Use pagination
3. Add actions: View, Download PDF, Email

---

#### 3.6 Then Payslip Details
**File:** `frontend/app/dashboard/payroll/payslips/[id]/page.tsx`

**Implementation tips:**
1. Design professional payslip layout
2. Show all sections: Employee info, Earnings, Deductions, Net, Attendance
3. Add Edit mode for TDS and other deductions
4. Add Recalculate button
5. Add Download PDF and Email buttons (placeholder for now)

---

#### 3.7 Finally Employee Payslip View
**File:** `frontend/app/dashboard/my-payslips/page.tsx`

**Implementation tips:**
1. Get logged-in employee ID from context
2. Fetch only their payslips
3. Simpler view (no edit/delete)
4. Focus on view and download

---

### Step 4: Add Navigation Links
**File:** `frontend/components/layout/Sidebar.tsx` or similar

Add these menu items for Admin/Payroll Officer:
```typescript
{
  name: 'Payroll',
  icon: MoneyIcon,
  children: [
    { name: 'Dashboard', href: '/dashboard/payroll' },
    { name: 'Salary Structures', href: '/dashboard/payroll/salary-structures' },
    { name: 'Payruns', href: '/dashboard/payroll/payruns' },
    { name: 'Payslips', href: '/dashboard/payroll/payslips' }
  ]
}
```

For Employees:
```typescript
{
  name: 'My Payslips',
  href: '/dashboard/my-payslips',
  icon: DocumentIcon
}
```

---

### Step 5: Test Each Feature

**Testing Checklist:**

- [ ] **Salary Structures**
  - [ ] Create new structure (₹50,000 → see auto-calculated components)
  - [ ] List all structures
  - [ ] Edit structure (change wage → see recalculation)
  - [ ] Delete structure (Admin only)
  - [ ] Filter by department
  - [ ] Search by employee name

- [ ] **Dashboard**
  - [ ] View warnings (should show "3 employees without salary structure")
  - [ ] View metrics
  - [ ] Quick actions work

- [ ] **Payruns**
  - [ ] Create payrun for current month
  - [ ] List payruns with filters
  - [ ] Process payrun → see payslips created
  - [ ] Validate payrun → see warnings
  - [ ] Mark as paid
  - [ ] Delete payrun

- [ ] **Payrun Details**
  - [ ] View summary
  - [ ] See all payslips
  - [ ] Perform actions

- [ ] **Payslips**
  - [ ] List all payslips
  - [ ] Filter by employee/department/month
  - [ ] View payslip details
  - [ ] Edit deductions (TDS, other)
  - [ ] Recalculate payslip
  - [ ] Download PDF (placeholder)
  - [ ] Email payslip (placeholder)

- [ ] **Employee View**
  - [ ] Employee sees only their payslips
  - [ ] Can view details
  - [ ] Can download (when implemented)
  - [ ] Cannot edit

- [ ] **RBAC**
  - [ ] Admin can access all features
  - [ ] Payroll Officer can access all features
  - [ ] HR Officer CANNOT access payroll
  - [ ] Employee can only see their own payslips

---

## 🎨 UI/UX Guidelines

### Design Principles
1. **Professional Look**: Payroll is sensitive - use clean, professional design
2. **Clear Typography**: Money amounts should be highly readable
3. **Status Indicators**: Use color-coded badges (Draft=Yellow, Processed=Blue, Validated=Green, Paid=Gray)
4. **Confirmation Dialogs**: Always confirm before Process, Validate, Mark Paid, Delete
5. **Loading States**: Show spinners during API calls
6. **Error Handling**: Show clear error messages

### Color Scheme
```typescript
const statusColors = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PROCESSED: 'bg-blue-100 text-blue-800',
  VALIDATED: 'bg-green-100 text-green-800',
  PAID: 'bg-gray-100 text-gray-800'
};
```

### Currency Formatting
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Usage: formatCurrency(31200) → "₹31,200.00"
```

### Date Formatting
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Usage: formatDate("2025-11-09") → "09 Nov 2025"
```

### Month/Year Display
```typescript
const getMonthName = (month: number) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};

// Usage: getMonthName(11) → "November"
```

---

## 🔒 Security & RBAC

### Role Permissions Matrix

| Feature | Admin | HR_OFFICER | PAYROLL_OFFICER | EMPLOYEE |
|---------|-------|------------|-----------------|----------|
| View Salary Structures | ✅ | ❌ | ✅ | ❌ |
| Create Salary Structure | ✅ | ❌ | ✅ | ❌ |
| Edit Salary Structure | ✅ | ❌ | ✅ | ❌ |
| Delete Salary Structure | ✅ | ❌ | ❌ | ❌ |
| Create Payrun | ✅ | ❌ | ✅ | ❌ |
| Process Payrun | ✅ | ❌ | ✅ | ❌ |
| Validate Payrun | ✅ | ❌ | ✅ | ❌ |
| Mark Payrun Paid | ✅ | ❌ | ✅ | ❌ |
| View All Payslips | ✅ | ❌ | ✅ | ❌ |
| View Own Payslips | ✅ | ✅ | ✅ | ✅ |
| Edit Payslip | ✅ | ❌ | ✅ | ❌ |
| Download Payslip PDF | ✅ | ❌ | ✅ | ✅ (own) |
| Email Payslip | ✅ | ❌ | ✅ | ❌ |
| Dashboard Warnings | ✅ | ❌ | ✅ | ❌ |

### Frontend RBAC Implementation

```typescript
// In your auth context or hook
const hasPermission = (requiredRole: string) => {
  const userRole = getCurrentUser()?.role;
  
  const roleHierarchy = {
    'ADMIN': ['ADMIN', 'PAYROLL_OFFICER', 'HR_OFFICER', 'EMPLOYEE'],
    'PAYROLL_OFFICER': ['PAYROLL_OFFICER', 'EMPLOYEE'],
    'HR_OFFICER': ['HR_OFFICER', 'EMPLOYEE'],
    'EMPLOYEE': ['EMPLOYEE']
  };
  
  return roleHierarchy[userRole]?.includes(requiredRole) || false;
};

// Usage in components
{hasPermission('PAYROLL_OFFICER') && (
  <button onClick={handleProcessPayrun}>Process Payrun</button>
)}

{hasPermission('ADMIN') && (
  <button onClick={handleDelete}>Delete</button>
)}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Payslip not found" for employee
**Solution:** Make sure you're using the correct employee ID (UUID, not employeeCode)

### Issue 2: Payslips showing ₹0
**Solution:** 
- Check if salary structure exists for the employee
- If no attendance data, system assumes full attendance (this is correct)
- Verify the salary structure has correct monthlyWage

### Issue 3: Cannot process payrun
**Solution:**
- Check if payrun status is DRAFT
- Ensure at least one employee has salary structure
- Check console for API errors

### Issue 4: Auto-calculation not working
**Solution:**
- Backend automatically calculates all components from monthlyWage
- Don't send individual component values in create/update requests
- Only send: employeeId, monthlyWage, pfPercentage, professionalTax

### Issue 5: Unauthorized errors
**Solution:**
- Check JWT token is being sent in headers
- Verify user role has permission for the action
- Token might be expired - refresh login

---

## 📚 Additional Resources

### Test Credentials
```
Admin:
  LoginID: OIADUS20200001
  Password: Password123!

Payroll Officer:
  LoginID: OIPAJO20210001
  Password: Password123!

Employee (Alice):
  LoginID: OIALSM20210002
  Password: Password123!

Employee (Bob):
  LoginID: OIBOWI20220001
  Password: Password123!
```

### Sample API Calls (for testing in Postman)

**Create Salary Structure:**
```bash
POST http://localhost:5000/api/payroll/salary-structure
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "00000000-0000-4000-8000-000000000110",
  "monthlyWage": 50000,
  "pfPercentage": 12,
  "professionalTax": 200
}
```

**Create Payrun:**
```bash
POST http://localhost:5000/api/payroll/payruns
Authorization: Bearer <token>
Content-Type: application/json

{
  "month": 11,
  "year": 2025
}
```

**Process Payrun:**
```bash
PUT http://localhost:5000/api/payroll/payruns/{payrunId}/process
Authorization: Bearer <token>
```

---

## ✅ Integration Checklist

### Pre-Development
- [ ] Read this document completely
- [ ] Understand RBAC requirements
- [ ] Review API endpoints
- [ ] Check test credentials work

### Development Phase
- [ ] Create API service layer (`lib/api/payroll.ts`)
- [ ] Create TypeScript interfaces (`types/payroll.ts`)
- [ ] Implement Salary Structures page
- [ ] Implement Dashboard page
- [ ] Implement Payruns page
- [ ] Implement Payrun Details page
- [ ] Implement Payslips List page
- [ ] Implement Payslip Details page
- [ ] Implement Employee Payslips page
- [ ] Add navigation menu items
- [ ] Implement RBAC guards

### Testing Phase
- [ ] Test as Admin (all features)
- [ ] Test as Payroll Officer (all features except delete)
- [ ] Test as Employee (only own payslips)
- [ ] Test CRUD operations
- [ ] Test filters and search
- [ ] Test pagination
- [ ] Test error handling
- [ ] Test responsive design

### Final Review
- [ ] All 22 endpoints integrated
- [ ] All 7 pages working
- [ ] RBAC working correctly
- [ ] UI looks professional
- [ ] Error messages are clear
- [ ] Loading states present
- [ ] Currency formatting correct
- [ ] Date formatting correct

---

## 🎯 Priority Summary

### MUST HAVE (Week 1)
1. Salary Structure Management
2. Payrun Management
3. Payslip Viewing
4. Basic Dashboard

### SHOULD HAVE (Week 2)
5. Payslip Editing
6. Advanced Filters
7. Employee Payslip View
8. Warnings Display

### NICE TO HAVE (Week 3)
9. PDF Download (backend implementation pending)
10. Email Payslip (backend implementation pending)
11. Advanced Dashboard Statistics
12. Bulk Operations

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check network tab for API responses
3. Verify JWT token is valid
4. Test API endpoint directly in Postman
5. Check backend logs for errors
6. Refer to test script: `backend/test-payroll-quick.ps1`

---

**Last Updated:** November 9, 2025  
**Backend Status:** ✅ All 22 endpoints working  
**Frontend Status:** 🔨 Ready for integration  
**Database Status:** ✅ Migrations applied, schema ready

---

## 🚀 Quick Start Commands

```bash
# Backend (already running)
cd backend
npm run dev

# Frontend (your turn!)
cd frontend
npm install
npm run dev

# Open browser
# Navigate to http://localhost:3000/dashboard/payroll
```

**Good luck with the integration! 💪**
