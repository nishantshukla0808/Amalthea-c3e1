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
  todayStatus?: 'present' | 'leave' | 'absent' | null;
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

  // Auto-refresh employee statuses every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing employee statuses...');
      refreshEmployeeStatuses();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [employees]);

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
      
      // Fetch today's status for all employees
      const employeesWithStatus = await Promise.all(
        response.data.map(async (emp: Employee) => {
          const status = await getTodayStatus(emp.id, emp.user.role);
          return { ...emp, todayStatus: status };
        })
      );
      
      setEmployees(employeesWithStatus);
      setTotalEmployees(response.pagination.total);
    } catch (err: any) {
      console.error('❌ Error loading employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Refresh only the status of existing employees without re-fetching the full list
  const refreshEmployeeStatuses = async () => {
    if (employees.length === 0) return;
    
    try {
      const updatedEmployees = await Promise.all(
        employees.map(async (emp) => {
          const status = await getTodayStatus(emp.id, emp.user.role);
          return { ...emp, todayStatus: status };
        })
      );
      
      setEmployees(updatedEmployees);
      console.log('✅ Employee statuses refreshed');
    } catch (err) {
      console.error('❌ Error refreshing statuses:', err);
    }
  };

  const getTodayStatus = async (employeeId: string, userRole?: string): Promise<'present' | 'leave' | 'absent' | null> => {
    try {
      // Admin users don't need status tracking - they're always considered present
      if (userRole === 'ADMIN') {
        return null;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // Check attendance first
      const attendanceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/attendance?employeeId=${employeeId}&month=${currentMonth}&year=${currentYear}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        const todayAttendance = attendanceData.data?.find((record: any) => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === today;
        });
        
        if (todayAttendance) {
          // Check if it's a leave status
          if (todayAttendance.status === 'LEAVE') {
            return 'leave';
          }
          // If checked in, they're present
          if (todayAttendance.checkIn) {
            return 'present';
          }
        }
      }
      
      // Check if employee has an approved leave today
      const leaveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leaves?employeeId=${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (leaveResponse.ok) {
        const leaveData = await leaveResponse.json();
        const hasLeaveToday = leaveData.data?.some((leave: any) => {
          if (leave.status !== 'APPROVED') return false;
          const leaveStart = new Date(leave.startDate).toISOString().split('T')[0];
          const leaveEnd = new Date(leave.endDate).toISOString().split('T')[0];
          return today >= leaveStart && today <= leaveEnd;
        });
        
        if (hasLeaveToday) {
          return 'leave';
        }
      }
      
      // Default to absent if no attendance and no leave
      return 'absent';
    } catch (error) {
      console.error('Error fetching status:', error);
      return 'absent';
    }
  };

  const getStatusIcon = (status?: 'present' | 'leave' | 'absent' | null) => {
    if (status === null) return null; // No status for admins
    switch (status) {
      case 'present':
        return '🟢'; // Green dot - Present in office
      case 'leave':
        return '✈️'; // Airplane - On leave
      case 'absent':
        return '🟡'; // Yellow dot - Absent (no leave applied)
      default:
        return '⚪'; // Gray - Unknown status
    }
  };

  const getStatusText = (status?: 'present' | 'leave' | 'absent' | null) => {
    if (status === null) return null; // No status for admins
    switch (status) {
      case 'present':
        return 'Present';
      case 'leave':
        return 'On Leave';
      case 'absent':
        return 'Absent';
      default:
        return 'Unknown';
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-black">Loading employees...</div>
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
          <p className="text-base text-black mt-2 font-medium">
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
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black shadow-sm hover:border-purple-300 transition-all"
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
            
            {/* Status Badge in top-right corner - Only show for non-admin users */}
            {employee.todayStatus !== null && (
              <div className="absolute top-3 right-3 z-10 group/status">
                <div className="relative">
                  <span className={`text-2xl transition-transform group-hover:scale-110 ${employee.todayStatus === 'present' ? 'animate-pulse' : ''}`}>
                    {getStatusIcon(employee.todayStatus)}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-200 whitespace-nowrap z-20 shadow-lg">
                    {getStatusText(employee.todayStatus)}
                  </div>
                </div>
              </div>
            )}

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
              <h3 className="font-bold text-black text-xl group-hover:text-purple-600 transition-colors">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-black mt-2 font-semibold">
                {employee.designation || 'No designation'}
              </p>
              <p className="text-xs text-black mt-1 font-medium">
                {employee.department || 'No department'}
              </p>
              <p className="text-xs text-black mt-2 font-mono">
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
          <span className="text-black">
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
          <h3 className="text-xl font-semibold text-black mb-2">
            No employees found
          </h3>
          <p className="text-black">
            {search ? 'Try adjusting your search' : 'Get started by adding your first employee'}
          </p>
        </div>
      )}
    </div>
  );
}

