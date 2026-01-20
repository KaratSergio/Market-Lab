'use client';

import { useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { TabNavigation } from '@/components/ui';
import { useTranslations } from 'next-intl';

import { SupplierOverview } from './SupplierOverview';
import { SupplierProfile } from './profile/SupplierProfile';
import { SupplierProducts } from './products/SupplierProducts';

type ActiveTab = 'dashboard' | 'profile' | 'products';

export function SupplierDashboard() {
  const t = useTranslations('SupplierDashboard');
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const SUPPLIER_TABS = [
    {
      id: 'dashboard' as const,
      label: t('tabs.dashboard'),
      icon: '📈',
      align: 'left' as const
    },
    {
      id: 'products' as const,
      label: t('tabs.products'),
      icon: '📦',
      badge: 24,
      align: 'left' as const
    },
    {
      id: 'profile' as const,
      label: t('tabs.profile'),
      icon: '👤',
      align: 'right' as const
    },
  ] as const;

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SupplierProfile />;
      case 'products':
        return <SupplierProducts />;
      default:
        return <SupplierOverview user={user} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={SUPPLIER_TABS}
        distribution="custom"
      />
      {renderContent()}
    </div>
  );
}