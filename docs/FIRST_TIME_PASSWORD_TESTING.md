# First-Time Password Change Feature - Testing Guide

## Overview
This document provides comprehensive testing instructions for the first-time password change feature and role-based employee creation.

## Features Implemented

### 1. First-Time Password Change
- New users are created with `mustChangePassword=true`
- Users are forced to change password on first login
- After password change, flag is set to `false`
- Users cannot access dashboard until password is changed

### 2. Role-Based Add Employee
- **Admin users** can create: Employee, HR Officer, Payroll Officer, Admin
- **HR users** can create: Employee, HR Officer, Payroll Officer (no Admin)

---

## Prerequisites

### Backend Setup
1. Ensure MySQL database is running
2. Navigate to backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database:
   ```bash
   npm run seed
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```
7. Backend should be running on: `http://localhost:5000`

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```
4. Frontend should be running on: `http://localhost:3000`

---

## Test Credentials

### Pre-seeded Users
```
Admin:
  Login ID: OIADUS20200001
  Password: Password123!
  Note: mustChangePassword should be false (already changed)

HR Officer:
  Login ID: OIHERO20200002
  Password: Password123!
  Note: mustChangePassword should be false (already changed)

Employee:
  Login ID: OIALSM20210002
  Password: Password123!
  Note: mustChangePassword should be false (already changed)
```

---

## Part 1: Backend API Testing

### Run Automated Test Script

1. Open PowerShell in the backend directory
2. Run the test script:
   ```powershell
   .\test-first-time-password.ps1
   ```

### Expected Results
The script will test:
- ✅ Creating a new user with `mustChangePassword=true`
- ✅ Login returns `mustChangePassword` flag
- ✅ Password change with wrong old password (should fail)
- ✅ Password change with correct credentials (should succeed)
- ✅ Login with new password (mustChangePassword should be false)
- ✅ Old password should no longer work

All 6-8 tests should pass.

---

## Part 2: Frontend Testing

### Test 1: Role-Based Employee Creation (Admin)

1. **Login as Admin:**
   - Go to: `http://localhost:3000/login`
   - Login ID: `OIADUS20200001`
   - Password: `Password123!`
   - Click "Sign in"

2. **Navigate to Add Employee:**
   - You should be on the dashboard (`/dashboard`)
   - Click "Employees" in the sidebar
   - Click "+ Add Employee" button

3. **Verify Role Options:**
   - Scroll down to the "Role" dropdown
   - **Expected:** Should see all 4 roles:
     - Employee
     - HR Officer
     - Payroll Officer
     - Admin
   - ✅ Pass if all 4 roles are visible

4. **Create a Test Employee:**
   - Fill in the form with test data:
     ```
     Company Name: Odeon Institute (default)
     First Name: Test
     Last Name: FirstTime
     Email: testfirsttime@example.com
     Phone: 9876543210
     Date of Birth: 2000-01-01
     Date of Joining: 2025-11-08
     Department: IT
     Designation: Developer
     Role: Employee
     Basic Salary: 50000
     Emergency Contact Name: Emergency Contact
     Emergency Contact Phone: 9999999999
     Password: TempPassword123!
     Confirm Password: TempPassword123!
     ```
   - Note the auto-generated Login ID (e.g., `OITEFI20252099`)
   - Click "Create Employee"
   - **Expected:** Success message and redirect to employees list
   - ✅ Pass if employee is created successfully

5. **Logout:**
   - Click user menu (bottom of sidebar)
   - Click "Logout"

### Test 2: Role-Based Employee Creation (HR Officer)

1. **Login as HR Officer:**
   - Login ID: `OIHERO20200002`
   - Password: `Password123!`
   - Click "Sign in"

2. **Navigate to Add Employee:**
   - Click "Employees" in sidebar
   - Click "+ Add Employee" button

3. **Verify Role Options:**
   - Scroll down to the "Role" dropdown
   - **Expected:** Should see only 3 roles:
     - Employee
     - HR Officer
     - Payroll Officer
   - **Expected:** Should NOT see "Admin" option
   - ✅ Pass if Admin option is hidden

4. **Logout**

### Test 3: First-Time Login (New User)

1. **Login with newly created employee:**
   - Login ID: (the one you noted, e.g., `OITEFI20252099`)
   - Password: `TempPassword123!`
   - Click "Sign in"

2. **Verify Redirect:**
   - **Expected:** Should be redirected to `/change-password-first-time`
   - **Expected:** Should see:
     - "Change Password" heading
     - Welcome message with user name
     - "For security reasons, please change your password" message
   - ✅ Pass if redirected to password change page

3. **Verify Dashboard Access is Blocked:**
   - Try to manually navigate to `http://localhost:3000/dashboard`
   - **Expected:** Should be redirected back to `/change-password-first-time`
   - ✅ Pass if cannot access dashboard

### Test 4: Password Change Validation

1. **Test Wrong Old Password:**
   - Current Password: `WrongPassword123!`
   - New Password: `NewSecurePass123!`
   - Confirm New Password: `NewSecurePass123!`
   - Click "Change Password"
   - **Expected:** Red error message "Current password is incorrect"
   - ✅ Pass if error is shown

2. **Test Mismatched Passwords:**
   - Current Password: `TempPassword123!`
   - New Password: `NewSecurePass123!`
   - Confirm New Password: `DifferentPass123!`
   - Click "Change Password"
   - **Expected:** Error "New password and confirm password do not match"
   - ✅ Pass if error is shown

3. **Test Weak Password:**
   - Current Password: `TempPassword123!`
   - New Password: `weakpass`
   - Confirm New Password: `weakpass`
   - Click "Change Password"
   - **Expected:** Error about password requirements
   - ✅ Pass if error is shown

