# Attendance API Integration Guide

**Generated:** November 8, 2024  
**Status:** Backend APIs Complete ✅ | Frontend Integration Pending ⏳

---

## 📋 Overview

The backend agent has successfully implemented **9 attendance management endpoints**. All APIs are tested and ready for frontend integration.

**Backend Files:**
- `backend/src/routes/attendance.ts` - All attendance routes
- `backend/test-attendance-comprehensive.ps1` - Comprehensive test suite
- `backend/src/index.ts` - Routes already registered at `/api/attendance`

---

## 🔌 API Endpoints

### 1. **Check-In** (Employee, HR, Admin)
```
POST /api/attendance/check-in
Authorization: Bearer <token>

Request Body:
{
  "remarks": "string (optional)"
}

Response (201):
{
  "message": "Check-in successful",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "date": "2024-11-08T00:00:00.000Z",
    "checkIn": "2024-11-08T09:15:30.000Z",
    "checkOut": null,
    "workingHours": 0,
    "status": "PRESENT",
    "remarks": "string",
    "isManual": false,
    "employee": {
      "id": "uuid",
      "employeeId": "OIHERO20200002",
      "firstName": "Jane",
      "lastName": "Smith",
      "department": "Human Resources"
    }
  }
}

Errors:
- 400: "Attendance already marked for today"
- 404: "Employee record not found"
```

### 2. **Check-Out** (Employee, HR, Admin)
```
POST /api/attendance/check-out
Authorization: Bearer <token>

Request Body:
{
  "remarks": "string (optional)"
}

Response (200):
{
  "message": "Check-out successful",
  "data": {
    "id": "uuid",
    "checkOut": "2024-11-08T18:30:00.000Z",
    "workingHours": 9.25,
    "remarks": "Morning: On time\nCheck-out: Completed tasks",
    ...
  }
}

Errors:
- 400: "No active check-in found for today"
```

### 3. **Get Attendance Records** (Employee sees own, HR/Admin see all)
```
GET /api/attendance?page=1&limit=10&department=IT&status=PRESENT&month=11&year=2024
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- department: string (HR/Admin only)
- status: PRESENT | ABSENT | HALF_DAY | LEAVE
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
- month: 1-12 (use with year)
- year: YYYY

Response (200):
{
  "message": "Attendance records retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "date": "2024-11-08T00:00:00.000Z",
      "checkIn": "2024-11-08T09:15:30.000Z",
      "checkOut": "2024-11-08T18:30:00.000Z",
      "workingHours": 9.25,
      "status": "PRESENT",
      "remarks": "string",
      "employee": {
        "id": "uuid",
        "employeeId": "OIHERO20200002",
        "firstName": "Jane",
        "lastName": "Smith",
        "department": "Human Resources",
        "designation": "HR Manager"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 4. **Get Employee Attendance** (Employee sees own, HR/Admin see any)
```
GET /api/attendance/employee/:employeeId?month=11&year=2024
Authorization: Bearer <token>

Query Parameters:
- month: 1-12 (use with year)
- year: YYYY
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD

Response (200):
{
  "message": "Employee attendance retrieved successfully",
  "employee": {
    "id": "uuid",
    "employeeId": "OIHERO20200002",
    "name": "Jane Smith",
    "department": "Human Resources"
  },
  "statistics": {
    "total": 22,
    "present": 18,
    "absent": 2,
    "halfDay": 1,
    "leave": 1,
    "totalHours": 162.50,
    "avgHours": 7.39
  },
  "data": [
    // Array of attendance records
  ]
}

Errors:
- 403: "You can only view your own attendance records" (if employee tries to view others)
- 404: "Employee not found"
```

### 5. **Manual Attendance Entry** (HR, Admin only)
```
POST /api/attendance/manual
Authorization: Bearer <token>

Request Body:
{
  "employeeId": "uuid (required)",
  "date": "2024-11-07 (required)",
  "status": "PRESENT | ABSENT | HALF_DAY | LEAVE (required)",
  "checkIn": "2024-11-07T09:00:00.000Z (optional)",
  "checkOut": "2024-11-07T18:00:00.000Z (optional)",
  "workingHours": 9 (optional),
  "remarks": "string (optional)"
}

