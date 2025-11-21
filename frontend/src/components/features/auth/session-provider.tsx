'use client';

import { useSession } from '@/core/hooks/use-auth';
import { useAuthStore } from '@/core/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useSession();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user || isAuthenticated) router.push('/cabinet');
  }, [user, isAuthenticated, router]);

  if (user || isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Redirecting to cabinet...</div>
      </div>
    );
  }

  return <>{children}</>;
}