4. **Test Same as Old Password:**
   - Current Password: `TempPassword123!`
   - New Password: `TempPassword123!`
   - Confirm New Password: `TempPassword123!`
   - Click "Change Password"
   - **Expected:** Error "New password must be different from old password"
   - ✅ Pass if error is shown

### Test 5: Successful Password Change

1. **Change Password Successfully:**
   - Current Password: `TempPassword123!`
   - New Password: `NewSecurePass123!`
   - Confirm New Password: `NewSecurePass123!`
   - Click "Change Password"
   - **Expected:** 
     - Green success message "Password changed successfully! Redirecting to dashboard..."
     - Auto-redirect to dashboard after 2 seconds
   - ✅ Pass if redirected to dashboard

2. **Verify Dashboard Access:**
   - **Expected:** Should now be on `/dashboard`
   - **Expected:** Can navigate freely (not redirected to password change)
   - ✅ Pass if dashboard is accessible

3. **Logout and Login Again:**
   - Logout
   - Login with:
     - Login ID: (your test user)
     - Password: `NewSecurePass123!` (new password)
   - **Expected:** Should go directly to dashboard (not password change page)
   - ✅ Pass if no redirect to password change page

4. **Verify Old Password Doesn't Work:**
   - Logout
   - Try to login with:
     - Login ID: (your test user)
     - Password: `TempPassword123!` (old password)
   - **Expected:** Error "Invalid credentials"
   - ✅ Pass if login fails

---

## Part 3: Edge Cases Testing

### Test 6: Login ID Serial Number Stability

1. **Navigate to Add Employee page** (as Admin or HR)
2. **Fill in form fields:**
   - First Name: John
   - Last Name: Doe
   - Date of Joining: 2025-11-08
3. **Observe Login ID preview**
4. **Change other fields** (email, phone, department, etc.)
5. **Expected:** The serial number (last 4 digits) should remain the same
6. **Example:** If it shows `OIJODO20252099`, it should stay `OIJODO20252099`
7. ✅ Pass if serial number is stable

### Test 7: Password Change Page Security

1. **Without logging in:**
   - Go directly to: `http://localhost:3000/change-password-first-time`
   - **Expected:** Redirected to login page
   - ✅ Pass if redirected

2. **Login as user who already changed password:**
   - Login as: `OIADUS20200001` / `Password123!`
   - Try to go to: `http://localhost:3000/change-password-first-time`
   - **Expected:** Redirected to dashboard
   - ✅ Pass if redirected

---

## Test Results Checklist

### Backend Tests
- [ ] Test 1: Create user with mustChangePassword=true
- [ ] Test 2: Login returns mustChangePassword flag
- [ ] Test 3: Wrong old password rejected
- [ ] Test 4: Password change succeeds
- [ ] Test 5: Login with new password works
- [ ] Test 6: Old password no longer works

### Frontend Tests
- [ ] Test 1: Admin sees all 4 role options
- [ ] Test 2: HR sees only 3 role options (no Admin)
- [ ] Test 3: New user redirected to password change page
- [ ] Test 4: Dashboard blocked until password changed
- [ ] Test 5: Wrong old password validation
- [ ] Test 6: Mismatched passwords validation
- [ ] Test 7: Weak password validation
- [ ] Test 8: Same password validation
- [ ] Test 9: Successful password change
- [ ] Test 10: Dashboard accessible after password change
- [ ] Test 11: Direct dashboard access without password change
- [ ] Test 12: Old password doesn't work
- [ ] Test 13: Login ID serial number stability
- [ ] Test 14: Password change page security

---

## Troubleshooting

### Backend Not Starting
- Check if MySQL is running
- Check if port 5000 is available
- Run `npx prisma generate` to regenerate Prisma client
- Check for errors in terminal

### Frontend Not Starting
- Check if port 3000 is available
- Clear Next.js cache: `rm -rf .next`
- Run `npm install` again

### Tests Failing
- Ensure both backend and frontend are running
- Check browser console for errors (F12)
- Check backend terminal for API errors
- Clear browser localStorage: `localStorage.clear()` in browser console

### Password Change Not Working
- Check browser Network tab (F12) for API call
- Look for 401/403 errors (authentication issues)
- Verify token is stored in localStorage
- Check backend logs for error messages

---

## Success Criteria

✅ **All tests pass** when:
1. Admin can create all 4 role types
2. HR can create only 3 role types (no Admin)
3. New users are forced to change password
4. Users cannot access dashboard before password change
5. All password validations work correctly
6. After password change, users can access dashboard normally
7. Login ID serial number remains stable during form editing
8. Old passwords stop working after change
9. Password change page is protected (requires login)

---

## Commit Message

```
feat(frontend): implement first-time password change flow and role-based permissions

- Add first-time password change page with validation
- Implement role-based employee creation (Admin: 4 roles, HR: 3 roles)
- Update login flow to redirect to password change if mustChangePassword=true
- Protect dashboard access until password is changed
- Update backend /auth/me to return mustChangePassword flag
- Add backward compatibility for oldPassword/currentPassword in backend
- Create comprehensive test suite with PowerShell script
- Add detailed testing documentation
```

---

## Next Steps After Testing

1. **If all tests pass:**
   - Commit changes with the message above
   - Push to repository
   - Mark feature as complete

2. **If tests fail:**
   - Note which tests failed
   - Check error messages in browser console and backend logs
   - Fix issues and retest

3. **Additional improvements (future):**
   - Add password strength meter to UI
   - Add "Remember me" functionality
   - Implement password expiry after 90 days
   - Add email notification on password change
   - Add 2FA (two-factor authentication)
