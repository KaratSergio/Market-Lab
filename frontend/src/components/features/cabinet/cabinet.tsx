'use client';

import { useAuthStore } from '@/core/store/auth-store';
import { useSession } from '@/core/hooks/use-auth';
import { useState } from 'react';
import { UserProfile } from './user-profile';
import { UserOrders } from './user-orders';

type ActiveTab = 'dashboard' | 'profile' | 'orders';

export function Cabinet() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: sessionUser } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  //   //!! Автоматически синхронизируется через useSession hook
  const currentUser = user || sessionUser;

  if (!isAuthenticated && !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UserProfile />;
      case 'orders':
        return <UserOrders />;
      default:
        return <DashboardContent user={currentUser} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* TAB NAVIGATION */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Orders
            </button>
          </nav>
        </div>
      </div>

      {/* CONTENT */}
      {renderContent()}
    </div>
  );
}

// DASHBOARD CONTENT
function DashboardContent({ user }: { user: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to your Cabinet, {user?.email}!
      </h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">User Information</h2>
          <div className="mt-2 space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-700">Quick Actions</h2>
          <div className="mt-2 flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Action_1
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              Action_2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
