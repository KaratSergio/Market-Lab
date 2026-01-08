'use client';

import { ReactNode } from 'react';
import { cn } from '@/core/utils/cn';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
}

export function TabButton({
  isActive,
  onClick,
  children,
  className = '',
  activeClassName = 'border-blue-500 text-blue-600',
  inactiveClassName = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
  disabled = false,
  icon,
  badge
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent',
        isActive ? activeClassName : inactiveClassName,
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span>{children}</span>
        {badge !== undefined && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            isActive
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700"
          )}>
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}