'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button/Button';
import { useTranslations, useLocale } from 'next-intl';

export function RoleSelectionForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('RoleSelection');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'supplier' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push(`/${locale}/register/${selectedRole}`);
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedRole('customer')}
          className={`
            w-full p-6 text-left rounded-lg border-2 transition-all
            ${selectedRole === 'customer'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <h3 className="text-lg font-semibold text-gray-900">👤 {t('customer.title')}</h3>
          <p className="mt-1 text-sm text-gray-600">{t('customer.description')}</p>
          <ul className="mt-4 space-y-1 text-sm text-gray-500">
            <li>• {t('customer.features.orderProducts')}</li>
            <li>• {t('customer.features.trackDelivery')}</li>
            <li>• {t('customer.features.saveFavorites')}</li>
          </ul>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('supplier')}
          className={`
            w-full p-6 text-left rounded-lg border-2 transition-all
            ${selectedRole === 'supplier'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
            }
          `}
        >
          <h3 className="text-lg font-semibold text-gray-900">🚜 {t('supplier.title')}</h3>
          <p className="mt-1 text-sm text-gray-600">{t('supplier.description')}</p>
          <ul className="mt-4 space-y-1 text-sm text-gray-500">
            <li>• {t('supplier.features.addProducts')}</li>
            <li>• {t('supplier.features.manageOrders')}</li>
          </ul>
        </button>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedRole || isLoading}
        className="w-full"
      >
        {isLoading ? '...' : t('continueButton')}
      </Button>
    </div>
  );
}