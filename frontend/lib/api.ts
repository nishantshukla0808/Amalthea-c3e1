// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  console.log(`📥 API Response: ${response.status} ${response.statusText}`);
  
  const data = await response.json();
  console.log('📦 Response data:', data);
  
  if (!response.ok) {
    const errorMessage = data.error || data.message || 'API request failed';
    console.error('❌ API Error:', errorMessage);
    throw new Error(errorMessage);
  }
  
  return data;
}

// Auth API functions
export const authAPI = {
  login: (loginId: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
    }),

  getCurrentUser: () => apiRequest('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// User API functions
export const userAPI = {
  getAll: () => apiRequest('/users'),
  getById: (id: string) => apiRequest(`/users/${id}`),
  create: (userData: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateRole: (id: string, role: string) => apiRequest(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
};

// Employee API functions
export const employeeAPI = {
  getAll: (params?: { page?: number; limit?: number; department?: string; search?: string; isActive?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.department) queryParams.append('department', params.department);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    return apiRequest(`/employees?${queryParams.toString()}`);
  },
  getById: (id: string) => apiRequest(`/employees/${id}`),
  getMe: () => apiRequest('/employees/me'),
  getProfile: (id: string) => apiRequest(`/employees/${id}/profile`),
  create: (data: any) => apiRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  }),
};

// Attendance API functions
export const attendanceAPI = {
  checkIn: (remarks?: string) => apiRequest('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({ remarks }),
  }),
  
  checkOut: (remarks?: string) => apiRequest('/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify({ remarks }),
  }),
  
  getAll: (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.department) queryParams.append('department', params.department);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    return apiRequest(`/attendance?${queryParams.toString()}`);
  },
  
  getByEmployee: (employeeId: string, params?: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    return apiRequest(`/attendance/employee/${employeeId}?${queryParams.toString()}`);
  },
  
  createManual: (data: {
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    workingHours?: number;
    remarks?: string;
  }) => apiRequest('/attendance/manual', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: {
    status?: string;
    checkIn?: string;
    checkOut?: string;
    workingHours?: number;
    remarks?: string;
  }) => apiRequest(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => apiRequest(`/attendance/${id}`, {
    method: 'DELETE',
  }),
  
  getReport: (params?: {
    department?: string;
    month?: number;
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.department) queryParams.append('department', params.department);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    return apiRequest(`/attendance/report?${queryParams.toString()}`);
  },
  
  checkLeaveStatus: () => apiRequest('/attendance/check-leave-status'),
};

// Leave API
export const leaveAPI = {
  // Apply for leave
  apply: (data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
  }) => apiRequest('/leaves', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get all leaves with filters
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    leaveType?: string;
    employeeId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.leaveType) queryParams.append('leaveType', params.leaveType);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    return apiRequest(`/leaves?${queryParams.toString()}`);
  },

  // Get leave balance for an employee
  getBalance: (employeeId: string) => apiRequest(`/leaves/balance/${employeeId}`),

  // Get specific leave by ID
  getById: (id: string) => apiRequest(`/leaves/${id}`),

  // Approve leave
  approve: (id: string, approverComments?: string) => apiRequest(`/leaves/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ approverComments }),
  }),

  // Reject leave
  reject: (id: string, approverComments: string) => apiRequest(`/leaves/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ approverComments }),
  }),

  // Cancel leave
  cancel: (id: string) => apiRequest(`/leaves/${id}/cancel`, {
    method: 'PUT',
  }),
};