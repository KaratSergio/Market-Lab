'use client';

import { useLogin } from '@/core/hooks/useAuth';
import { devCredentials, DevUserRole } from './devCredentials';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const ROUTES = {
  admin: 'admin-dashboard',
  supplier: 'supplier-dashboard',
  customer: 'customer-dashboard',
} as const;

interface QuickLoginButtonsProps {
  className?: string;
  onSuccess?: () => void;
}

export function QuickLoginButtons({ className = '', onSuccess }: QuickLoginButtonsProps) {
  const loginMutation = useLogin();
  const router = useRouter();
  const locale = useLocale();

  const handleQuickLogin = (role: DevUserRole) => {
    const credentials = devCredentials[role];

    loginMutation.mutate(
      {
        email: credentials.email!,
        password: credentials.password!,
      },
      {
        onSuccess: (data) => {
          const userRoles = data?.user?.roles;
          const role = userRoles[0] as DevUserRole;
          const path = ROUTES[role];

          router.push(`/${locale}/${path}`);
          onSuccess?.();
        },
        onError: (error) => console.error(`❌ Failed to login as ${role}:`, error)
      }
    );
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-500 mb-2">
        🔧 Quick login (development mode)
      </div>

      {(Object.keys(devCredentials) as DevUserRole[]).map((role) => {
        const cred = devCredentials[role];
        const isLoading = loginMutation.isPending &&
          loginMutation.variables?.email === cred.email;

        return (
          <button
            key={role}
            onClick={() => handleQuickLogin(role)}
            disabled={loginMutation.isPending}
            className={`
              w-full flex items-center justify-between px-4 py-3 
              rounded-lg transition-all border border-transparent
              ${cred.bgColor}
              ${loginMutation.isPending
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md hover:border-gray-300'
              }
            `}
          >
            <span className="font-medium">{cred.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-75 font-mono hidden sm:inline">
                {cred.email}
              </span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </button>
        );
      })}

      {loginMutation.isError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            error: {loginMutation.error?.message || 'Failed to log in'}
          </p>
        </div>
      )}
    </div>
  );
}