'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect based on role
      if (parsedUser.role === 'ADMIN' || parsedUser.role === 'HR_OFFICER') {
        // Admins and HR Officers go to employees page
        router.push('/dashboard/employees');
      } else {
        // Regular employees go to their profile
        router.push('/dashboard/profile');
      }
    } else {
      // Default to profile if no user data
      router.push('/dashboard/profile');
    }
  }, [router]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-4xl font-extrabold">
          Welcome back, {user?.email?.split('@')[0]}! 👋
        </h2>
        <p className="text-blue-100 mt-2 text-lg">Here's what's happening with your organization today.</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl hover:scale-[1.02] hover:border-blue-300 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">Your Role</h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
            {user?.role || 'Loading...'}
          </p>
          <p className="text-sm text-black mt-2 font-medium">Current access level</p>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-300 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">Account Status</h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">{user?.isActive ? '✅' : '⚠️'}</span>
          </div>
          <p className={`text-4xl font-extrabold mt-2 ${user?.isActive ? 'bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'}`}>
            {user?.isActive ? 'Active' : 'Inactive'}
          </p>
          <p className="text-sm text-black mt-2 font-medium">Account is {user?.isActive ? 'operational' : 'suspended'}</p>
        </div>

        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-2xl hover:scale-[1.02] hover:border-purple-300 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">Login ID</h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">🔑</span>
          </div>
          <p className="text-2xl font-mono font-bold text-black mt-2">{user?.loginId || 'Loading...'}</p>
          <p className="text-sm text-black mt-2 font-medium">Your unique identifier</p>
        </div>
      </div>

      {/* Feature Modules Grid */}
      <div>
        <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quick Access</span>
          <span className="text-2xl">⚡</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-2xl hover:scale-[1.05] hover:border-blue-400 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <span className="text-3xl">👥</span>
                </div>
              </div>
              <h4 className="font-bold text-black text-lg">Employees</h4>
              <p className="text-sm text-black mt-2">Manage employee data and profiles</p>
            </div>
          </div>

          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-100 hover:shadow-2xl hover:scale-[1.05] hover:border-emerald-400 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <span className="text-3xl">📅</span>
                </div>
              </div>
              <h4 className="font-bold text-black text-lg">Attendance</h4>
              <p className="text-sm text-black mt-2">Track attendance and timesheets</p>
            </div>
          </div>

          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100 hover:shadow-2xl hover:scale-[1.05] hover:border-purple-400 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <span className="text-3xl">🏖️</span>
                </div>
              </div>
              <h4 className="font-bold text-black text-lg">Leaves</h4>
              <p className="text-sm text-black mt-2">Manage leave requests and balances</p>
            </div>
          </div>

          <div className="group relative bg-white p-6 rounded-2xl shadow-lg border-2 border-amber-100 hover:shadow-2xl hover:scale-[1.05] hover:border-amber-400 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
              <h4 className="font-bold text-black text-lg">Payroll</h4>
              <p className="text-sm text-black mt-2">Process payroll and compensation</p>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activity / Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quick Actions</span>
            <span className="text-xl">⚡</span>
          </h3>
          <div className="space-y-3">
            <button className="group w-full text-left px-5 py-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300">
              <span className="text-black font-semibold flex items-center gap-3">
                <span className="text-xl">👤</span>
                View My Profile
              </span>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="group w-full text-left px-5 py-4 bg-gradient-to-r from-gray-50 to-purple-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-200 hover:border-purple-300">
              <span className="text-black font-semibold flex items-center gap-3">
                <span className="text-xl">🔐</span>
                Change Password
              </span>
              <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="group w-full text-left px-5 py-4 bg-gradient-to-r from-gray-50 to-emerald-50 hover:from-emerald-100 hover:to-green-100 rounded-xl transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-200 hover:border-emerald-300">
              <span className="text-black font-semibold flex items-center gap-3">
                <span className="text-xl">📊</span>
                View Attendance
              </span>
              <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="group w-full text-left px-5 py-4 bg-gradient-to-r from-gray-50 to-pink-50 hover:from-pink-100 hover:to-rose-100 rounded-xl transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-200 hover:border-pink-300">
              <span className="text-black font-semibold flex items-center gap-3">
                <span className="text-xl">🏖️</span>
                Request Leave
              </span>
              <span className="text-pink-600 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 rounded-2xl shadow-2xl text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <h3 className="text-2xl font-extrabold mb-3 flex items-center gap-2">
              Welcome to WorkZen! 
              <span className="text-3xl">🎉</span>
            </h3>
            <p className="text-blue-100 mb-6 text-base leading-relaxed">
              Your comprehensive HRMS solution for managing employees, attendance, leaves, and payroll all in one place.
            </p>
            <div className="space-y-3">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all">
                <span className="mr-3 text-xl">✅</span>
                <span className="font-medium">Real-time attendance tracking</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all">
                <span className="mr-3 text-xl">💸</span>
                <span className="font-medium">Automated payroll processing</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all">
                <span className="mr-3 text-xl">🏖️</span>
                <span className="font-medium">Leave management system</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all">
                <span className="mr-3 text-xl">🔒</span>
                <span className="font-medium">Role-based access control</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

