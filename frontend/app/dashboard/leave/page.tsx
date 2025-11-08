'use client';

import { useState, useEffect } from 'react';
import { leaveAPI, employeeAPI } from '@/lib/api';

interface LeaveRecord {
  id: string;
  leaveType: 'SICK' | 'CASUAL' | 'PAID' | 'UNPAID' | 'MATERNITY' | 'PATERNITY';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverComments: string | null;
  isHalfDay: boolean;
  employee?: {
    firstName: string;
    lastName: string;
    department: string;
    employeeId: string;
    user?: {
      role: string;
    };
  };
  createdAt: string;
}

interface LeaveBalance {
  [key: string]: {
    total: number;
    used: number;
    remaining: number;
  };
}

export default function LeavePage() {
  const [loading, setLoading] = useState(true);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    leaveType: 'PAID',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
  });

  // Filters for admin/HR
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    department: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        // Get employee profile
        try {
          const empResponse = await employeeAPI.getMe();
          if (empResponse && empResponse.data) {
            setCurrentEmployee(empResponse.data);
            
            // Fetch leave balance for employees and HR
            if (user.role === 'EMPLOYEE' || user.role === 'HR_OFFICER') {
              await fetchLeaveBalance(empResponse.data.id);
            }
          }
        } catch (err) {
          console.error('Could not fetch employee profile:', err);
        }

        // Fetch leave records
        await fetchLeaves(user.role);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async (userRole: string) => {
    try {
      const params: any = { limit: 100 };
      
      // Apply filters for admin/HR
      if (userRole !== 'EMPLOYEE') {
        if (filters.status) params.status = filters.status;
        if (filters.leaveType) params.leaveType = filters.leaveType;
        if (filters.department) params.department = filters.department;
      }

      const response = await leaveAPI.getAll(params);
      setLeaveRecords(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch leaves:', err);
      setError(err.message || 'Failed to load leave records');
    }
  };

  const fetchLeaveBalance = async (employeeId: string) => {
    try {
      const response = await leaveAPI.getBalance(employeeId);
      setLeaveBalance(response.balance);
    } catch (err: any) {
      console.error('Failed to fetch leave balance:', err);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setActionLoading('apply');

      await leaveAPI.apply(formData);
      
      setSuccess('Leave request submitted successfully!');
      setShowApplyForm(false);
      setFormData({
        leaveType: 'PAID',
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDay: false,
      });

      // Refresh data
      if (currentUser) {
        await fetchLeaves(currentUser.role);
        if (currentEmployee) {
          await fetchLeaveBalance(currentEmployee.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(leaveId);

      await leaveAPI.approve(leaveId);
      setSuccess('Leave request approved successfully!');
      
      // Refresh data
      if (currentUser) {
        await fetchLeaves(currentUser.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve leave request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (leaveId: string) => {
    setRejectLeaveId(leaveId);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectLeaveId || !rejectReason.trim()) {
      setError('Please enter a rejection reason');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setActionLoading(rejectLeaveId);
      setShowRejectDialog(false);

      await leaveAPI.reject(rejectLeaveId, rejectReason);
      setSuccess('Leave request rejected.');
      
      // Refresh data
      if (currentUser) {
        await fetchLeaves(currentUser.role);
      }
      
      // Reset reject dialog state
      setRejectLeaveId(null);
      setRejectReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to reject leave request');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelReject = () => {
    setShowRejectDialog(false);
    setRejectLeaveId(null);
    setRejectReason('');
  };

  const handleFilterChange = async () => {
    if (currentUser) {
      try {
        setError('');
        await fetchLeaves(currentUser.role);
      } catch (err: any) {
        console.error('Filter change error:', err);
        setError('Failed to apply filters');
      }
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SICK: 'Sick Leave',
      CASUAL: 'Casual Leave',
      PAID: 'Paid Time Off',
      UNPAID: 'Unpaid Leave',
      MATERNITY: 'Maternity Leave',
      PATERNITY: 'Paternity Leave',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { gradient: string; icon: string }> = {
      PENDING: { gradient: 'from-amber-500 to-yellow-500', icon: '⏳' },
      APPROVED: { gradient: 'from-emerald-500 to-green-500', icon: '✅' },
      REJECTED: { gradient: 'from-red-500 to-rose-500', icon: '❌' },
      CANCELLED: { gradient: 'from-gray-500 to-slate-500', icon: '🚫' },
    };

    const badge = badges[status] || { gradient: 'from-gray-500 to-slate-500', icon: '•' };

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${badge.gradient} text-white shadow-md flex items-center gap-1 w-fit`}>
        <span>{badge.icon}</span>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const isHR = currentUser?.role === 'HR_OFFICER';
  const canApprove = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR_OFFICER';
  const canApplyForLeave = isEmployee || isHR;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-3">
            {isEmployee ? '🏖️ My Time Off' : '🏖️ Time Off Management'}
          </h1>
          <p className="text-base text-gray-600 mt-2 font-medium">
            {isEmployee 
              ? 'Apply for leave and view your time off history' 
              : isHR 
              ? 'Manage employee leaves and apply for your own time off'
              : 'Manage and approve employee leave requests'
            }
          </p>
        </div>
        {canApplyForLeave && (
          <button
            onClick={() => setShowApplyForm(!showApplyForm)}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
              showApplyForm 
                ? 'bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white'
            }`}
          >
            {showApplyForm ? '✕ Cancel' : '+ Apply for Leave'}
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 flex items-start gap-3 shadow-md">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-5 flex items-start gap-3 shadow-md">
          <svg className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-emerald-800 font-semibold">{success}</p>
        </div>
      )}

      {/* Leave Balance Cards - For Employees and HR */}
      {canApplyForLeave && leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(leaveBalance).map(([type, balance], index) => {
            const gradients = [
              'from-blue-500 to-indigo-600',
              'from-purple-500 to-pink-600',
              'from-emerald-500 to-green-600',
            ];
            const gradient = gradients[index % gradients.length];
            
            return (
              <div key={type} className="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-2xl hover:scale-[1.03] hover:border-purple-300 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative">
                  <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">{getLeaveTypeLabel(type)}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-5xl font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                      {balance.remaining}
                    </span>
                    <span className="text-lg text-gray-500 font-semibold">/ {balance.total}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold`}>{balance.used}</span> days used
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Leave Form - For Employees and HR */}
      {canApplyForLeave && showApplyForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply for Leave</h2>
          <form onSubmit={handleApplyLeave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="PAID">Paid Time Off</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="PATERNITY">Paternity Leave</option>
                </select>
              </div>

              <div className="md:col-span-1 flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHalfDay}
                    onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Half Day</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="dd-mm-yyyy"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="dd-mm-yyyy"
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                rows={4}
                placeholder="Please provide a reason for your leave..."
                required
              />
            </div>

            <div className="flex gap-4 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading === 'apply'}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300"
              >
                {actionLoading === 'apply' ? '⏳ Submitting...' : '✓ Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters - Only for Admin/HR */}
      {canApprove && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔍</span>
            Filter Leave Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={async (e) => {
                  const newFilters = { ...filters, status: e.target.value };
                  setFilters(newFilters);
                  if (currentUser) {
                    try {
                      setError('');
                      const params: any = { limit: 100 };
                      if (newFilters.status) params.status = newFilters.status;
                      if (newFilters.leaveType) params.leaveType = newFilters.leaveType;
                      if (newFilters.department) params.department = newFilters.department;
                      const response = await leaveAPI.getAll(params);
                      setLeaveRecords(response.data || []);
                    } catch (err: any) {
                      console.error('Filter error:', err);
                      setError('Failed to apply filters');
                    }
                  }
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white font-medium hover:border-purple-300 transition-all"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type</label>
              <select
                value={filters.leaveType}
                onChange={async (e) => {
                  const newFilters = { ...filters, leaveType: e.target.value };
                  setFilters(newFilters);
                  if (currentUser) {
                    try {
                      setError('');
                      const params: any = { limit: 100 };
                      if (newFilters.status) params.status = newFilters.status;
                      if (newFilters.leaveType) params.leaveType = newFilters.leaveType;
                      if (newFilters.department) params.department = newFilters.department;
                      const response = await leaveAPI.getAll(params);
                      setLeaveRecords(response.data || []);
                    } catch (err: any) {
                      console.error('Filter error:', err);
                      setError('Failed to apply filters');
                    }
                  }
                }}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white font-medium hover:border-purple-300 transition-all"
              >
                <option value="">All Types</option>
                <option value="PAID">Paid Time Off</option>
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="PATERNITY">Paternity Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                onKeyPress={async (e) => {
                  if (e.key === 'Enter' && currentUser) {
                    try {
                      setError('');
                      const params: any = { limit: 100 };
                      if (filters.status) params.status = filters.status;
                      if (filters.leaveType) params.leaveType = filters.leaveType;
                      if (filters.department) params.department = filters.department;
                      const response = await leaveAPI.getAll(params);
                      setLeaveRecords(response.data || []);
                    } catch (err: any) {
                      console.error('Filter error:', err);
                      setError('Failed to apply filters');
                    }
                  }
                }}
                placeholder="e.g., Engineering"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400 font-medium hover:border-purple-300 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={async () => {
                  setFilters({ status: '', leaveType: '', department: '' });
                  if (currentUser) {
                    try {
                      setError('');
                      const response = await leaveAPI.getAll({ limit: 100 });
                      setLeaveRecords(response.data || []);
                    } catch (err: any) {
                      console.error('Clear filters error:', err);
                      setError('Failed to clear filters');
                    }
                  }
                }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Leave Requests</h2>
        </div>
        
        {leaveRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No leave records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {canApprove && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  {canApprove && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {canApprove && record.employee && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee.firstName} {record.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{record.employee.department}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLeaveTypeLabel(record.leaveType)}
                      {record.isHalfDay && <span className="ml-2 text-xs text-blue-600">(Half Day)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.totalDays} {record.totalDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={record.reason}>
                      {record.reason}
                    </td>
                    {canApprove && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.status === 'PENDING' ? (
                          // HR can only approve/reject non-HR employees' leaves, Admin can approve all
                          (currentUser?.role === 'ADMIN' || record.employee?.user?.role !== 'HR_OFFICER') ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(record.id)}
                                disabled={actionLoading === record.id}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleReject(record.id)}
                                disabled={actionLoading === record.id}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 italic">Admin Only</span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Request</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this leave request:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 resize-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelReject}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
