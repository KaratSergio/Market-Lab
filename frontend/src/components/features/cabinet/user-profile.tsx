'use client';

import { useAuthStore } from '@/core/store/auth-store';

export function UserProfile() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
        
        <div className="space-y-6">
          {/* MAIN INFO */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                <p className="text-gray-900">{user?.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Roles</label>
                <p className="text-gray-900">{user?.roles?.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Change Password
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                Notification Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}