'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Redirect to employees page
    router.push('/dashboard/employees');
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.email?.split('@')[0]}!
        </h2>
        <p className="text-gray-600 mt-1">Here's what's happening with your organization today.</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Your Role</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{user?.role || 'Loading...'}</p>
          <p className="text-sm text-gray-600 mt-1">Current access level</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Account Status</h3>
          <p className={`text-3xl font-bold mt-2 ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {user?.isActive ? 'Active' : 'Inactive'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Account is {user?.isActive ? 'operational' : 'suspended'}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Login ID</h3>
          <p className="text-xl font-mono font-bold text-gray-900 mt-2">{user?.loginId || 'Loading...'}</p>
          <p className="text-sm text-gray-600 mt-1">Your unique identifier</p>
        </div>
      </div>

      {/* Feature Modules Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900">Employees</h4>
            <p className="text-sm text-gray-600 mt-1">Manage employee data and profiles</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900">Attendance</h4>
            <p className="text-sm text-gray-600 mt-1">Track attendance and timesheets</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏖️</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900">Leaves</h4>
            <p className="text-sm text-gray-600 mt-1">Manage leave requests and balances</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900">Payroll</h4>
            <p className="text-sm text-gray-600 mt-1">Process payroll and compensation</p>
          </div>

        </div>
      </div>

      {/* Recent Activity / Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between">
              <span className="text-gray-900">View My Profile</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between">
              <span className="text-gray-900">Change Password</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between">
              <span className="text-gray-900">View Attendance</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between">
              <span className="text-gray-900">Request Leave</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-lg shadow-sm text-white">
          <h3 className="text-lg font-semibold mb-2">Welcome to WorkZen!</h3>
          <p className="text-blue-100 mb-4">
            Your comprehensive HRMS solution for managing employees, attendance, leaves, and payroll all in one place.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Real-time attendance tracking</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Automated payroll processing</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Leave management system</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Role-based access control</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}