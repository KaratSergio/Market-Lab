'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui';
import { SupplierRegistrationFormData } from '@/core/schemas';
import { useTranslations } from 'next-intl';

interface PersonalInfoStepProps {
  register: UseFormRegister<SupplierRegistrationFormData>;
  errors: FieldErrors<SupplierRegistrationFormData>;
}

export function PersonalInfoStep({ register, errors }: PersonalInfoStepProps) {
  const t = useTranslations('SupplierForm.PersonalInfo');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('firstName')} *
          </label>
          <Input
            {...register('firstName')}
            placeholder={t('firstNamePlaceholder')}
            error={errors.firstName?.message}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('lastName')} *
          </label>
          <Input
            {...register('lastName')}
            placeholder={t('lastNamePlaceholder')}
            error={errors.lastName?.message}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('phone')} *
        </label>
        <Input
          {...register('phone')}
          placeholder={t('phonePlaceholder')}
          error={errors.phone?.message}
        />
      </div>
    </div>
  );
}