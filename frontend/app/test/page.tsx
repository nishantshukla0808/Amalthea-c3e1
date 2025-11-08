'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setResult(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: 'OIADUS20200001',
          password: 'Password123!',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        setError('');
        console.log('Login successful!', data);
      } else {
        setError(data.error || 'Login failed');
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testBackend}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Backend Health
        </button>

        <button
          onClick={testLogin}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Login API
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <strong>Result:</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}