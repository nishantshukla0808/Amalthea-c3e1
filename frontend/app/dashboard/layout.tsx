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
      console.log('🔒 No token found, redirecting to login...');
      router.push('/login');
      return;
    }

    // Check if user needs to change password
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('🔍 Dashboard: Checking user data:', userData);
      console.log('🔍 Dashboard: mustChangePassword =', userData.mustChangePassword);
      
      if (userData.mustChangePassword === true) {
        console.log('🔑 Dashboard: User must change password, redirecting...');
        router.push('/change-password-first-time');
        return;
      }
    }

    // Verify token and get user
    authAPI.getCurrentUser()
      .then((response) => {
        console.log('✅ Dashboard: Got current user:', response.user);
        // Double check mustChangePassword from server response
        if (response.user.mustChangePassword === true) {
          console.log('🔑 Dashboard: Server says must change password, redirecting...');
          router.push('/change-password-first-time');
          return;
        }
        console.log('✅ Dashboard: User can access dashboard');
        setUser(response.user);
        setLoading(false);
      })
      .catch(() => {
        // Token invalid, redirect to login
        console.log('❌ Dashboard: Token invalid, redirecting to login...');
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    
    // Clear auth state
    authAPI.logout();
    
    // Force clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.clear(); // Clear all localStorage
      sessionStorage.clear(); // Clear sessionStorage too
    }
    
    console.log('✅ Logged out, redirecting to login...');
    
    // Redirect to login
    router.push('/login');
    
    // Force reload to clear any React state
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Company Name / Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Company Name</h1>
          <p className="text-xs text-gray-400 mt-1">HRMS</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Show Employees only for ADMIN and HR_OFFICER */}
          {(user?.role === 'ADMIN' || user?.role === 'HR_OFFICER') && (
            <a
              href="/dashboard/employees"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span>👥</span>
              <span>Employees</span>
            </a>
          )}
          <a
            href="/dashboard/attendance"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>📅</span>
            <span>Attendance</span>
          </a>
          <a
            href="/dashboard/leave"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>🏖️</span>
            <span>Time Off</span>
          </a>
          <a
            href="/dashboard/payroll"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>💰</span>
            <span>Payroll</span>
          </a>
          <a
            href="/dashboard/reports"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>📊</span>
            <span>Reports</span>
          </a>
          <a
            href="/dashboard/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex-1">
              {/* Search or breadcrumb can go here */}
            </div>
            
            {/* User Profile Dropdown */}
            <div className="flex items-center space-x-4">
              {/* User Avatar and Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <span className="text-gray-400">▼</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <a
                    href="/dashboard/profile"
                    className="block px-4 py-3 hover:bg-gray-50 text-gray-700 border-b border-gray-100"
                  >
                    👤 My Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600"
                  >
                    🚪 Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}