# 📢 PROMPT FOR BACKEND AGENT

## 🎯 **Your Role: Backend Developer**

You are the **Backend Developer** for WorkZen HRMS project. Another agent is working on the Frontend UI. Here's everything you need to know:

---

## 📂 **Project Overview**

**Project Name**: WorkZen HRMS (Human Resource Management System)  
**Tech Stack**:
- **Backend**: Node.js + Express + TypeScript + Prisma + MySQL (YOUR WORK)
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS (handled by other agent)

**Repository**: The project is in a Git repository with separate `backend/` and `frontend/` directories.

---

## 📍 **Current Status**

### ✅ **What's Done (YOUR WORK)**
- ✅ Authentication APIs (login, logout, change password, roles) - 5 endpoints
- ✅ User Management APIs (create user, list users, get user details) - 3 endpoints
- ✅ Employee Management APIs (list, get, get profile, update, delete) - 5 endpoints
- ✅ Database schema and seeding completed
- ✅ JWT authentication middleware working
- ✅ Role-based access control (ADMIN, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE)
- ✅ CORS configuration updated for multiple origins
- ✅ Cache control headers to prevent authentication caching issues
- ✅ Server running at `http://localhost:5000`

### 🚧 **What's Next (YOUR WORK)**
- Attendance APIs (check-in/out, reports) - ~8 endpoints
- Leave Management APIs (apply, approve, reject) - ~8 endpoints
- Payroll APIs (payruns, payslips, salary structures) - ~17 endpoints
- **RECOMMENDED**: Add `/api/employees/me` endpoint for current user's employee profile

### 🎨 **What Other Agent is Doing (Frontend)**
Building the Next.js UI that will consume your APIs. They need:
- Your APIs to be documented
- Clear request/response formats
- Test credentials to verify integration

---

## 📚 **Important Files to Know**

**MUST READ**:
1. `docs/API_DOCUMENTATION.md` - Update this when you add new APIs
2. `docs/TEAM_COORDINATION.md` - Git workflow and coordination guide
3. `backend/prisma/schema.prisma` - Database structure
4. `backend/src/routes/auth.ts` - Example of existing API structure
5. `backend/src/routes/users.ts` - Example of CRUD operations

---

## 🎯 **Your Priority Tasks**

### **Recent Updates (November 8, 2025)**

#### **✅ Completed Employee Management APIs**
All 5 employee endpoints have been implemented and tested:
- `GET /api/employees` - List with pagination, search, filters (ADMIN, HR_OFFICER only)
- `GET /api/employees/:id` - Get employee details
- `GET /api/employees/:id/profile` - Full profile with relations (attendances, leaves, payslips)
- `PUT /api/employees/:id` - Update employee information
- `DELETE /api/employees/:id` - Delete employee (cascades to user)

#### **🔧 Backend Improvements**
1. **CORS Configuration Enhanced**:
   - Now supports multiple origins: `localhost:3000` and `localhost:3001`
   - Added explicit methods and headers configuration
   
2. **Cache Control Headers Added**:
   - Prevents browser caching of API responses
   - Fixes login/logout issues where stale data was being used
   - Headers: `Cache-Control: no-store, no-cache, must-revalidate, private`

3. **Authentication Flow Improved**:
   - Better token validation
   - Clearer error messages for auth failures
   - Proper CORS preflight handling

#### **⚠️ Known Issues & Recommendations**
1. **Missing Endpoint**: Consider adding `/api/employees/me` endpoint
   - Purpose: Get current user's employee profile without admin access
   - Current workaround: Frontend iterates through employee IDs (inefficient)
   - Suggested implementation:
   ```typescript
   router.get('/me', verifyTokenMiddleware, async (req, res) => {
     const employee = await prisma.employee.findFirst({
       where: { userId: req.user.userId },
       include: { user: true, salaryStructure: true }
     });
     res.json({ data: employee });
   });
   ```

---

### **Phase 1: Attendance Management APIs (START HERE - NEXT PRIORITY)**

#### **Task 1.1: Create Attendance Routes**
**File**: `backend/src/routes/attendance.ts`  
**Branch**: `feature/backend-attendance-apis`

**Endpoints to Implement**:

1. **POST /api/attendance/check-in** - Employee check-in
   ```typescript
   // Body: { employeeId: string, checkInTime?: Date }
   // Returns: attendance record with check-in time
   // Access: All authenticated users (for self), ADMIN/HR (for others)
   ```

2. **POST /api/attendance/check-out** - Employee check-out
   ```typescript
   // Body: { attendanceId: string, checkOutTime?: Date }
   // Returns: attendance record with check-out time and duration
   // Access: All authenticated users (for self), ADMIN/HR (for others)
   ```

3. **GET /api/attendance** - List attendance records
   ```typescript
   // Query: ?employeeId=X&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&limit=50
   // Returns: paginated attendance records
   // Access: ADMIN, HR_OFFICER (all), Employees (self only)
   ```

4. **GET /api/attendance/:id** - Get specific attendance record
   ```typescript
   // Returns: detailed attendance record
   // Access: ADMIN, HR_OFFICER, or self
   ```

