'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { salaryStructureAPI, SalaryStructure } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SalaryStructureListPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasPayrollAccess } = useAuth();

  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !hasPayrollAccess()) {
      alert('Access denied. Only Admin, Payroll Officers, and HR Officers can view salary structures.');
      router.push('/dashboard');
      return;
    }
    if (!authLoading) {
      loadStructures();
    }
  }, [authLoading]);

  const loadStructures = async () => {
    try {
      setLoading(true);
      const response = await salaryStructureAPI.getAll();
      setStructures(response.data || []);
    } catch (error: any) {
      console.error('Failed to load salary structures:', error);
      alert('Failed to load salary structures: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, employeeName: string) => {
    const confirm = window.confirm(
      `Delete salary structure for ${employeeName}? This action cannot be undone and may affect future payrun processing.`
    );
    if (!confirm) return;

    try {
      await salaryStructureAPI.delete(id);
      alert('Salary structure deleted successfully');
      await loadStructures();
    } catch (error: any) {
      alert('Failed to delete salary structure: ' + error.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Filter structures based on search term
  const filteredStructures = structures.filter((structure) =>
    structure.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    structure.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    structure.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading salary structures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Structures</h1>
          <p className="text-gray-600 mt-1">Manage employee salary configurations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/payroll')}
            className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
          >
            ← Back to Payroll
          </button>
          <button
            onClick={() => router.push('/dashboard/payroll/salary-structure/create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg"
          >
            + New Salary Structure
          </button>
        </div>
      </div>

      {/* Stats */}
      {structures.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Structures
              </h3>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {structures.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Average Monthly Wage
              </h3>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {formatCurrency(
                structures.reduce((sum, s) => sum + (s.monthlyWage || 0), 0) / structures.length
              )}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Total Monthly Cost
              </h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(
                structures.reduce((sum, s) => sum + (s.monthlyWage || 0), 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee name, code, or department..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Showing {filteredStructures.length} of {structures.length} salary structures
        </p>
      </div>

      {/* Salary Structures Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Salary Structure Records</h3>
        </div>

        {filteredStructures.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📋</span>
            <p className="text-gray-600 mb-2 text-lg font-semibold">
              {searchTerm ? 'No matching salary structures found' : 'No salary structures found'}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Create salary structures for employees before processing payruns'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/dashboard/payroll/salary-structure/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg"
              >
                + Create First Salary Structure
              </button>
            )}
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
                    Department
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Monthly Wage
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    PF %
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Effective From
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStructures.map((structure) => (
                  <tr
                    key={structure.id}
                    className="hover:bg-purple-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{structure.employeeName}</div>
                        <div className="text-sm text-gray-600">{structure.employeeCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{structure.department || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 text-lg">
                      {formatCurrency(structure.monthlyWage)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {structure.pfPercentage || 12}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">
                      {formatDate(structure.effectiveFrom)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/payroll/salary-structure/${structure.id}`)
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(structure.id, structure.employeeName || 'this employee')}
                          className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <div className="flex items-start">
          <span className="text-blue-600 text-xl mr-3">ℹ️</span>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Salary structures must be created before processing payruns for employees</li>
              <li>Monthly wage is automatically broken down into salary components (Basic, HRA, etc.)</li>
              <li>PF percentage defaults to 12% if not specified</li>
              <li>Effective From date determines when this structure becomes active</li>
              <li>Changes to salary structures will affect future payrun calculations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
