# 🤝 Team Coordination Guide - WorkZen HRMS

## 👥 **Team Structure**

### **Agent 1: Frontend Developer** (THIS AGENT)
- **Responsibility**: Next.js UI, Components, User Experience
- **Working Directory**: `/frontend/`
- **Current Status**: Ready to start frontend development

### **Agent 2: Backend Developer**  
- **Responsibility**: REST APIs, Database, Business Logic
- **Working Directory**: `/backend/`
- **Current Status**: 8 APIs completed (Authentication & User Management)

---

## 📂 **Project Structure**

```
Amalthea-c3e1/
│
├── frontend/                   # 🟢 THIS AGENT (Frontend)
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # Reusable React components
│   ├── lib/                   # Frontend utilities, API client
│   ├── public/                # Static assets
│   └── package.json
│
├── backend/                    # 🔴 OTHER AGENT (Backend)
│   ├── src/
│   │   ├── routes/            # API endpoints (auth.ts, users.ts)
│   │   ├── middleware/        # Authentication, validation
│   │   ├── utils/             # Helpers, JWT, password utils
│   │   ├── config/            # Database configuration
│   │   └── index.ts           # Express server entry
│   ├── prisma/                # Database schema & migrations
│   ├── scripts/               # Seed scripts
│   └── package.json
│
├── docs/                       # 📖 SHARED DOCUMENTATION
│   ├── API_DOCUMENTATION.md   # Complete API reference
│   ├── LOGIN-ID-SYSTEM.md     # Login ID generation logic
│   └── TEAM_COORDINATION.md   # This file
│
├── .env                        # Environment variables
├── README.md                   # Project overview
└── .git/                       # Git repository
```

---

## 🔄 **Git Workflow to Avoid Conflicts**

### **Golden Rules:**

1. ✅ **Never work directly on `main` branch**
2. ✅ **Always create feature branches**
3. ✅ **Pull latest changes before starting work**
4. ✅ **Push frequently (at least daily)**
5. ✅ **Create Pull Requests for all changes**
6. ✅ **Review each other's PRs**

---

### **Daily Workflow**

#### **Morning Routine** (Both Agents)
```bash
# 1. Switch to main and pull latest
git checkout main
git pull origin main

# 2. Create feature branch
# Backend: feature/backend-<feature-name>
# Frontend: feature/frontend-<feature-name>
git checkout -b feature/backend-employee-apis
```

#### **During Development**
```bash
# 3. Make changes in your directory only
# Backend: work in /backend/
# Frontend: work in /frontend/

# 4. Commit frequently with clear messages
git add .
git commit -m "feat: add employee list API"

# 5. Push your branch
git push origin feature/backend-employee-apis
```

#### **End of Day**
```bash
# 6. Create Pull Request on GitHub
# - Add clear description
# - Tag the other agent for review
# - Wait for approval before merging

# 7. After merge, delete branch
git checkout main
git pull origin main
git branch -d feature/backend-employee-apis
```

---

## 🚦 **Branch Naming Convention**

### Backend Agent:
```bash
feature/backend-employee-apis
feature/backend-attendance-apis
feature/backend-leave-apis
fix/backend-auth-token-expiry
```

### Frontend Agent:
```bash
feature/frontend-login-page
feature/frontend-dashboard
feature/frontend-employee-list
fix/frontend-navbar-responsive
```

---

## 📝 **Commit Message Format**

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build/config changes

### Examples:

**Backend:**
```bash
git commit -m "feat(backend): add employee management APIs

- GET /api/employees - list all employees
- GET /api/employees/:id - get employee details
- PUT /api/employees/:id - update employee
- DELETE /api/employees/:id - delete employee

Closes #12"
```

**Frontend:**
```bash
git commit -m "feat(frontend): create employee dashboard

- Add employee table component
- Implement search and pagination
- Add role-based access control

Closes #23"
```

---

## 🔒 **Avoiding Merge Conflicts**

### **DO's** ✅

1. **Work in your own directory**
   - **THIS AGENT (Frontend)**: `/frontend/app/`, `/frontend/components/`, `/frontend/lib/`
   - **OTHER AGENT (Backend)**: `/backend/src/`, `/backend/scripts/`

2. **Coordinate on shared files**
   - Before editing `/backend/prisma/schema.prisma`, discuss with backend agent
   - Before editing `.env` or `package.json`, communicate

3. **Pull frequently**
   ```bash
   # Every morning and after lunch
   git checkout main
   git pull origin main
   git checkout your-branch
   git merge main
   ```

4. **Keep branches short-lived**
   - Create small, focused features
   - Merge within 1-3 days
   - Don't let branches diverge too much

5. **Use Pull Requests**
   - Never merge directly to main
   - Always get review from other agent
   - Use PR comments for questions

---

### **DON'Ts** ❌

1. **Don't edit same files simultaneously**
   - If backend needs to update `prisma/schema.prisma`, frontend should wait
   - Coordinate via GitHub Issues or comments

2. **Don't work on main branch**
   ```bash
   # BAD ❌
   git checkout main
   git commit -m "add feature"
   
   # GOOD ✅
   git checkout -b feature/backend-new-api
   git commit -m "feat: add new API"
   ```

3. **Don't merge without testing**
   - Backend: Test APIs with curl/Postman
   - Frontend: Test UI locally
   - Run `npm run build` before merging

4. **Don't forget to update documentation**
   - Backend: Update `docs/API_DOCUMENTATION.md` after adding APIs
   - Frontend: Update component documentation

---

## 📋 **Current Development Plan**

### **THIS AGENT (Frontend) - Priority List**

