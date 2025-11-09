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
      console.log('🔍 User data:', response.user);
      console.log('🔍 mustChangePassword flag:', response.user.mustChangePassword);
      
      // Check if user needs to change password
      if (response.user.mustChangePassword === true) {
        console.log('🔑 User must change password, redirecting to password change page...');
        router.push('/change-password-first-time');
      } else {
        // Redirect to dashboard
        console.log('🚀 Redirecting to dashboard... (mustChangePassword is false or undefined)');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 p-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl relative z-10 border border-white/20">
        <div>
          <h2 className="text-center text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            WorkZen HRMS
          </h2>
          <p className="text-center text-sm text-gray-600 mt-3 font-medium">
            Welcome back! Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="loginId" className="block text-sm font-semibold text-gray-700 mb-2">
              Login ID
            </label>
            <input
              id="loginId"
              type="text"
              required
              value={formData.loginId}
              onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition-all duration-200 hover:border-purple-300"
              placeholder="OIADUS20200001"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition-all duration-200 hover:border-purple-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-center text-xs text-gray-700 font-bold mb-3 uppercase tracking-wide">Test Credentials:</p>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all duration-200">
              <span className="font-semibold text-blue-600">Admin:</span>
              <span className="font-mono text-gray-800">OIADUS20200001</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all duration-200">
              <span className="font-semibold text-purple-600">HR:</span>
              <span className="font-mono text-gray-800">OIHERO20200002</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all duration-200">
              <span className="font-semibold text-green-600">Payroll:</span>
              <span className="font-mono text-gray-800">OIPAJO20210001</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-md transition-all duration-200">
              <span className="font-semibold text-pink-600">Employee:</span>
              <span className="font-mono text-gray-800">OIALSM20210002</span>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2 italic">Password: Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}