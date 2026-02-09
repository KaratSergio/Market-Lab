'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/core/api/auth-api.ts';
import { useAuthStore } from '@/core/store/authStore';
import { useLocale } from 'next-intl';

interface GoogleCallbackHandlerProps {
  code?: string;
  error?: string;
}

export function GoogleCallbackHandler({ code, error }: GoogleCallbackHandlerProps) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const locale = useLocale();

  useEffect(() => {
    const handleCallback = async () => {
      if (error) {
        console.error('Error from URL:', error);
        router.push(`/${locale}/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code) {
        console.error('No code parameter received');
        router.push(`/${locale}/login?error=no_code`);
        return;
      }

      try {
        const result = await authApi.googleCallback(code, locale);
        setAuth(result.user, result.access_token);

        if (!result.user.regComplete) {
          router.push(`/${locale}/register/role`);
        } else {
          const role = result.user.roles[0];

          if (role === 'customer') {
            router.push(`/${locale}/customer-dashboard`);
          } else if (role === 'supplier') {
            router.push(`/${locale}/supplier-dashboard`);
          } else {
            router.push(`/${locale}/login`);
          }
        }

      } catch (error) {
        console.error('❌ Google callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleCallback();
  }, [code, error, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Completing Google Sign In
        </h2>
        <p className="text-gray-600 mb-6">
          Please wait while we authenticate...
        </p>
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>Check browser console for details</p>
          <p>Code: {code ? '✅ Received' : '❌ Missing'}</p>
          <p>Error: {error || 'None'}</p>
        </div>
      </div>
    </div>
  );
}