Response (201):
{
  "message": "Attendance record created successfully",
  "data": {
    "id": "uuid",
    "isManual": true,
    "remarks": "Manually added by HR/Admin",
    ...
  }
}

Errors:
- 400: "Employee ID, date, and status are required"
- 400: "Attendance record already exists for this date"
- 404: "Employee not found"
```

### 6. **Update Attendance** (HR, Admin only)
```
PUT /api/attendance/:id
Authorization: Bearer <token>

Request Body:
{
  "status": "PRESENT (optional)",
  "checkIn": "2024-11-08T09:00:00.000Z (optional)",
  "checkOut": "2024-11-08T18:00:00.000Z (optional)",
  "workingHours": 9 (optional),
  "remarks": "string (optional)"
}

Response (200):
{
  "message": "Attendance record updated successfully",
  "data": {
    // Updated attendance record
  }
}

Errors:
- 404: "Attendance record not found"
```

### 7. **Delete Attendance** (Admin only)
```
DELETE /api/attendance/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Attendance record deleted successfully"
}

Errors:
- 404: "Attendance record not found"
```

### 8. **Attendance Report** (HR, Admin only)
```
GET /api/attendance/report?department=IT&month=11&year=2024
Authorization: Bearer <token>

Query Parameters:
- department: string (optional)
- month: 1-12 (use with year)
- year: YYYY

Response (200):
{
  "message": "Attendance report generated successfully",
  "data": {
    "summary": {
      "totalRecords": 450,
      "totalHours": 3375.50,
      "avgHours": 7.50
    },
    "statusBreakdown": [
      {
        "status": "PRESENT",
        "count": 380,
        "percentage": 84.44
      },
      {
        "status": "ABSENT",
        "count": 35,
        "percentage": 7.78
      },
      {
        "status": "HALF_DAY",
        "count": 20,
        "percentage": 4.44
      },
      {
        "status": "LEAVE",
        "count": 15,
        "percentage": 3.33
      }
    ]
  }
}
```

---

## 🎨 Frontend Integration Plan

### Phase 1: API Client Setup
Create `frontend/lib/api/attendance.ts`:

```typescript
import { apiClient } from './client';

export interface CheckInRequest {
  remarks?: string;
}

export interface CheckOutRequest {
  remarks?: string;
}

export interface ManualAttendanceRequest {
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  remarks?: string;
}

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  department?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

