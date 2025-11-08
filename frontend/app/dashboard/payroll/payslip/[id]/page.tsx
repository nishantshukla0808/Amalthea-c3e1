'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { payslipAPI, Payslip } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PayslipDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const payslipId = params.id as string;
  const { user, loading: authLoading, canViewPayroll, isEmployee, canManagePayroll } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [activeTab, setActiveTab] = useState<'workedDays' | 'salaryComputation'>('salaryComputation');

  useEffect(() => {
    if (!authLoading && !canViewPayroll()) {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && payslipId) {
      loadPayslip();
    }
  }, [authLoading, payslipId]);

  const loadPayslip = async () => {
    try {
      setLoading(true);
      const response = await payslipAPI.getById(payslipId);
      
      // If employee role, check if this is their payslip
      if (isEmployee() && user?.employeeId && response.data.employeeId !== user.employeeId) {
        alert('Access denied. You can only view your own payslips.');
        router.push('/dashboard/payroll/payslip');
        return;
      }
      
      setPayslip(response.data);
    } catch (error: any) {
      console.error('Failed to load payslip:', error);
      alert('Failed to load payslip: ' + error.message);
      router.push('/dashboard/payroll/payslip');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!canManagePayroll()) {
      alert('Only Admin and Payroll Officers can recalculate payslips');
      return;
    }

    if (!payslip?.isEditable) {
      alert('This payslip cannot be recalculated as it is locked (payrun is PAID)');
      return;
    }

    const confirm = window.confirm(
      'Recalculate this payslip? This will recompute all earnings and deductions based on attendance and salary structure.'
    );
    if (!confirm) return;

    try {
      setProcessing(true);
      const response = await payslipAPI.recalculate(payslipId);
      alert('Payslip recalculated successfully!');
      setPayslip(response.data);
    } catch (error: any) {
      alert('Failed to recalculate payslip: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!canManagePayroll()) {
      alert('Only Admin and Payroll Officers can delete payslips');
      return;
    }

    if (!payslip?.isEditable) {
      alert('This payslip cannot be deleted as it is locked (payrun is PAID)');
      return;
    }

    const confirm = window.confirm(
      'Delete this payslip? This action cannot be undone. You will need to process the payrun again to regenerate it.'
    );
    if (!confirm) return;

    try {
      setProcessing(true);
      await payslipAPI.delete(payslipId);
      alert('Payslip deleted successfully');
      router.push('/dashboard/payroll/payslip');
    } catch (error: any) {
      alert('Failed to delete payslip: ' + error.message);
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const numberToWords = (num: number): string => {
    // Simplified number to words converter
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convert = (n: number): string => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
    };
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let words = convert(rupees) + ' Rupees';
    if (paise > 0) words += ' and ' + convert(paise) + ' Paise';
    return words + ' Only';
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payslip...</p>
        </div>
      </div>
    );
  }

  if (!payslip) {
    return <div>Payslip not found</div>;
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - Hide action buttons on print */}
      <div className="print:hidden">
        <button
          onClick={() => router.push('/dashboard/payroll/payslip')}
          className="text-purple-600 hover:text-purple-800 font-semibold mb-4 flex items-center gap-2"
        >
          ← Back to Payslips
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payslip Details</h1>
            <p className="text-gray-600 mt-1">
              {formatMonth(payslip.month, payslip.year)} - {payslip.employeeName}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              🖨️ Print
            </button>
            {canManagePayroll() && payslip.isEditable && (
              <>
                <button
                  onClick={handleRecalculate}
                  disabled={processing}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg disabled:opacity-50"
                >
                  🔄 Recalculate
                </button>
                <button
                  onClick={handleDelete}
                  disabled={processing}
                  className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payslip Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 print:shadow-none print:border-black">
        {/* Company Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl print:rounded-none print:bg-purple-700">
          <h2 className="text-2xl font-bold">WorkZen HRMS</h2>
          <p className="text-purple-100 mt-1">Payslip for {formatMonth(payslip.month, payslip.year)}</p>
        </div>

        {/* Employee Information */}
        <div className="p-6 border-b border-gray-200 print:p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-gray-600">Employee Name</div>
              <div className="font-semibold text-gray-900">{payslip.employeeName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Employee Code</div>
              <div className="font-semibold text-gray-900">{payslip.employeeCode}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Department</div>
              <div className="font-semibold text-gray-900">{payslip.department || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Location</div>
              <div className="font-semibold text-gray-900">{payslip.location || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">PAN</div>
              <div className="font-semibold text-gray-900">{payslip.pan || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">UAN</div>
              <div className="font-semibold text-gray-900">{payslip.uan || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Pay Period</div>
              <div className="font-semibold text-gray-900">
                {new Date(payslip.payPeriodStart).toLocaleDateString('en-GB')} to{' '}
                {new Date(payslip.payPeriodEnd).toLocaleDateString('en-GB')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Days in Month</div>
              <div className="font-semibold text-gray-900">{payslip.daysInMonth}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Working Days</div>
              <div className="font-semibold text-gray-900">{payslip.workedDays}</div>
            </div>
          </div>
        </div>

        {/* Tabs - Hide on print, show both sections */}
        <div className="print:hidden border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('salaryComputation')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'salaryComputation'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Salary Computation
            </button>
            <button
              onClick={() => setActiveTab('workedDays')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'workedDays'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Worked Days
            </button>
          </div>
        </div>

        {/* Worked Days Tab */}
        <div className={`p-6 print:p-4 ${activeTab === 'workedDays' ? 'block' : 'hidden print:block'}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 print:mt-4">Attendance Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Days</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Days in Month</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{payslip.daysInMonth}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Present Days</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-green-600">{payslip.presentDays}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Absent Days</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-red-600">{payslip.absentDays}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Paid Time Off (Leave)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-blue-600">{payslip.paidTimeOff}</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Total Worked Days</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold text-purple-600">{payslip.workedDays}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Salary Computation Tab */}
        <div className={`p-6 print:p-4 ${activeTab === 'salaryComputation' ? 'block' : 'hidden print:block'}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 print:mt-4 print:page-break-before">Salary Breakdown</h3>
          <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
            {/* Earnings */}
            <div>
              <h4 className="font-semibold text-green-700 mb-3 text-lg">Earnings</h4>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Component</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Rate %</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Basic Salary</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.basicSalary)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">HRA</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.hra)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Standard Allowance</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.standardAllowance)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Performance Bonus</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.performanceBonus)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">LTA</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.lta)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Fixed Allowance</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.fixedAllowance)}
                    </td>
                  </tr>
                  <tr className="bg-green-100">
                    <td className="border border-gray-300 px-3 py-2 font-bold" colSpan={2}>
                      Gross Salary
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-bold text-lg">
                      {formatCurrency(payslip.grossSalary)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div>
              <h4 className="font-semibold text-red-700 mb-3 text-lg">Deductions</h4>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-red-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Component</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Rate %</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">PF Employee</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.pfEmployee)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">PF Employer</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.pfEmployer)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Professional Tax</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.professionalTax)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">TDS</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.tds)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Other Deductions</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">100</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                      {formatCurrency(payslip.otherDeductions)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                  </tr>
                  <tr className="bg-red-100">
                    <td className="border border-gray-300 px-3 py-2 font-bold" colSpan={2}>
                      Total Deductions
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-bold text-lg">
                      {formatCurrency(payslip.totalDeductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Net Salary (Take Home)</div>
                <div className="text-3xl font-bold text-green-700">
                  {formatCurrency(payslip.netSalary)}
                </div>
                <div className="text-sm text-gray-700 mt-2 italic">
                  {numberToWords(payslip.netSalary)}
                </div>
              </div>
              <div className="text-6xl">💰</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl print:rounded-none print:bg-gray-100 print:p-4 print:page-break-before-avoid">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <strong>Status:</strong>{' '}
              {payslip.isEditable ? (
                <span className="text-green-600 font-semibold">Editable</span>
              ) : (
                <span className="text-gray-600 font-semibold">Locked (Paid)</span>
              )}
            </div>
            <div>
              <strong>Generated on:</strong>{' '}
              {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center print:mt-6">
            This is a computer-generated document and does not require a signature.
          </div>
        </div>
      </div>
    </div>
  );
}