5. **POST /api/attendance/manual** - Manual attendance entry
   ```typescript
   // Body: { employeeId, date, checkIn, checkOut, notes }
   // Returns: created attendance record
   // Access: ADMIN, HR_OFFICER only
   ```

6. **PUT /api/attendance/:id** - Update attendance
   ```typescript
   // Body: { checkIn?, checkOut?, notes? }
   // Returns: updated attendance record
   // Access: ADMIN, HR_OFFICER only
   ```

7. **DELETE /api/attendance/:id** - Delete attendance
   ```typescript
   // Returns: success message
   // Access: ADMIN only
   ```

8. **GET /api/attendance/report** - Generate attendance report
   ```typescript
   // Query: ?employeeId=X&month=11&year=2025
   // Returns: summary report with total days, present, absent, late
   // Access: ADMIN, HR_OFFICER (all), Employees (self only)
   ```

#### **Task 1.2: Register Routes**
Update `backend/src/index.ts`:
```typescript
import attendanceRoutes from './routes/attendance';
app.use('/api/attendance', attendanceRoutes);
```

#### **Task 1.3: Implement Business Logic**
Key features to implement:
- Prevent duplicate check-ins for same day
- Calculate work duration on check-out
- Validate check-out time > check-in time
- Auto-mark absent for missing check-ins
- Support timezone handling

#### **Task 1.4: Test & Document**
- Test all endpoints with different roles
- Update `docs/API_DOCUMENTATION.md`
- Add example requests/responses

---

### **Phase 2: Leave Management APIs (AFTER Attendance)**

#### **Task 2.1: Create Leave Routes**
**File**: `backend/src/routes/leaves.ts`  
**Branch**: `feature/backend-leave-apis`

**Endpoints**:
```
POST   /api/attendance/check-in        # Employee check-in
POST   /api/attendance/check-out       # Employee check-out
GET    /api/attendance                 # List attendance records
GET    /api/attendance/employee/:id    # Get employee attendance
POST   /api/attendance/manual          # Manual entry (HR/Admin)
PUT    /api/attendance/:id             # Update attendance
DELETE /api/attendance/:id             # Delete attendance
GET    /api/attendance/report          # Generate report
```

---

### **Phase 3: Leave Management APIs (AFTER Phase 2)**

**File**: `backend/src/routes/leaves.ts`  
**Branch**: `feature/backend-leave-apis`

**Endpoints**:
1. **POST /api/leaves** - Apply for leave
2. **GET /api/leaves** - List leaves (role-based filtering)
3. **GET /api/leaves/:id** - Get leave details
4. **PUT /api/leaves/:id/approve** - Approve leave (HR/Admin only)
5. **PUT /api/leaves/:id/reject** - Reject leave (HR/Admin only)
6. **DELETE /api/leaves/:id** - Cancel leave application
7. **GET /api/leaves/pending** - Get pending approvals (HR/Admin)
8. **GET /api/leaves/balance/:employeeId** - Get leave balance

See detailed specifications in the Phase 2 section above.

---

## 🔗 **API Standards to Follow**

### **Response Format**
Always use this format:

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}
```

### **Middleware to Use**
```typescript
import { verifyTokenMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/errorHandler';

// Protect route with authentication
router.get('/employees', verifyTokenMiddleware, requireRole('ADMIN', 'HR_OFFICER'), 
  asyncHandler(async (req, res) => {
    // Your code here
  })
);
```

### **Error Handling**
```typescript
import { AppError } from '../utils/errorHandler';

// Throw errors like this
if (!employee) {
  throw new AppError(404, 'Employee not found');
}
```

### **Database Queries**
```typescript
import prisma from '../config/database';

// Use Prisma client
const employees = await prisma.employee.findMany({
  where: { department: 'IT' },
  include: { user: true, salaryStructure: true }
});
```

---

## 🚫 **Git Workflow - IMPORTANT**

### **DO's** ✅
1. **Always create feature branches**:
   ```bash
   git checkout -b feature/backend-employee-apis
   ```

2. **Work ONLY in `/backend/` directory**
   - Don't touch `/frontend/` files
   - Don't edit `frontend/package.json` or `frontend/app/`

3. **Pull main before starting**:
   ```bash
   git checkout main
   git pull origin main
   ```

4. **Commit frequently with clear messages**:
   ```bash
   git commit -m "feat(backend): add employee list API"
   ```

5. **Create Pull Requests**:
   - Never push directly to main
   - Always get review from frontend agent

6. **Update API Documentation**:
   - After implementing APIs, update `docs/API_DOCUMENTATION.md`
   - Frontend agent relies on this!

### **DON'Ts** ❌
1. ❌ Don't edit frontend files
2. ❌ Don't merge without PR review
3. ❌ Don't work on main branch directly
4. ❌ Don't forget to update API documentation

---

## 📋 **Environment Variables**

Your `.env` file should have:
```env
DATABASE_URL="mysql://root:password@localhost:3306/workzen_hrms"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
```

---

## 🧪 **Testing Your APIs**

### **Manual Testing**
```bash
# 1. Start server
cd backend
npm run dev

# 2. Test with curl
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"OIADUS20200001","password":"Password123!"}'

