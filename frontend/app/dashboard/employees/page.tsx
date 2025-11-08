'use client';

import { useEffect, useState } from 'react';
import { employeeAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string | null;
  designation: string | null;
  phoneNumber: string | null;
  user: {
    email: string;
    isActive: boolean;
    role: string;
  };
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [search, currentPage]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching employees...');
      
      const response = await employeeAPI.getAll({
        page: currentPage,
        limit: 12,
        search: search || undefined,
      });
      
      console.log('✅ Employees loaded:', response.data.length);
      setEmployees(response.data);
      setTotalEmployees(response.pagination.total);
    } catch (err: any) {
      console.error('❌ Error loading employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusDot = (isActive: boolean) => {
    if (isActive) return '🟢'; // Green - Present
    return '⚪'; // Gray - Inactive
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Company Name */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            Employees 👥
          </h1>
          <p className="text-base text-gray-600 mt-2 font-medium">
            Total: <span className="font-bold text-purple-600">{totalEmployees}</span> employees
          </p>
        </div>
        
        {/* VIEW Toggle - can add later */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/dashboard/employees/add')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Employee
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, department, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 shadow-sm hover:border-purple-300 transition-all"
          />
          <span className="absolute right-5 top-4 text-2xl">🔍</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-md">
          <span className="text-2xl">⚠️</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.03] hover:border-purple-300 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
          >
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Status Badge in top-right corner */}
            <div className="absolute top-3 right-3 z-10">
              <span className={`text-2xl transition-transform group-hover:scale-110 ${employee.user.isActive ? 'animate-pulse' : ''}`}>
                {getStatusDot(employee.user.isActive)}
              </span>
            </div>

            {/* Employee Avatar */}
            <div className="relative flex justify-center mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all ring-4 ring-white">
                <span className="text-4xl text-white font-extrabold">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Employee Info */}
            <div className="relative text-center">
              <h3 className="font-bold text-gray-900 text-xl group-hover:text-purple-600 transition-colors">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-gray-600 mt-2 font-semibold">
                {employee.designation || 'No designation'}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {employee.department || 'No department'}
              </p>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                {employee.employeeId}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/employees/${employee.id}`);
                }}
                className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/employees/${employee.id}/edit`);
                }}
                className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalEmployees > 12 && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {Math.ceil(totalEmployees / 12)}
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage >= Math.ceil(totalEmployees / 12)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {employees.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No employees found
          </h3>
          <p className="text-gray-600">
            {search ? 'Try adjusting your search' : 'Get started by adding your first employee'}
          </p>
        </div>
      )}
    </div>
  );
}
