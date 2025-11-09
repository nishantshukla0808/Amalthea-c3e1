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
    // Create a new window for printing with proper PDF structure
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the payslip');
      return;
    }

    if (!payslip) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${payslip.employeeName} - ${formatMonth(payslip.month, payslip.year)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            font-size: 12px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
          }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { opacity: 0.9; }
          .info-section {
            background: #f7fafc;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .info-item label {
            display: block;
            font-size: 10px;
            color: #718096;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .info-item value {
            display: block;
            font-weight: bold;
            color: #2d3748;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2d3748;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #e2e8f0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f7fafc;
            padding: 10px;
            text-align: left;
            font-size: 11px;
            color: #4a5568;
            border: 1px solid #e2e8f0;
          }
          td {
            padding: 10px;
            border: 1px solid #e2e8f0;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .earnings { color: #38a169; font-weight: 600; }
          .deductions { color: #e53e3e; font-weight: 600; }
          .net-salary-box {
            background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 2px solid #38a169;
          }
          .net-salary-box .label {
            font-size: 12px;
            color: #2d3748;
            margin-bottom: 5px;
          }
          .net-salary-box .amount {
            font-size: 28px;
            font-weight: bold;
            color: #22543d;
            margin-bottom: 10px;
          }
          .net-salary-box .words {
            font-size: 11px;
            color: #2d3748;
            font-style: italic;
          }
          .salary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .salary-section {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }
          .salary-section-header {
            padding: 10px 15px;
            font-weight: bold;
            font-size: 14px;
          }
          .salary-section-header.earnings {
            background: #f0fff4;
            color: #22543d;
            border-bottom: 2px solid #38a169;
          }
          .salary-section-header.deductions {
            background: #fff5f5;
            color: #742a2a;
            border-bottom: 2px solid #e53e3e;
          }
          .salary-row {
            padding: 8px 15px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #f7fafc;
          }
          .salary-row:last-child {
            border-bottom: none;
          }
          .salary-total {
            background: #f7fafc;
            padding: 12px 15px;
            font-weight: bold;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            border-top: 2px solid #e2e8f0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #718096;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>WorkZen HRMS</h1>
          <p>Payslip for ${formatMonth(payslip.month, payslip.year)}</p>
        </div>

        <!-- Employee Information -->
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <label>Employee Name</label>
              <value>${payslip.employeeName}</value>
            </div>
            <div class="info-item">
              <label>Employee Code</label>
              <value>${payslip.employeeCode}</value>
            </div>
            <div class="info-item">
              <label>Department</label>
              <value>${payslip.department || 'N/A'}</value>
            </div>
            <div class="info-item">
              <label>Location</label>
              <value>${payslip.location || 'N/A'}</value>
            </div>
            <div class="info-item">
              <label>PAN</label>
              <value>${payslip.pan || 'N/A'}</value>
            </div>
            <div class="info-item">
              <label>UAN</label>
              <value>${payslip.uan || 'N/A'}</value>
            </div>
            <div class="info-item">
              <label>Pay Period</label>
              <value>${new Date(payslip.payPeriodStart).toLocaleDateString('en-GB')} to ${new Date(payslip.payPeriodEnd).toLocaleDateString('en-GB')}</value>
            </div>
            <div class="info-item">
              <label>Days in Month</label>
              <value>${payslip.daysInMonth}</value>
            </div>
            <div class="info-item">
              <label>Working Days</label>
              <value>${payslip.workedDays}</value>
            </div>
          </div>
        </div>

        <!-- Attendance Details -->
        <div class="section-title">Attendance Details</div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th class="text-right">Days</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Days in Month</td>
              <td class="text-right"><strong>${payslip.daysInMonth}</strong></td>
            </tr>
            <tr>
              <td>Present Days</td>
              <td class="text-right earnings"><strong>${payslip.presentDays}</strong></td>
            </tr>
            <tr>
              <td>Absent Days</td>
              <td class="text-right deductions"><strong>${payslip.absentDays}</strong></td>
            </tr>
            <tr>
              <td>Paid Time Off (Leave)</td>
              <td class="text-right" style="color: #3182ce;"><strong>${payslip.paidTimeOff}</strong></td>
            </tr>
            <tr style="background: #f7fafc;">
              <td><strong>Total Worked Days</strong></td>
              <td class="text-right"><strong style="color: #667eea;">${payslip.workedDays}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Salary Breakdown -->
        <div class="section-title">Salary Breakdown</div>
        <div class="salary-grid">
          <!-- Earnings -->
          <div class="salary-section">
            <div class="salary-section-header earnings">Earnings</div>
            <div class="salary-row">
              <span>Basic Salary</span>
              <span><strong>${formatCurrency(payslip.basicSalary)}</strong></span>
            </div>
            <div class="salary-row">
              <span>HRA</span>
              <span><strong>${formatCurrency(payslip.hra)}</strong></span>
            </div>
            <div class="salary-row">
              <span>Standard Allowance</span>
              <span><strong>${formatCurrency(payslip.standardAllowance)}</strong></span>
            </div>
            <div class="salary-row">
              <span>Performance Bonus</span>
              <span><strong>${formatCurrency(payslip.performanceBonus)}</strong></span>
            </div>
            <div class="salary-row">
              <span>LTA</span>
              <span><strong>${formatCurrency(payslip.lta)}</strong></span>
            </div>
            <div class="salary-row">
              <span>Fixed Allowance</span>
              <span><strong>${formatCurrency(payslip.fixedAllowance)}</strong></span>
            </div>
            <div class="salary-total earnings">
              <span>Gross Salary</span>
              <span>${formatCurrency(payslip.grossSalary)}</span>
            </div>
          </div>

          <!-- Deductions -->
          <div class="salary-section">
            <div class="salary-section-header deductions">Deductions</div>
            <div class="salary-row">
              <span>PF Employee</span>
              <span><strong>${formatCurrency(payslip.pfEmployee)}</strong></span>
            </div>
            <div class="salary-row">
              <span>PF Employer</span>
              <span><strong>${formatCurrency(payslip.pfEmployer)}</strong></span>
            </div>
            <div class="salary-row">
              <span>Professional Tax</span>
              <span><strong>${formatCurrency(payslip.professionalTax)}</strong></span>
            </div>
            <div class="salary-row">
              <span>TDS</span>
              <span><strong>${formatCurrency(payslip.tds)}</strong></span>
            </div>
            <div class="salary-row">
              <span>Other Deductions</span>
              <span><strong>${formatCurrency(payslip.otherDeductions)}</strong></span>
            </div>
            <div class="salary-row">
              <span>&nbsp;</span>
              <span>&nbsp;</span>
            </div>
            <div class="salary-total deductions">
              <span>Total Deductions</span>
              <span>${formatCurrency(payslip.totalDeductions)}</span>
            </div>
          </div>
        </div>

        <!-- Net Salary -->
        <div class="net-salary-box">
          <div class="label">Net Salary (Take Home)</div>
          <div class="amount">${formatCurrency(payslip.netSalary)}</div>
          <div class="words">${numberToWords(payslip.netSalary)}</div>
        </div>

        <div class="footer">
          <p><strong>Status:</strong> ${payslip.isEditable ? 'Editable' : 'Locked (Paid)'} | <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
          <p style="margin-top: 10px;">This is a computer-generated document and does not require a signature.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
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
          <p className="mt-4 text-black">Loading payslip...</p>
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
            <h1 className="text-3xl font-bold text-black">Payslip Details</h1>
            <p className="text-black mt-1">
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
          <h3 className="text-lg font-semibold text-black mb-4">Employee Information</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-black">Employee Name</div>
              <div className="font-semibold text-black">{payslip.employeeName}</div>
            </div>
            <div>
              <div className="text-sm text-black">Employee Code</div>
              <div className="font-semibold text-black">{payslip.employeeCode}</div>
            </div>
            <div>
              <div className="text-sm text-black">Department</div>
              <div className="font-semibold text-black">{payslip.department || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-black">Location</div>
              <div className="font-semibold text-black">{payslip.location || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-black">PAN</div>
              <div className="font-semibold text-black">{payslip.pan || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-black">UAN</div>
              <div className="font-semibold text-black">{payslip.uan || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-black">Pay Period</div>
              <div className="font-semibold text-black">
                {new Date(payslip.payPeriodStart).toLocaleDateString('en-GB')} to{' '}
                {new Date(payslip.payPeriodEnd).toLocaleDateString('en-GB')}
              </div>
            </div>
            <div>
              <div className="text-sm text-black">Days in Month</div>
              <div className="font-semibold text-black">{payslip.daysInMonth}</div>
            </div>
            <div>
              <div className="text-sm text-black">Working Days</div>
              <div className="font-semibold text-black">{payslip.workedDays}</div>
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
                  : 'border-transparent text-black hover:text-black'
              }`}
            >
              Salary Computation
            </button>
            <button
              onClick={() => setActiveTab('workedDays')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'workedDays'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-black hover:text-black'
              }`}
            >
              Worked Days
            </button>
          </div>
        </div>

        {/* Worked Days Tab */}
        <div className={`p-6 print:p-4 ${activeTab === 'workedDays' ? 'block' : 'hidden print:block'}`}>
          <h3 className="text-lg font-semibold text-black mb-4 print:mt-4">Attendance Details</h3>
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
          <h3 className="text-lg font-semibold text-black mb-4 print:mt-4 print:page-break-before">Salary Breakdown</h3>
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
                <div className="text-sm text-black mb-1">Net Salary (Take Home)</div>
                <div className="text-3xl font-bold text-green-700">
                  {formatCurrency(payslip.netSalary)}
                </div>
                <div className="text-sm text-black mt-2 italic">
                  {numberToWords(payslip.netSalary)}
                </div>
              </div>
              <div className="text-6xl">💰</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl print:rounded-none print:bg-gray-100 print:p-4 print:page-break-before-avoid">
          <div className="flex justify-between items-center text-sm text-black">
            <div>
              <strong>Status:</strong>{' '}
              {payslip.isEditable ? (
                <span className="text-green-600 font-semibold">Editable</span>
              ) : (
                <span className="text-black font-semibold">Locked (Paid)</span>
              )}
            </div>
            <div>
              <strong>Generated on:</strong>{' '}
              {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          <div className="mt-4 text-xs text-black text-center print:mt-6">
            This is a computer-generated document and does not require a signature.
          </div>
        </div>
      </div>
    </div>
  );
}
