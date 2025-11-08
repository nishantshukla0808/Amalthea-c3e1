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
    <div className="space-y-6">
      {/* Header with Company Name */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: {totalEmployees} employees
          </p>
        </div>
        
        {/* VIEW Toggle - can add later */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/dashboard/employees/add')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer relative"
            onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
          >
            {/* Status Dot in top-right corner */}
            <div className="absolute top-2 right-2">
              <span className="text-xl">{getStatusDot(employee.user.isActive)}</span>
            </div>

            {/* Employee Avatar */}
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white font-bold">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Employee Info */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 text-lg">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {employee.designation || 'No designation'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
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
