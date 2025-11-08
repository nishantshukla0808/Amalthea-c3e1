# 🗺️ Payroll System Navigation Guide

## Quick Access Menu

```
🏠 Dashboard (/dashboard/payroll)
│
├── 📊 Payruns (/dashboard/payroll/payrun)
│   ├── ➕ Create New Payrun (/dashboard/payroll/payrun/create)
│   └── 📄 View Payrun Details (/dashboard/payroll/payrun/[id])
│       ├── ⚙️ Process (DRAFT → PROCESSED)
│       ├── ✅ Validate (PROCESSED → VALIDATED)
│       └── 💰 Mark Paid (VALIDATED → PAID)
│
├── 📋 Payslips (/dashboard/payroll/payslip)
│   └── 📄 View Payslip (/dashboard/payroll/payslip/[id])
│       ├── 🖨️ Print
│       ├── 🔄 Recalculate (if editable)
│       └── 🗑️ Delete (if editable)
│
└── 💰 Salary Structures (/dashboard/payroll/salary-structure)
    ├── ➕ Create New Structure (/dashboard/payroll/salary-structure/create)
    └── ✏️ Edit Structure (/dashboard/payroll/salary-structure/[id])
```

---

## 📱 Page Screenshots & Features

### 1. Main Dashboard
**URL**: `/dashboard/payroll`
**Role Required**: ADMIN, PAYROLL_OFFICER, HR_OFFICER

```
┌─────────────────────────────────────────────────────────┐
│  📊 Payroll Dashboard                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [💰 Employer Cost]  [👥 Employees]  [📊 Payruns]      │
│     ₹1,50,000            3              2               │
│                                                          │
│  Recent Payruns:                                        │
│  • January 2025 - PAID      - ₹50,000                  │
│  • December 2024 - VALIDATED - ₹48,000                 │
│                                                          │
│  ⚠️ Warnings:                                           │
│  • 2 employees missing salary structures                │
│                                                          │
│  [View All Payruns]  [View Payslips]  [Structures]    │
└─────────────────────────────────────────────────────────┘
```

### 2. Payrun List
**URL**: `/dashboard/payroll/payrun`
**Role Required**: ADMIN, PAYROLL_OFFICER, HR_OFFICER

```
┌─────────────────────────────────────────────────────────┐
│  Payruns                         [+ New Payrun]         │
├─────────────────────────────────────────────────────────┤
│  Filters:                                               │
│  [Month ▼] [Year ▼] [Status ▼]  [Apply] [Clear]       │
├─────────────────────────────────────────────────────────┤
│  Period       Status      Employees  Gross     Net      │
│  ──────────────────────────────────────────────────────│
│  Jan 2025     🟢 PAID          3     ₹50K    ₹45K  →  │
│  Dec 2024     🔵 VALIDATED     3     ₹48K    ₹43K  →  │
│  Nov 2024     🟣 PROCESSED     3     ₹47K    ₹42K  →  │
└─────────────────────────────────────────────────────────┘
```

### 3. Create Payrun
**URL**: `/dashboard/payroll/payrun/create`
**Role Required**: ADMIN, PAYROLL_OFFICER ⭐

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Payruns                                      │
│  Create Payrun                                          │
├─────────────────────────────────────────────────────────┤
│  Select Month:                                          │
│  [Jan] [Feb] [Mar] [Apr] [May] [Jun]                  │
│  [Jul] [Aug] [Sep] [Oct] [Nov] [Dec]                  │
│                                                          │
│  Select Year:                                           │
│  [2023] [2024] [2025] [2026] [2027]                    │
│                                                          │
│  Preview:                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ January 2025                                     │   │
│  │ Pay Period: 01/01/2025 - 31/01/2025            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ℹ️ Important Notes:                                    │
│  • Payrun will be created in DRAFT status              │
│  • Must process to generate payslips                    │
│                                                          │
│  [Cancel] [✓ Create Payrun]                            │
└─────────────────────────────────────────────────────────┘
```

### 4. Payrun Details
**URL**: `/dashboard/payroll/payrun/[id]`
**Role Required**: View (ADMIN, PAYROLL_OFFICER, HR_OFFICER) | Actions (ADMIN, PAYROLL_OFFICER)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Payruns                                      │
│  January 2025  [🟣 PROCESSED]                          │
├─────────────────────────────────────────────────────────┤
│  ⚠️ Warnings:                                           │
│  • Employee EMP001 has 0 worked days                   │
│                                                          │
│  Actions:                                               │
│  [✓ Validate]  [🗑️ Delete Payrun]                     │
├─────────────────────────────────────────────────────────┤
│  [👥 3 Employees]  [💵 ₹50,000]  [💰 ₹45,000]        │
│                                                          │
│  Payslips (3):                                          │
│  ──────────────────────────────────────────────────────│
│  Alice Smith   EMP001   ₹18K  -₹2K   ₹16K      →     │
│  Bob Johnson   EMP002   ₹17K  -₹2K   ₹15K      →     │
│  Charlie Brown EMP003   ₹15K  -₹1K   ₹14K      →     │
└─────────────────────────────────────────────────────────┘
```

