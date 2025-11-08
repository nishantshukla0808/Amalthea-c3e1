'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('⚠️ Found existing token, redirecting to dashboard...');
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Attempting login with:', formData.loginId);

    try {
      console.log('📡 Calling API...');
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
      
      const response = await authAPI.login(formData.loginId, formData.password);
      console.log('✅ Login response:', response);
      
      // Clear any existing data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('💾 Token and user data stored');
      
      // Check if user needs to change password
      if (response.user.mustChangePassword) {
        console.log('🔑 User must change password, redirecting to password change page...');
        router.push('/change-password-first-time');
      } else {
        // Redirect to dashboard
        console.log('🚀 Redirecting to dashboard...');
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Provide more helpful error messages
      let errorMessage = err.message || 'Login failed';
      if (err.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            WorkZen HRMS
          </h2>
          <p className="text-center text-sm text-gray-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
              Login ID
            </label>
            <input
              id="loginId"
              type="text"
              required
              value={formData.loginId}
              onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="OIADUS20200001"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-center text-xs text-gray-600 font-semibold mb-2">Test Credentials:</p>
          <div className="space-y-1 text-xs text-gray-700">
            <p className="font-mono">Admin: OIADUS20200001 / Password123!</p>
            <p className="font-mono">HR: OIHERO20200002 / Password123!</p>
            <p className="font-mono">Employee: OIALSM20210002 / Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}