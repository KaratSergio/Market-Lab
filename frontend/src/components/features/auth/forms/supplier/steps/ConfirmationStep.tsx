import { AddressFormData } from '@/core/schemas/auth-schemas';

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
        <h3 className="font-medium text-gray-900">Review Your Information</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{formData.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Address</p>
            <p className="font-medium">
              {formatAddress(formData.address)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Farm Name</p>
            <p className="font-medium">{formData.companyName}</p>
          </div>
          <div>
            <p className="text-gray-500">Registration Number</p>
            <p className="font-medium">{formData.registrationNumber}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Description</p>
            <p className="font-medium">{formData.description}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Documents</p>
            <p className="font-medium">{uploadedFilesCount} files uploaded</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Your documents will be verified within 1-2 business days.
        </p>
      </div>
    </div>
  );
}