'use client';

import { ReactNode } from 'react';
import { TabButton } from './button/TabButton';
import { cn } from '@/core/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabNavigationProps<T extends string> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: readonly TabItem[];
  className?: string;
  wrapperClassName?: string;
  navClassName?: string;
  fullWidth?: boolean;
}

export function TabNavigation<T extends string>({
  activeTab,
  onTabChange,
  tabs,
  className = '',
  wrapperClassName = '',
  navClassName = '',
  fullWidth = false,
}: TabNavigationProps<T>) {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm mb-6',
      wrapperClassName
    )}>
      <div className="border-b">
        <nav className={cn(
          'flex px-6',
          fullWidth ? 'justify-between' : 'space-x-8',
          navClassName
        )}>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => onTabChange(tab.id as T)}
              disabled={tab.disabled}
              icon={tab.icon}
              badge={tab.badge}
              className={cn(
                fullWidth && 'flex-1 text-center',
                className
              )}
            >
              {tab.label}
            </TabButton>
          ))}
        </nav>
      </div>
    </div>
  );
}