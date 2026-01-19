'use client';

import { AddressFormData } from '@/core/schemas';
import { useTranslations } from 'next-intl';

interface ConfirmationStepProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    address: AddressFormData;
    companyName: string;
    description: string;
    registrationNumber: string;
  };
  uploadedFilesCount: number;
}

export function ConfirmationStep({ formData, uploadedFilesCount }: ConfirmationStepProps) {
  const t = useTranslations('SupplierForm.Confirmation');

  const formatAddress = (address: AddressFormData) => {
    const parts = [
      address.street && address.building && `${address.street} ${address.building}`,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">{t('title')}</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('name')}</p>
            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('phone')}</p>
            <p className="font-medium">{formData.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">{t('address')}</p>
            <p className="font-medium">
              {formatAddress(formData.address)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('farmName')}</p>
            <p className="font-medium">{formData.companyName}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('registrationNumber')}</p>
            <p className="font-medium">{formData.registrationNumber}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">{t('description')}</p>
            <p className="font-medium">{formData.description}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">{t('documents')}</p>
            <p className="font-medium">{t('filesUploaded', { count: uploadedFilesCount })}</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <p className="text-sm text-green-700">
          {t('verificationInfo')}
        </p>
      </div>
    </div>
  );
}