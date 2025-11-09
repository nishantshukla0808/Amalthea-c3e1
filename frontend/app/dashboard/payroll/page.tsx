'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payrunAPI, payrollDashboardAPI, Payrun } from '@/lib/api/payroll';

export default function PayrollDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentPayruns, setRecentPayruns] = useState<Payrun[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [stats, setStats] = useState({
    employerCost: 0,
    employeeCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load recent payruns
      const payrunsResponse = await payrunAPI.getAll({ limit: 5 });
      setRecentPayruns(payrunsResponse.data || []);

      // Load warnings
      const warningsResponse = await payrollDashboardAPI.getWarnings();
      setWarnings(warningsResponse.data?.warnings || []);

      // Calculate stats from recent payruns
      if (payrunsResponse.data && payrunsResponse.data.length > 0) {
        const latestPayrun = payrunsResponse.data[0];
        setStats({
          employerCost: latestPayrun.totalGrossWage || 0,
          employeeCount: latestPayrun.employeeCount || 0,
        });
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
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
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSED':
        return 'bg-purple-100 text-purple-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-black';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading payroll dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Payroll Dashboard</h1>
          <p className="text-black mt-1">
            Manage payruns, payslips, and salary structures
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/payroll/payrun/create')}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <span className="text-xl">+</span>
          New Payrun
        </button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-600 text-xl mr-3">⚠️</span>
            <div className="flex-1">
              <div className="font-semibold text-red-900 mb-2">Payroll Warnings:</div>
              <ul className="list-disc list-inside space-y-1 text-red-800">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Employer Cost Card */}
        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-2xl hover:scale-[1.02] hover:border-purple-300 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">
              Employer Cost
            </h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatCurrency(stats.employerCost)}
          </p>
          <p className="text-sm text-black mt-2">Latest payrun total</p>
        </div>

        {/* Employee Count Card */}
        <div className="group bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl hover:scale-[1.02] hover:border-blue-300 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">
              Employee Count
            </h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {stats.employeeCount}
          </p>
          <p className="text-sm text-black mt-2">In latest payrun</p>
        </div>

        {/* Payruns Card */}
        <div
          className="group bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-300 transition-all duration-300 cursor-pointer"
          onClick={() => router.push('/dashboard/payroll/payrun')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">
              Payruns
            </h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            {recentPayruns.length}
          </p>
          <p className="text-sm text-black mt-2">View all payruns →</p>
        </div>

        {/* Salary Structures Card */}
        <div
          className="group bg-white p-6 rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-[1.02] hover:border-amber-300 transition-all duration-300 cursor-pointer"
          onClick={() => router.push('/dashboard/payroll/salary-structure')}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">
              Salary Structures
            </h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Manage
          </p>
          <p className="text-sm text-black mt-2">Employee salaries →</p>
        </div>
      </div>

      {/* Recent Payruns */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Recent Payruns</h2>
            <p className="text-black mt-1">Latest payroll processing activities</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/payroll/payrun')}
            className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2"
          >
            View All
            <span>→</span>
          </button>
        </div>

        {recentPayruns.length === 0 ? (
          <div className="text-center py-12 text-black">
            <span className="text-6xl mb-4 block">📅</span>
            <p className="text-lg">No payruns found</p>
            <button
              onClick={() => router.push('/dashboard/payroll/payrun/create')}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Payrun
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayruns.map((payrun) => (
              <div
                key={payrun.id}
                className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-all duration-300"
                onClick={() => router.push(`/dashboard/payroll/payrun/${payrun.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    📅
                  </div>
                  <div>
                    <div className="font-bold text-black">
                      {formatMonth(payrun.month, payrun.year)}
                    </div>
                    <div className="text-sm text-black">
                      {payrun.employeeCount} employees • {formatCurrency(payrun.totalNetWage)} net
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      payrun.status
                    )}`}
                  >
                    {payrun.status}
                  </span>
                  <span className="text-purple-600">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-black mb-2">Quick Actions</h2>
        <p className="text-black mb-6">Common payroll tasks</p>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => router.push('/dashboard/payroll/payrun')}
            className="group text-left p-6 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg"
          >
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">📅</span>
            <div className="font-bold text-black text-lg">View Payruns</div>
            <div className="text-sm text-black mt-1">
              Browse all payroll runs
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/payroll/payslip')}
            className="group text-left p-6 bg-gradient-to-br from-blue-50 to-emerald-50 hover:from-blue-100 hover:to-emerald-100 rounded-xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg"
          >
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">📄</span>
            <div className="font-bold text-black text-lg">View Payslips</div>
            <div className="text-sm text-black mt-1">
              Browse employee payslips
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/payroll/salary-structure')}
            className="group text-left p-6 bg-gradient-to-br from-emerald-50 to-amber-50 hover:from-emerald-100 hover:to-amber-100 rounded-xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-lg"
          >
            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">📊</span>
            <div className="font-bold text-black text-lg">Salary Structures</div>
            <div className="text-sm text-black mt-1">
              Manage employee salaries
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

