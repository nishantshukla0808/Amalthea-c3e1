# 📡 WorkZen HRMS - API Documentation

**Base URL**: `http://localhost:5000/api`  
**Last Updated**: November 8, 2025 - 18:45  
**Backend Location**: `/backend/src/routes/`

---

## 🔐 Authentication

All protected endpoints require JWT token in header:
```http
Authorization: Bearer <your-jwt-token>
```

---

## ✅ **IMPLEMENTED APIs** (21 endpoints)

### Summary:
- **Authentication**: 5 endpoints
- **User Management**: 3 endpoints
- **Employee Management**: 5 endpoints
- **Attendance Management**: 8 endpoints ✨ NEW!

### 🔑 Authentication Routes (`/api/auth`)

#### 1. **Login**
```http
POST /api/auth/login
Content-Type: application/json

Body:
{
  "loginId": "OIADUS20200001",  // or use "email"
  "password": "Password123!"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "loginId": "OIADUS20200001",
    "email": "admin@workzen.com",
    "role": "ADMIN",
    "isActive": true,
    "mustChangePassword": false
  },
  "mustChangePassword": false
}

Errors:
- 400: Missing credentials
- 401: Invalid credentials
- 403: Account deactivated
```

#### 2. **Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "user": {
    "id": "uuid",
    "email": "admin@workzen.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2025-11-08T...",
    "updatedAt": "2025-11-08T..."
  }
}

Errors:
- 401: Authentication required
- 404: User not found
```

#### 3. **Change Password**
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

Response (200):
{
  "message": "Password changed successfully"
}

Errors:
- 400: Missing fields / Weak password / Same password
- 401: Current password incorrect
- 404: User not found
```

#### 4. **Get Available Roles**
```http
GET /api/auth/roles

Response (200):
{
  "roles": ["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "EMPLOYEE"]
}
```

#### 5. **Register** (Disabled)
```http
POST /api/auth/register

Response (403):
{
  "success": false,
  "error": "Public registration is disabled. Please contact HR to create your account."
}
```

---

### 👥 User Management Routes (`/api/users`)
**Required Roles**: ADMIN, HR_OFFICER

#### 6. **Create User**
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "email": "john.doe@workzen.com",        // Required
  "firstName": "John",                     // Required
  "lastName": "Doe",                       // Required
  "dateOfJoining": "2024-01-15",          // Required (YYYY-MM-DD)
  "role": "EMPLOYEE",                      // Optional (default: EMPLOYEE)
  "department": "IT",                      // Optional
  "designation": "Developer",              // Optional
  "dateOfBirth": "1990-05-15",            // Optional
  "phoneNumber": "+1234567890",           // Optional
  "address": "123 Main St",               // Optional
  "emergencyContact": "+9876543210",      // Optional
  "bankAccountNo": "1234567890",          // Optional
  "ifscCode": "BANK0001234",              // Optional
  "panNumber": "ABCDE1234F",              // Optional
  "aadharNumber": "123456789012"          // Optional
}

Response (201):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "loginId": "OIJODO20240001",           // Auto-generated
    "email": "john.doe@workzen.com",
    "temporaryPassword": "SmartTiger601$", // Auto-generated (SAVE THIS!)
    "role": "EMPLOYEE",
    "mustChangePassword": true,
    "employee": {
      "employeeId": "OIJODO20240001",
      "firstName": "John",
      "lastName": "Doe",
      "department": "IT",
      "designation": "Developer"
    }
  }
}

Errors:
- 400: Missing required fields / Email already exists
- 401: Unauthorized
- 403: Insufficient permissions
```

#### 7. **Get All Users**
```http
GET /api/users
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "loginId": "OIADUS20200001",
      "email": "admin@workzen.com",
      "role": "ADMIN",
      "isActive": true,
      "mustChangePassword": false,
      "createdAt": "2025-11-08T...",
      "updatedAt": "2025-11-08T...",
      "employee": {
        "employeeId": "OIADUS20200001",
        "firstName": "Admin",
        "lastName": "User",
        "department": "Management",
        "designation": "System Administrator"
      }
    }
  ],
  "total": 7
}

Errors:
- 401: Unauthorized
- 403: Insufficient permissions
```

#### 8. **Get User by ID**
```http
GET /api/users/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "loginId": "OIADUS20200001",
    "email": "admin@workzen.com",
    "role": "ADMIN",
    "isActive": true,
    "mustChangePassword": false,
    "employee": {
      "employeeId": "OIADUS20200001",
      "firstName": "Admin",
      "lastName": "User",
      "dateOfBirth": "1985-01-15T...",
      "dateOfJoining": "2020-01-01T...",
      "department": "Management",
      "designation": "System Administrator",
      "phoneNumber": "+1234567890"
    }
  }
}

