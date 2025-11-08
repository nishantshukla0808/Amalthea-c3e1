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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl">
        {/* Company Name / Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Company Name</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">HRMS Platform</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {/* Show Employees only for ADMIN and HR_OFFICER */}
          {(user?.role === 'ADMIN' || user?.role === 'HR_OFFICER') && (
            <a
              href="/dashboard/employees"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:translate-x-1 transition-all duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">👥</span>
              <span className="font-medium">Employees</span>
            </a>
          )}
          <a
            href="/dashboard/attendance"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:translate-x-1 transition-all duration-200 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">📅</span>
            <span className="font-medium">Attendance</span>
          </a>
          <a
            href="/dashboard/leave"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:translate-x-1 transition-all duration-200 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">🏖️</span>
            <span className="font-medium">Time Off</span>
          </a>
          <a
            href="/dashboard/payroll"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:translate-x-1 transition-all duration-200 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">💰</span>
            <span className="font-medium">Payroll</span>
          </a>
          <a
            href="/dashboard/reports"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:translate-x-1 transition-all duration-200 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">📊</span>
            <span className="font-medium">Reports</span>
          </a>
          {/* Show Settings only for Admin */}
          {user?.role === 'ADMIN' && (
            <a
              href="/dashboard/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 hover:translate-x-1 transition-all duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">⚙️</span>
              <span className="font-medium">Settings</span>
            </a>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex-1">
              {/* Search or breadcrumb can go here */}
            </div>
            
            {/* User Profile Dropdown */}
            <div className="flex items-center space-x-4">
              {/* User Avatar and Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-md">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                    <span className="text-white font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 font-medium">{user?.role.replace('_', ' ')}</p>
                  </div>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                  <a
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 border-b border-gray-100 transition-all duration-200"
                  >
                    <span className="text-lg">👤</span>
                    <span className="font-medium">My Profile</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-all duration-200"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="font-medium">Log Out</span>
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