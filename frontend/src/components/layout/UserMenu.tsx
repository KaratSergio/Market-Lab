'use client';

import { useAuthStore } from '@/core/store/authStore';
import { useLogout } from '@/core/hooks/useAuth';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export function UserMenu() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
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
        <Link href={`/${locale}/login`}>{t('Auth.login')}</Link>
      </Button>
    );
  }

  const isDashboardActive =
    pathname.startsWith(`/${locale}/customer-dashboard`) ||
    pathname.startsWith(`/${locale}/supplier-dashboard`) ||
    pathname.startsWith(`/${locale}/admin-dashboard`);

  return (
    <div className="flex items-center rounded-2xl bg-green-100 hover:bg-green-200">
      <Link
        href={getDashboardLink()}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isDashboardActive
          ? 'text-green-700'
          : 'text-gray-700'
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
        className='bg-green-200 hover:bg-green-100 pointer mr-2 cursor-pointer'
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? '...' : t('Auth.logout')}
      </Button>
    </div>
  );
}