'use client';

import { useState } from 'react';
import { TabNavigation } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/core/store/authStore';

import { AdminManagement } from './AdminManagement';
import { SupplierApproval } from './SupplierApproval';
import { SystemOverview } from './SystemOverview';

type AdminTab = 'overview' | 'admins' | 'suppliers';

export function AdminDashboard() {
  const t = useTranslations('AdminDashboard');
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const ADMIN_TABS = [
    {
      id: 'overview' as const,
      label: t('tabs.overview'),
      icon: '📊',
      align: 'left' as const
    },
    {
      id: 'suppliers' as const,
      label: t('tabs.suppliers'),
      icon: '👥',
      badge: 5,
      align: 'left' as const
    },
    {
      id: 'admins' as const,
      label: t('tabs.admins'),
      icon: '🔧',
      align: 'right' as const
    },
  ] as const;

  if (!isAuthenticated || !user || !user.roles.includes('admin')) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">{t('unauthorized')}</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'admins':
        return <AdminManagement />;
      case 'suppliers':
        return <SupplierApproval />;
      default:
        return <SystemOverview user={user} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600">{t('description')}</p>
      </div>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={ADMIN_TABS}
        distribution="custom"
      />

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
}