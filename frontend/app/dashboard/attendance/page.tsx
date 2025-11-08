'use client';

import { useState, useEffect } from 'react';
import { attendanceAPI } from '@/lib/api';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY';
  remarks: string | null;
  employee?: {
    firstName: string;
    lastName: string;
    department: string;
  };
}

interface Statistics {
  total: number;
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  totalHours: number;
  avgHours: number;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false);
  const [checkInOutLoading, setCheckInOutLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get current month and year from selectedDate
  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      fetchAttendance(user.role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, currentMonth, currentYear]);

  const fetchAttendance = async (userRole: string) => {
    try {
      setLoading(true);
      setError('');

      // Get attendance for the selected month for all users
      const response = await attendanceAPI.getAll({
        month: currentMonth,
        year: currentYear,
        limit: 1000, // Higher limit for admin/HR to see all employees
      });

      setAttendanceRecords(response.data || []);
      
      // For employees and HR, check if checked in/out today
      if (userRole === 'EMPLOYEE' || userRole === 'HR_OFFICER') {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = response.data?.find((record: AttendanceRecord) => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === today;
        });

        if (todayRecord) {
          setHasCheckedInToday(true);
          setHasCheckedOutToday(!!todayRecord.checkOut);
        } else {
          setHasCheckedInToday(false);
          setHasCheckedOutToday(false);
        }
      }

      // Calculate statistics
      calculateStatistics(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch attendance:', err);
      // Check if it's an employee not found error
      if (err.message?.includes('Employee record not found') || err.message?.includes('Employee not found')) {
        setError('Your user account is not linked to an employee record yet. Please contact your administrator to complete your employee profile setup.');
      } else {
        setError(err.message || 'Failed to load attendance records');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (records: AttendanceRecord[]) => {
    const stats = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      halfDay: records.filter(r => r.status === 'HALF_DAY').length,
      leave: records.filter(r => r.status === 'LEAVE').length,
      totalHours: records.reduce((sum, r) => sum + (r.workingHours || 0), 0),
      avgHours: 0,
    };
    stats.avgHours = stats.total > 0 ? stats.totalHours / stats.total : 0;
    setStatistics(stats);
  };

  const handleCheckIn = async () => {
    try {
      setCheckInOutLoading(true);
      setError('');
      setSuccess('');

      await attendanceAPI.checkIn();
      setSuccess('Checked in successfully!');
      setHasCheckedInToday(true);
      
      // Refresh attendance data
      if (currentUser) {
        fetchAttendance(currentUser.role);
      }
    } catch (err: any) {
      // Check if it's an employee not found error
      if (err.message?.includes('Employee record not found') || err.message?.includes('Employee not found')) {
        setError('Your user account is not linked to an employee record yet. Please contact your administrator to complete your employee profile setup.');
      } else {
        setError(err.message || 'Failed to check in');
      }
    } finally {
      setCheckInOutLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckInOutLoading(true);
      setError('');
      setSuccess('');

      await attendanceAPI.checkOut();
      setSuccess('Checked out successfully!');
      setHasCheckedOutToday(true);
      
      // Refresh attendance data
      if (currentUser) {
        fetchAttendance(currentUser.role);
      }
    } catch (err: any) {
      // Check if it's an employee not found error
      if (err.message?.includes('Employee record not found') || err.message?.includes('Employee not found')) {
        setError('Your user account is not linked to an employee record yet. Please contact your administrator to complete your employee profile setup.');
      } else {
        setError(err.message || 'Failed to check out');
      }
    } finally {
      setCheckInOutLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      PRESENT: { bg: 'bg-green-100', text: 'text-green-800' },
      ABSENT: { bg: 'bg-red-100', text: 'text-red-800' },
      HALF_DAY: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      LEAVE: { bg: 'bg-blue-100', text: 'text-blue-800' },
      HOLIDAY: { bg: 'bg-purple-100', text: 'text-purple-800' },
    };

    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading attendance...</div>
      </div>
    );
  }

  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const isHR = currentUser?.role === 'HR_OFFICER';
  const canMarkAttendance = isEmployee || isHR;
  const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEmployee ? 'My Attendance' : 'Attendance Management'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEmployee 
              ? `View your attendance records for ${monthName}` 
              : isHR
              ? `Mark your attendance and view all employees' records for ${monthName}`
              : `View all employees' attendance for ${monthName}`
            }
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Check-in/Check-out Buttons - For Employees and HR */}
      {canMarkAttendance && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Off</h2>
          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedInToday || checkInOutLoading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {checkInOutLoading ? 'Processing...' : hasCheckedInToday ? 'Already Checked In' : 'Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!hasCheckedInToday || hasCheckedOutToday || checkInOutLoading}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {checkInOutLoading ? 'Processing...' : hasCheckedOutToday ? 'Already Checked Out' : 'Check Out'}
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{statistics.present}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leave</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.leave}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Hours</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.avgHours.toFixed(1)}h</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month Navigation */}
      {(isEmployee || currentUser?.role === 'ADMIN' || currentUser?.role === 'HR_OFFICER') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousMonth}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Previous</span>
            </button>
            <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
            <button
              onClick={handleNextMonth}
              disabled={currentMonth === new Date().getMonth() + 1 && currentYear === new Date().getFullYear()}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="text-sm font-medium">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
        </div>
        
        {attendanceRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {!isEmployee && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {!isEmployee && record.employee && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee.firstName} {record.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{record.employee.department}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.checkOut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.workingHours ? `${record.workingHours.toFixed(2)}h` : '0.00h'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.workingHours > 8 ? `+${(record.workingHours - 8).toFixed(2)}h` : '0.00h'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
