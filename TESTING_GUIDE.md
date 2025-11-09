# 🧪 Complete Testing Guide - PayrollLogin & Reports

## 🚀 Quick Start

### Start Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev
# ✅ Should see: Server running on port 5000

# Frontend (Terminal 2)
cd frontend
npm run dev
# ✅ Should see: Local: http://localhost:3000
```

---

## 🔐 Test Login Credentials

### All Test Accounts
| Role | Login ID | Email | Password | Access |
|------|----------|-------|----------|--------|
| **Admin** | `OIADUS20200001` | admin@workzen.com | Password123! | All features |
| **HR Officer** | `OIHERO20200002` | hr@workzen.com | Password123! | Employees, Attendance, Leave |
| **Payroll Officer** | `OIPAJO20210001` | payroll@workzen.com | Password123! | Payroll + Reports ⭐ |
| **Employee (Alice)** | `OIALSM20210002` | alice@workzen.com | Password123! | Own data only |
| **Employee (Bob)** | `OIBOSM20210003` | bob@workzen.com | Password123! | Own data only |
| **Employee (Charlie)** | `OICHSM20210004` | charlie@workzen.com | Password123! | Own data only |

### 🎯 Payroll Officer Credentials (IMPORTANT!)

**✅ CORRECT Ways to Login:**
```bash
# Method 1: Using Login ID (Recommended)
Login ID: OIPAJO20210001
Password: Password123!

# Method 2: Using Email (Also works!)
Login ID: payroll@workzen.com
Password: Password123!
```

**Why it works:**
The backend `/api/auth/login` endpoint accepts **both** `loginId` and `email` in the same field. The frontend label says "Login ID" but you can enter either.

---

## 📋 Test Scenarios

### Test 1: Payroll Officer Login ⭐
**Objective:** Verify payroll officer can login and access payroll features

**Steps:**
1. Go to `http://localhost:3000/login`
2. Enter Login ID: `OIPAJO20210001`
3. Enter Password: `Password123!`
4. Click "Sign in"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Sidebar shows: Attendance, Time Off, **Payroll**, **Reports**, Settings
- ✅ Can access `/dashboard/payroll` (no access denied error)
- ✅ Role shown in header: "PAYROLL OFFICER"

**Alternative Test (Using Email):**
- Use `payroll@workzen.com` instead of `OIPAJO20210001`
- Should work exactly the same way

---

### Test 2: Payroll Menu Access Control
**Objective:** Verify only Admin and Payroll Officer can access Payroll

#### 2a. Test with Payroll Officer ✅
```
1. Login as: OIPAJO20210001 / Password123!
2. Navigate to: /dashboard/payroll
3. Expected: ✅ Access granted, see dashboard
```

#### 2b. Test with Admin ✅
```
1. Login as: OIADUS20200001 / Password123!
2. Navigate to: /dashboard/payroll
3. Expected: ✅ Access granted, see dashboard
```

#### 2c. Test with HR Officer ⚠️
```
1. Login as: OIHERO20200002 / Password123!
2. Navigate to: /dashboard/payroll
3. Expected: ⚠️ View-only access (cannot create/edit)
```

#### 2d. Test with Employee ❌
```
1. Login as: OIALSM20210002 / Password123!
2. Navigate to: /dashboard/payroll
3. Expected: ❌ Access denied or redirect
```

---

### Test 3: Reports Access (All Roles) ⭐
**Objective:** Verify all roles can access Reports, but employees see only own data

#### 3a. Test Employee Report Access
```
1. Login as: alice@workzen.com / Password123!
2. Click "Reports" in sidebar
3. Navigate to: /dashboard/reports

Expected Results:
✅ Page loads successfully
✅ Employee ID field is PRE-FILLED with Alice's ID
✅ Employee ID field is DISABLED (read-only)
✅ Year dropdown is enabled
✅ Can select year and generate report
✅ Report shows ONLY Alice's salary data
```

