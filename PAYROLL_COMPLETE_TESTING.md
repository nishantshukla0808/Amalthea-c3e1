# 🧪 Complete Payroll Testing Guide - All Roles & Edge Cases

## 📋 Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [Test Data Reference](#test-data-reference)
3. [Admin Role Tests](#admin-role-tests)
4. [Payroll Officer Role Tests](#payroll-officer-role-tests)
5. [HR Officer Role Tests](#hr-officer-role-tests)
6. [Employee Role Tests](#employee-role-tests)
7. [Edge Cases & Error Scenarios](#edge-cases--error-scenarios)
8. [Integration Tests](#integration-tests)
9. [Performance Tests](#performance-tests)
10. [Security Tests](#security-tests)

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Start Backend
cd backend
npm run dev
# ✅ Verify: Server running on port 5000

# 2. Start Frontend
cd frontend
npm run dev
# ✅ Verify: Local: http://localhost:3000

# 3. Verify Database Seeded
# Check backend logs for: "✅ Database seeded successfully"
# If not seeded: cd backend && npm run seed
```

### Test Accounts
| Role | Login ID | Email | Password | Employee ID |
|------|----------|-------|----------|-------------|
| Admin | OIADUS20200001 | admin@workzen.com | Password123! | N/A |
| Payroll Officer | OIPAJO20210001 | payroll@workzen.com | Password123! | 00000000-0000-4000-8000-000000000103 |
| HR Officer | OIHERO20200002 | hr@workzen.com | Password123! | N/A |
| Employee (Alice) | OIALSM20210002 | alice@workzen.com | Password123! | 00000000-0000-4000-8000-000000000102 |
| Employee (Bob) | OIBOSM20210003 | bob@workzen.com | Password123! | 00000000-0000-4000-8000-000000000103 |
| Employee (Charlie) | OICHSM20210004 | charlie@workzen.com | Password123! | 00000000-0000-4000-8000-000000000104 |

---

## Test Data Reference

### Employee UUIDs (for creating salary structures & payruns)
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

---

## Admin Role Tests

### TEST 1: Admin Login & Navigation
**Objective:** Verify admin can login and sees correct navigation

**Steps:**
1. Go to http://localhost:3000/login
2. Enter: `admin@workzen.com` / `Password123!`
3. Click "Sign in"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Sidebar shows:
  * Employees
  * Attendance
  * Time Off
  * Payroll
  * Reports
  * Settings
- ✅ Header shows: "admin" / "ADMIN"
- ✅ No console errors

**Edge Cases:**
- [ ] Login with uppercase email (ADMIN@WORKZEN.COM)
- [ ] Login with loginId instead of email (OIADUS20200001)
- [ ] Login with wrong password → Should show error
- [ ] Login with inactive account → Should show error

---

### TEST 2: Admin - Create Salary Structure
**Objective:** Create salary structure for an employee

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Salary Structures
3. Click "+ Create New Structure"
4. Fill form:
   - Employee ID: `00000000-0000-4000-8000-000000000102` (Alice)
   - Basic Salary: `30000`
   - HRA: `12000`
   - Allowances: `8000`
   - Deductions: `2000`
   - PF Contribution: `3600`
   - Effective From: `2024-01-01`
5. Click "Create Salary Structure"

**Expected Results:**
- ✅ Success message: "Salary structure created successfully"
- ✅ Redirected to salary structures list
- ✅ New structure appears in list
- ✅ Shows: Employee Code, Basic, HRA, Total
- ✅ "Edit" button visible
- ✅ Gross Salary calculated: 30000 + 12000 + 8000 = 50000
- ✅ Net Salary calculated: 50000 - 2000 - 3600 = 44400

**Edge Cases:**
- [ ] Create with empty Employee ID → Should show validation error
- [ ] Create with invalid Employee ID → Should show error
- [ ] Create with negative salary → Should show validation error
- [ ] Create with zero salary → Should be allowed
- [ ] Create duplicate structure for same employee → Should show error or overwrite
- [ ] Create with future date → Should be allowed
- [ ] Create with past date → Should be allowed
- [ ] Create without HRA → Should default to 0
- [ ] Create without Allowances → Should default to 0
- [ ] Basic salary > 1,00,000 → Should be allowed
- [ ] PF > Basic * 0.12 → Should be allowed (no validation)

---

### TEST 3: Admin - Edit Salary Structure
**Objective:** Modify existing salary structure

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Salary Structures
3. Click "Edit" on Alice's structure
4. Modify:
   - Basic Salary: `35000` (increased by 5000)
   - HRA: `14000` (increased by 2000)
5. Click "Update Salary Structure"

**Expected Results:**
- ✅ Success message: "Salary structure updated successfully"
- ✅ Redirected to list
- ✅ Updated values visible
- ✅ New Gross = 35000 + 14000 + 8000 = 57000
- ✅ New Net = 57000 - 2000 - 3600 = 51400

**Edge Cases:**
- [ ] Update with empty Basic Salary → Validation error
- [ ] Update to reduce salary → Should be allowed
- [ ] Update multiple times rapidly → Should handle correctly
- [ ] Update while payrun is processing → Should check if allowed
- [ ] Update effective date to past → Should be allowed
- [ ] Update all fields to 0 → Should be allowed

---

### TEST 4: Admin - Create Payrun
**Objective:** Create a new payrun for the month

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payruns
3. Click "+ New Payrun"
4. Fill form:
   - Month: `January` (1)
   - Year: `2024`
5. Click "Create Payrun"

**Expected Results:**
- ✅ Success message: "Payrun created successfully"
- ✅ Redirected to payrun details page
- ✅ Status: "DRAFT"
- ✅ Shows: Month, Year, Status
- ✅ "Process Payrun" button visible and enabled
- ✅ Employee Count: 0 (not processed yet)
- ✅ Total Gross: ₹0
- ✅ Total Net: ₹0

**Edge Cases:**
- [ ] Create for current month → Should be allowed
- [ ] Create for past month → Should be allowed
- [ ] Create for future month → Should be allowed
- [ ] Create duplicate payrun (same month+year) → Should show error
- [ ] Create for month 13 → Validation error
- [ ] Create for month 0 → Validation error
- [ ] Create for year 1900 → Should be allowed
- [ ] Create for year 2100 → Should be allowed
- [ ] Create without selecting month → Validation error
- [ ] Create without selecting year → Validation error

---

### TEST 5: Admin - Process Payrun
**Objective:** Process payrun to generate payslips

**Prerequisites:**
- At least one salary structure exists (Alice: created in TEST 2)
- Payrun created for Jan 2024 (created in TEST 4)

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payruns
3. Click on Jan 2024 payrun
4. Verify Status: "DRAFT"
5. Click "Process Payrun" button
6. Wait for processing (may take a few seconds)

**Expected Results:**
- ✅ Status changes to: "PROCESSED"
- ✅ Success message: "Payrun processed successfully"
- ✅ Employee Count updates (should be ≥ 1 if Alice has structure)
- ✅ Total Gross shows correct sum
- ✅ Total Net shows correct sum
- ✅ "Validate Payrun" button appears (enabled)
- ✅ "Process Payrun" button disappears or disabled
- ✅ Processed By: admin@workzen.com
- ✅ Processed At: Current timestamp
- ✅ Payslips generated (visible in Payslips section)

**Verify Payslips:**
- Navigate to: Payroll → Payslips
- ✅ Should see payslip for Alice (Jan 2024)
- ✅ Status: "DRAFT"
- ✅ Gross Salary matches salary structure
- ✅ Net Salary correctly calculated

**Edge Cases:**
- [ ] Process payrun with no salary structures → Should show warning or create 0 payslips
- [ ] Process already processed payrun → Should show error
- [ ] Process validated payrun → Should show error
- [ ] Process paid payrun → Should show error
- [ ] Click process multiple times rapidly → Should handle correctly (prevent duplicate)
- [ ] Process while another payrun processing → Should queue or show error
- [ ] Process payrun with 100+ employees → Should handle performance
- [ ] Process payrun with employee having no salary structure → Should skip or show warning

---

### TEST 6: Admin - Validate Payrun
**Objective:** Validate processed payrun

**Prerequisites:**
- Payrun processed (TEST 5)

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payruns
3. Click on Jan 2024 payrun
4. Verify Status: "PROCESSED"
5. Click "Validate Payrun" button

**Expected Results:**
- ✅ Status changes to: "FINALIZED"
- ✅ Success message: "Payrun validated successfully"
- ✅ "Validate Payrun" button disappears
- ✅ "Mark as Paid" button appears (enabled)
- ✅ Finalized By: admin@workzen.com
- ✅ Finalized At: Current timestamp
- ✅ All payslips status NOT changed (still DRAFT)

**Edge Cases:**
- [ ] Validate without processing → Should show error
- [ ] Validate already validated → Should show error
- [ ] Validate already paid → Should show error
- [ ] Click validate multiple times → Should handle correctly
- [ ] Validate payrun with 0 payslips → Should be allowed or show warning

---

### TEST 7: Admin - Mark Payrun as Paid
**Objective:** Mark validated payrun as paid

**Prerequisites:**
- Payrun validated (TEST 6)

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payruns
3. Click on Jan 2024 payrun
4. Verify Status: "FINALIZED"
5. Click "Mark as Paid" button

**Expected Results:**
- ✅ Status changes to: "PAID"
- ✅ Success message: "Payrun marked as paid successfully"
- ✅ "Mark as Paid" button disappears or disabled
- ✅ All buttons disabled (no further actions)
- ✅ Paid timestamp shown
- ✅ All payslips status should remain or update (check backend logic)

**Edge Cases:**
- [ ] Mark as paid without validation → Should show error
- [ ] Mark as paid without processing → Should show error
- [ ] Mark already paid → Should show error
- [ ] Click paid multiple times → Should handle correctly

---

### TEST 8: Admin - View Payslip Details
**Objective:** View individual payslip with all details

**Prerequisites:**
- Payslips generated (from TEST 5)

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payslips
3. Click "View Details" on Alice's payslip

**Expected Results:**
- ✅ Payslip details page opens
- ✅ Shows all sections:
  * Employee Information (Name, Code, Department, Designation)
  * Payslip Information (Period, Status, Payment Date)
  * Earnings Breakdown (Basic, HRA, Allowances)
  * Deductions Breakdown (PF, Professional Tax, TDS)
  * Summary (Gross, Total Deductions, Net)
- ✅ All amounts match salary structure
- ✅ Calculations correct
- ✅ "Print Payslip" button visible
- ✅ Status badge shown with correct color

**Edge Cases:**
- [ ] View payslip with invalid ID → 404 error
- [ ] View payslip from different year → Should load correctly
- [ ] View payslip with 0 salary → Should display 0
- [ ] View payslip with very large numbers → Should format correctly
- [ ] Print payslip → Opens in new window with print-friendly format

---

### TEST 9: Admin - Print Payslip
**Objective:** Print/Download payslip as PDF

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payslips
3. Click "View Details" on any payslip
4. Click "Print Payslip" button

**Expected Results:**
- ✅ New window/tab opens
- ✅ Print-friendly layout (no sidebar, no buttons)
- ✅ Company header shown
- ✅ All payslip details visible
- ✅ Professional formatting
- ✅ Print dialog appears automatically
- ✅ Can save as PDF
- ✅ Page breaks correctly (if multi-page)

**Edge Cases:**
- [ ] Print in different browsers (Chrome, Firefox, Edge)
- [ ] Print with browser print settings (Portrait/Landscape)
- [ ] Print with custom page size
- [ ] Popup blocker enabled → Should show message
- [ ] Print fails → Should handle gracefully

---

### TEST 10: Admin - View Payroll Dashboard
**Objective:** View dashboard statistics

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Dashboard

**Expected Results:**
- ✅ Shows cards:
  * Employer Cost (latest payrun total)
  * Employee Count (in latest payrun)
  * Payruns (total count)
  * Salary Structures (with "Manage" link)
- ✅ Recent Payruns section
- ✅ List of recent payruns (sorted by date desc)
- ✅ Quick Actions section
- ✅ "Create Your First Payrun" button (if no payruns)
- ✅ "+ New Payrun" button (if payruns exist)
- ✅ All numbers accurate
- ✅ Currency formatting correct (₹)

**Edge Cases:**
- [ ] Dashboard with 0 payruns → Shows "No payruns found"
- [ ] Dashboard with 0 structures → Shows ₹0
- [ ] Dashboard with 100+ payruns → Should paginate or limit display
- [ ] Refresh dashboard → Data updates correctly

---

### TEST 11: Admin - Filter Payslips
**Objective:** Filter payslips by various criteria

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payslips
3. Test filters:
   - Filter by Employee ID
   - Filter by Month
   - Filter by Year
   - Filter by Status
   - Combine multiple filters

**Expected Results:**
- ✅ Employee ID filter: Shows only matching payslips
- ✅ Month filter: Shows only selected month
- ✅ Year filter: Shows only selected year
- ✅ Status filter: Shows only matching status
- ✅ Combined filters: AND logic (all conditions must match)
- ✅ "Clear Filters" works correctly
- ✅ Filter state persists on page navigation
- ✅ URL params updated with filters

**Edge Cases:**
- [ ] Filter with no results → Shows "No payslips found"
- [ ] Filter with invalid employee ID → No results
- [ ] Filter with future date → No results
- [ ] Apply same filter twice → No change
- [ ] Clear filters when none applied → No change

---

### TEST 12: Admin - Access Reports
**Objective:** Generate salary statement reports

**Steps:**
1. Login as Admin
2. Navigate to: Reports (sidebar)
3. Enter Employee ID: `00000000-0000-4000-8000-000000000102` (Alice)
4. Select Year: `2024`
5. Click "Print Salary Statement Report"

**Expected Results:**
- ✅ New window opens
- ✅ Report shows:
  * Company header (WorkZen HRMS)
  * Employee information (6 fields)
  * Monthly breakdown table (12 rows, 11 columns)
  * Yearly totals (3 cards)
  * Generated timestamp
- ✅ All months shown (Jan-Dec)
- ✅ Data matches payslips
- ✅ Totals calculated correctly
- ✅ Print dialog appears
- ✅ Can save as PDF

**Edge Cases:**
- [ ] Report for employee with no payslips → Alert: "No payslips found"
- [ ] Report for future year → No data
- [ ] Report for year with partial data → Shows available months
- [ ] Report with very large numbers → Formats correctly
- [ ] Print report in different browsers

---

### TEST 13: Admin - Edit Payslip Deductions
**Objective:** Modify deductions on draft payslip

**Prerequisites:**
- Draft payslip exists

**Steps:**
1. Login as Admin
2. Navigate to: Payroll → Payslips
3. Find DRAFT status payslip
4. Click "View Details"
5. Modify deductions:
   - TDS: `500`
   - Other Deductions: `200`
6. Click "Update Deductions"

**Expected Results:**
- ✅ Success message: "Deductions updated successfully"
- ✅ Net salary recalculated
- ✅ Total deductions updated
- ✅ Page refreshes with new values
- ✅ Changes saved to database

**Edge Cases:**
- [ ] Edit with negative values → Validation error
- [ ] Edit with very large values → Should be allowed
- [ ] Edit validated payslip → Should show error or be disabled
- [ ] Edit paid payslip → Should show error or be disabled
- [ ] Edit multiple times → Should save correctly
- [ ] Set deductions > gross salary → Net becomes negative (check if allowed)

---

## Payroll Officer Role Tests

### TEST 14: Payroll Officer Login & Navigation
**Objective:** Verify payroll officer access

**Steps:**
1. Go to http://localhost:3000/login
2. Enter: `payroll@workzen.com` / `Password123!`
3. Click "Sign in"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Sidebar shows:
  * Attendance
  * Time Off
  * Payroll ✅
  * Reports
- ✅ Sidebar does NOT show:
  * Employees ❌
  * Settings ❌
- ✅ Header shows: "payroll" / "PAYROLL OFFICER"

**Edge Cases:**
- [ ] Login with loginId: OIPAJO20210001
- [ ] Try to access /dashboard/employees → Should redirect or show access denied
- [ ] Try to access /dashboard/settings → Should redirect or show access denied

---

### TEST 15: Payroll Officer - All Payroll Operations
**Objective:** Verify payroll officer has same payroll access as admin

**Steps:**
Run all payroll tests (TEST 2 to TEST 13) as Payroll Officer

**Expected Results:**
- ✅ Can create salary structures
- ✅ Can edit salary structures
- ✅ Can create payruns
- ✅ Can process payruns
- ✅ Can validate payruns
- ✅ Can mark as paid
- ✅ Can view payslips
- ✅ Can print payslips
- ✅ Can view dashboard
- ✅ Can filter payslips
- ✅ Can generate reports (any employee)
- ✅ Can edit payslip deductions
- ✅ All functionality identical to admin

**Edge Cases:**
- [ ] All admin edge cases apply
- [ ] Cannot access employee management
- [ ] Cannot access settings

---

## HR Officer Role Tests

### TEST 16: HR Officer Login & Navigation
**Objective:** Verify HR officer access restrictions

**Steps:**
1. Go to http://localhost:3000/login
2. Enter: `hr@workzen.com` / `Password123!`
3. Click "Sign in"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Sidebar shows:
  * Employees ✅
  * Attendance
  * Time Off
  * Reports
- ✅ Sidebar does NOT show:
  * Payroll ❌ (CRITICAL)
  * Settings ❌
- ✅ Header shows: "hr" / "HR OFFICER"

**Edge Cases:**
- [ ] Try to access /dashboard/payroll → Should redirect or show access denied
- [ ] Try to access /dashboard/payroll/payruns → Should redirect
- [ ] Try to access /dashboard/settings → Should redirect

---

### TEST 17: HR Officer - View-Only Payroll Access (if implemented)
**Objective:** Verify HR cannot create/edit payroll

**Steps:**
1. Login as HR Officer
2. Try to access payroll URLs directly:
   - `/dashboard/payroll`
   - `/dashboard/payroll/payruns`
   - `/dashboard/payroll/salary-structure`

**Expected Results:**
- ❌ Should redirect to dashboard or show 403 error
- ❌ Cannot view payroll pages
- ❌ Cannot create salary structures
- ❌ Cannot create payruns
- ❌ Cannot process payruns

**Edge Cases:**
- [ ] Try API calls directly → Should return 403
- [ ] Try to access payslip details → Should be blocked
- [ ] Bookmark payroll page and try to access → Should redirect

---

### TEST 18: HR Officer - Reports Access
**Objective:** Verify HR can access reports

**Steps:**
1. Login as HR Officer
2. Navigate to: Reports
3. Enter any Employee ID
4. Select Year: 2024
5. Click "Print Salary Statement Report"

**Expected Results:**
- ✅ Can access Reports page
- ✅ Can enter any employee ID
- ✅ Can generate reports
- ✅ Report displays correctly
- ✅ Can print/download PDF

**Edge Cases:**
- [ ] Generate report for non-existent employee → Alert: "No payslips found"
- [ ] Generate report for employee with no data → Alert shown

---

## Employee Role Tests

### TEST 19: Employee Login & Navigation
**Objective:** Verify employee sees correct navigation

**Steps:**
1. Go to http://localhost:3000/login
2. Enter: `alice@workzen.com` / `Password123!`
3. Click "Sign in"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Sidebar shows (in order):
  1. My Profile ✅ (FIRST)
  2. Attendance
  3. Time Off
  4. Reports ✅
- ✅ Sidebar does NOT show:
  * Employees ❌
  * Payroll ❌
  * Settings ❌
- ✅ Header shows: "alice" / "EMPLOYEE"

**Edge Cases:**
- [ ] Login with loginId: OIALSM20210002
- [ ] Try to access /dashboard/payroll → Should redirect
- [ ] Try to access /dashboard/employees → Should redirect
- [ ] Try to access /dashboard/settings → Should redirect

---

### TEST 20: Employee - My Profile Access
**Objective:** Verify employee can access own profile

**Steps:**
1. Login as Alice (Employee)
2. Click "My Profile" (first menu item)
3. Verify profile page loads

**Expected Results:**
- ✅ Profile page opens
- ✅ Shows employee information
- ✅ Can view own details
- ✅ May be able to edit certain fields (depends on implementation)

**Edge Cases:**
- [ ] Try to access other employee's profile → Should be blocked
- [ ] Try to access via URL manipulation → Should show only own profile

---

### TEST 21: Employee - Access Reports (Own Data Only)
**Objective:** Verify employee can only see own salary reports

**Steps:**
1. Login as Alice (Employee)
2. Navigate to: Reports
3. Observe Employee ID field

**Expected Results:**
- ✅ Can access Reports page
- ✅ Employee ID field is PRE-FILLED with Alice's ID
- ✅ Employee ID field is DISABLED (read-only)
- ✅ Cannot edit or change employee ID
- ✅ Year dropdown is enabled
- ✅ Can select year
- ✅ Can generate report for own data only

**Test Report Generation:**
1. Select Year: 2024
2. Click "Print Salary Statement Report"
3. ✅ Report opens with Alice's data only
4. ✅ Shows Alice's name, employee code
5. ✅ Shows Alice's salary breakdown

**Edge Cases:**
- [ ] Try to modify employee ID via browser console → Should be blocked or ignored
- [ ] Try to access report API with different employee ID → Should return 403 or own data only
- [ ] Generate report for year with no data → Alert shown
- [ ] Try to generate report for other employee via API call → Should be blocked

---

### TEST 22: Employee - Cannot Access Payroll
**Objective:** Verify employee cannot access payroll management

**Steps:**
1. Login as Alice (Employee)
2. Verify "Payroll" is NOT in sidebar
3. Try to access directly:
   - Type URL: `http://localhost:3000/dashboard/payroll`
   - Type URL: `http://localhost:3000/dashboard/payroll/payruns`
   - Type URL: `http://localhost:3000/dashboard/payroll/payslips`
   - Type URL: `http://localhost:3000/dashboard/payroll/salary-structure`

**Expected Results:**
- ❌ All payroll URLs should:
  * Redirect to /dashboard
  * OR Show 403 Access Denied page
  * OR Show "You don't have permission" message
- ❌ Cannot view any payroll pages
- ❌ Cannot create/edit salary structures
- ❌ Cannot view/create payruns
- ❌ Cannot view other employees' payslips

**Edge Cases:**
- [ ] Try API calls directly (curl/Postman) → Should return 403
- [ ] Use browser back button after redirect → Should redirect again
- [ ] Bookmark payroll page and try later → Should redirect

---

### TEST 23: Employee - Multiple Employees Same Operations
**Objective:** Test with different employee accounts

**Steps:**
1. Repeat TEST 19-22 with:
   - Bob: `bob@workzen.com` / `Password123!`
   - Charlie: `charlie@workzen.com` / `Password123!`

**Expected Results:**
- ✅ Each employee sees own data only in Reports
- ✅ Each employee ID pre-filled correctly
- ✅ Cannot access others' data
- ✅ All restrictions apply consistently

---

## Edge Cases & Error Scenarios

### TEST 24: Invalid Data Handling

#### A. Invalid Employee IDs
```
Test Cases:
- [ ] Empty employee ID
- [ ] Non-existent UUID
- [ ] Malformed UUID (missing characters)
- [ ] SQL injection attempt: `' OR '1'='1`
- [ ] XSS attempt: `<script>alert('xss')</script>`
- [ ] Very long string (1000+ chars)
```

#### B. Invalid Date Ranges
```
Test Cases:
- [ ] Month = 0
- [ ] Month = 13
- [ ] Month = -1
- [ ] Year = 0
- [ ] Year = -2024
- [ ] Year = 9999
- [ ] Future dates (year 2100)
- [ ] Very old dates (year 1900)
```

#### C. Invalid Salary Values
```
Test Cases:
- [ ] Negative salary
- [ ] Zero salary (should be allowed)
- [ ] Extremely large salary (999,999,999)
- [ ] Decimal values (25000.50)
- [ ] Non-numeric values (abc, !@#)
- [ ] Null values
- [ ] Empty strings
```

---

### TEST 25: Concurrent Operations

#### A. Multiple Users Same Payrun
```
Steps:
1. Admin starts processing payrun
2. Payroll Officer tries to process same payrun simultaneously
3. Expected: Only one succeeds, other gets error
```

#### B. Edit Conflicts
```
Steps:
1. User A opens salary structure for editing
2. User B opens same salary structure
3. User A saves changes
4. User B tries to save
5. Expected: Last write wins or conflict error
```

---

### TEST 26: Network & Performance

#### A. Slow Network
```
Test Cases:
- [ ] Throttle network to 3G
- [ ] Create payrun → Should show loading state
- [ ] Process payrun → Should handle timeout
- [ ] Load payslips list → Should paginate
```

#### B. Large Datasets
```
Test Cases:
- [ ] Process payrun with 100+ employees
- [ ] View payslips list with 1000+ records
- [ ] Generate report with 12 months data
- [ ] Dashboard with 100+ payruns
```

---

### TEST 27: Browser Compatibility

**Test in multiple browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

**Verify:**
- [ ] All features work
- [ ] Styling correct
- [ ] Print functionality works
- [ ] No console errors

---

### TEST 28: Mobile Responsiveness

**Test on mobile devices or browser dev tools:**
- [ ] Login page responsive
- [ ] Dashboard responsive
- [ ] Payroll pages responsive
- [ ] Reports page responsive
- [ ] Sidebar collapses on mobile
- [ ] Tables scroll horizontally
- [ ] Buttons accessible
- [ ] Forms usable

---

## Integration Tests

### TEST 29: Complete Payroll Workflow
**Objective:** End-to-end payroll processing

**Scenario:**
1. Admin creates salary structures for 3 employees
2. Admin creates payrun for current month
3. Admin processes payrun
4. Verify payslips generated correctly
5. Admin validates payrun
6. Admin marks as paid
7. Employee logs in
8. Employee generates report
9. Employee sees own payslip data
10. Print payslip

**Expected Results:**
- ✅ All steps complete successfully
- ✅ Data consistent across all steps
- ✅ Employee sees correct data
- ✅ Reports show accurate information
- ✅ No errors at any step

---

### TEST 30: Multi-Month Payroll
**Objective:** Process multiple months

**Steps:**
1. Create payrun for Jan 2024
2. Process and finalize
3. Create payrun for Feb 2024
4. Process and finalize
5. Create payrun for Mar 2024
6. Process and finalize
7. Generate employee report for Q1 2024

**Expected Results:**
- ✅ All three payruns processed
- ✅ Payslips for all three months
- ✅ Report shows all three months
- ✅ Totals calculated correctly
- ✅ No data corruption

---

### TEST 31: Salary Changes Mid-Year
**Objective:** Handle salary structure updates

**Scenario:**
1. Create salary structure: ₹30,000 (Jan 2024)
2. Process Jan payrun → Payslip shows ₹30,000
3. Update salary structure: ₹35,000 (effective Feb 2024)
4. Process Feb payrun → Payslip shows ₹35,000
5. Generate yearly report → Shows both values

**Expected Results:**
- ✅ Jan payslip: ₹30,000
- ✅ Feb payslip: ₹35,000
- ✅ Report shows correct values per month
- ✅ History maintained

---

## Security Tests

### TEST 32: Authentication Bypass Attempts

```
Test Cases:
- [ ] Access /dashboard without login → Redirect to login
- [ ] Access /dashboard/payroll without login → Redirect
- [ ] Access API endpoints without token → 401 Unauthorized
- [ ] Use expired token → 401 Unauthorized
- [ ] Use invalid token → 401 Unauthorized
- [ ] Use another user's token → Should work only for that user
```

---

### TEST 33: Authorization Bypass Attempts

```
Test Cases:
- [ ] Employee tries to access admin API → 403 Forbidden
- [ ] Employee modifies JWT token → Should be rejected
- [ ] Employee accesses other employee's data via API → 403
- [ ] HR tries to access payroll API → 403
- [ ] Payroll officer tries to access settings → 403
```

---

### TEST 34: SQL Injection Attempts

```
Test Cases:
- [ ] Employee ID: `' OR '1'='1`
- [ ] Employee ID: `'; DROP TABLE users; --`
- [ ] Email: `admin@test.com' OR '1'='1`
- [ ] Search query: `%' AND 1=1 --`

Expected: All should be sanitized, no SQL execution
```

---

### TEST 35: XSS Attempts

```
Test Cases:
- [ ] Employee name: `<script>alert('xss')</script>`
- [ ] Department: `<img src=x onerror=alert('xss')>`
- [ ] Notes field: `javascript:alert('xss')`

Expected: All should be escaped/sanitized in output
```

---

## Performance Tests

### TEST 36: Load Testing

```
Test Scenarios:
- [ ] 100 concurrent users logging in
- [ ] 50 users processing payruns simultaneously
- [ ] 1000 payslips in database → List loads < 2s
- [ ] Generate report with 12 months → < 3s
- [ ] Dashboard loads in < 1s
```

---

### TEST 37: Database Performance

```
Test Cases:
- [ ] 10,000 payslips in database
- [ ] 1,000 salary structures
- [ ] 500 payruns
- [ ] Queries should use indexes
- [ ] No N+1 query problems
- [ ] Pagination works correctly
```

---

## Test Checklist Summary

### Admin (17 tests)
- [ ] TEST 1: Login & Navigation
- [ ] TEST 2: Create Salary Structure
- [ ] TEST 3: Edit Salary Structure
- [ ] TEST 4: Create Payrun
- [ ] TEST 5: Process Payrun
- [ ] TEST 6: Validate Payrun
- [ ] TEST 7: Mark as Paid
- [ ] TEST 8: View Payslip Details
- [ ] TEST 9: Print Payslip
- [ ] TEST 10: View Dashboard
- [ ] TEST 11: Filter Payslips
- [ ] TEST 12: Access Reports
- [ ] TEST 13: Edit Deductions

### Payroll Officer (2 tests)
- [ ] TEST 14: Login & Navigation
- [ ] TEST 15: All Payroll Operations

### HR Officer (3 tests)
- [ ] TEST 16: Login & Navigation
- [ ] TEST 17: No Payroll Access
- [ ] TEST 18: Reports Access

### Employee (5 tests)
- [ ] TEST 19: Login & Navigation
- [ ] TEST 20: My Profile Access
- [ ] TEST 21: Reports (Own Data Only)
- [ ] TEST 22: Cannot Access Payroll
- [ ] TEST 23: Multiple Employees

### Edge Cases (10 tests)
- [ ] TEST 24: Invalid Data Handling
- [ ] TEST 25: Concurrent Operations
- [ ] TEST 26: Network & Performance
- [ ] TEST 27: Browser Compatibility
- [ ] TEST 28: Mobile Responsiveness
- [ ] TEST 29: Complete Workflow
- [ ] TEST 30: Multi-Month Payroll
- [ ] TEST 31: Salary Changes
- [ ] TEST 32: Authentication Bypass
- [ ] TEST 33: Authorization Bypass
- [ ] TEST 34: SQL Injection
- [ ] TEST 35: XSS Attempts
- [ ] TEST 36: Load Testing
- [ ] TEST 37: Database Performance

---

## Bug Reporting Template

When you find a bug, document it like this:

```
BUG ID: PAY-001
Severity: High/Medium/Low
Title: [Brief description]

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:


Actual Result:


Environment:
- Browser: 
- Role: 
- Date: 

Screenshots:
[Attach if available]

Console Errors:
[Paste any errors]
```

---

## Testing Schedule Recommendation

### Day 1: Basic Functionality
- Admin login & navigation (TEST 1)
- Create salary structures (TEST 2)
- Create & process payrun (TEST 4, 5)
- View payslips (TEST 8)

### Day 2: Advanced Admin Features
- Edit structures (TEST 3)
- Validate & mark paid (TEST 6, 7)
- Print payslips (TEST 9)
- Dashboard (TEST 10)
- Filters (TEST 11)
- Reports (TEST 12)
- Edit deductions (TEST 13)

### Day 3: Other Roles
- Payroll Officer (TEST 14, 15)
- HR Officer (TEST 16, 17, 18)
- Employee (TEST 19-23)

### Day 4: Edge Cases & Security
- Invalid data (TEST 24)
- Concurrent ops (TEST 25)
- Network issues (TEST 26)
- Auth/Authz (TEST 32, 33)
- Injection (TEST 34, 35)

### Day 5: Integration & Performance
- Complete workflow (TEST 29)
- Multi-month (TEST 30)
- Salary changes (TEST 31)
- Load testing (TEST 36)
- Database perf (TEST 37)
- Browser compat (TEST 27)
- Mobile (TEST 28)

---

## Success Criteria

**All tests pass when:**
- ✅ All roles have correct access
- ✅ All payroll operations work correctly
- ✅ All calculations are accurate
- ✅ Reports generate correctly
- ✅ No unauthorized access possible
- ✅ No data corruption
- ✅ No security vulnerabilities
- ✅ Performance is acceptable
- ✅ Error handling is graceful
- ✅ UI is responsive and accessible

---

## Notes

- Test in **order** for Admin tests (TEST 1-13) as they build on each other
- Clear database between major test suites if needed
- Document all bugs found
- Take screenshots of failures
- Check console for errors at each step
- Monitor network tab for API calls
- Verify database state after operations

**Good luck with testing! 🧪**
