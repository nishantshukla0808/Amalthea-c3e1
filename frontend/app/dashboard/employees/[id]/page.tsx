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
    } catch (err: any) {
      setError(err.message || 'Failed to load employee profile');
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
        <div className="text-lg text-gray-600">Loading profile...</div>
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
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Employees
        </button>
        <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-xl shadow-md">
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
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-lg text-gray-600 font-semibold">{employee.designation || 'Employee'}</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b-2 border-gray-200">
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'resume'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📄 Resume
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'private'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
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
                      : 'text-gray-600 hover:bg-gray-100'
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
                    : 'text-gray-600 hover:bg-gray-100'
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
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                      Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Skills</h3>
                      <button className="text-sm text-purple-600 hover:text-purple-700">
                        + Add Skill
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] text-center text-gray-400">
                      No skills added yet
                    </div>
                  </div>

                  {/* Certification Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Certification</h3>
                      <button className="text-sm text-purple-600 hover:text-purple-700">
                        + Add Skill
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] text-center text-gray-400">
                      No certifications added yet
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'private' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Login ID</label>
                      <p className="font-medium text-gray-900">{employee.user.loginId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Company</label>
                      <p className="font-medium text-gray-900">Odeo India</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium text-gray-900">{employee.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Department</label>
                      <p className="font-medium text-gray-900">{employee.department || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Mobile</label>
                      <p className="font-medium text-gray-900">{employee.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Manager</label>
                      <p className="font-medium text-gray-900">N/A</p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Date of Birth</label>
                      <p className="font-medium text-gray-900">
                        {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Gender</label>
                      <p className="font-medium text-gray-900">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Reporting Address</label>
                      <p className="font-medium text-gray-900 text-sm">{employee.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Marital Status</label>
                      <p className="font-medium text-gray-900">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Nationality</label>
                      <p className="font-medium text-gray-900">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Date of Joining</label>
                      <p className="font-medium text-gray-900">
                        {new Date(employee.user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Account Number</label>
                      <p className="font-medium text-gray-900">{employee.bankAccountNo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Bank Name</label>
                      <p className="font-medium text-gray-900">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">IFSC Code</label>
                      <p className="font-medium text-gray-900">{employee.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">PAN No</label>
                      <p className="font-medium text-gray-900">{employee.panNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">UAN No</label>
                      <p className="font-medium text-gray-900">N/A</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Emp Code</label>
                      <p className="font-medium text-gray-900">{employee.employeeId}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'salary' && canViewSalary() && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Salary Information</h3>
                    {employee.salaryStructure ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Month Wage</span>
                          <span className="font-bold text-gray-900 text-lg">₹{employee.salaryStructure.basicSalary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Yearly Wage</span>
                          <span className="font-bold text-gray-900 text-lg">₹{employee.salaryStructure.basicSalary * 12}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No salary information available</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">PAN Number</label>
                    <p className="font-medium text-gray-900">{employee.panNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Aadhar Number</label>
                    <p className="font-medium text-gray-900">{employee.aadharNumber || 'Not provided'}</p>
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
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Total Attendance</h4>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {employee.attendances?.length || 0}
                  </p>
                </div>
                <div className="group bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Leaves Taken</h4>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {employee.leaves?.length || 0}
                  </p>
                </div>
                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Payslips</h4>
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
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📅</span>
                  Recent Attendance
                </h3>
                {employee.attendances && employee.attendances.length > 0 ? (
                  <div className="space-y-3">
                    {employee.attendances.slice(0, 5).map((attendance: any) => (
                      <div key={attendance.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                        <span className="text-sm font-semibold text-gray-700">
                          {new Date(attendance.checkIn).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(attendance.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Present'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl text-center">
                    <p className="text-gray-500 font-medium">No attendance records</p>
                  </div>
                )}
              </div>

              {/* Recent Leaves */}
              <div className="bg-gradient-to-br from-gray-50 to-green-50 p-6 rounded-2xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🏖️</span>
                  Recent Leaves
                </h3>
                {employee.leaves && employee.leaves.length > 0 ? (
                  <div className="space-y-3">
                    {employee.leaves.slice(0, 5).map((leave: any) => (
                      <div key={leave.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-base font-bold text-gray-900">{leave.leaveType}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">
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
                    <p className="text-gray-500 font-medium">No leave records</p>
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
