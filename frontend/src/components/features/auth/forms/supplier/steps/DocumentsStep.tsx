import { FieldErrors } from 'react-hook-form';
import { FileUpload } from '@/components/ui';
import { SupplierProfileFormData } from '@/core/schemas/auth-schemas';

interface DocumentsStepProps {
  errors: FieldErrors<SupplierProfileFormData>;
  onFilesChange: (files: File[]) => void;
}

export function DocumentsStep({ errors, onFilesChange }: DocumentsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Required Documents *
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please upload certificates, licenses, and other legal documents (at least 1 required)
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
          Supported formats: PDF, JPG, PNG, WEBP, DOC. Max file size: 10MB
        </p>
      </div>
    </div>
  );
}