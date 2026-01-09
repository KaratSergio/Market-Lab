import { UseFormReturn } from 'react-hook-form';
import { SupplierProfileFormData } from '@/core/schemas/supplier-schemas';
import { formatSupplierAddress } from '@/core/utils/supplier-utils';

interface AddressInfoProps {
  currentSupplier: any;
  isEditing: boolean;
  form: UseFormReturn<SupplierProfileFormData>;
}

export function AddressInfo({ currentSupplier, isEditing, form }: AddressInfoProps) {
  const { register, formState: { errors } } = form;

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          Primary Address
        </label>
        <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
          {currentSupplier?.primaryAddress?.fullAddress ||
            formatSupplierAddress(currentSupplier) ||
            'Not specified'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-600">
        Primary Address *
      </label>

      <div className="space-y-3">
        {/* Country */}
        <div>
          <input
            {...register('address.country')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            placeholder="Country *"
          />
          {errors.address?.country && (
            <p className="text-red-500 text-xs mt-1">{errors.address.country.message}</p>
          )}
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input
              {...register('address.city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="City *"
            />
            {errors.address?.city && (
              <p className="text-red-500 text-xs mt-1">{errors.address.city.message}</p>
            )}
          </div>
          <div>
            <input
              {...register('address.state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="State/Region"
            />
          </div>
        </div>

        {/* Street and Building */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input
              {...register('address.street')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Street *"
            />
            {errors.address?.street && (
              <p className="text-red-500 text-xs mt-1">{errors.address.street.message}</p>
            )}
          </div>
          <div>
            <input
              {...register('address.building')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Building/Apartment"
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <input
            {...register('address.postalCode')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            placeholder="Postal Code"
          />
        </div>
      </div>
    </div>
  );
}