### 5. Payslip List
**URL**: `/dashboard/payroll/payslip`
**Role Required**: All (Employees see only their own)

```
┌─────────────────────────────────────────────────────────┐
│  Payslips                                               │
├─────────────────────────────────────────────────────────┤
│  Filters:                                               │
│  [Month ▼] [Year ▼] [Employee ID]  [Apply] [Clear]    │
├─────────────────────────────────────────────────────────┤
│  [📄 22 payslips]  [💵 ₹5.5L Total]  [💰 ₹5L Net]    │
├─────────────────────────────────────────────────────────┤
│  Employee      Period      Gross    Deductions  Net     │
│  ──────────────────────────────────────────────────────│
│  Alice Smith   Jan 2025   ₹18K      -₹2K      ₹16K  → │
│  Bob Johnson   Jan 2025   ₹17K      -₹2K      ₹15K  → │
│  Charlie Brown Jan 2025   ₹15K      -₹1K      ₹14K  → │
└─────────────────────────────────────────────────────────┘
```

### 6. Payslip Details (Print View)
**URL**: `/dashboard/payroll/payslip/[id]`
**Role Required**: All (Employees see only their own) | Actions (ADMIN, PAYROLL_OFFICER)

```
┌─────────────────────────────────────────────────────────┐
│  🖨️ [Print] 🔄 [Recalculate] 🗑️ [Delete]              │
├─────────────────────────────────────────────────────────┤
│  ═══════════════════════════════════════════════════   │
│  WorkZen HRMS                                           │
│  Payslip for January 2025                              │
│  ═══════════════════════════════════════════════════   │
│                                                          │
│  Employee Information:                                  │
│  • Name: Alice Smith         • Code: EMP001            │
│  • Department: Engineering   • Location: Gandhinagar   │
│  • PAN: ABCDE1234F          • UAN: 123456789012       │
│  • Pay Period: 01/01/2025 - 31/01/2025               │
│                                                          │
│  [Salary Computation] [Worked Days]                    │
│                                                          │
│  ┌─── Earnings ────┐  ┌─── Deductions ────┐          │
│  │ Basic:    ₹8,000│  │ PF Emp:     ₹960  │          │
│  │ HRA:      ₹4,000│  │ PF Empr:    ₹960  │          │
│  │ Std Allow: ₹4,167│  │ Prof Tax:   ₹200  │          │
│  │ Perf Bonus: ₹667│  │ TDS:        ₹500  │          │
│  │ LTA:       ₹667│  │ Other:      ₹100  │          │
│  │ Fixed:    ₹2,499│  │                   │          │
│  ├─────────────────┤  ├───────────────────┤          │
│  │ Total:  ₹20,000│  │ Total:     ₹2,720 │          │
│  └─────────────────┘  └───────────────────┘          │
│                                                          │
│  ╔═══════════════════════════════════════════════╗     │
│  ║  Net Salary: ₹17,280                          ║     │
│  ║  Seventeen Thousand Two Hundred Eighty Only   ║     │
│  ╚═══════════════════════════════════════════════╝     │
│                                                          │
│  This is a computer-generated document.                │
└─────────────────────────────────────────────────────────┘
```

### 7. Salary Structure List
**URL**: `/dashboard/payroll/salary-structure`
**Role Required**: ADMIN, PAYROLL_OFFICER, HR_OFFICER

```
┌─────────────────────────────────────────────────────────┐
│  Salary Structures              [+ New Structure]       │
├─────────────────────────────────────────────────────────┤
│  [🔍 Search by name, code, or department...]  [Clear]  │
├─────────────────────────────────────────────────────────┤
│  [📋 25]  [💵 Avg: ₹35K]  [💰 Total: ₹8.75L]          │
├─────────────────────────────────────────────────────────┤
│  Employee      Dept         Wage    PF%   Effective     │
│  ──────────────────────────────────────────────────────│
│  Alice Smith   Engineering  ₹40K    12%   01/01/2024   │
│                EMP001                      [Edit] [Del] │
│  Bob Johnson   Marketing    ₹35K    12%   15/03/2024   │
│                EMP002                      [Edit] [Del] │
└─────────────────────────────────────────────────────────┘
```

