'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { salaryStructureAPI } from '@/lib/api/payroll';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CreateSalaryStructurePage() {
  const router = useRouter();
  const { user, loading: authLoading, hasPayrollAccess } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    monthlyWage: '',
    effectiveFrom: '',
    pfPercentage: '12',
    professionalTax: '200',
    workingDaysPerWeek: '5',
    workingHoursPerDay: '8',
  });

  // Calculated preview
  const [preview, setPreview] = useState({
    basicSalary: 0,
    hra: 0,
    standardAllowance: 4167,
    performanceBonus: 0,
    lta: 0,
    fixedAllowance: 0,
  });

  useEffect(() => {
    if (!authLoading && !hasPayrollAccess()) {
      alert('Access denied. Only Admin, Payroll Officers, and HR Officers can create salary structures.');
      router.push('/dashboard');
      return;
    }
  }, [authLoading]);

  // Calculate preview whenever monthly wage changes
  useEffect(() => {
    const wage = parseFloat(formData.monthlyWage) || 0;
    if (wage > 0) {
      const basic = wage * 0.5; // 50% of wage
      const hra = basic * 0.5; // 50% of basic
      const standardAllowance = 4167; // Fixed
      const performanceBonus = basic * 0.0833; // 8.33% of basic
      const lta = basic * 0.0833; // 8.33% of basic
      const fixedAllowance = wage - (basic + hra + standardAllowance + performanceBonus + lta);

      setPreview({
        basicSalary: Math.round(basic),
        hra: Math.round(hra),
        standardAllowance,
        performanceBonus: Math.round(performanceBonus),
        lta: Math.round(lta),
        fixedAllowance: Math.max(0, Math.round(fixedAllowance)),
      });
    } else {
      setPreview({
        basicSalary: 0,
        hra: 0,
        standardAllowance: 4167,
        performanceBonus: 0,
        lta: 0,
        fixedAllowance: 0,
      });
    }
  }, [formData.monthlyWage]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.employeeId.trim()) {
      alert('Please enter Employee ID');
      return;
    }

    const wage = parseFloat(formData.monthlyWage);
    if (!wage || wage <= 0) {
      alert('Please enter a valid Monthly Wage (greater than 0)');
      return;
    }

    if (!formData.effectiveFrom) {
      alert('Please select Effective From date');
      return;
    }

    const confirm = window.confirm(
      `Create salary structure with monthly wage ₹${wage.toLocaleString('en-IN')}?`
    );
    if (!confirm) return;

    try {
      setLoading(true);

      // Prepare payload
      const payload: any = {
        employeeId: formData.employeeId.trim(),
        monthlyWage: wage,
        effectiveFrom: formData.effectiveFrom,
      };

      // Add optional fields if provided
      const pf = parseFloat(formData.pfPercentage);
      if (!isNaN(pf) && pf > 0) payload.pfPercentage = pf;

      const pt = parseFloat(formData.professionalTax);
      if (!isNaN(pt) && pt >= 0) payload.professionalTax = pt;

      const wd = parseInt(formData.workingDaysPerWeek);
      if (!isNaN(wd) && wd > 0) payload.workingDaysPerWeek = wd;

      const wh = parseFloat(formData.workingHoursPerDay);
      if (!isNaN(wh) && wh > 0) payload.workingHoursPerDay = wh;

      const response = await salaryStructureAPI.create(payload);
      alert('Salary structure created successfully!');
      router.push(`/dashboard/payroll/salary-structure/${response.data.id}`);
    } catch (error: any) {
      alert('Failed to create salary structure: ' + error.message);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/payroll/salary-structure')}
          className="text-purple-600 hover:text-purple-800 font-semibold mb-4 flex items-center gap-2"
        >
          ← Back to Salary Structures
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Salary Structure</h1>
        <p className="text-gray-600 mt-1">Set up salary configuration for an employee</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="e.g., 00000000-0000-4000-8000-000000000110"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the UUID of the employee (from fixtures or database)
              </p>
            </div>

            {/* Monthly Wage */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Wage (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.monthlyWage}
                onChange={(e) => handleChange('monthlyWage', e.target.value)}
                placeholder="e.g., 50000"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Total monthly salary (will be broken down into components)
              </p>
            </div>

            {/* Effective From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Effective From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => handleChange('effectiveFrom', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Date from which this structure becomes active
              </p>
            </div>

            {/* PF Percentage */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PF Percentage (%)
              </label>
              <input
                type="number"
                value={formData.pfPercentage}
                onChange={(e) => handleChange('pfPercentage', e.target.value)}
                placeholder="12"
                min="0"
                max="100"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Default: 12%</p>
            </div>
          </div>
        </div>

        {/* Optional Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Settings</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Professional Tax */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Tax (₹)
              </label>
              <input
                type="number"
                value={formData.professionalTax}
                onChange={(e) => handleChange('professionalTax', e.target.value)}
                placeholder="200"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Default: ₹200</p>
            </div>

            {/* Working Days Per Week */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Working Days/Week
              </label>
              <input
                type="number"
                value={formData.workingDaysPerWeek}
                onChange={(e) => handleChange('workingDaysPerWeek', e.target.value)}
                placeholder="5"
                min="1"
                max="7"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Default: 5 days</p>
            </div>

            {/* Working Hours Per Day */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Working Hours/Day
              </label>
              <input
                type="number"
                value={formData.workingHoursPerDay}
                onChange={(e) => handleChange('workingHoursPerDay', e.target.value)}
                placeholder="8"
                min="0"
                step="0.5"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Default: 8 hours</p>
            </div>
          </div>
        </div>

        {/* Salary Breakdown Preview */}
        {parseFloat(formData.monthlyWage) > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📊</span> Salary Breakdown Preview
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Earnings */}
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-3">Earnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary (50%)</span>
                    <span className="font-semibold">{formatCurrency(preview.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">HRA (50% of Basic)</span>
                    <span className="font-semibold">{formatCurrency(preview.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Standard Allowance</span>
                    <span className="font-semibold">{formatCurrency(preview.standardAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Performance Bonus (8.33%)</span>
                    <span className="font-semibold">{formatCurrency(preview.performanceBonus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LTA (8.33%)</span>
                    <span className="font-semibold">{formatCurrency(preview.lta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fixed Allowance</span>
                    <span className="font-semibold">{formatCurrency(preview.fixedAllowance)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(parseFloat(formData.monthlyWage))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-red-700 mb-3">Estimated Deductions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">PF Employee ({formData.pfPercentage}%)</span>
                    <span className="font-semibold">
                      {formatCurrency((preview.basicSalary * parseFloat(formData.pfPercentage)) / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PF Employer ({formData.pfPercentage}%)</span>
                    <span className="font-semibold">
                      {formatCurrency((preview.basicSalary * parseFloat(formData.pfPercentage)) / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professional Tax</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(formData.professionalTax))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Estimated Net</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(
                        parseFloat(formData.monthlyWage) -
                          ((preview.basicSalary * parseFloat(formData.pfPercentage)) / 100) * 2 -
                          parseFloat(formData.professionalTax)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">
              * This is an estimated breakdown. Actual values may vary based on attendance and other factors during payrun processing.
            </p>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start">
            <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Monthly wage will be automatically broken down into salary components</li>
                <li>Basic Salary is 50% of monthly wage, HRA is 50% of basic salary</li>
                <li>Standard Allowance is fixed at ₹4,167 per month</li>
                <li>Performance Bonus and LTA are each 8.33% of basic salary</li>
                <li>Remaining amount is allocated to Fixed Allowance</li>
                <li>Ensure the Employee ID exists in the database before creating</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/payroll/salary-structure')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </span>
            ) : (
              '✓ Create Salary Structure'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