#### 🚧 **Phase 1: START HERE - Authentication UI**
**Branch**: `feature/frontend-auth-pages`
**Status**: 🔴 Not Started

**Tasks**:
1. Create API client (`frontend/lib/api.ts`)
2. Create login page (`frontend/app/login/page.tsx`)
3. Create dashboard layout (`frontend/app/dashboard/layout.tsx`)
4. Create dashboard home (`frontend/app/dashboard/page.tsx`)

**Pages to Build**:
```
/login          # Login page
/dashboard      # Main dashboard after login
/profile        # User profile page
```

**What APIs Are Available**:
- ✅ POST /api/auth/login - User login
- ✅ GET /api/auth/me - Get current user
- ✅ POST /api/auth/change-password - Change password
- ✅ GET /api/users - List users (Admin/HR)

#### ⏳ **Phase 2: UPCOMING - Employee Management UI**
**Branch**: `feature/frontend-employee-pages`
**Files**: `frontend/app/employees/`

**Pages**:
```
/employees          # Employee list
/employees/[id]     # Employee details  
/employees/new      # Create employee (HR/Admin only)
```

**Depends On**: Backend Employee APIs (being developed by other agent)

#### ⏳ **Phase 3: FUTURE**
- Attendance UI (check-in/out, view records)
- Leave Management UI (apply, approve leaves)
- Payroll UI (view payslips, download PDF)

---

### **OTHER AGENT (Backend) - What They're Working On**

#### ✅ **Completed**
- Authentication APIs (8 endpoints)
- User Management APIs
- Database setup & seeding

#### 🚧 **Next**
- Employee Management APIs
- Attendance APIs
- Leave Management APIs

---

## 🔗 **API Integration**

### **For Frontend Agent:**

#### **1. Create API Client**
Create `frontend/lib/api.ts`:

```typescript
// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

// Example usage:
export const login = (loginId: string, password: string) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ loginId, password }),
  });

export const getEmployees = () =>
  apiRequest('/employees');
```

#### **2. Environment Variables**
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### **3. Test API Integration**
- Backend APIs are already running at `http://localhost:5000`
- Use the test credentials from `docs/API_DOCUMENTATION.md`
- Admin login: `OIADUS20200001` / `Password123!`

---

## 📊 **Communication Checklist**

### **Before Starting Work**
- [ ] Pull latest changes from main
- [ ] Create feature branch
- [ ] Check if anyone else is working on related files

### **During Development**
- [ ] Commit changes frequently
- [ ] Push to remote at least once a day
- [ ] Update documentation if adding new features
- [ ] Test your code thoroughly

### **Before Creating PR**
- [ ] Pull latest main and merge into your branch
- [ ] Resolve any conflicts
- [ ] Run build/test commands
- [ ] Update relevant documentation
- [ ] Write clear PR description

### **After PR Approval**
- [ ] Merge using "Squash and Merge" on GitHub
- [ ] Delete the feature branch
- [ ] Pull latest main
- [ ] Notify other agent about the merge

---

## 🆘 **Handling Merge Conflicts**

If you encounter conflicts:

```bash
# 1. Fetch latest main
git fetch origin main

# 2. Try to merge
git merge origin/main

# 3. If conflicts, open the files in VS Code
# Look for conflict markers:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> origin/main

# 4. Resolve manually, then:
git add <resolved-files>
git commit -m "merge: resolve conflicts with main"
git push
```

**Best Practice**: Communicate via GitHub PR comments when conflicts occur!

---

## 📞 **Communication Channels**

1. **GitHub Issues**: For bugs, feature requests
2. **Pull Request Comments**: For code review, questions
3. **Commit Messages**: For explaining changes
4. **Documentation**: For API specs, design decisions

---

## 🎯 **Next Steps**

### **THIS AGENT (Frontend) - START HERE**

```bash
# 1. Create feature branch
cd frontend
git checkout -b feature/frontend-auth-pages

# 2. Set up API client (FIRST TASK!)
# File: frontend/lib/api.ts
# This will handle all API calls to backend

# 3. Create login page
# File: frontend/app/login/page.tsx
# Use the API client to call POST /api/auth/login

# 4. Create dashboard layout
# File: frontend/app/dashboard/layout.tsx
# Add navigation, sidebar, user menu

# 5. Create dashboard home
# File: frontend/app/dashboard/page.tsx
# Show welcome message, stats, quick actions

# 6. Test login flow
npm run dev
# Test at http://localhost:3000/login
# Use: OIADUS20200001 / Password123!

# 7. Commit, push, create PR
git add .
git commit -m "feat(frontend): create authentication pages"
git push origin feature/frontend-auth-pages
```

### **OTHER AGENT (Backend) - What They'll Do**

```bash
# They will create Employee Management APIs
git checkout -b feature/backend-employee-apis
# Create backend/src/routes/employees.ts
# Implement CRUD endpoints
# Test and document
```

---

## ✅ **Success Criteria**

### THIS AGENT (Frontend):
- [ ] Login page works with backend API
- [ ] JWT token stored and managed properly
- [ ] Protected routes redirect correctly
- [ ] UI is responsive on all devices
- [ ] Loading and error states handled
- [ ] User-friendly error messages
- [ ] Clean, maintainable code

### OTHER AGENT (Backend):
- [ ] APIs return correct data format
- [ ] Role-based access control works
- [ ] Error handling is consistent
- [ ] Documentation is updated
- [ ] Code is tested

---

**Remember**: Communication is key! When in doubt, ask via GitHub PR comments or issues.

**Last Updated**: November 8, 2025
