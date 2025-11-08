'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { payrunAPI, Payrun, Payslip } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PayrunDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const payrunId = params.id as string;
  const { user, loading: authLoading, hasPayrollAccess, canManagePayroll } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payrun, setPayrun] = useState<Payrun | null>(null);

  useEffect(() => {
    if (!authLoading && !hasPayrollAccess()) {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && payrunId) {
      loadPayrun();
    }
  }, [authLoading, payrunId]);

  const loadPayrun = async () => {
    try {
      setLoading(true);
      const response = await payrunAPI.getById(payrunId);
      setPayrun(response.data);
    } catch (error: any) {
      console.error('Failed to load payrun:', error);
      alert('Failed to load payrun: ' + error.message);
      router.push('/dashboard/payroll/payrun');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!canManagePayroll()) {
      alert('Only Admin and Payroll Officers can process payruns');
      return;
    }

    const confirm = window.confirm(
      'Process this payrun? This will calculate and generate payslips for all employees with salary structures.'
    );
    if (!confirm) return;

    try {
      setProcessing(true);
      const response = await payrunAPI.process(payrunId);
      alert(
        `Payrun processed successfully!\n\nEmployees: ${response.data.employeeCount}\nTotal Gross: ₹${response.data.totalGrossWage}\nTotal Net: ₹${response.data.totalNetWage}`
      );
      await loadPayrun();
    } catch (error: any) {
      alert('Failed to process payrun: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleValidate = async () => {
    if (!canManagePayroll()) {
      alert('Only Admin and Payroll Officers can validate payruns');
      return;
    }

    const confirm = window.confirm('Validate this payrun? This will check for any issues and warnings.');
    if (!confirm) return;

    try {
      setProcessing(true);
      const response = await payrunAPI.validate(payrunId);
      if (response.data.warnings && response.data.warnings.length > 0) {
        alert(`Payrun validated with warnings:\n\n${response.data.warnings.join('\n')}`);
      } else {
        alert('Payrun validated successfully with no warnings!');
      }
      await loadPayrun();
    } catch (error: any) {
      alert('Failed to validate payrun: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!canManagePayroll()) {
      alert('Only Admin and Payroll Officers can mark payruns as paid');
      return;
    }

    const confirm = window.confirm(
      'Mark this payrun as PAID? This will lock all payslips and they cannot be edited anymore.'
    );
    if (!confirm) return;

    try {
      setProcessing(true);
      await payrunAPI.markPaid(payrunId);
      alert('Payrun marked as PAID successfully! All payslips are now locked.');
      await loadPayrun();
    } catch (error: any) {
      alert('Failed to mark payrun as paid: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!canManagePayroll()) {
      alert('Only Admin and Payroll Officers can delete payruns');
      return;
    }

    const confirm = window.confirm(
      'Delete this payrun? This action cannot be undone and will delete all associated payslips.'
    );
    if (!confirm) return;

    try {
      setProcessing(true);
      await payrunAPI.delete(payrunId);
      alert('Payrun deleted successfully');
      router.push('/dashboard/payroll/payrun');
    } catch (error: any) {
      alert('Failed to delete payrun: ' + error.message);
      setProcessing(false);
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
          <p className="mt-4 text-gray-600">Loading payrun details...</p>
        </div>
      </div>
    );
  }

  if (!payrun) {
    return <div>Payrun not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/payroll/payrun')}
          className="text-purple-600 hover:text-purple-800 font-semibold mb-4 flex items-center gap-2"
        >
          ← Back to Payruns
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {formatMonth(payrun.month, payrun.year)}
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                  payrun.status
                )}`}
              >
                {payrun.status}
              </span>
            </h1>
            <p className="text-gray-600 mt-1">
              Pay Period: {new Date(payrun.payPeriodStart).toLocaleDateString('en-GB')} to{' '}
              {new Date(payrun.payPeriodEnd).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {payrun.warnings && payrun.warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-3">⚠️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">Warnings:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                {payrun.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {canManagePayroll() && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {payrun.status === 'DRAFT' && (
              <button
                onClick={handleProcess}
                disabled={processing}
                className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-2">⚙️</div>
                Process Payrun
              </button>
            )}

            {payrun.status === 'PROCESSED' && (
              <>
                <button
                  onClick={handleValidate}
                  disabled={processing}
                  className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl mb-2">✓</div>
                  Validate
                </button>
              </>
            )}

            {payrun.status === 'VALIDATED' && (
              <button
                onClick={handleMarkPaid}
                disabled={processing}
                className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-2">💰</div>
                Mark as Paid
              </button>
            )}

            {['DRAFT', 'PROCESSED'].includes(payrun.status) && (
              <button
                onClick={handleDelete}
                disabled={processing}
                className="p-4 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-2">🗑️</div>
                Delete Payrun
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Employees
            </h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {payrun.employeeCount}
          </p>
          <p className="text-sm text-gray-600 mt-2">Total employees in payrun</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Total Gross
            </h3>
            <span className="text-2xl">💵</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatCurrency(payrun.totalGrossWage)}
          </p>
          <p className="text-sm text-gray-600 mt-2">Before deductions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Total Net
            </h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(payrun.totalNetWage)}
          </p>
          <p className="text-sm text-gray-600 mt-2">Final payout amount</p>
        </div>
      </div>

      {/* Payslips List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Payslips</h3>
          <p className="text-gray-600 text-sm mt-1">
            {payrun.payslips?.length || 0} payslips in this payrun
          </p>
        </div>

        {!payrun.payslips || payrun.payslips.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📄</span>
            <p className="text-gray-600 mb-4">
              {payrun.status === 'DRAFT'
                ? 'Process the payrun to generate payslips'
                : 'No payslips generated yet'}
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrun.payslips.map((payslip: Payslip) => (
                  <tr key={payslip.id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{payslip.employeeName}</div>
                        <div className="text-sm text-gray-600">{payslip.employeeCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(payslip.grossSalary)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      - {formatCurrency(payslip.totalDeductions)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {formatCurrency(payslip.netSalary)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => router.push(`/dashboard/payroll/payslip/${payslip.id}`)}
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

      {/* Metadata */}
      {payrun.processedAt && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Processing History</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {payrun.processedAt && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Processed At</div>
                <div className="font-semibold text-gray-900">
                  {new Date(payrun.processedAt).toLocaleString('en-GB')}
                </div>
              </div>
            )}
            {payrun.validatedAt && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Validated At</div>
                <div className="font-semibold text-gray-900">
                  {new Date(payrun.validatedAt).toLocaleString('en-GB')}
                </div>
              </div>
            )}
            {payrun.paidAt && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Paid At</div>
                <div className="font-semibold text-gray-900">
                  {new Date(payrun.paidAt).toLocaleString('en-GB')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
