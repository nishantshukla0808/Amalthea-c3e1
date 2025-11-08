// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
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
  getProfile: (id: string) => apiRequest(`/employees/${id}/profile`),
  update: (id: string, data: any) => apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  }),
};