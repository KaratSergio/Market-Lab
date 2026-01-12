import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui';
import { SupplierProfileFormData } from '@/core/schemas/auth-schemas';

interface FarmDetailsStepProps {
  register: UseFormRegister<SupplierProfileFormData>;
  errors: FieldErrors<SupplierProfileFormData>;
}

export function FarmDetailsStep({ register, errors }: FarmDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Farm Name *
        </label>
        <Input
          {...register('companyName')}
          placeholder="Green Valley Farm"
          error={errors.companyName?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Registration Number *
        </label>
        <Input
          {...register('registrationNumber')}
          placeholder="Tax ID or Registration Number"
          error={errors.registrationNumber?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Farm Description *
        </label>
        <Textarea
          {...register('description')}
          placeholder="Tell us about your farm, products, and farming practices..."
          minRows={3}
          maxRows={10}
          maxLength={500}
          error={errors.description?.message}
        />
      </div>
    </div>
  );
}