'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, employeeAPI } from '@/lib/api';

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

export default function MyProfilePage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('resume');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user info
      const response = await authAPI.getCurrentUser();
      console.log('🔍 Current user response:', response);
      
      if (!response || !response.user) {
        setError('Unable to get current user information');
        return;
      }
      
      setCurrentUser(response.user);
      console.log('👤 User data:', response.user);

      // Get current user's employee profile using the new /me endpoint
      console.log('� Fetching employee profile...');
      const profileResponse = await employeeAPI.getMe();
      
      if (profileResponse && profileResponse.data) {
        console.log('✅ Employee profile loaded:', profileResponse.data);
        setEmployee(profileResponse.data);
      } else {
        setError('Employee profile not found');
      }
    } catch (err: any) {
      console.error('❌ Profile fetch error:', err);
      // Check if it's the "employee not found" error
      if (err.message?.includes('Employee record not found')) {
        setError('Your user account is not linked to an employee record yet. Please contact your administrator to complete your employee profile setup.');
      } else {
        setError(err.message || 'Failed to load your profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const canViewSalary = () => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'PAYROLL_OFFICER';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-black">Loading your profile...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-black">My Profile</h1>
        
        {currentUser ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl text-white font-bold">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-black">{currentUser.email}</h2>
              <p className="text-sm text-purple-600 font-medium mt-1">{currentUser.role}</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Information</h3>
              <p className="text-sm text-yellow-700">{error || 'Employee profile not found'}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-black">Login ID</label>
                  <p className="font-medium text-black">{currentUser.loginId}</p>
                </div>
                <div>
                  <label className="text-sm text-black">Email</label>
                  <p className="font-medium text-black">{currentUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-black">Role</label>
                  <p className="font-medium text-black">{currentUser.role}</p>
                </div>
                <div>
                  <label className="text-sm text-black">Status</label>
                  <p className="font-medium text-black">
                    {currentUser.isActive ? '✅ Active' : '❌ Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Profile not found'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-3">
          👤 My Profile
        </h1>
        <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-xl shadow-lg border-2 border-gray-200">
          <span className={`text-2xl ${employee.user.isActive ? 'animate-pulse' : ''}`}>
            {employee.user.isActive ? '🟢' : '🔴'}
          </span>
          <span className={`text-base font-bold ${employee.user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
            {employee.user.isActive ? 'Active' : 'Inactive'}
          </span>
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
              <p className="text-black">{employee.designation || 'Employee'}</p>
              <p className="text-sm text-purple-600 font-medium mt-1">{currentUser?.role}</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-3 py-2 font-medium text-sm ${
                  activeTab === 'resume'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-black hover:text-black'
                }`}
              >
                Resume
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`px-3 py-2 font-medium text-sm ${
                  activeTab === 'private'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-black hover:text-black'
                }`}
              >
                Private Info
              </button>
              {canViewSalary() && (
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`px-3 py-2 font-medium text-sm ${
                    activeTab === 'salary'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-black hover:text-black'
                  }`}
                >
                  Salary Info
                </button>
              )}
              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-black hover:text-black'
                }`}
              >
                Security
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
                  <div className="mt-6">
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Dashboard/Activity */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm text-black mb-2">Total Attendance</h4>
                  <p className="text-2xl font-bold text-blue-600">{employee.attendances?.length || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm text-black mb-2">Leaves Taken</h4>
                  <p className="text-2xl font-bold text-green-600">{employee.leaves?.length || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm text-black mb-2">Payslips</h4>
                  <p className="text-2xl font-bold text-purple-600">{employee.payslips?.length || 0}</p>
                </div>
              </div>

              {/* Bank Account Warning */}
              {!employee.bankAccountNo && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning</h4>
                  <p className="text-sm text-yellow-700">
                    Your bank account details are not updated. Please contact HR to update your banking information.
                  </p>
                </div>
              )}

              {/* Recent Attendance */}
              <div>
                <h3 className="font-semibold text-black mb-3">Recent Attendance</h3>
                {employee.attendances && employee.attendances.length > 0 ? (
                  <div className="space-y-2">
                    {employee.attendances.slice(0, 5).map((attendance: any) => (
                      <div key={attendance.id} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-black">
                          {new Date(attendance.checkIn).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-black">
                          {new Date(attendance.checkIn).toLocaleTimeString()} - 
                          {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : 'Present'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-black text-center py-8">No attendance records</p>
                )}
              </div>

              {/* Recent Leaves */}
              <div>
                <h3 className="font-semibold text-black mb-3">Recent Leaves</h3>
                {employee.leaves && employee.leaves.length > 0 ? (
                  <div className="space-y-2">
                    {employee.leaves.slice(0, 5).map((leave: any) => (
                      <div key={leave.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-black">{leave.leaveType}</p>
                            <p className="text-xs text-black">
                              {new Date(leave.startDate).toLocaleDateString()} - 
                              {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {leave.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-black text-center py-8">No leave records</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

