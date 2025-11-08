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
  const [hasFullDayLeave, setHasFullDayLeave] = useState(false);
  const [hasHalfDayLeave, setHasHalfDayLeave] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState<any>(null);

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
      
      // For employees and HR, check if checked in/out today and leave status
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

        // Check if user has an approved leave today
        try {
          const leaveResponse = await attendanceAPI.checkLeaveStatus();
          setHasFullDayLeave(leaveResponse.hasFullDayLeave);
          setHasHalfDayLeave(leaveResponse.hasHalfDayLeave);
          setLeaveDetails(leaveResponse.leaveDetails);
        } catch (leaveErr) {
          console.error('Failed to check leave status:', leaveErr);
          // Don't show error for leave check failure, just proceed without leave info
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
          
          {/* Leave Status Info */}
          {hasFullDayLeave && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">You have an approved full-day leave today</p>
                <p className="text-xs text-amber-700 mt-1">
                  Leave Type: {leaveDetails?.leaveType?.replace('_', ' ')} | {new Date(leaveDetails?.startDate).toLocaleDateString()} - {new Date(leaveDetails?.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          
          {hasHalfDayLeave && !hasFullDayLeave && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-800">You have an approved half-day leave today</p>
                <p className="text-xs text-blue-700 mt-1">
                  Leave Type: {leaveDetails?.leaveType?.replace('_', ' ')} | You can still check in for the working half
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedInToday || checkInOutLoading || hasFullDayLeave}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {checkInOutLoading ? 'Processing...' : hasCheckedInToday ? '✓ Already Checked In' : hasFullDayLeave ? '🚫 Leave Today' : '→ Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!hasCheckedInToday || hasCheckedOutToday || checkInOutLoading || hasFullDayLeave}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {checkInOutLoading ? 'Processing...' : hasCheckedOutToday ? '✓ Already Checked Out' : hasFullDayLeave ? '🚫 Leave Today' : '← Check Out'}
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousMonth}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{monthName}</h3>
            <button
              onClick={handleNextMonth}
              disabled={currentMonth === new Date().getMonth() + 1 && currentYear === new Date().getFullYear()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-medium"
            >
              <span>Next</span>
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
