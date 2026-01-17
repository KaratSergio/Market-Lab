'use client';

import { useSession, useAuthRedirect } from '@/core/hooks/useAuth';
import { useAuthStore } from '@/core/store/authStore';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { data: user, isLoading } = useSession();
  const { isAuthenticated } = useAuthStore();
  const { redirectToLogin } = useAuthRedirect();

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated) {
      redirectToLogin();
    }
  }, [user, isAuthenticated, isLoading, redirectToLogin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}