#### 3b. Test Admin Report Access
```
1. Login as: admin@workzen.com / Password123!
2. Click "Reports" in sidebar
3. Navigate to: /dashboard/reports

Expected Results:
✅ Page loads successfully
✅ Employee ID field is EMPTY
✅ Employee ID field is ENABLED (can type any ID)
✅ Can enter any employee ID manually
✅ Can generate report for ANY employee
```

#### 3c. Test Payroll Officer Report Access
```
1. Login as: payroll@workzen.com / Password123!
   OR: OIPAJO20210001 / Password123!
2. Click "Reports" in sidebar
3. Navigate to: /dashboard/reports

Expected Results:
✅ Page loads successfully
✅ Employee ID field is EMPTY
✅ Employee ID field is ENABLED (can type any ID)
✅ Can enter any employee ID manually
✅ Can generate report for ANY employee
```

---

### Test 4: Salary Statement Report Generation ⭐
**Objective:** Verify report generates correctly with proper data

**Steps:**
1. Login as Payroll Officer: `OIPAJO20210001 / Password123!`
2. Navigate to Reports
3. Enter Employee ID: `00000000-0000-4000-8000-000000000102` (Alice)
4. Select Year: `2024`
5. Click "🖨️ Print Salary Statement Report"

**Expected Results:**
- ✅ New browser window/tab opens
- ✅ Report title: "Salary Statement Report - Year 2024"
- ✅ Employee information displayed:
  * Name: Alice Smith
  * Employee Code: EMP001
  * Department: Engineering
  * Designation: Software Engineer
  * Year: 2024
  * Date of Joining: 01/01/2024
- ✅ Monthly breakdown table shows:
  * All 12 months (Jan to Dec)
  * Columns: Month, Days Worked, Basic, HRA, Allowances, Gross Salary, PF, Tax, Other Deductions, Total Deductions, Net Salary
  * Data from payslips API
- ✅ Yearly totals section shows:
  * Total Earnings (sum of all gross)
  * Total Deductions (sum of all deductions)
  * Total Net Salary (earnings - deductions)
- ✅ Print dialog automatically appears
- ✅ Can save as PDF or print directly
- ✅ Footer shows: "Generated on [timestamp]" and "This is a computer-generated document"

**Test with No Data:**
1. Enter Employee ID that has no payslips
2. Click generate
3. Expected: ⚠️ Alert message: "No payslips found for this employee in the selected year"

---

### Test 5: Role-Based Sidebar Navigation
**Objective:** Verify correct menu items appear for each role

#### Admin
```
Expected Sidebar:
✅ Employees
✅ Attendance
✅ Time Off
✅ Payroll
✅ Reports ⭐
✅ Settings
```

#### Payroll Officer
```
Expected Sidebar:
❌ Employees (hidden)
✅ Attendance
✅ Time Off
✅ Payroll
✅ Reports ⭐
❌ Settings (hidden)
```

#### HR Officer
```
Expected Sidebar:
✅ Employees
✅ Attendance
✅ Time Off
✅ Payroll (view-only)
✅ Reports ⭐
❌ Settings (hidden)
```

#### Employee
```
Expected Sidebar:
❌ Employees (hidden)
✅ Attendance
✅ Time Off
❌ Payroll (hidden)
✅ Reports ⭐ (own data only)
❌ Settings (hidden)
```

---

## 🐛 Troubleshooting

### Issue 1: "Payroll login is not working"

**Symptoms:**
- Cannot login with payroll credentials
- "Invalid credentials" error

**Solutions:**

✅ **Solution 1: Use Correct Login ID**
```
Login ID: OIPAJO20210001
Password: Password123!
```

✅ **Solution 2: Use Email (Also Works)**
```
Login ID: payroll@workzen.com
Password: Password123!
```

**Common Mistakes:**
- ❌ Using uppercase/lowercase incorrectly
- ❌ Typing password wrong (check caps lock)
- ❌ Backend not running (check port 5000)
- ❌ Database not seeded (run `npm run seed`)

