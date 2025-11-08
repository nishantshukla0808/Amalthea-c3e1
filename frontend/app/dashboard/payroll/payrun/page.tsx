'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payrunAPI, Payrun } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PayrunListPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasPayrollAccess } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payruns, setPayruns] = useState<Payrun[]>([]);
  const [filters, setFilters] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    status: '',
  });

  useEffect(() => {
    if (!authLoading && !hasPayrollAccess()) {
      router.push('/dashboard');
      return;
    }
    if (!authLoading) {
      loadPayruns();
    }
  }, [authLoading, filters]);

  const loadPayruns = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.month) params.month = parseInt(filters.month);
      if (filters.year) params.year = parseInt(filters.year);
      if (filters.status) params.status = filters.status;

      const response = await payrunAPI.getAll(params);
      setPayruns(response.data || []);
    } catch (error: any) {
      console.error('Failed to load payruns:', error);
      alert('Failed to load payruns: ' + error.message);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PROCESSED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payruns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payruns</h1>
          <p className="text-gray-600 mt-1">Manage monthly payroll processing</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/payroll/payrun/create')}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <span className="text-xl">+</span>
          New Payrun
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2025, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PROCESSING">Processing</option>
              <option value="PROCESSED">Processed</option>
              <option value="VALIDATED">Validated</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ month: '', year: new Date().getFullYear().toString(), status: '' })}
              className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payruns List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        {payruns.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-8xl mb-6 block">📅</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Payruns Found</h3>
            <p className="text-gray-600 mb-6">
              {filters.month || filters.status
                ? 'Try adjusting your filters or create a new payrun'
                : 'Create your first payrun to get started'}
            </p>
            <button
              onClick={() => router.push('/dashboard/payroll/payrun/create')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Create Payrun
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Employees
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Total Gross
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Total Net
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payruns.map((payrun) => (
                  <tr
                    key={payrun.id}
                    className="hover:bg-purple-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/payroll/payrun/${payrun.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-xl shadow-md">
                          📅
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatMonth(payrun.month, payrun.year)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(payrun.payPeriodStart).toLocaleDateString('en-GB')} -{' '}
                            {new Date(payrun.payPeriodEnd).toLocaleDateString('en-GB')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          payrun.status
                        )}`}
                      >
                        {payrun.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {payrun.employeeCount}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(payrun.totalGrossWage)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-purple-600">
                      {formatCurrency(payrun.totalNetWage)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/payroll/payrun/${payrun.id}`);
                        }}
                        className="text-purple-600 hover:text-purple-800 font-semibold"
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
