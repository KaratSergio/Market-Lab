'use client';

import { useAuthStore } from '@/core/store/authStore';
import { useAdmins, useDeleteAdmin } from '@/core/hooks/useAdmin';
import { AdminCreateForm } from './forms/AdminCreateForm';
import { Button } from '@/components/ui/button/Button';
import { useTranslations } from 'next-intl';

export function AdminManagement() {
  const user = useAuthStore((state) => state.user);
  const canManageAdmins = useAuthStore((state) => state.canManageAdmins);
  const { data: admins, isLoading } = useAdmins();
  const { mutate: deleteAdmin } = useDeleteAdmin();

  const t = useTranslations('AdminManagement');
  const tCommon = useTranslations('Common');

  if (!user || !user.roles.includes('admin')) return null;

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm(t('deleteConfirm'))) {
      deleteAdmin(adminId);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{t('panelTitle')}</h1>
        <p className="text-gray-600">{t('panelDescription')}</p>
      </div>

      {canManageAdmins() && (
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('createNewAdmin')}</h2>
          <AdminCreateForm />
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('administrators')}</h2>

        {isLoading ? (
          <div>{t('loadingAdmins')}</div>
        ) : !admins?.length ? (
          <div className="text-gray-500">{t('noAdmins')}</div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
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
                    {tCommon('delete')}
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