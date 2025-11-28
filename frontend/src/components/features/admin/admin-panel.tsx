'use client';

import { useAuthStore } from '@/core/store/auth-store';
import { useAdmins, useDeleteAdmin } from '@/core/hooks/use-admin.hooks';
import { AdminCreateForm } from '@/components/forms/admin-create-form';
import { Button } from '@/components/ui/button/button';


export function AdminPanel() {
  const user = useAuthStore((state) => state.user);
  const canManageAdmins = useAuthStore((state) => state.canManageAdmins);
  const { data: admins, isLoading } = useAdmins();
  const { mutate: deleteAdmin } = useDeleteAdmin();

  if (!user || !user.roles.includes('admin'))  return null;

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      deleteAdmin(adminId);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-600">Manage system administrators</p>
      </div>

      {/* The admin creation section is only for SUPER_ADMIN.*/}
      {canManageAdmins() && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
          <AdminCreateForm />
        </section>
      )}

      {/* Admin list */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Administrators</h2>
        
        {isLoading ? (
          <div>Loading admins...</div>
        ) : (
          <div className="space-y-4">
            {admins?.map((admin) => (
              <div key={admin.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {admin.firstName} {admin.lastName}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {admin.role}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {admin.status}
                    </span>
                  </div>
                </div>

                {canManageAdmins() && admin.role !== 'super_admin' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteAdmin(admin.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}