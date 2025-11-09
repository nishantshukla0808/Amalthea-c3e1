'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { employeeAPI } from '@/lib/api';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  department: string | null;
  designation: string | null;
  phoneNumber: string | null;
  address: string | null;
  emergencyContact: string | null;
  bankAccountNo: string | null;
  ifscCode: string | null;
  panNumber: string | null;
  aadharNumber: string | null;
  user: {
    id: string;
    email: string;
    loginId: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  salaryStructure: any;
  attendances: any[];
  leaves: any[];
  payslips: any[];
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('resume');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [todayStatus, setTodayStatus] = useState<'present' | 'leave' | 'absent' | null>('absent');

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    fetchEmployeeProfile();
  }, [params.id]);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getProfile(params.id as string);
      setEmployee(response.data);
      
      // Fetch today's status
      const status = await getTodayStatus(params.id as string, response.data.user.role);
      setTodayStatus(status);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee profile');
    } finally {
      setLoading(false);
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

  const canViewSalary = () => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'PAYROLL_OFFICER';
  };

  const getStatusIcon = (status: 'present' | 'leave' | 'absent' | null) => {
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

  const getStatusText = (status: 'present' | 'leave' | 'absent' | null) => {
    if (status === null) return null; // No status for admins
    switch (status) {
      case 'present':
        return 'Present in Office';
      case 'leave':
        return 'On Leave';
      case 'absent':
        return 'Absent';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: 'present' | 'leave' | 'absent' | null) => {
    if (status === null) return ''; // No status for admins
    switch (status) {
      case 'present':
        return 'bg-emerald-50 border-emerald-300 text-emerald-700';
      case 'leave':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      case 'absent':
        return 'bg-amber-50 border-amber-300 text-amber-700';
      default:
        return 'bg-gray-50 border-gray-300 text-black';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-black">Loading profile...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error || 'Employee not found'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-black hover:text-black font-semibold transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Employees
        </button>
        <div className="flex items-center space-x-3">
          {/* Today's Status - Only show for non-admin users */}
          {todayStatus !== null && (
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-xl shadow-md border-2 ${getStatusColor(todayStatus)}`}>
              <span className={`text-2xl ${todayStatus === 'present' ? 'animate-pulse' : ''}`}>
                {getStatusIcon(todayStatus)}
              </span>
              <div>
                <div className="text-xs font-medium opacity-70">Today's Status</div>
                <div className="text-base font-bold">
                  {getStatusText(todayStatus)}
                </div>
              </div>
            </div>
          )}
          
          {/* Account Status */}
          <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-xl shadow-md border-2 border-gray-200">
            <span className={`text-2xl ${employee.user.isActive ? 'animate-pulse' : ''}`}>
              {employee.user.isActive ? '🟢' : '🔴'}
            </span>
            <div>
              <div className="text-xs font-medium text-black">Account</div>
              <div className={`text-base font-bold ${employee.user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                {employee.user.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
        <div className="flex space-x-8">
          {/* Left Section - Profile Info */}
          <div className="w-1/3 border-r-2 border-gray-200 pr-8">
            {/* Avatar and Name */}
            <div className="text-center mb-8">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white hover:scale-105 transition-transform">
                <span className="text-6xl text-white font-extrabold">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-black mb-2">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-lg text-black font-semibold">{employee.designation || 'Employee'}</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b-2 border-gray-200">
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'resume'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                📄 Resume
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'private'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                🔒 Private Info
              </button>
              {canViewSalary() && (
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === 'salary'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  💰 Salary Info
                </button>
              )}
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'security'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                🛡️ Security
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'resume' && (
                <div className="space-y-6">
                  {/* About Section */}
                  <div>
                    <h3 className="font-semibold text-black mb-2">About</h3>
                    <p className="text-sm text-black leading-relaxed">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                      Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-black">Skills</h3>
                      <button className="text-sm text-purple-600 hover:text-purple-700">
                        + Add Skill
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] text-center text-black">
                      No skills added yet
                    </div>
                  </div>

                  {/* Certification Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-black">Certification</h3>
                      <button className="text-sm text-purple-600 hover:text-purple-700">
                        + Add Skill
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] text-center text-black">
                      No certifications added yet
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'private' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-black">Login ID</label>
                      <p className="font-medium text-black">{employee.user.loginId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Company</label>
                      <p className="font-medium text-black">Odeo India</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Email</label>
                      <p className="font-medium text-black">{employee.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Department</label>
                      <p className="font-medium text-black">{employee.department || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Mobile</label>
                      <p className="font-medium text-black">{employee.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Manager</label>
                      <p className="font-medium text-black">N/A</p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-black">Date of Birth</label>
                      <p className="font-medium text-black">
                        {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Gender</label>
                      <p className="font-medium text-black">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Reporting Address</label>
                      <p className="font-medium text-black text-sm">{employee.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Marital Status</label>
                      <p className="font-medium text-black">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Nationality</label>
                      <p className="font-medium text-black">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Date of Joining</label>
                      <p className="font-medium text-black">
                        {new Date(employee.user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-black">Account Number</label>
                      <p className="font-medium text-black">{employee.bankAccountNo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Bank Name</label>
                      <p className="font-medium text-black">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">IFSC Code</label>
                      <p className="font-medium text-black">{employee.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">PAN No</label>
                      <p className="font-medium text-black">{employee.panNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">UAN No</label>
                      <p className="font-medium text-black">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-black">Emp Code</label>
                      <p className="font-medium text-black">{employee.employeeId}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'salary' && canViewSalary() && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-black mb-4">Salary Information</h3>
                    {employee.salaryStructure ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-black font-medium">Month Wage</span>
                          <span className="font-bold text-black text-lg">₹{employee.salaryStructure.basicSalary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-black font-medium">Yearly Wage</span>
                          <span className="font-bold text-black text-lg">₹{employee.salaryStructure.basicSalary * 12}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-black text-center py-4">No salary information available</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-black">PAN Number</label>
                    <p className="font-medium text-black">{employee.panNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-black">Aadhar Number</label>
                    <p className="font-medium text-black">{employee.aadharNumber || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Dashboard/Activity */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-2">Total Attendance</h4>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {employee.attendances?.length || 0}
                  </p>
                </div>
                <div className="group bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-2">Leaves Taken</h4>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {employee.leaves?.length || 0}
                  </p>
                </div>
                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <h4 className="text-sm font-bold text-black uppercase tracking-wide mb-2">Payslips</h4>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {employee.payslips?.length || 0}
                  </p>
                </div>
              </div>

              {/* Bank Account Warning */}
              {!employee.bankAccountNo && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning</h4>
                  <p className="text-sm text-yellow-700">
                    Employee without bank account. Please update bank details.
                  </p>
                </div>
              )}

              {/* Recent Attendance */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <span>📅</span>
                  Recent Attendance
                </h3>
                {employee.attendances && employee.attendances.length > 0 ? (
                  <div className="space-y-3">
                    {employee.attendances.slice(0, 5).map((attendance: any) => (
                      <div key={attendance.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                        <span className="text-sm font-semibold text-black">
                          {new Date(attendance.checkIn).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-bold text-black">
                          {new Date(attendance.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Present'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl text-center">
                    <p className="text-black font-medium">No attendance records</p>
                  </div>
                )}
              </div>

              {/* Recent Leaves */}
              <div className="bg-gradient-to-br from-gray-50 to-green-50 p-6 rounded-2xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <span>🏖️</span>
                  Recent Leaves
                </h3>
                {employee.leaves && employee.leaves.length > 0 ? (
                  <div className="space-y-3">
                    {employee.leaves.slice(0, 5).map((leave: any) => (
                      <div key={leave.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-base font-bold text-black">{leave.leaveType}</p>
                            <p className="text-sm text-black font-medium mt-1">
                              {new Date(leave.startDate).toLocaleDateString()} - 
                              {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
                            leave.status === 'APPROVED' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                            leave.status === 'REJECTED' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' :
                            'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                          }`}>
                            {leave.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl text-center">
                    <p className="text-black font-medium">No leave records</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