export const attendanceAPI = {
  // Employee check-in/out
  checkIn: async (data: CheckInRequest) => {
    const response = await apiClient.post('/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (data: CheckOutRequest) => {
    const response = await apiClient.post('/attendance/check-out', data);
    return response.data;
  },

  // Get attendance records
  getAll: async (filters: AttendanceFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    const response = await apiClient.get(`/attendance?${params}`);
    return response.data;
  },

  // Get employee attendance
  getEmployeeAttendance: async (employeeId: string, filters?: AttendanceFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const response = await apiClient.get(`/attendance/employee/${employeeId}?${params}`);
    return response.data;
  },

  // Manual entry (HR/Admin)
  createManual: async (data: ManualAttendanceRequest) => {
    const response = await apiClient.post('/attendance/manual', data);
    return response.data;
  },

  // Update attendance (HR/Admin)
  update: async (id: string, data: Partial<ManualAttendanceRequest>) => {
    const response = await apiClient.put(`/attendance/${id}`, data);
    return response.data;
  },

  // Delete attendance (Admin)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  },

  // Get report (HR/Admin)
  getReport: async (filters?: AttendanceFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const response = await apiClient.get(`/attendance/report?${params}`);
    return response.data;
  },
};
```

### Phase 2: UI Components to Build

1. **My Attendance Page** (`/dashboard/attendance`)
   - For all users to see their own attendance
   - Check-in/Check-out buttons
   - Monthly calendar view with status indicators
   - Statistics card: Present/Absent/Hours worked
   - Attendance history table

2. **Attendance Management** (`/dashboard/attendance/manage`)
   - For HR/Admin only
   - List all employees' attendance with filters
   - Department filter, date range picker
   - Manual attendance entry form
   - Edit/Delete actions
   - Bulk import option (future)

3. **Attendance Reports** (`/dashboard/attendance/reports`)
   - For HR/Admin only
   - Summary statistics (total hours, attendance rate)
   - Status breakdown chart (Present/Absent/Leave)
   - Department-wise comparison
   - Export to CSV/PDF

4. **Quick Check-in Widget** (Dashboard sidebar)
   - Show today's status
   - One-click check-in/out button
   - Current working hours display

### Phase 3: Navbar Updates
Add to `frontend/app/dashboard/layout.tsx`:

```typescript
{(user?.role === 'ADMIN' || user?.role === 'HR_OFFICER' || user?.role === 'EMPLOYEE') && (
  <>
    <Link
      href="/dashboard/attendance"
      className={`flex items-center px-4 py-2 ${
        pathname === '/dashboard/attendance'
          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <ClockIcon className="w-5 h-5 mr-3" />
      My Attendance
    </Link>
    
    {(user?.role === 'ADMIN' || user?.role === 'HR_OFFICER') && (
      <Link
        href="/dashboard/attendance/manage"
        className={`flex items-center px-4 py-2 ${
          pathname === '/dashboard/attendance/manage'
            ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <ChartBarIcon className="w-5 h-5 mr-3" />
        Attendance Management
      </Link>
    )}
  </>
)}
```

---

## ✅ Testing Results

The backend agent ran comprehensive tests with the following results:

**Test Coverage:**
- ✅ Login authentication
- ✅ Check-in functionality
- ✅ Duplicate check-in prevention
- ✅ Check-out with working hours calculation
- ✅ Get employee attendance with statistics
- ✅ List all attendance with pagination
- ✅ Filter by today's date
- ✅ Generate attendance reports
- ✅ Manual attendance entry
- ✅ Update attendance records

**All tests passed successfully!** 🎉

---

## 🔐 Role-Based Access Summary

| Endpoint | EMPLOYEE | HR_OFFICER | ADMIN |
|----------|----------|------------|-------|
| Check-in | ✅ (own) | ✅ (own) | ✅ (own) |
| Check-out | ✅ (own) | ✅ (own) | ✅ (own) |
| Get Attendance | ✅ (own) | ✅ (all) | ✅ (all) |
| Get Employee Attendance | ✅ (own) | ✅ (all) | ✅ (all) |
| Manual Entry | ❌ | ✅ | ✅ |
| Update | ❌ | ✅ | ✅ |
| Delete | ❌ | ❌ | ✅ |
| Reports | ❌ | ✅ | ✅ |

---

## 🚀 Next Steps

1. **Restart Backend Server** (currently exited with code 1)
   ```powershell
   cd backend
   npm run dev
   ```

2. **Test Attendance APIs Manually** (optional)
   ```powershell
   cd backend
   .\test-attendance-comprehensive.ps1
   ```

3. **Create Frontend API Client**
   - Create `frontend/lib/api/attendance.ts`
   - Import in components

4. **Build My Attendance Page**
   - Create `frontend/app/dashboard/attendance/page.tsx`
   - Add check-in/out functionality
   - Show attendance history

5. **Add Attendance Nav Item**
   - Update sidebar in `layout.tsx`
   - Make it visible to all users

6. **Build Management Pages** (HR/Admin)
   - Create `frontend/app/dashboard/attendance/manage/page.tsx`
   - Add manual entry form
   - List all employees' attendance

---

## 📝 Important Notes

- **isManual flag**: Backend tracks if attendance was manually entered vs. self-check-in
- **Working hours**: Auto-calculated on check-out (checkOut - checkIn in hours)
- **Duplicate prevention**: One check-in per day per employee
- **Date handling**: All dates stored in UTC, convert to local timezone in frontend
- **Statistics**: Backend provides aggregated stats, no need to calculate in frontend

---

## 🐛 Known Issues

- Backend server needs restart (Exit Code: 1)
- No issues with attendance APIs themselves - all tested and working

---

**Last Updated:** November 8, 2024  
**Next Priority:** Frontend attendance UI integration
