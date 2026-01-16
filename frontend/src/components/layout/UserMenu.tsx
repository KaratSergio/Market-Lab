'use client';

import { useAuthStore } from '@/core/store/authStore';
import { useLogout } from '@/core/hooks/useAuth';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function UserMenu() {
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDashboardLink = () => {
    if (!user) return `/${locale}/login`;

    if (user.roles?.includes('admin')) return `/${locale}/admin-dashboard`;
    if (user.roles?.includes('supplier')) return `/${locale}/supplier-dashboard`;
    if (user.roles?.includes('customer')) return `/${locale}/customer-dashboard`;

    return `/${locale}/dashboard`;
  };

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm">
        <Link href={`/${locale}/login`}>Login</Link>
      </Button>
    );
  }

  const isDashboardActive =
    pathname.startsWith(`/${locale}/customer-dashboard`) ||
    pathname.startsWith(`/${locale}/supplier-dashboard`) ||
    pathname.startsWith(`/${locale}/admin-dashboard`);

  return (
    <div className="flex items-center gap-3">
      <Link
        href={getDashboardLink()}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isDashboardActive
          ? 'bg-green-100 text-green-700'
          : 'hover:bg-gray-100 text-gray-700'
          }`}
      >
        {/* User */}
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.email?.charAt(0).toUpperCase() || 'U'}
        </div>

        {/* user Email (hidden on mobile) */}
        <span className="text-sm hidden sm:block truncate max-w-[150px]">
          {user.email}
        </span>
      </Link>

      {/* logout button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? '...' : 'logout'}
      </Button>
    </div>
  );
}