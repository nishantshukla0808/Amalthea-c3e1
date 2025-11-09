'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { employeeAPI } from '@/lib/api';

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  
  // Generate serial number once and keep it stable
  const [serialNumber] = useState(() => 
    Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0')
  );

  // Get current user's role
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserRole(user.role);
    }
  }, []);

  const [formData, setFormData] = useState({
    companyName: 'Odeon Institute',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
    department: '',
    designation: '',
    dateOfBirth: '',
    dateOfJoining: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    basicSalary: '',
  });

  // Generate Login ID based on company name and employee details
  const generateLoginId = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfJoining) {
      return 'Fill all details to generate Login ID';
    }

    // Extract company initials (OI for Odeon Institute)
    const companyInitials = formData.companyName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    // Get first two letters of first name and last name
    const nameInitials = (
      formData.firstName.substring(0, 2) +
      formData.lastName.substring(0, 2)
    ).toUpperCase();

    // Get year from joining date (YYYY format)
    const year = formData.dateOfJoining.split('-')[0];

    // Use the stable serial number from state
    // Format: OI + Name Initials + Year + Serial
    // Example: OIJODO20220001
    return `${companyInitials}${nameInitials}${year}${serialNumber}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate the login ID
      const loginId = generateLoginId();
      
      console.log('📝 Creating employee with data:', {
        ...formData,
        loginId,
      });

      const response = await employeeAPI.create({
        // User fields
        loginId,
        email: formData.email,
        password: formData.password,
        role: formData.role,

        // Employee fields
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        department: formData.department || undefined,
        designation: formData.designation || undefined,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
          dateOfJoining: formData.dateOfJoining ? new Date(formData.dateOfJoining).toISOString() : undefined,
          address: formData.address || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        basicSalary: formData.basicSalary ? parseFloat(formData.basicSalary) : undefined,
      });

      console.log('✅ Employee created:', response);

      // Show success message and redirect
      alert(`Employee created successfully!\n\nLogin ID: ${loginId}\nPassword: ${formData.password}\n\nPlease save these credentials.`);
      router.push('/dashboard/employees');
    } catch (err: any) {
      console.error('❌ Error creating employee:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const previewLoginId = generateLoginId();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Add New Employee</h1>
          <p className="text-sm text-black mt-1">
            Fill in the details to create a new employee account
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Logo/Name Section */}
          <div className="text-center pb-6 border-b border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-3">
              <span className="text-3xl text-white">🏢</span>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-black mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black text-center"
                required
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black border-b pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black border-b pb-2">
              Employment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Engineering, HR, Sales"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer, Manager"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Date of Joining <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                  required
                >
                  <option value="EMPLOYEE">Employee</option>
                  {currentUserRole === 'ADMIN' && (
                    <>
                      <option value="HR_OFFICER">HR Officer</option>
                      <option value="PAYROLL_OFFICER">Payroll Officer</option>
                      <option value="ADMIN">Admin</option>
                    </>
                  )}
                  {currentUserRole === 'HR_OFFICER' && (
                    <>
                      <option value="HR_OFFICER">HR Officer</option>
                      <option value="PAYROLL_OFFICER">Payroll Officer</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Basic Salary (₹)
                </label>
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black border-b pb-2">
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                />
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black border-b pb-2">
              Account Credentials
            </h3>
            
            {/* Auto-generated Login ID Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <label className="block text-sm font-medium text-black mb-2">
                Login ID (Auto-generated)
              </label>
              <div className="font-mono text-lg text-blue-900 font-semibold">
                {previewLoginId}
              </div>
              <p className="text-xs text-black mt-2">
                Format: {formData.companyName.split(' ').map(w => w[0]).join('')} + First Name (2 letters) + Last Name (2 letters) + Year of Joining + Serial Number
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-black hover:text-black"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-black mt-1">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-black hover:text-black"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Note about credentials */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> The system will auto-generate a Login ID. 
                The employee can login with this ID and the password you set here. 
                They can change the password after first login.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