Errors:
- 401: Unauthorized
- 403: Insufficient permissions
- 404: User not found
```

---

### � Employee Management Routes (`/api/employees`)
**Required Roles**: ADMIN, HR_OFFICER (some endpoints allow EMPLOYEE)

#### 9. **List All Employees**
```http
GET /api/employees
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- department: string (optional filter)
- search: string (optional - searches name, employeeId, designation)
- isActive: boolean (optional filter)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "OIADUS20200001",
      "firstName": "Admin",
      "lastName": "User",
      "dateOfBirth": "1985-01-15T...",
      "dateOfJoining": "2020-01-01T...",
      "joiningYear": 2020,
      "department": "Management",
      "designation": "System Administrator",
      "phoneNumber": "+1234567890",
      "user": {
        "id": "uuid",
        "email": "admin@workzen.com",
        "role": "ADMIN",
        "isActive": true,
        "loginId": "OIADUS20200001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 7,
    "totalPages": 1
  }
}

Errors:
- 401: Unauthorized
- 403: Insufficient permissions
```

#### 10. **Get Employee Details**
```http
GET /api/employees/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "OIADUS20200001",
    "firstName": "Admin",
    "lastName": "User",
    "dateOfBirth": "1985-01-15T...",
    "dateOfJoining": "2020-01-01T...",
    "joiningYear": 2020,
    "department": "Management",
    "designation": "System Administrator",
    "phoneNumber": "+1234567890",
    "address": "123 Admin Street, City",
    "emergencyContact": null,
    "bankAccountNo": "1234567890",
    "ifscCode": "BANK0001234",
    "panNumber": "ABCDE1234F",
    "aadharNumber": "123456789012",
    "user": {
      "id": "uuid",
      "email": "admin@workzen.com",
      "role": "ADMIN",
      "isActive": true,
      "loginId": "OIADUS20200001",
      "createdAt": "2025-11-08T...",
      "updatedAt": "2025-11-08T..."
    }
  }
}

Note: Employees can only view their own profile
Errors:
- 401: Unauthorized
- 403: Insufficient permissions / Not your profile
- 404: Employee not found
```

#### 11. **Get Full Employee Profile**
```http
GET /api/employees/:id/profile
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    // All employee fields...
    "salaryStructure": {
      // Salary details
    },
    "attendances": [
      // Last 10 attendance records
    ],
    "leaves": [
      // Last 10 leave records
    ],
    "payslips": [
      // Last 5 payslips
    ]
  }
}

Note: Employees can only view their own full profile
Errors:
- 401: Unauthorized
- 403: Insufficient permissions / Not your profile
- 404: Employee not found
```

#### 12. **Update Employee**
```http
PUT /api/employees/:id
Authorization: Bearer <token>
Content-Type: application/json

Body (all fields optional):
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "department": "IT",
  "designation": "Senior Developer",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City",
  "emergencyContact": "+9876543210",
  "bankAccountNo": "1234567890",
  "ifscCode": "BANK0001234",
  "panNumber": "ABCDE1234F",
  "aadharNumber": "123456789012"
}

Response (200):
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    // Updated employee object with user relation
  }
}

Errors:
- 400: Invalid data
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Employee not found
```

#### 13. **Delete Employee**
```http
DELETE /api/employees/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Employee deleted successfully"
}

