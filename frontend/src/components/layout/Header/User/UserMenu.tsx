'use client';

import { useAuthStore } from '@/core/store/auth-store';
import { useLogout } from '@/core/hooks/use-auth';
import { Button } from '@/components/ui';

export function UserMenu() {
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm">
        <a href="/login">Login</a>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-gray-700 hidden sm:block">
          {user.email}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? '...' : 'Logout'}
      </Button>
    </div>
  );
}