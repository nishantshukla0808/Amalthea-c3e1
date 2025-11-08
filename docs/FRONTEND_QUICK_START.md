# 🎨 YOUR TASK: Frontend Development Guide

## 👋 **Welcome, Frontend Agent!**

You are the **Frontend Developer** for WorkZen HRMS. The backend is already running with 8 APIs ready for you to use. Let's build an amazing UI!

---

## 🎯 **Quick Summary**

- **Your Role**: Build Next.js frontend
- **Your Directory**: `/frontend/` (work here only!)
- **Backend Status**: ✅ Running at `http://localhost:5000` with 8 APIs ready
- **Your First Task**: Create login page and dashboard
- **Timeline**: Start now, Phase 1 takes 1-2 days

---

## 🚀 **Phase 1: Authentication UI (START HERE)**

### **Task 1: Create API Client** ⭐ (Do This First!)

**File**: `frontend/lib/api.ts`

```typescript
// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
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

// Auth API functions
export const authAPI = {
  login: (loginId: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
    }),

  getCurrentUser: () => apiRequest('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// User API functions
export const userAPI = {
  getAll: () => apiRequest('/users'),
  getById: (id: string) => apiRequest(`/users/${id}`),
  create: (userData: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};
```

---

### **Task 2: Create Environment File**

**File**: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### **Task 3: Create Login Page** ⭐

**File**: `frontend/app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData.loginId, formData.password);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            WorkZen HRMS
          </h2>
          <p className="text-center text-sm text-gray-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
              Login ID
            </label>
            <input
              id="loginId"
              type="text"
              required
              value={formData.loginId}
              onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="OIADUS20200001"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Test Credentials:</p>
          <p className="font-mono">OIADUS20200001 / Password123!</p>
        </div>
      </div>
    </div>
  );
}
```

---

### **Task 4: Create Dashboard Layout** ⭐

**File**: `frontend/app/dashboard/layout.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token and get user
    authAPI.getCurrentUser()
      .then((response) => {
        setUser(response.user);
        setLoading(false);
      })
      .catch(() => {
        // Token invalid, redirect to login
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">WorkZen HRMS</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.email} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

---

### **Task 5: Create Dashboard Home** ⭐

**File**: `frontend/app/dashboard/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">
        Welcome back, {user?.email?.split('@')[0]}!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Your Role</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{user?.role}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {user?.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-2 space-y-2">
            <button className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
              View Profile
            </button>
            <button className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h4 className="font-semibold">Employees</h4>
          <p className="text-sm text-gray-600 mt-1">Manage employee data</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h4 className="font-semibold">Attendance</h4>
          <p className="text-sm text-gray-600 mt-1">Track attendance</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h4 className="font-semibold">Leaves</h4>
          <p className="text-sm text-gray-600 mt-1">Manage leave requests</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h4 className="font-semibold">Payroll</h4>
          <p className="text-sm text-gray-600 mt-1">Process payroll</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 **Testing Your Work**

### **Step 1**: Start the dev server
```bash
cd frontend
npm run dev
```

### **Step 2**: Open browser
Navigate to: `http://localhost:3000/login`

### **Step 3**: Test login
Use these credentials:
- Login ID: `OIADUS20200001`
- Password: `Password123!`

### **Step 4**: Verify
- ✅ Login should work
- ✅ Should redirect to `/dashboard`
- ✅ Dashboard should show user info
- ✅ Logout should work

---

## 📋 **Checklist**

- [ ] Create `frontend/lib/api.ts`
- [ ] Create `frontend/.env.local`
- [ ] Create `frontend/app/login/page.tsx`
- [ ] Create `frontend/app/dashboard/layout.tsx`
- [ ] Create `frontend/app/dashboard/page.tsx`
- [ ] Test login flow
- [ ] Test logout
- [ ] Commit and push

---

## 🚀 **Git Workflow**

```bash
# 1. Create branch
cd frontend
git checkout -b feature/frontend-auth-pages

# 2. Make changes (create files above)

# 3. Commit
git add .
git commit -m "feat(frontend): create authentication pages and dashboard"

# 4. Push
git push origin feature/frontend-auth-pages

# 5. Create Pull Request on GitHub
```

---

## 📖 **Resources**

- `docs/API_DOCUMENTATION.md` - Backend API reference
- `docs/TEAM_COORDINATION.md` - Git workflow
- Backend APIs running at: `http://localhost:5000`

---

## ✅ **Success Criteria**

You're done with Phase 1 when:
- ✅ Login page works and looks good
- ✅ JWT token is stored in localStorage
- ✅ Dashboard redirects unauthorized users to login
- ✅ User info displays correctly
- ✅ Logout works
- ✅ Code is clean and organized

---

## 🎉 **You Got This!**

The backend is ready, APIs are documented, test credentials are available. Just follow this guide step-by-step and you'll have a working authentication system in no time!

**Questions?** Check `docs/API_DOCUMENTATION.md` or `docs/FRONTEND_AGENT_PROMPT.md`

**Good luck! 🚀**

---

**Last Updated**: November 8, 2025