Note: Only ADMIN can delete employees. This also deletes the associated user account.
Errors:
- 401: Unauthorized
- 403: Insufficient permissions (Admin only)
- 404: Employee not found
```

---

## 🚧 **PLANNED APIs** (To Be Implemented)

---

### 📅 Attendance Management (`/api/attendance`)
**Priority**: ⭐ HIGH  
**Status**: 🔴 Not Started  
**File Location**: `backend/src/routes/attendance.ts` (to be created)

```http
POST   /api/attendance/check-in              # Employee check-in
POST   /api/attendance/check-out             # Employee check-out
GET    /api/attendance                       # List attendance records
GET    /api/attendance/employee/:employeeId  # Get employee attendance
POST   /api/attendance/manual                # Manual entry (HR/Admin)
PUT    /api/attendance/:id                   # Update attendance
DELETE /api/attendance/:id                   # Delete attendance
GET    /api/attendance/report                # Attendance report
```

---

### 🌴 Leave Management (`/api/leaves`)
**Priority**: ⭐ HIGH  
**Status**: 🔴 Not Started  
**File Location**: `backend/src/routes/leaves.ts` (to be created)

```http
POST   /api/leaves                   # Apply for leave
GET    /api/leaves                   # List leaves (filtered by role)
GET    /api/leaves/:id               # Get leave details
GET    /api/leaves/employee/:empId   # Get employee leaves
PUT    /api/leaves/:id/approve       # Approve leave (HR/Admin)
PUT    /api/leaves/:id/reject        # Reject leave (HR/Admin)
DELETE /api/leaves/:id/cancel        # Cancel leave
GET    /api/leaves/pending           # Get pending leaves (HR/Admin)
```

---

### 💰 Salary Structure (`/api/salary`)
**Priority**: ⭐ MEDIUM  
**Status**: 🔴 Not Started  
**File Location**: `backend/src/routes/salary.ts` (to be created)

```http
POST   /api/salary                      # Create salary structure
GET    /api/salary/employee/:empId     # Get employee salary
PUT    /api/salary/:id                 # Update salary
DELETE /api/salary/:id                 # Remove salary structure
GET    /api/salary                     # List all salaries (Admin/HR)
```

---

### 💵 Payroll Management (`/api/payroll`)
**Priority**: ⭐ MEDIUM  
**Status**: 🔴 Not Started  
**File Location**: `backend/src/routes/payroll.ts` (to be created)

```http
POST   /api/payroll/payrun              # Create payrun
GET    /api/payroll/payruns             # List payruns
GET    /api/payroll/payrun/:id          # Get payrun details
POST   /api/payroll/payrun/:id/process  # Process payrun
POST   /api/payroll/payrun/:id/finalize # Finalize payrun
DELETE /api/payroll/payrun/:id          # Delete draft payrun
```

---

### 📄 Payslip Management (`/api/payslips`)
**Priority**: ⭐ MEDIUM  
**Status**: 🔴 Not Started  
**File Location**: `backend/src/routes/payslips.ts` (to be created)

```http
GET    /api/payslips                    # List payslips (role-based)
GET    /api/payslips/:id                # Get payslip details
GET    /api/payslips/employee/:empId    # Get employee payslips
GET    /api/payslips/:id/pdf            # Download payslip PDF
POST   /api/payslips/:id/email          # Email payslip
PUT    /api/payslips/:id                # Update payslip (before finalization)
```

---

### 📊 Dashboard/Analytics (`/api/dashboard`)
**Priority**: 🔵 LOW (After core features)  
**Status**: 🔴 Not Started  
**File Location**: `backend/src/routes/dashboard.ts` (to be created)

```http
GET    /api/dashboard/stats             # Dashboard statistics (role-based)
GET    /api/dashboard/attendance        # Attendance analytics
GET    /api/dashboard/leaves            # Leave analytics
GET    /api/dashboard/payroll           # Payroll summary
```

---

## 🔑 **Role-Based Access Control (RBAC)**

| Endpoint | ADMIN | HR_OFFICER | PAYROLL_OFFICER | EMPLOYEE |
|----------|:-----:|:----------:|:---------------:|:--------:|
| **Authentication** |
| Login | ✅ | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ | ✅ |
| Get Current User | ✅ | ✅ | ✅ | ✅ |
| **User Management** |
| Create User | ✅ | ✅ | ❌ | ❌ |
| View All Users | ✅ | ✅ | ❌ | ❌ |
| View User Details | ✅ | ✅ | ❌ | ❌ |
| **Attendance** |
| Check In/Out | ✅ | ✅ | ✅ | ✅ |
| View Own Attendance | ✅ | ✅ | ✅ | ✅ |
| View All Attendance | ✅ | ✅ | ❌ | ❌ |
| Manual Entry | ✅ | ✅ | ❌ | ❌ |
| **Leave Management** |
| Apply Leave | ✅ | ✅ | ✅ | ✅ |
| View Own Leaves | ✅ | ✅ | ✅ | ✅ |
| Approve/Reject Leaves | ✅ | ✅ | ❌ | ❌ |
| **Payroll** |
| Process Payroll | ✅ | ❌ | ✅ | ❌ |
| View All Payslips | ✅ | ✅ | ✅ | ❌ |
| View Own Payslip | ✅ | ✅ | ✅ | ✅ |

---

## 📝 **API Response Format**

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}
```

---

## ⚠️ **Error Codes**

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Missing fields, validation errors |
| 401 | Unauthorized | Invalid/expired token, wrong password |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side errors |

---

## 🧪 **Test Credentials** (from seed data)

| Role | Login ID | Email | Password |
|------|----------|-------|----------|
| Admin | OIADUS20200001 | admin@workzen.com | Password123! |
| HR Officer | OIHERO20200002 | hr@workzen.com | Password123! |
| Payroll Officer | OIPAJO20210001 | payroll@workzen.com | Password123! |
| Employee | OIALSM20210002 | alice@workzen.com | Password123! |
| Employee | OIBOWI20220001 | bob@workzen.com | Password123! |
| Employee | OICHBR20210003 | charlie@workzen.com | Password123! |

---

## 🔄 **Development Status**

- ✅ **8 APIs Complete** (15%)
- 🚧 **~47 APIs Planned** (85%)

**Next Priority**: Employee Management APIs

---

## 📞 **For Frontend Team**

