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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Employees
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{employee.user.isActive ? '🟢' : '🔴'}</span>
          <span className="text-sm text-gray-600">
            {employee.user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-8">
          {/* Left Section - Profile Info */}
          <div className="w-1/3 border-r border-gray-200 pr-6">
            {/* Avatar and Name */}
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl text-white font-bold">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-gray-600">{employee.designation || 'Employee'}</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'resume'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Resume
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'private'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Private Info
              </button>
              {canViewSalary() && (
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'salary'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Salary Info
                </button>
              )}
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'security'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
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
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Salary Information</h3>
                    {employee.salaryStructure ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Month Wage</span>
                          <span className="font-medium">₹{employee.salaryStructure.basicSalary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Yearly Wage</span>
                          <span className="font-medium">₹{employee.salaryStructure.basicSalary * 12}</span>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-2">Total Attendance</h4>
                  <p className="text-2xl font-bold text-blue-600">{employee.attendances?.length || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-2">Leaves Taken</h4>
                  <p className="text-2xl font-bold text-green-600">{employee.leaves?.length || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-2">Payslips</h4>
                  <p className="text-2xl font-bold text-purple-600">{employee.payslips?.length || 0}</p>
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
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recent Attendance</h3>
                {employee.attendances && employee.attendances.length > 0 ? (
                  <div className="space-y-2">
                    {employee.attendances.slice(0, 5).map((attendance: any) => (
                      <div key={attendance.id} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-700">
                          {new Date(attendance.checkIn).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(attendance.checkIn).toLocaleTimeString()} - 
                          {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : 'Present'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attendance records</p>
                )}
              </div>

              {/* Recent Leaves */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recent Leaves</h3>
                {employee.leaves && employee.leaves.length > 0 ? (
                  <div className="space-y-2">
                    {employee.leaves.slice(0, 5).map((leave: any) => (
                      <div key={leave.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{leave.leaveType}</p>
                            <p className="text-xs text-gray-600">
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
                  <p className="text-gray-500 text-center py-8">No leave records</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
