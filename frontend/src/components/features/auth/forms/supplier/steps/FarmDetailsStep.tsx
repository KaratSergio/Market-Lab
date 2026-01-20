'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui';
import { SupplierRegistrationFormData } from '@/core/schemas';
import { useTranslations } from 'next-intl';

interface FarmDetailsStepProps {
  register: UseFormRegister<SupplierRegistrationFormData>;
  errors: FieldErrors<SupplierRegistrationFormData>;
}

export function FarmDetailsStep({ register, errors }: FarmDetailsStepProps) {
  const t = useTranslations('SupplierForm.FarmDetails');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('farmName')} *
        </label>
        <Input
          {...register('companyName')}
          placeholder={t('farmNamePlaceholder')}
          error={errors.companyName?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('registrationNumber')} *
        </label>
        <Input
          {...register('registrationNumber')}
          placeholder={t('registrationNumberPlaceholder')}
          error={errors.registrationNumber?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('description')} *
        </label>
        <Textarea
          {...register('description')}
          placeholder={t('descriptionPlaceholder')}
          minRows={3}
          maxRows={10}
          maxLength={500}
          error={errors.description?.message}
        />
      </div>
    </div>
  );
}