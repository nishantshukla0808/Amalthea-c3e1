# Leave-Based Attendance Restrictions

## Overview
This implementation prevents employees from checking in/out when they have approved full-day leaves, while allowing check-in for half-day leaves.

## Features Implemented

### 1. Backend Validation (backend/src/routes/attendance.ts)

#### Check-In Route Protection
- Added leave validation before allowing check-in
- Queries for approved leaves that overlap with today
- Blocks check-in for full-day leaves (totalDays >= 1)
- Allows check-in for half-day leaves (totalDays = 0.5)
- Returns error message: "You have an approved full-day leave for today. Check-in is not allowed."

#### New API Endpoint: GET /api/attendance/check-leave-status
Returns leave status for the current user for today:
```json
{
  "hasLeave": true,
  "hasFullDayLeave": true,
  "hasHalfDayLeave": false,
  "leaveDetails": {
    "id": "...",
    "leaveType": "SICK_LEAVE",
    "startDate": "2024-01-15",
    "endDate": "2024-01-15",
    "totalDays": 1,
    "status": "APPROVED"
  }
}
```

### 2. Frontend Integration (frontend/app/dashboard/attendance/page.tsx)

#### State Management
Added three new state variables:
- `hasFullDayLeave`: Boolean indicating full-day approved leave
- `hasHalfDayLeave`: Boolean indicating half-day approved leave
- `leaveDetails`: Object containing full leave information

#### Leave Status Checking
- Automatically checks leave status when fetching attendance data
- Calls the new `/api/attendance/check-leave-status` endpoint
- Updates state to reflect current leave status

#### UI Enhancements

**Info Banners:**
- **Full-Day Leave**: Shows amber warning banner with leave details
- **Half-Day Leave**: Shows blue info banner explaining partial work is allowed

**Button Behavior:**
- Check-in button disabled when `hasFullDayLeave` is true
- Check-out button disabled when `hasFullDayLeave` is true
- Button text changes to "🚫 Leave Today" when disabled due to leave
- Half-day leaves do NOT disable buttons

### 3. API Client Update (frontend/lib/api.ts)

Added new method to attendanceAPI:
```typescript
checkLeaveStatus: () => apiRequest('/attendance/check-leave-status')
```

## How It Works

### Full-Day Leave Scenario
1. Employee has approved leave with `totalDays = 1`
2. Backend blocks check-in API call with error
3. Frontend shows amber warning banner
4. Check-in and check-out buttons are disabled
5. Button text shows "🚫 Leave Today"

### Half-Day Leave Scenario
1. Employee has approved leave with `totalDays = 0.5`
2. Backend allows check-in API call
3. Frontend shows blue info banner
4. Check-in and check-out buttons remain enabled
5. Employee can mark partial attendance

### No Leave Scenario
1. No approved leave for today
2. Normal check-in/check-out flow
3. No special banners shown

## Testing Checklist

### Backend Testing
- [ ] Check-in with full-day leave returns 400 error
- [ ] Check-in with half-day leave succeeds
- [ ] Check-in with no leave succeeds
- [ ] `/check-leave-status` endpoint returns correct data
- [ ] Endpoint handles pending/rejected leaves correctly (allows check-in)

### Frontend Testing
- [ ] Full-day leave shows amber warning banner
- [ ] Full-day leave disables both buttons
- [ ] Half-day leave shows blue info banner
- [ ] Half-day leave keeps buttons enabled
- [ ] No leave shows normal UI
- [ ] Leave status updates when date changes
- [ ] Error handling works if leave check fails

## Database Schema Reference

### Leave Model
```prisma
model Leave {
  totalDays   Float       // 0.5 for half-day, 1.0 for full-day, >1 for multiple days
  status      LeaveStatus // PENDING, APPROVED, REJECTED
  startDate   DateTime
  endDate     DateTime
  // ... other fields
}
```

## Technical Decisions

### Why Check totalDays >= 1?
- Supports multi-day leaves (totalDays > 1)
- Clear distinction: `0.5 = half-day`, `>= 1 = full-day`
- Flexible for future leave types

### Why Two-Tier Validation?
- **Backend**: Security - prevents API abuse
- **Frontend**: UX - immediate feedback without API call attempt

### Why Separate Endpoint?
- Reusable across different components
- Lightweight check without fetching full attendance data
- Can be called independently for proactive validation

## Future Enhancements

### Potential Improvements
1. **Leave Calendar Integration**: Show leaves on attendance calendar
2. **Partial Day Tracking**: Track which half (AM/PM) for half-day leaves
3. **Leave Balance Display**: Show remaining leave balance on attendance page
4. **Automated Leave Status**: Automatically mark attendance as "LEAVE" for approved leaves
5. **Notification**: Alert users when trying to mark attendance on leave days
6. **Admin Override**: Allow HR to force check-in for special cases

### Edge Cases to Handle
1. **Overlapping Leaves**: Multiple approved leaves for same date
2. **Late Leave Approval**: Leave approved after check-in
3. **Leave Cancellation**: Leave cancelled after being counted
4. **Timezone Issues**: Ensure date comparison handles timezones correctly

## Files Modified

### Backend
- `backend/src/routes/attendance.ts`
  - Added leave validation in check-in route (lines ~48-64)
  - Added `/check-leave-status` endpoint (lines ~645-677)

### Frontend
- `frontend/lib/api.ts`
  - Added `checkLeaveStatus()` method to attendanceAPI (line ~199)

- `frontend/app/dashboard/attendance/page.tsx`
  - Added leave state variables (lines ~38-40)
  - Added leave status checking in `fetchAttendance()` (lines ~88-96)
  - Added leave info banners (lines ~285-308)
  - Updated button disabled logic (lines ~310-320)

## API Documentation

### GET /api/attendance/check-leave-status
**Description**: Check if the current user has an approved leave for today

**Authentication**: Required (Bearer token)

**Response**: 
```json
{
  "hasLeave": boolean,
  "hasFullDayLeave": boolean,
  "hasHalfDayLeave": boolean,
  "leaveDetails": {
    "id": string,
    "employeeId": string,
    "leaveType": string,
    "startDate": string,
    "endDate": string,
    "totalDays": number,
    "reason": string,
    "status": string
  } | null
}
```

**Errors**:
- 401: Unauthorized (no/invalid token)
- 404: Employee record not found

## Conclusion

This implementation provides a robust system for preventing attendance conflicts with approved leaves while maintaining flexibility for half-day leaves. The two-tier validation (backend + frontend) ensures both security and good user experience.
