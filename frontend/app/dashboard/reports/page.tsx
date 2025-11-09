'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payslipAPI } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, isPayrollOfficer, isEmployee } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    // Pre-fill employee ID for employees
    if (!authLoading && isEmployee() && user?.employeeId) {
      setFormData(prev => ({ ...prev, employeeId: user.employeeId || '' }));
    }
  }, [authLoading, user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = async () => {
    if (!formData.employeeId) {
      alert('Please enter Employee ID');
      return;
    }

    if (!formData.year) {
      alert('Please select Year');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all payslips for the employee and year
      const response = await payslipAPI.getAll({
        employeeId: formData.employeeId,
        year: parseInt(formData.year),
      });

      console.log('Payslips response:', response);
      
      if (!response.data || response.data.length === 0) {
        alert(`No payslips found for employee "${formData.employeeId}" in year ${formData.year}. Please ensure:\n1. The employee ID is correct\n2. Payruns have been processed for this employee\n3. The year is correct`);
        setLoading(false);
        return;
      }

      // Generate printable report
      generatePrintableReport(response.data);
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePrintableReport = (payslips: any[]) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the report');
      return;
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const formatMonth = (month: number) => {
      return new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' });
    };

    // Calculate totals
    const yearlyEarnings = payslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
    const yearlyDeductions = payslips.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
    const yearlyNet = payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const employee = payslips[0];

    // Generate HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Statement Report - ${employee.employeeName} - ${formData.year}</title>
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
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .earnings { color: #38a169; font-weight: 600; }
          .deductions { color: #e53e3e; font-weight: 600; }
          .net { color: #38a169; font-weight: 700; font-size: 13px; }
          .totals {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .totals-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .total-card {
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
          }
          .total-card h3 {
            font-size: 11px;
            color: #718096;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          .total-card .amount {
            font-size: 20px;
            font-weight: bold;
          }
          .total-card.green { border-color: #38a169; }
          .total-card.green .amount { color: #38a169; }
          .total-card.red { border-color: #e53e3e; }
          .total-card.red .amount { color: #e53e3e; }
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
          <p>Salary Statement Report - Year ${formData.year}</p>
        </div>

        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <label>Employee Name</label>
              <value>${employee.employeeName}</value>
            </div>
            <div class="info-item">
              <label>Employee Code</label>
              <value>${employee.employeeCode}</value>
            </div>
            <div class="info-item">
              <label>Department</label>
              <value>${employee.department || 'N/A'}</value>
            </div>
            <div class="info-item">
              <label>Date Of Joining</label>
              <value>${employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-GB') : 'N/A'}</value>
            </div>
            <div class="info-item">
              <label>Report Year</label>
              <value>${formData.year}</value>
            </div>
            <div class="info-item">
              <label>Total Months</label>
              <value>${payslips.length}</value>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th class="text-center">Days Worked</th>
              <th class="text-right">Basic Salary</th>
              <th class="text-right">HRA</th>
              <th class="text-right">Allowances</th>
              <th class="text-right">Gross Salary</th>
              <th class="text-right">PF</th>
              <th class="text-right">Tax</th>
              <th class="text-right">Other Deductions</th>
              <th class="text-right">Total Deductions</th>
              <th class="text-right">Net Salary</th>
            </tr>
          </thead>
          <tbody>
            ${payslips.map((p: any) => `
              <tr>
                <td>${formatMonth(p.month)} ${p.year}</td>
                <td class="text-center">${p.workedDays || p.attendanceDays || 0}</td>
                <td class="text-right">${formatCurrency(p.basicSalary || 0)}</td>
                <td class="text-right">${formatCurrency(p.hra || 0)}</td>
                <td class="text-right">${formatCurrency((p.standardAllowance || 0) + (p.performanceBonus || 0) + (p.lta || p.leaveTravelAllowance || 0) + (p.fixedAllowance || 0))}</td>
                <td class="text-right earnings">${formatCurrency(p.grossSalary || 0)}</td>
                <td class="text-right">${formatCurrency((p.pfEmployee || 0) + (p.pfEmployer || 0))}</td>
                <td class="text-right">${formatCurrency((p.tds || p.tdsDeduction || 0) + (p.professionalTax || 0))}</td>
                <td class="text-right">${formatCurrency((p.otherDeductions || 0) + (p.unpaidDeduction || 0))}</td>
                <td class="text-right deductions">${formatCurrency(p.totalDeductions || 0)}</td>
                <td class="text-right net">${formatCurrency(p.netSalary || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-grid">
            <div class="total-card green">
              <h3>Total Yearly Earnings</h3>
              <div class="amount">${formatCurrency(yearlyEarnings)}</div>
            </div>
            <div class="total-card red">
              <h3>Total Yearly Deductions</h3>
              <div class="amount">${formatCurrency(yearlyDeductions)}</div>
            </div>
            <div class="total-card green">
              <h3>Total Yearly Net</h3>
              <div class="amount">${formatCurrency(yearlyNet)}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Generate year options (current year + 5 previous years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">📊 Reports</h1>
        <p className="text-black mt-1">
          {isEmployee() 
            ? 'Download your salary statement report'
            : 'Generate salary statement reports for employees'}
        </p>
      </div>

      {/* Report Form */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">📄</span>
          <div>
            <h3 className="text-xl font-bold text-black">Salary Statement Report</h3>
            <p className="text-sm text-black">Generate yearly salary breakdown with all earnings and deductions</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Employee ID */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              placeholder="e.g., OIALSM20210002 or UUID"
              disabled={isEmployee()}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black placeholder-gray-600"
            />
            {isEmployee() && (
              <p className="text-sm text-black mt-1">
                Your employee ID (auto-filled)
              </p>
            )}
            {!isEmployee() && (
              <p className="text-sm text-black mt-1">
                Enter employee ID (e.g., OIALSM20210002) or UUID
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <p className="text-sm text-black mt-1">
              Select year for the report
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Report...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">🖨️</span>
                Print Salary Statement Report
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <div className="flex items-start">
          <span className="text-blue-600 text-xl mr-3">ℹ️</span>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">About Salary Statement Report:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Shows all payslips for the selected employee and year</li>
              <li>Includes monthly breakdown of earnings and deductions</li>
              <li>Displays yearly totals at the bottom</li>
              <li>Opens in a new window ready for printing or saving as PDF</li>
              <li>Use your browser's "Print to PDF" option to save the report</li>
              {isEmployee() && <li><strong>Employees can only view their own reports</strong></li>}
              {!isEmployee() && <li><strong>Admin and Payroll Officers can generate reports for any employee</strong></li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Access Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <span>🔐</span> Access Information
        </h4>
        <div className="space-y-2 text-sm text-purple-800">
          {isEmployee() ? (
            <>
              <p>✓ You can view and download your own salary statements</p>
              <p>✓ Reports include all your payslips for the selected year</p>
              <p>✓ For individual month payslips, contact your HR or Payroll Officer</p>
            </>
          ) : (
            <>
              <p>✓ You can generate salary statements for any employee</p>
              <p>✓ Use the employee's UUID to generate their report</p>
              <p>✓ Reports are generated on-demand and can be printed or saved</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

