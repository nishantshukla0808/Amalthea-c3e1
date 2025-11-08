'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payslipAPI, Payslip } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PayslipListPage() {
  const router = useRouter();
  const { user, loading: authLoading, canViewPayroll, isEmployee } = useAuth();

  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    employeeId: '',
  });

  // Generate month options
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Generate year options (current year + 2 previous years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!authLoading && !canViewPayroll()) {
      router.push('/dashboard');
      return;
    }
    if (!authLoading) {
      loadPayslips();
    }
  }, [authLoading]);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // If employee role, fetch only their payslips
      if (isEmployee() && user?.employeeId) {
        params.employeeId = user.employeeId;
      } else if (filters.employeeId) {
        params.employeeId = filters.employeeId;
      }
      
      if (filters.month) params.month = parseInt(filters.month);
      if (filters.year) params.year = parseInt(filters.year);

      const response = await payslipAPI.getAll(params);
      setPayslips(response.data || []);
    } catch (error: any) {
      console.error('Failed to load payslips:', error);
      alert('Failed to load payslips: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ month: '', year: '', employeeId: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payslips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payslips</h1>
          <p className="text-gray-600 mt-1">
            {isEmployee() ? 'Your payslip history' : 'All employee payslips'}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/payroll')}
          className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
        >
          ← Back to Payroll
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Employee ID Filter - Only for non-employee roles */}
          {!isEmployee() && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                placeholder="Enter employee ID"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={loadPayslips}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {payslips.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Payslips
              </h3>
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {payslips.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Gross
              </h3>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {formatCurrency(
                payslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0)
              )}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Net
              </h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(
                payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Payslips Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Payslip Records</h3>
          <p className="text-gray-600 text-sm mt-1">{payslips.length} payslips found</p>
        </div>

        {payslips.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📋</span>
            <p className="text-gray-600 mb-2 text-lg font-semibold">No payslips found</p>
            <p className="text-gray-500 text-sm">
              {isEmployee()
                ? 'You have no payslips yet. Payslips are generated during payrun processing.'
                : 'Try adjusting your filters or create a new payrun to generate payslips.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Period
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Gross Salary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Editable
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payslips.map((payslip) => (
                  <tr
                    key={payslip.id}
                    onClick={() => router.push(`/dashboard/payroll/payslip/${payslip.id}`)}
                    className="hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{payslip.employeeName}</div>
                        <div className="text-sm text-gray-600">{payslip.employeeCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {formatMonth(payslip.month, payslip.year)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(payslip.payPeriodStart).toLocaleDateString('en-GB')} -{' '}
                        {new Date(payslip.payPeriodEnd).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(payslip.grossSalary)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      - {formatCurrency(payslip.totalDeductions)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600 text-lg">
                      {formatCurrency(payslip.netSalary)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {payslip.isEditable ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          🔒 Locked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/payroll/payslip/${payslip.id}`);
                        }}
                        className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                      >
                        View Details →
                      </button>
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
