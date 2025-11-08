// frontend/lib/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'ADMIN' | 'HR_OFFICER' | 'PAYROLL_OFFICER' | 'EMPLOYEE';

export interface User {
  id: string;
  loginId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  employeeId?: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const hasPayrollAccess = () => {
    if (!user) return false;
    return ['ADMIN', 'PAYROLL_OFFICER', 'HR_OFFICER'].includes(user.role);
  };

  const canManagePayroll = () => {
    if (!user) return false;
    return ['ADMIN', 'PAYROLL_OFFICER'].includes(user.role);
  };

  const canViewPayroll = () => {
    if (!user) return false;
    // All roles can view their own payslips
    return true;
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isPayrollOfficer = () => user?.role === 'PAYROLL_OFFICER';
  const isHROfficer = () => user?.role === 'HR_OFFICER';
  const isEmployee = () => user?.role === 'EMPLOYEE';

  return {
    user,
    loading,
    hasPayrollAccess,
    canManagePayroll,
    canViewPayroll,
    isAdmin,
    isPayrollOfficer,
    isHROfficer,
    isEmployee,
  };
}