### Important Notes:

1. **JWT Token Storage**: Store in localStorage or httpOnly cookie
2. **Token Expiry**: 7 days (configurable via JWT_EXPIRES_IN)
3. **Token Format**: Always send as `Authorization: Bearer <token>`
4. **Base URL**: Use environment variable for API base URL
5. **Error Handling**: Check `success` field in response

### Example API Call (React/Next.js):
```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    loginId: 'OIADUS20200001',
    password: 'Password123!'
  })
});

const data = await response.json();

if (data.success) {
  localStorage.setItem('token', data.token);
  // Redirect to dashboard
} else {
  // Show error message
  console.error(data.error);
}
```

---

### 📅 Attendance Routes (`/api/attendance`)

#### 1. **Check-In**
```http
POST /api/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Starting work for today"
}
```

**Response** (201):
```json
{
  "message": "Check-in successful",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "date": "2025-11-08",
    "checkIn": "2025-11-08T09:00:00.000Z",
    "checkOut": null,
    "status": "PRESENT",
    "workingHours": 0,
    "remarks": "Starting work for today",
    "employee": {
      "id": "uuid",
      "employeeId": "OIJODO20240001",
      "firstName": "John",
      "lastName": "Doe",
      "department": "IT"
    }
  }
}
```

#### 2. **Check-Out**
```http
POST /api/attendance/check-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "remarks": "Completed tasks for today"
}
```

**Response** (200):
```json
{
  "message": "Check-out successful",
  "data": {
    "id": "uuid",
    "checkIn": "2025-11-08T09:00:00.000Z",
    "checkOut": "2025-11-08T17:30:00.000Z",
    "workingHours": 8.5,
    "status": "PRESENT"
  }
}
```

#### 3. **List Attendance Records**
```http
GET /api/attendance?page=1&limit=10&department=IT&status=PRESENT&month=11&year=2025
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `department` (optional): Filter by department
- `status` (optional): PRESENT | ABSENT | HALF_DAY | LEAVE
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2025)

**Response** (200):
```json
{
  "message": "Attendance records retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "date": "2025-11-08",
      "checkIn": "2025-11-08T09:00:00.000Z",
      "checkOut": "2025-11-08T17:30:00.000Z",
      "workingHours": 8.5,
      "status": "PRESENT",
      "employee": {
        "employeeId": "OIJODO20240001",
        "firstName": "John",
        "lastName": "Doe",
        "department": "IT"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### 4. **Get Employee Attendance**
```http
GET /api/attendance/employee/:employeeId?month=11&year=2025
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Employee attendance retrieved successfully",
  "employee": {
    "id": "uuid",
    "employeeId": "OIJODO20240001",
    "name": "John Doe",
    "department": "IT"
  },
  "statistics": {
    "total": 22,
    "present": 20,
    "absent": 0,
    "halfDay": 2,
    "leave": 0,
    "totalHours": 176,
    "avgHours": 8
  },
  "data": [/* attendance records */]
}
```

#### 5. **Manual Attendance Entry** (HR/Admin Only)
```http
POST /api/attendance/manual
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid",
  "date": "2025-11-08",
  "status": "PRESENT",
  "checkIn": "2025-11-08T09:00:00.000Z",
  "checkOut": "2025-11-08T17:00:00.000Z",
  "workingHours": 8,
  "remarks": "Manually marked by HR"
}
```

**Response** (201):
```json
{
  "message": "Attendance record created successfully",
  "data": {/* attendance record */}
}
```

#### 6. **Update Attendance** (HR/Admin Only)
```http
PUT /api/attendance/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "HALF_DAY",
  "workingHours": 4,
  "remarks": "Left early due to personal reason"
}
```

**Response** (200):
```json
{
  "message": "Attendance record updated successfully",
  "data": {/* updated attendance record */}
}
```

#### 7. **Delete Attendance** (Admin Only)
```http
DELETE /api/attendance/:id
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Attendance record deleted successfully"
}
```

#### 8. **Attendance Report** (HR/Admin Only)
```http
GET /api/attendance/report?department=IT&month=11&year=2025
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Attendance report generated successfully",
  "data": {
    "summary": {
      "totalRecords": 150,
      "totalHours": 1200,
      "avgHours": 8
    },
    "statusBreakdown": [
      {
        "status": "PRESENT",
        "count": 140,
        "percentage": 93.33
      },
      {
        "status": "ABSENT",
        "count": 5,
        "percentage": 3.33
      },
      {
        "status": "HALF_DAY",
        "count": 3,
        "percentage": 2
      },
      {
        "status": "LEAVE",
        "count": 2,
        "percentage": 1.33
      }
    ]
  }
}
```

---

**Last Updated**: November 8, 2025  
**Backend Status**: Development Phase  
**Server**: Running at `http://localhost:5000`
