import { UseFormReturn } from 'react-hook-form';
import { SupplierProfileFormData } from '@/core/schemas';
import { useTranslations } from 'next-intl';
import type { Supplier } from '@/core/types';

interface CompanyInfoProps {
  currentSupplier: Supplier;
  isEditing: boolean;
  form: UseFormReturn<SupplierProfileFormData>;
}

export function CompanyInfo({ currentSupplier, isEditing, form }: CompanyInfoProps) {
  const t = useTranslations('SupplierProfile.CompanyInfo');
  const { register, formState: { errors } } = form;

  return (
    <div className="border-b pb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            {t('companyName')} *
          </label>
          {isEditing ? (
            <div>
              <input
                {...register('companyName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                placeholder={t('companyNamePlaceholder')}
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
              {currentSupplier?.companyName || t('notSpecified')}
            </p>
          )}
        </div>

        {/* Registration Number */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            {t('registrationNumber')}
          </label>
          <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
            {currentSupplier?.registrationNumber || t('notSpecified')}
          </p>
        </div>

        {/* Contact Person */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            {t('contactPerson')}
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <input
                  {...register('firstName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  placeholder={t('firstNamePlaceholder')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register('lastName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  placeholder={t('lastNamePlaceholder')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
              {currentSupplier?.firstName || currentSupplier?.lastName
                ? `${currentSupplier.firstName} ${currentSupplier.lastName}`.trim()
                : t('notSpecified')
              }
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">{t('phone')}</label>
          {isEditing ? (
            <div>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                placeholder={t('phonePlaceholder')}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
              {currentSupplier?.phone || t('notSpecified')}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">{t('email')}</label>
          {isEditing ? (
            <div>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                placeholder={t('emailPlaceholder')}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
              {currentSupplier?.email || t('notSpecified')}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {t('description')}
        </label>
        {isEditing ? (
          <div>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>
        ) : (
          <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
            {currentSupplier?.description || t('noDescription')}
          </p>
        )}
      </div>
    </div>
  );
}