### 8. Create/Edit Salary Structure
**URL**: `/dashboard/payroll/salary-structure/create` or `/[id]`
**Role Required**: ADMIN, PAYROLL_OFFICER, HR_OFFICER

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Salary Structures                            │
│  Create Salary Structure                                │
├─────────────────────────────────────────────────────────┤
│  Basic Information:                                     │
│  • Employee ID*:    [____________________________]     │
│  • Monthly Wage*:   [₹ 50,000____________]            │
│  • Effective From*: [2025-01-01___]                   │
│  • PF Percentage:   [12%_______]                      │
│                                                          │
│  Optional Settings:                                     │
│  • Professional Tax: [₹ 200____]                      │
│  • Working Days/Week: [5____]                         │
│  • Working Hours/Day: [8____]                         │
│                                                          │
│  📊 Salary Breakdown Preview:                          │
│  ┌────────────────────────────────────────────────┐   │
│  │ Earnings:               Deductions:             │   │
│  │ • Basic (50%):  ₹25,000  • PF Emp:    ₹3,000  │   │
│  │ • HRA (50%):    ₹12,500  • PF Empr:   ₹3,000  │   │
│  │ • Std Allow:     ₹4,167  • Prof Tax:    ₹200  │   │
│  │ • Perf Bonus:    ₹2,083                        │   │
│  │ • LTA:           ₹2,083  Estimated Net:        │   │
│  │ • Fixed:         ₹4,167    ₹43,800             │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
│  [Cancel] [✓ Create Salary Structure]                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Navigation

### As PAYROLL_OFFICER (payroll@workzen.com)
✅ Full Access to All Pages:
- Dashboard (view stats, warnings)
- Payruns (list, create, view, process, validate, mark paid, delete)
- Payslips (list all, view details, recalculate, delete)
- Salary Structures (list, create, edit, delete)

### As HR_OFFICER (hr@workzen.com)
⚠️ Limited Access:
- Dashboard (view stats, warnings)
- Payruns (list, view) - **Cannot create/process**
- Payslips (list all, view details) - **Cannot modify**
- Salary Structures (list, create, edit, delete)

### As EMPLOYEE (alice@workzen.com)
🔒 Restricted Access:
- Dashboard - **Access Denied**
- Payruns - **Access Denied**
- Payslips (view own only)
- Salary Structures - **Access Denied**

---

## ⚡ Quick Actions Cheat Sheet

### Creating a Complete Payroll Cycle
```
1. Create Salary Structures
   → Salary Structures → Create New
   → Enter employee IDs and wages
   → Save

2. Create Monthly Payrun
   → Payruns → New Payrun
   → Select month/year
   → Create

3. Process Payrun
   → Click payrun → Process
   → Generates payslips

4. Validate Payrun
   → Validate button
   → Check warnings

5. Mark as Paid
   → Mark Paid button
   → Locks payslips

6. View/Print Payslips
   → Payslips → Select employee
   → Print
```

### Common Tasks
```
Edit Salary:
→ Structures → Click employee → Edit → Save

Recalculate Payslip:
→ Payslips → Select → Recalculate

Delete Draft Payrun:
→ Payruns → Click payrun → Delete

Search Payslips:
→ Payslips → Filter by month/year → Apply
```

---

## 🎨 Color Code Reference

### Status Colors
- 🟢 **PAID** - Green (final, locked)
- 🔵 **VALIDATED** - Blue (approved, ready for payment)
- 🟣 **PROCESSED** - Purple (payslips generated)
- 🟡 **PROCESSING** - Yellow (in progress)
- ⚪ **DRAFT** - Gray (editable)

### Action Button Colors
- 🟣 **Purple Gradient** - Primary actions (Create, Save)
- 🔵 **Blue** - Edit actions
- 🟢 **Green** - Success actions (Mark Paid, Validate)
- 🔴 **Red** - Destructive actions (Delete)
- ⚪ **Gray** - Secondary actions (Cancel, Back)

---

## 💡 Tips & Tricks

### Navigation
- Use browser **Back** button or page **Back** links
- Main dashboard has quick access cards
- All list pages have filters and search

### Data Entry
- Form fields with * are required
- Preview updates in real-time
- Confirmation dialogs prevent accidental actions

### Viewing Data
- Click table rows to view details
- Use filters to narrow down results
- Print button creates printer-friendly layout

### Troubleshooting
- If employee not found: Check employee ID is correct UUID
- If payrun fails: Ensure employees have salary structures
- If payslip locked: Payrun is PAID, cannot edit
- If access denied: Check your role permissions

---

## 📞 Quick Reference

### URLs
```
Main Dashboard:       /dashboard/payroll
Payruns:             /dashboard/payroll/payrun
Create Payrun:       /dashboard/payroll/payrun/create
Payslips:            /dashboard/payroll/payslip
Salary Structures:   /dashboard/payroll/salary-structure
```

### Test Accounts
```
Payroll Officer:  payroll@workzen.com / Password123!
HR Officer:       hr@workzen.com / Password123!
Admin:            admin@workzen.com / Password123!
Employee:         alice@workzen.com / Password123!
```

### Test Employee IDs
```
Alice:   00000000-0000-4000-8000-000000000110
Bob:     00000000-0000-4000-8000-000000000111
Charlie: 00000000-0000-4000-8000-000000000112
```

---

**Need help?** Refer to `PAYROLL_FRONTEND_INTEGRATION_GUIDE.md` for detailed API documentation and examples.
