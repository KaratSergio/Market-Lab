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
  align?: 'left' | 'center' | 'right';
}

interface TabNavigationProps<T extends string> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: readonly TabItem[];
  className?: string;
  wrapperClassName?: string;
  navClassName?: string;
  buttonClassName?: string;
  fullWidth?: boolean;
  distribution?: 'auto' | 'left-right' | 'custom';
}

export function TabNavigation<T extends string>({
  activeTab,
  onTabChange,
  tabs,
  className = '',
  wrapperClassName = '',
  navClassName = '',
  buttonClassName = '',
  fullWidth = false,
  distribution = 'auto',
}: TabNavigationProps<T>) {

  const getTabGroups = () => {
    if (distribution === 'custom') {
      const leftTabs = tabs.filter(tab => !tab.align || tab.align === 'left');
      const centerTabs = tabs.filter(tab => tab.align === 'center');
      const rightTabs = tabs.filter(tab => tab.align === 'right');

      return { leftTabs, centerTabs, rightTabs };
    }

    if (distribution === 'left-right') {
      const leftTabs = tabs.slice(0, -1);
      const rightTabs = tabs.slice(-1);

      return { leftTabs, centerTabs: [], rightTabs };
    }

    // by default all tabs left
    return {
      leftTabs: tabs,
      centerTabs: [],
      rightTabs: []
    };
  };

  const { leftTabs, centerTabs, rightTabs } = getTabGroups();

  return (
    <div className={cn(
      'bg-white rounded-t-lg shadow-sm mb-6',
      wrapperClassName
    )}>
      <div className="border-b border-green-600">
        <nav className={cn(
          'flex justify-between items-center px-6',
          navClassName
        )}>
          {/* left tab group */}
          <div className="flex space-x-6">
            {leftTabs.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id as T)}
                disabled={tab.disabled}
                icon={tab.icon}
                badge={tab.badge}
                className={cn(
                  fullWidth && 'flex-1 text-center',
                  buttonClassName,
                  className
                )}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>

          {/* tabs by center */}
          {centerTabs.length > 0 && (
            <div className="flex space-x-8">
              {centerTabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  isActive={activeTab === tab.id}
                  onClick={() => onTabChange(tab.id as T)}
                  disabled={tab.disabled}
                  icon={tab.icon}
                  badge={tab.badge}
                  className={cn(
                    fullWidth && 'flex-1 text-center',
                    buttonClassName,
                    className
                  )}
                >
                  {tab.label}
                </TabButton>
              ))}
            </div>
          )}

          {/* Right tab group */}
          {rightTabs.length > 0 && (
            <div className="flex space-x-8">
              {rightTabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  isActive={activeTab === tab.id}
                  onClick={() => onTabChange(tab.id as T)}
                  disabled={tab.disabled}
                  icon={tab.icon}
                  badge={tab.badge}
                  className={cn(
                    fullWidth && 'flex-1 text-center',
                    buttonClassName,
                    className
                  )}
                >
                  {tab.label}
                </TabButton>
              ))}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}