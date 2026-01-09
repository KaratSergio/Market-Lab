import { UseFormReturn } from 'react-hook-form';
import { SupplierProfileFormData } from '@/core/schemas/supplier-schemas';

interface AccountInfoProps {
  user: any;
  currentSupplier: any;
  isEditing: boolean;
  form: UseFormReturn<SupplierProfileFormData>;
}

export function AccountInfo({ user, currentSupplier, isEditing, form }: AccountInfoProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="border-b pb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
          <p className="text-gray-900 p-2 bg-gray-50 rounded text-sm md:text-base">
            {user?.email}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
          <div className="p-2 bg-gray-50 rounded">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${currentSupplier?.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
              ${currentSupplier?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${currentSupplier?.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
            `}>
              {currentSupplier?.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}