**Verify Backend:**
```bash
# Test login via curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"OIPAJO20210001","password":"Password123!"}'

# Expected response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "...",
    "loginId": "OIPAJO20210001",
    "email": "payroll@workzen.com",
    "role": "PAYROLL_OFFICER",
    "isActive": true,
    "mustChangePassword": false
  }
}
```

---

### Issue 2: "Reports page not showing in sidebar"

**Solution:**
Reports has been added to the sidebar at line 159-166 of `frontend/app/dashboard/layout.tsx`.

**Verify:**
1. Restart frontend: `npm run dev`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Check sidebar - should see 📊 Reports between Payroll and Settings

---

### Issue 3: "Employee can't access Reports"

**Check:**
1. Employee IS logged in (check header shows EMPLOYEE role)
2. Navigate to `/dashboard/reports` directly
3. Reports is visible to ALL roles - no role restriction

**If still not working:**
- Check `frontend/app/dashboard/layout.tsx` line 159-166
- Reports link should have NO role conditional wrapper
- Should be accessible like Attendance and Time Off

---

### Issue 4: "Report shows no data"

**Possible Causes:**
1. **No payslips created** - Create payrun and generate payslips first
2. **Wrong employee ID** - Use correct UUID from fixtures
3. **Wrong year** - Payslips might be from different year

**Solution:**
```bash
# Create test payslip first:
# 1. Login as Admin: OIADUS20200001
# 2. Go to Payroll → Payruns → Create New Payrun
# 3. Fill: Month (January), Year (2024)
# 4. Click "Process Payrun" button
# 5. Now Reports will show data for 2024
```

---

### Issue 5: "Print doesn't work"

**Check:**
1. Popup blocker is disabled for localhost:3000
2. Browser allows window.open() calls
3. Print dialog appears but click cancel - window should stay open with report

**Browser Settings:**
- Chrome: Settings → Privacy → Site Settings → Pop-ups → Allow for localhost:3000
- Firefox: Options → Privacy → Permissions → Block pop-up windows → Exceptions → localhost:3000
- Edge: Settings → Site permissions → Pop-ups → Allow for localhost:3000

---

## 🧪 API Testing (Backend Only)

### Test Payroll APIs via curl

#### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"OIPAJO20210001","password":"Password123!"}'
```

#### 2. Get All Payslips
```bash
# Save token from login response
TOKEN="your_token_here"

curl -X GET http://localhost:5000/api/payslips \
  -H "Authorization: Bearer $TOKEN"
