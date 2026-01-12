import { useState, useEffect } from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui';
import { SupplierProfileFormData } from '@/core/schemas/auth-schemas';

interface AddressStepProps {
  register: UseFormRegister<SupplierProfileFormData>;
  errors: FieldErrors<SupplierProfileFormData>;
  watch: UseFormWatch<SupplierProfileFormData>;
  setValue: UseFormSetValue<SupplierProfileFormData>;
}

export function AddressStep({ register, errors, watch, setValue }: AddressStepProps) {
  const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({});

  const geocodeAddress = async () => {
    const country = watch('address.country');
    const city = watch('address.city');
    const street = watch('address.street');
    const building = watch('address.building');

    if (country && city && street && building) {
      const fullAddress = `${street} ${building}, ${city}, ${country}`;

      try {
        // for demo
        const fakeCoords = {
          lat: 50.4501 + (Math.random() - 0.5) * 0.1,
          lng: 30.5234 + (Math.random() - 0.5) * 0.1,
        };
        setCoordinates(fakeCoords);
        setValue('address.lat', fakeCoords.lat, { shouldValidate: false });
        setValue('address.lng', fakeCoords.lng, { shouldValidate: false });
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      geocodeAddress();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    watch('address.country'),
    watch('address.city'),
    watch('address.street'),
    watch('address.building')
  ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <Input
            {...register('address.country')}
            placeholder="Ukraine"
            error={errors.address?.country?.message}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <Input
            {...register('address.city')}
            placeholder="Kyiv"
            error={errors.address?.city?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street *
          </label>
          <Input
            {...register('address.street')}
            placeholder="Khreshchatyk Street"
            error={errors.address?.street?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Building Number *
          </label>
          <Input
            {...register('address.building')}
            placeholder="1A"
            error={errors.address?.building?.message}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <Input
            {...register('address.postalCode')}
            placeholder="01001"
            error={errors.address?.postalCode?.message}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State/Region
        </label>
        <Input
          {...register('address.state')}
          placeholder="Kyiv Oblast"
          error={errors.address?.state?.message}
        />
      </div>

      {coordinates.lat && coordinates.lng && (
        <div className="text-sm text-gray-500 mt-2">
          Coordinates detected: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}