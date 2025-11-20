'use client';

import { useAuthStore } from '@/core/store/auth-store';
import { useSession } from '@/core/hooks/use-auth';


export function CabinetContent() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: sessionUser } = useSession();

  //!! Автоматически синхронизируется через useSession hook
  const currentUser = user || sessionUser;

  if (!isAuthenticated && !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to your Cabinet
        </h1>
        
        <div className="space-y-4">
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Profile
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}