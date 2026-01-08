'use client';

import { useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { TabNavigation } from '@/components/ui';

import { SupplierOverview } from './SupplierOverview';
import { SupplierProfile } from './SupplierProfile';
import { SupplierProducts } from './SupplierProducts';

type ActiveTab = 'dashboard' | 'profile' | 'products';

const SUPPLIER_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'products', label: 'Products', icon: '📦', badge: 24 },
] as const;

export function SupplierDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading...</div>
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
      />
      {renderContent()}
    </div>
  );
}