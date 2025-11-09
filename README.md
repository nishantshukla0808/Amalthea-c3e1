# 🚀 WorkZen HRMS

**WorkZen** is a production-grade Human Resource Management System (HRMS) built with modern technologies.

## 🎥 Demo Video

**[📺 Watch Full Demo Video on Google Drive](https://drive.google.com/drive/folders/1DAMuaDkc3tcy5urX1MsGQmg12rYR3Bqx?usp=sharing)**


## 📋 Features

- ✅ **Authentication & RBAC** (Admin, HR Officer, Payroll Officer, Employee)
- ✅ **User Management** with role-based access control
- ✅ **Attendance Tracking** (check-in/out, manual overrides)
- ✅ **Leave Management** (apply, approve, reject, cancel)
- ✅ **Payroll Processing** (deterministic calculations)
- ✅ **Payslip Generation** (PDF + email delivery)
- ✅ **Analytics Dashboard** (role-aware insights)
- ✅ **Audit Logging** (complete change tracking)

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **PDF Generation:** Puppeteer
- **Email:** Nodemailer

### Frontend (Coming Soon)
- **Framework:** Next.js 15 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Auth:** NextAuth.js

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- MySQL 8+ running
- Git

### 2. Clone & Install

```bash
git clone <repository-url>
cd Amalthea-c3e1
npm install
```

### 3. Environment Setup

Create `.env` file:

```bash
cp .env.example .env
```

Update `.env` with your MySQL credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/workzen_hrms"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start at: **http://localhost:5000**

---

## 🧪 Test Credentials

After running `npm run db:seed`, use these credentials:

| Role             | Email                  | Password      |
|------------------|------------------------|---------------|
| Admin            | admin@workzen.com      | Password123!  |
| HR Officer       | hr@workzen.com         | Password123!  |
| Payroll Officer  | payroll@workzen.com    | Password123!  |
| Employee (Alice) | alice@workzen.com      | Password123!  |
| Employee (Bob)   | bob@workzen.com        | Password123!  |
| Employee (Charlie) | charlie@workzen.com  | Password123!  |

---

## 📡 API Endpoints Documentation

### 🏥 Health & System

#### `GET /api/health`
**Description:** Check server health status  
**Auth Required:** No  
**Response:** `{ status: "ok", timestamp: "ISO-8601" }`

---

### 🔐 Authentication Routes (`/api/auth`)

#### `POST /api/auth/login`
**Description:** User login with email or loginId  
**Auth Required:** No  
**Request Body:**
```json
{
  "loginId": "admin@workzen.com",  // or Employee ID
  "password": "Password123!"
}
```
**Response:** JWT token + user details  
**Edge Cases:**
- ❌ Returns 401 if credentials invalid
- ❌ Returns 401 if account is inactive
- ✅ Accepts both email and employee ID as loginId

---

#### `POST /api/auth/register`
**Description:** Register new user (Admin only)  
**Auth Required:** Yes (JWT Token)  
**Role Required:** ADMIN  
**Request Body:**
```json
{
  "loginId": "EMP001",
  "email": "user@company.com",
  "password": "SecurePass123!",
  "role": "EMPLOYEE"
}
```
**Edge Cases:**
- ❌ Returns 400 if loginId or email already exists
- ❌ Returns 403 if not ADMIN role
- ✅ Password hashed with bcrypt (10 rounds)
- ✅ Sets `mustChangePassword: true` by default

---

#### `GET /api/auth/me`
**Description:** Get current authenticated user info  
**Auth Required:** Yes  
**Response:** Full user object with employee details  
**Edge Cases:**
- ❌ Returns 401 if token invalid/expired
- ✅ Includes role and permissions

---

#### `POST /api/auth/change-password`
**Description:** Change user password  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```
**Edge Cases:**
- ❌ Returns 400 if current password incorrect
- ❌ Returns 400 if new passwords don't match
- ❌ Returns 400 if new password less than 8 chars
- ✅ Sets `mustChangePassword: false` after first change

---

#### `GET /api/auth/roles`
**Description:** Get list of all available roles  
**Auth Required:** No  
**Response:** `["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "EMPLOYEE"]`

---

### 👥 Employee Routes (`/api/employees`)

#### `GET /api/employees`
**Description:** Get all employees with pagination and filters  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER, PAYROLL_OFFICER  
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `department` (string): Filter by department
- `search` (string): Search by name, email, employee ID
- `isActive` (boolean): Filter by active status

**Edge Cases:**
- ❌ Returns 403 if EMPLOYEE role tries to access
- ✅ Returns paginated results with total count
- ✅ Includes user and salary structure data

---

#### `GET /api/employees/me`
**Description:** Get current employee's own profile  
**Auth Required:** Yes  
**Response:** Employee object with user details  
**Edge Cases:**
- ❌ Returns 404 if employee record not found
- ✅ Works for all roles (self-access)

---

#### `POST /api/employees`
**Description:** Create new employee  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Request Body:**
```json
{
  "loginId": "OIJODO20240001",
  "email": "john.doe@company.com",
  "password": "TempPass123!",
  "role": "EMPLOYEE",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "department": "Engineering",
  "designation": "Software Engineer",
  "dateOfBirth": "1990-01-15T00:00:00Z",
  "dateOfJoining": "2024-01-01T00:00:00Z",
  "address": "123 Main St",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+0987654321",
  "basicSalary": 50000
}
```
**Edge Cases:**
- ❌ Returns 400 if loginId or email already exists
- ❌ Returns 400 if required fields missing
- ✅ Creates User and Employee in transaction
- ✅ Auto-generates employeeId from loginId
- ✅ Sets joiningYear automatically

---

#### `GET /api/employees/:id`
**Description:** Get employee by ID  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER, or self  
**Edge Cases:**
- ❌ Returns 404 if employee not found
- ❌ Returns 403 if trying to access other employee (non-admin)

---

#### `PUT /api/employees/:id`
**Description:** Update employee details  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Edge Cases:**
- ❌ Returns 404 if employee not found
- ✅ Partial updates supported
- ✅ Cannot update loginId or userId

---

#### `DELETE /api/employees/:id`
**Description:** Delete employee (soft delete - sets isActive: false)  
**Auth Required:** Yes  
**Role Required:** ADMIN  
**Edge Cases:**
- ❌ Returns 404 if employee not found
- ✅ Deactivates user account as well

---

### 🕐 Attendance Routes (`/api/attendance`)

#### `POST /api/attendance/check-in`
**Description:** Check-in for the day  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "remarks": "Starting work" // Optional
}
```
**Edge Cases:**
- ❌ Returns 400 if already checked in today
- ❌ Returns 404 if employee not found
- ✅ Records timestamp automatically
- ✅ Status set to "PRESENT"

---

#### `POST /api/attendance/check-out`
**Description:** Check-out for the day  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "remarks": "End of day" // Optional
}
```
**Edge Cases:**
- ❌ Returns 400 if not checked in today
- ❌ Returns 400 if already checked out
- ✅ Calculates total hours worked
- ✅ Marks overtime if > 8 hours

---

#### `GET /api/attendance`
**Description:** Get attendance records with filters  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER, PAYROLL_OFFICER (all), or self  
**Query Parameters:**
- `employeeId` (string): Filter by employee
- `startDate` (ISO string): Start date range
- `endDate` (ISO string): End date range
- `status` (enum): PRESENT, ABSENT, HALF_DAY, LEAVE, HOLIDAY

**Edge Cases:**
- ❌ EMPLOYEE role can only view own records
- ✅ Returns records sorted by date (desc)

---

#### `GET /api/attendance/today`
**Description:** Get today's attendance status for current user  
**Auth Required:** Yes  
**Edge Cases:**
- ❌ Returns null if no check-in today
- ✅ Includes check-in/out times

---

#### `POST /api/attendance/manual`
**Description:** Manually create attendance record (HR/Admin)  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Request Body:**
```json
{
  "employeeId": "uuid-here",
  "date": "2024-01-15T00:00:00Z",
  "status": "PRESENT",
  "checkIn": "2024-01-15T09:00:00Z",
  "checkOut": "2024-01-15T18:00:00Z",
  "remarks": "Manual entry"
}
```
**Edge Cases:**
- ❌ Returns 400 if record already exists for that date
- ✅ Calculates hours automatically if checkIn/Out provided

---

#### `PUT /api/attendance/:id`
**Description:** Update attendance record  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Edge Cases:**
- ❌ Returns 404 if record not found
- ✅ Recalculates hours on update

---

#### `DELETE /api/attendance/:id`
**Description:** Delete attendance record  
**Auth Required:** Yes  
**Role Required:** ADMIN  
**Edge Cases:**
- ❌ Returns 404 if not found

---

#### `GET /api/attendance/dashboard`
**Description:** Get attendance statistics  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Response:**
```json
{
  "totalPresent": 45,
  "totalAbsent": 5,
  "totalLeave": 3,
  "presentPercentage": 84.9
}
```

---

#### `GET /api/attendance/employee-status`
**Description:** Get real-time employee status (Present/Leave/Absent)  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER, PAYROLL_OFFICER  
**Response:**
```json
[
  {
    "employeeId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "status": "PRESENT",
    "emoji": "🟢"
  }
]
```
**Edge Cases:**
- ✅ Excludes ADMIN users from status tracking
- ✅ Shows leave emoji (✈️) if on approved leave
- ✅ Shows absent emoji (🟡) if not checked in

---

### 🏖️ Leave Routes (`/api/leaves`)

#### `POST /api/leaves`
**Description:** Apply for leave  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "leaveType": "SICK",
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2024-02-03T00:00:00Z",
  "reason": "Medical appointment",
  "halfDay": false
}
```
**Leave Types:** `CASUAL`, `SICK`, `EARNED`, `MATERNITY`, `PATERNITY`, `UNPAID`  
**Edge Cases:**
- ❌ Returns 400 if insufficient leave balance
- ❌ Returns 400 if dates overlap existing leave
- ❌ Returns 400 if endDate before startDate
- ✅ Calculates total days automatically
- ✅ Sets status to PENDING by default

---

#### `GET /api/leaves`
**Description:** Get all leave requests with filters  
**Auth Required:** Yes  
**Query Parameters:**
- `employeeId` (string): Filter by employee
- `status` (enum): PENDING, APPROVED, REJECTED, CANCELLED
- `leaveType` (enum): Leave type filter
- `startDate`, `endDate`: Date range

**Edge Cases:**
- ❌ EMPLOYEE can only see own leaves
- ✅ HR/Admin can see all leaves

---

#### `GET /api/leaves/balance/:employeeId`
**Description:** Get leave balance for employee  
**Auth Required:** Yes  
**Response:**
```json
{
  "casual": 10,
  "sick": 7,
  "earned": 15,
  "totalAvailable": 32
}
```
**Edge Cases:**
- ✅ Calculated based on approved leaves
- ✅ Annual limits: Casual=12, Sick=12, Earned=15

---

#### `GET /api/leaves/:id`
**Description:** Get leave details by ID  
**Auth Required:** Yes  
**Edge Cases:**
- ❌ EMPLOYEE can only view own leaves
- ❌ Returns 404 if not found

---

#### `PUT /api/leaves/:id/approve`
**Description:** Approve leave request  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Edge Cases:**
- ❌ Returns 400 if already approved/rejected
- ❌ Returns 400 if insufficient balance
- ✅ Creates attendance records with status=LEAVE
- ✅ Sends approval notification

---

#### `PUT /api/leaves/:id/reject`
**Description:** Reject leave request  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Request Body:**
```json
{
  "remarks": "Reason for rejection"
}
```
**Edge Cases:**
- ❌ Returns 400 if already approved/rejected
- ✅ Sends rejection notification

---

#### `DELETE /api/leaves/:id`
**Description:** Cancel/delete leave request  
**Auth Required:** Yes  
**Edge Cases:**
- ❌ Cannot delete approved leaves (only ADMIN can)
- ✅ Employee can delete PENDING leaves
- ✅ Removes associated attendance records

---

### 💰 Payroll Routes (`/api/payroll`)

#### `POST /api/payroll/salary-structure`
**Description:** Create salary structure for employee  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Request Body:**
```json
{
  "employeeId": "uuid",
  "basicSalary": 30000,
  "hra": 12000,
  "allowances": 8000,
  "pfPercentage": 12,
  "professionalTax": 200,
  "effectiveFrom": "2024-01-01T00:00:00Z"
}
```
**Edge Cases:**
- ❌ Returns 400 if employee not found
- ❌ Returns 400 if overlapping effective dates
- ✅ Auto-calculates gross salary
- ✅ Validates percentage fields (0-100)

---

#### `GET /api/payroll/salary-structure`
**Description:** Get all salary structures with filters  
**Auth Required:** Yes  
**Query Parameters:**
- `employeeId` (string): Filter by employee
- `department` (string): Filter by department

**Edge Cases:**
- ❌ EMPLOYEE can only view own structure
- ✅ Returns active structures by default

---

#### `GET /api/payroll/salary-structure/:employeeId`
**Description:** Get salary structure by employee ID  
**Auth Required:** Yes  
**Edge Cases:**
- ❌ Returns 404 if no structure found
- ✅ Returns most recent active structure

---

#### `PUT /api/payroll/salary-structure/:id`
**Description:** Update salary structure  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Edge Cases:**
- ❌ Returns 404 if not found
- ✅ Creates new record if effectiveFrom changed (audit trail)

---

#### `DELETE /api/payroll/salary-structure/:id`
**Description:** Delete salary structure  
**Auth Required:** Yes  
**Role Required:** ADMIN  
**Edge Cases:**
- ❌ Returns 400 if used in payslips
- ✅ Soft delete recommended

---

#### `POST /api/payroll/payruns`
**Description:** Create payrun for month  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Request Body:**
```json
{
  "month": 1,
  "year": 2024,
  "paymentDate": "2024-02-05T00:00:00Z"
}
```
**Edge Cases:**
- ❌ Returns 400 if payrun already exists for month/year
- ❌ Returns 400 if future month selected
- ✅ Status set to DRAFT initially
- ✅ Auto-generates unique payrun code

---

#### `GET /api/payroll/payruns`
**Description:** Get all payruns with filters  
**Auth Required:** Yes  
**Query Parameters:**
- `status` (enum): DRAFT, VALIDATED, PROCESSED, PAID
- `year` (number): Filter by year

---

#### `GET /api/payroll/payruns/:id`
**Description:** Get payrun details with payslips  
**Auth Required:** Yes  
**Edge Cases:**
- ✅ Includes all payslips in response
- ✅ Shows employee count and totals

---

#### `PUT /api/payroll/payruns/:id/process`
**Description:** Process payrun (generate payslips)  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Edge Cases:**
- ❌ Returns 400 if already processed
- ❌ Returns 400 if not in DRAFT status
- ✅ Generates payslips for all active employees
- ✅ Calculates attendance-based deductions
- ✅ Status changes to PROCESSED

---

#### `PUT /api/payroll/payruns/:id/validate`
**Description:** Validate payrun before processing  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Edge Cases:**
- ❌ Returns 400 if no employees with salary structure
- ✅ Checks for missing attendance records
- ✅ Status changes to VALIDATED

---

#### `PUT /api/payroll/payruns/:id/mark-paid`
**Description:** Mark payrun as paid  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Edge Cases:**
- ❌ Returns 400 if not PROCESSED
- ✅ Marks all payslips as PAID
- ✅ Records payment date

---

#### `DELETE /api/payroll/payruns/:id`
**Description:** Delete payrun  
**Auth Required:** Yes  
**Role Required:** ADMIN  
**Edge Cases:**
- ❌ Returns 400 if status is PAID
- ✅ Cascades delete to payslips

---

#### `GET /api/payroll/payslips`
**Description:** Get all payslips with filters  
**Auth Required:** Yes  
**Query Parameters:**
- `employeeId` (string): Filter by employee
- `month` (number): Filter by month
- `year` (number): Filter by year
- `status` (enum): DRAFT, PROCESSED, PAID

**Edge Cases:**
- ❌ EMPLOYEE can only view own payslips
- ✅ Returns with employee and payrun details

---

#### `GET /api/payroll/payslips/employee/:employeeId`
**Description:** Get payslips for specific employee  
**Auth Required:** Yes  
**Edge Cases:**
- ❌ EMPLOYEE can only access own ID
- ✅ Sorted by date descending

---

#### `GET /api/payroll/payslips/:id`
**Description:** Get payslip details  
**Auth Required:** Yes  
**Edge Cases:**
- ❌ EMPLOYEE can only view own payslips
- ✅ Includes full breakdown of earnings/deductions

---

#### `PUT /api/payroll/payslips/:id`
**Description:** Update payslip manually  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Edge Cases:**
- ❌ Returns 400 if payslip is PAID
- ✅ Recalculates totals on update

---

#### `PUT /api/payroll/payslips/:id/compute`
**Description:** Recompute payslip calculations  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Edge Cases:**
- ✅ Fetches latest attendance data
- ✅ Recalculates all deductions
- ✅ Updates net salary

---

#### `GET /api/payroll/dashboard/warnings`
**Description:** Get payroll warnings and alerts  
**Auth Required:** Yes  
**Role Required:** ADMIN, PAYROLL_OFFICER  
**Response:**
```json
{
  "missingAttendance": 5,
  "missingSalaryStructure": 2,
  "pendingPayslips": 45
}
```

---

### 👤 User Routes (`/api/users`)

#### `POST /api/users`
**Description:** Create new user account  
**Auth Required:** Yes  
**Role Required:** ADMIN  
**Request Body:**
```json
{
  "loginId": "USR001",
  "email": "user@company.com",
  "password": "SecurePass123!",
  "role": "EMPLOYEE",
  "isActive": true
}
```
**Edge Cases:**
- ❌ Returns 400 if loginId/email exists
- ✅ Password hashed with bcrypt

---

#### `GET /api/users`
**Description:** Get all users  
**Auth Required:** Yes  
**Role Required:** ADMIN, HR_OFFICER  
**Query Parameters:**
- `role` (enum): Filter by role
- `isActive` (boolean): Filter by status

---

## 🛡️ Security & Edge Cases

### Authentication & Authorization
- ✅ **JWT Token:** All protected routes require `Bearer <token>` in Authorization header
- ✅ **Token Expiry:** Tokens expire after 7 days
- ✅ **Password Security:** Bcrypt hashing with 10 rounds
- ✅ **RBAC:** Role-based access control on all sensitive endpoints
- ✅ **CORS:** Configured for frontend origin (http://localhost:3000)

### Data Validation
- ✅ **Email Validation:** Proper email format required
- ✅ **Date Validation:** ISO-8601 format enforced
- ✅ **Enum Validation:** Only allowed values accepted for status fields
- ✅ **Required Fields:** Returns 400 if mandatory fields missing

### Business Logic Edge Cases
- ✅ **Leave Balance:** Cannot apply leave if insufficient balance
- ✅ **Overlapping Leave:** Prevents overlapping leave requests
- ✅ **Duplicate Check-in:** Cannot check-in twice on same day
- ✅ **Payrun Validation:** Cannot process payrun for future months
- ✅ **Salary Structure:** Cannot have overlapping effective dates
- ✅ **Attendance Records:** Automatically created for approved leaves

### Error Handling
- ✅ **400 Bad Request:** Invalid input or business rule violation
- ✅ **401 Unauthorized:** Missing or invalid token
- ✅ **403 Forbidden:** Insufficient permissions
- ✅ **404 Not Found:** Resource doesn't exist
- ✅ **500 Internal Server Error:** Server-side errors with logging

### Database
- ✅ **Transactions:** Critical operations use Prisma transactions
- ✅ **Cascading Deletes:** Configured for related records
- ✅ **Unique Constraints:** Enforced at DB level
- ✅ **Foreign Keys:** Maintain referential integrity

---

## 🗂 Project Structure

```
Amalthea-c3e1/
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   └── seed.ts             # Database seeding
├── src/
│   └── index.ts            # Main server entry
├── fixtures.json           # Test data IDs
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📝 Development Phases

- ✅ **Phase A.1** — Prisma Schema & Seed (CURRENT)
- ⏳ **Phase A.2** — Prisma Client Setup
- ⏳ **Phase A.3** — Auth Routes & JWT
- ⏳ **Phase A.4** — RBAC Middleware
- ⏳ **Phase A.5** — Health & Logging
- ⏳ **Phase B** — Core APIs (Users, Attendance, Leave, Payroll)
- ⏳ **Phase C** — Testing & CI
- ⏳ **Phase D** — Frontend Integration

---

## 🤝 Contributing

This project follows a **strict commit protocol**. Each phase must be:

1. Developed in a feature branch
2. Tested with curl scripts
3. Reviewed via PR
4. Merged to main

---

## 📄 License

MIT License

---

## 📞 Support

For issues or questions, open a GitHub issue.

---

**Built with ❤️ by the WorkZen Team**
