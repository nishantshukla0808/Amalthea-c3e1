'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payrunAPI } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CreatePayrunPage() {
  const router = useRouter();
  const { user, loading: authLoading, canManagePayroll } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!authLoading && !canManagePayroll()) {
      alert('Access denied. Only Admin and Payroll Officers can create payruns.');
      router.push('/dashboard/payroll');
    }
  }, [authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.month || !formData.year) {
      alert('Please select both month and year');
      return;
    }

    const confirm = window.confirm(
      `Create payrun for ${new Date(formData.year, formData.month - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })}?`
    );

    if (!confirm) return;

    try {
      setLoading(true);
      const response = await payrunAPI.create({
        month: formData.month,
        year: formData.year,
      });

      alert('Payrun created successfully!');
      router.push(`/dashboard/payroll/payrun/${response.data.id}`);
    } catch (error: any) {
      console.error('Failed to create payrun:', error);
      alert('Failed to create payrun: ' + error.message);
      setLoading(false);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-purple-600 hover:text-purple-800 font-semibold mb-4 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Payrun</h1>
        <p className="text-gray-600 mt-1">
          Set up a new monthly payroll processing cycle
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Month Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Month <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {monthNames.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => setFormData({ ...formData, month: index + 1 })}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.month === index + 1
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-lg transform scale-105'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="font-semibold">{month.substring(0, 3)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Year <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setFormData({ ...formData, year })}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.year === year
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-lg transform scale-105'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="font-bold">{year}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview</h3>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {new Date(formData.year, formData.month - 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Pay Period: {new Date(formData.year, formData.month - 1, 1).toLocaleDateString('en-GB')} to{' '}
              {new Date(formData.year, formData.month, 0).toLocaleDateString('en-GB')}
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  <li>Payrun will be created in DRAFT status</li>
                  <li>You'll need to process it to generate payslips</li>
                  <li>Ensure employees have salary structures before processing</li>
                  <li>Attendance data will be used for calculations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : (
                'Create Payrun'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