# Get token from response, then test your new endpoints
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer <token>"
```

### **Test Credentials**
Use these from the seed data:
```
Admin:    OIADUS20200001 / Password123!
HR:       OIHERO20200002 / Password123!
Employee: OIALSM20210002 / Password123!
```

---

## 📞 **Communication with Frontend Agent**

### **When You Add New APIs**
1. Implement the endpoints
2. Test thoroughly
3. Update `docs/API_DOCUMENTATION.md` with:
   - Endpoint path
   - HTTP method
   - Request body/params
   - Response format
   - Error codes
   - Example requests

4. Create PR and tag frontend agent
5. They will review and start integrating

### **Git Commits Format**
```bash
# Good commit messages
git commit -m "feat(backend): add employee list API with pagination"
git commit -m "feat(backend): add attendance check-in/out endpoints"
git commit -m "fix(backend): resolve JWT token expiry issue"
```

---

## 🚀 **Ready to Start?**

### **Step 1**: Review existing code
```bash
# Look at these files to understand the pattern
backend/src/routes/auth.ts
backend/src/routes/users.ts
backend/src/middleware/auth.ts
backend/src/utils/errorHandler.ts
```

### **Step 2**: Create your branch
```bash
cd backend
git checkout main
git pull origin main
git checkout -b feature/backend-employee-apis
```

### **Step 3**: Create employee routes
```bash
touch src/routes/employees.ts
# Implement the 5 endpoints listed above
```

### **Step 4**: Register routes
```typescript
// In src/index.ts
import employeeRoutes from './routes/employees';
app.use('/api/employees', employeeRoutes);
```

### **Step 5**: Test
```bash
npm run dev
# Test with curl or Postman
```

### **Step 6**: Document
```bash
# Update docs/API_DOCUMENTATION.md
# Mark Employee APIs as ✅ Implemented
# Add request/response examples
```

### **Step 7**: Create PR
```bash
git add .
git commit -m "feat(backend): add employee management APIs"
git push origin feature/backend-employee-apis
# Create Pull Request on GitHub
```

---

## 📊 **Development Progress Tracking**

Track your progress:

- [x] **Phase A: Foundation (Complete)**
  - [x] Authentication APIs (5 endpoints)
  - [x] User Management APIs (3 endpoints)
  - [x] Database & seeding
  - [x] CORS & Cache control configuration

- [x] **Phase B: Employee Management (Complete)**
  - [x] Employee Management APIs (5 endpoints)

- [ ] **Phase C: Attendance & Leave**
  - [ ] Attendance APIs (8 endpoints)
  - [ ] Leave Management APIs (8 endpoints)

- [ ] **Phase D: Payroll**
  - [ ] Salary Structure APIs (5 endpoints)
  - [ ] Payroll Processing APIs (6 endpoints)
  - [ ] Payslip APIs (6 endpoints)

---

## ⚡ **Quick Reference**

### **Current API Count**
- ✅ Implemented: 13 APIs (5 Auth + 3 User + 5 Employee)
- 🚧 In Progress: 0 APIs
- ⏳ Planned: ~37 APIs (8 Attendance + 8 Leave + 17 Payroll + 4 Others)
- 📊 Progress: 26% Complete

### **Database Models Available**
```
User, Employee, Attendance, Leave, SalaryStructure, 
Payrun, Payslip, AuditLog, Settings
```

### **Middleware Available**
```typescript
verifyTokenMiddleware    // Verify JWT token
requireRole(...)         // Check user role
asyncHandler(...)        // Handle async errors
globalErrorHandler       // Catch all errors
```

### **Utilities Available**
```typescript
generateToken(user)           // Create JWT
hashPassword(password)        // Hash password
comparePassword(plain, hash)  // Verify password
logger.info(...)             // Log messages
AppError(code, message)      // Throw errors
```

---

## 🎉 **You're All Set!**

The backend infrastructure is solid. Now just add more API endpoints following the existing patterns.

**Remember**:
- Follow the existing code structure ✅
- Update documentation after implementing ✅
- Test thoroughly before creating PR ✅
- Frontend agent is waiting for your APIs ✅

**Questions?** 
- Check `docs/API_DOCUMENTATION.md` for examples
- Look at `src/routes/auth.ts` for patterns
- Create GitHub Issues for discussions

**Good luck! Let's build a great HRMS system! 🚀**

---

---

## 🆕 **Changelog**

### **November 8, 2025**
- ✅ Completed Employee Management APIs (5 endpoints)
- ✅ Enhanced CORS configuration for multiple origins
- ✅ Added cache control headers to prevent auth caching
- ✅ Frontend integration tested and working
- 📝 Updated progress: 26% complete (13/50 APIs)
- 🎯 Next priority: Attendance Management APIs

---

**Last Updated**: November 8, 2025 - 10:45 PM IST