```

#### 3. Get Payslips by Employee
```bash
curl -X GET "http://localhost:5000/api/payslips?employeeId=00000000-0000-4000-8000-000000000102" \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Get Payslips by Year
```bash
curl -X GET "http://localhost:5000/api/payslips?year=2024" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Test Data Reference

### Employee UUIDs (for Reports)
```
Alice Smith:    00000000-0000-4000-8000-000000000102
Bob Smith:      00000000-0000-4000-8000-000000000103
Charlie Smith:  00000000-0000-4000-8000-000000000104
Diana Prince:   00000000-0000-4000-8000-000000000105
Eve Adams:      00000000-0000-4000-8000-000000000106
Frank Castle:   00000000-0000-4000-8000-000000000107
Grace Hopper:   00000000-0000-4000-8000-000000000108
Henry Ford:     00000000-0000-4000-8000-000000000109
Iris West:      00000000-0000-4000-8000-00000000010A
Jack Ryan:      00000000-0000-4000-8000-00000000010B
```

### User UUIDs
```
Admin:          00000000-0000-4000-8000-000000000001
HR Officer:     00000000-0000-4000-8000-000000000002
Payroll Officer: 00000000-0000-4000-8000-000000000003
Alice (Employee): 00000000-0000-4000-8000-000000000004
Bob (Employee):   00000000-0000-4000-8000-000000000005
```

---

## ✅ Complete Test Checklist

### Backend Tests
- [ ] Backend running on port 5000
- [ ] Database seeded with test data
- [ ] Login API works with loginId
- [ ] Login API works with email
- [ ] Payslips API returns data
- [ ] Auth middleware validates tokens

### Frontend Tests
- [ ] Frontend running on port 3000
- [ ] Login page shows all 4 credentials (Admin, HR, Payroll, Employee)
- [ ] Can login as Payroll Officer with OIPAJO20210001
- [ ] Can login as Payroll Officer with payroll@workzen.com
- [ ] Dashboard shows correct sidebar for each role

### Payroll Tests
- [ ] Admin can access /dashboard/payroll
- [ ] Payroll Officer can access /dashboard/payroll
- [ ] HR Officer can view (but not edit) payroll
- [ ] Employee CANNOT access /dashboard/payroll
- [ ] Can create payrun
- [ ] Can process payrun
- [ ] Can view payslips

### Reports Tests ⭐
- [ ] Reports menu visible in sidebar for ALL roles
- [ ] Admin can access /dashboard/reports
- [ ] Payroll Officer can access /dashboard/reports
- [ ] HR Officer can access /dashboard/reports
- [ ] Employee can access /dashboard/reports
- [ ] Employee sees pre-filled employee ID (read-only)
- [ ] Admin sees empty employee ID (can type any)
- [ ] Payroll Officer sees empty employee ID (can type any)
- [ ] Year dropdown shows current + 5 previous years
- [ ] Can generate report with valid data
- [ ] Report opens in new window
- [ ] Report shows all 12 months
- [ ] Report shows yearly totals
- [ ] Print dialog appears automatically
- [ ] Can save as PDF
- [ ] Shows alert when no payslips found

### Integration Tests
- [ ] Can complete full payroll workflow (Create → Process → View → Report)
- [ ] Employee can download own salary statement via Reports
- [ ] Admin can generate salary statement for any employee
- [ ] All role-based access controls working correctly
- [ ] No console errors in browser
- [ ] No backend errors in terminal

---

## 🎯 Success Criteria

**All tests pass when:**

1. ✅ Payroll Officer can login with both loginId and email
2. ✅ Payroll Officer can access Payroll menu
3. ✅ Payroll Officer can access Reports menu
4. ✅ Employee can access Reports menu (but NOT Payroll)
5. ✅ Employee sees only own data in Reports
6. ✅ Admin/Payroll can generate reports for any employee
7. ✅ Salary statement report generates correctly
8. ✅ Print functionality works
9. ✅ All role-based access controls enforced
10. ✅ No errors in console or terminal

---

## 📞 Need Help?

**Check These First:**
1. Both servers running (backend:5000, frontend:3000)
2. Database seeded (`npm run seed` in backend)
3. Browser cache cleared
4. Correct credentials used
5. No popup blockers

**Still Having Issues?**
- Check browser console (F12) for errors
- Check backend terminal for API errors
- Verify token stored in localStorage
- Try logging out and back in
- Restart both servers

---

## 🎉 Expected Final State

**After completing all tests:**

```
✅ Payroll Officer Login Working
   - Can use OIPAJO20210001 OR payroll@workzen.com
   - Both credentials work perfectly

✅ Payroll Menu Access
   - Admin: Full access
   - Payroll Officer: Full access
   - HR Officer: View-only
   - Employee: No access

✅ Reports Menu Access
   - Admin: Full access (any employee)
   - Payroll Officer: Full access (any employee)
   - HR Officer: Full access (any employee)
   - Employee: Own data only

✅ Salary Statement Reports
   - Professional format with all details
   - Monthly breakdown (12 months)
   - Yearly totals
   - Print/PDF functionality
   - Role-based data filtering

✅ System Architecture
   - Payroll: Admin & Payroll Officer only
   - Reports: All roles (separate menu)
   - Employees download payslips via Reports
   - Complete role-based access control
```

**Everything works as per your requirements! 🚀**
