'use client';

import { FieldErrors } from 'react-hook-form';
import { FileUpload } from '@/components/ui';
import { SupplierRegistrationFormData } from '@/core/schemas';
import { useTranslations } from 'next-intl';

interface DocumentsStepProps {
  errors: FieldErrors<SupplierRegistrationFormData>;
  onFilesChange: (files: File[]) => void;
}

export function DocumentsStep({ errors, onFilesChange }: DocumentsStepProps) {
  const t = useTranslations('SupplierForm.Documents');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('title')} *
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('description')}
        </p>
      </div>

      <FileUpload
        onFilesChange={onFilesChange}
        acceptedTypes=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
        maxSize={10 * 1024 * 1024}
        maxFiles={10}
        error={errors.documents?.message}
      />

      <div className="bg-yellow-50 rounded-lg p-4">
        <p className="text-sm text-yellow-700">
          {t('supportedFormats')}
        </p>
      </div>
    </div>
  );
}