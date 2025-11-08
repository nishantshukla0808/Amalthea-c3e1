'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';

interface User {
  id: string;
  loginId: string;
  email: string;
  role: 'EMPLOYEE' | 'HR_OFFICER' | 'PAYROLL_OFFICER' | 'ADMIN';
  employee?: {
    firstName: string;
    lastName: string;
  };
}

interface AccessRights {
  employees: boolean;
  attendance: boolean;
  timeOff: boolean;
  payroll: boolean;
  reports: boolean;
  settings: boolean;
}

interface UserWithAccess extends User {
  accessRights: AccessRights;
  accessMode: 'role-based' | 'custom';
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<UserWithAccess[]>([]);
  const [selectedTab, setSelectedTab] = useState<'user-settings' | 'company'>('user-settings');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      // Only Admin can access settings
      if (user.role !== 'ADMIN') {
        setError('Access denied. Only administrators can access settings.');
        setLoading(false);
        return;
      }
      
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      
      // Transform API response to include access rights
      const usersWithAccess: UserWithAccess[] = response.data.map((user: User) => ({
        ...user,
        accessRights: getDefaultAccessRightsByRole(user.role),
        accessMode: 'role-based' as const,
      }));
      
      setUsers(usersWithAccess);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAccessRightsByRole = (role: string): AccessRights => {
    // Define default access rights based on role
    switch (role) {
      case 'ADMIN':
        return {
          employees: true,
          attendance: true,
          timeOff: true,
          payroll: true,
          reports: true,
          settings: true,
        };
      case 'HR_OFFICER':
        return {
          employees: true,
          attendance: true,
          timeOff: true,
          payroll: false,
          reports: true,
          settings: false,
        };
      case 'PAYROLL_OFFICER':
        return {
          employees: false,
          attendance: true,
          timeOff: true,
          payroll: true,
          reports: true,
          settings: false,
        };
      case 'EMPLOYEE':
      default:
        return {
          employees: false,
          attendance: true,
          timeOff: true,
          payroll: false,
          reports: false,
          settings: false,
        };
    }
  };

  const handleAccessRightChange = (userId: string, module: keyof AccessRights, value: boolean) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          accessRights: {
            ...user.accessRights,
            [module]: value,
          },
        };
      }
      return user;
    }));
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setError('');
      await userAPI.updateRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            role: newRole as User['role'],
            accessRights: getDefaultAccessRightsByRole(newRole),
            accessMode: 'role-based' as const,
          };
        }
        return user;
      }));
      
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleAccessModeChange = (userId: string, mode: 'role-based' | 'custom') => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          accessMode: mode,
          // If switching back to role-based, reset to default rights
          accessRights: mode === 'role-based' ? getDefaultAccessRightsByRole(user.role) : user.accessRights,
        };
      }
      return user;
    }));
  };

  const getRoleOptions = (role: string) => {
    const allRoles = ['EMPLOYEE', 'ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'];
    return allRoles;
  };

  const getModuleLabel = (module: keyof AccessRights) => {
    const labels: Record<keyof AccessRights, string> = {
      employees: 'Employees',
      attendance: 'Attendance',
      timeOff: 'Time Off',
      payroll: 'Payroll',
      reports: 'Reports',
      settings: 'Settings',
    };
    return labels[module];
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      EMPLOYEE: 'Employee / Admin / HR Officer / Payroll Officer',
      ADMIN: 'Employee / Admin / HR Officer / Payroll Officer',
      HR_OFFICER: 'Employee / Admin / HR Officer / Payroll Officer',
      PAYROLL_OFFICER: 'Employee / Admin / HR Officer / Payroll Officer',
    };
    return descriptions[role] || '';
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const userName = user.employee ? `${user.employee.firstName} ${user.employee.lastName}`.toLowerCase() : user.email.split('@')[0].toLowerCase();
    const loginId = user.loginId.toLowerCase();
    const email = user.email.toLowerCase();
    
    return userName.includes(query) || loginId.includes(query) || email.includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure system settings and user access rights
        </p>
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

      {/* Tabs */}
      <div className="bg-gray-800 rounded-t-lg">
        <div className="flex gap-2 p-1">
          <button
            onClick={() => setSelectedTab('company')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'company'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Logo/Company Name
          </button>
          <button
            onClick={() => setSelectedTab('user-settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'user-settings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            User Setting
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg shadow-sm border border-gray-200">
        {selectedTab === 'user-settings' && (
          <div className="p-6">
            {/* Description */}
            <div className="mb-6 text-sm text-gray-600 space-y-2">
              <p>- In the Admin Settings, the administrator can assign user access rights based on each user's role.</p>
              <p>- Access rights can be configured on an module basis, allowing specific permissions for each module.</p>
              <div className="mt-4">
                <p className="text-gray-700">
                  Select user access rights as per their role and responsibilities. These access rights define what users are allowed to access and what they are restricted from accessing.
                </p>
                <p className="text-gray-500 italic mt-1">
                  Employee / Admin / HR Officer / Payroll Officer
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name, email, or login ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* User Access Rights Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Module
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      User name
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Login id
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Role
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Access Mode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <>
                      {/* User Info Row */}
                      <tr key={user.id} className="bg-gray-800">
                        <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-white">
                          {/* Empty for first row */}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-white">
                          {user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email.split('@')[0]}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-white">
                          {user.loginId}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-white">
                          {user.email}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-500 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {getRoleOptions(user.role).map((role) => (
                              <option key={role} value={role}>
                                {role.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm">
                          <select
                            value={user.accessMode}
                            onChange={(e) => handleAccessModeChange(user.id, e.target.value as 'role-based' | 'custom')}
                            className="w-full px-2 py-1 border border-gray-500 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="role-based">Role Based</option>
                            <option value="custom">Custom</option>
                          </select>
                        </td>
                      </tr>

                      {/* Module Access Rights Rows - Only show when Custom mode is selected */}
                      {user.accessMode === 'custom' && (Object.keys(user.accessRights) as Array<keyof AccessRights>).map((module) => (
                        <tr key={`${user.id}-${module}`} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                            {getModuleLabel(module)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3" colSpan={4}>
                            {/* Empty cells */}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={user.accessRights[module]}
                              onChange={(e) => handleAccessRightChange(user.id, module, e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  // TODO: Save access rights
                  setSuccess('Access rights updated successfully');
                  setTimeout(() => setSuccess(''), 3000);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {selectedTab === 'company' && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <span className="text-gray-400 text-sm">Logo Preview</span>
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Upload Logo
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 200x200px, PNG or JPG</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
