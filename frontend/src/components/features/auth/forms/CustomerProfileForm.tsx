'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerProfileSchema, CustomerProfileFormData } from '@/core/utils/validations';
import { useRegisterComplete } from '@/core/hooks/useAuth';
import { DatePicker, Input, Button, ProgressBar } from '@/components/ui';

const steps = ['Personal Info', 'Contact Details', 'Confirmation'];

export function CustomerProfileForm() {
  const completeRegistration = useRegisterComplete();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepValidity, setStepValidity] = useState<boolean[]>([false, false, true]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    getFieldState,
  } = useForm<CustomerProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      birthDate: undefined,
    },
  });

  const updateStepValidity = async (step: number) => {
    let fieldsToValidate: (keyof CustomerProfileFormData)[] = [];

    switch (step) {
      case 0:
        fieldsToValidate = ['firstName', 'lastName'];
        //! birthDate optional
        break;
      case 1:
        fieldsToValidate = ['phone', 'address'];
        break;
      default:
        return;
    }

    const results = await Promise.all(
      fieldsToValidate.map(field => trigger(field))
    );

    const isStepValid = results.every(result => result === true);
    setStepValidity(prev => {
      const newValidity = [...prev];
      newValidity[step] = isStepValid;
      return newValidity;
    });
  };

  const handleNext = async () => {
    await updateStepValidity(currentStep);

    if (stepValidity[currentStep] && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CustomerProfileFormData) => {
    completeRegistration.mutate({
      role: 'customer',
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        birthDate: data.birthDate?.toISOString(),
      },
    });
  };

  const isStep1Valid = () => {
    const firstNameValid = !getFieldState('firstName').invalid;
    const lastNameValid = !getFieldState('lastName').invalid;
    // birthDate
    return firstNameValid && lastNameValid;
  };

  const isStep2Valid = () => {
    const phoneValid = !getFieldState('phone').invalid;
    const addressValid = !getFieldState('address').invalid;
    return phoneValid && addressValid;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in your details to get started
          </p>
        </div>

        <ProgressBar steps={steps} currentStep={currentStep} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    {...register('firstName')}
                    placeholder="John"
                    error={errors.firstName?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    {...register('lastName')}
                    placeholder="Doe"
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-gray-400 text-sm">(optional)</span>
                </label>
                <DatePicker
                  value={watch('birthDate')}
                  onChange={(date) => setValue('birthDate', date)}
                  error={errors.birthDate?.message}
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  {...register('phone')}
                  placeholder="+380 XX XXX XXXX"
                  error={errors.phone?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  {...register('address')}
                  placeholder="City, Street, Building"
                  error={errors.address?.message}
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Review Your Information</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{watch('firstName')} {watch('lastName')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Birth Date</p>
                    <p className="font-medium">
                      {watch('birthDate')?.toLocaleDateString() || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{watch('phone') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">{watch('address') || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Your information will be used to personalize your experience and for delivery purposes.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
                disabled={
                  currentStep === 0 ? !isStep1Valid() :
                    currentStep === 1 ? !isStep2Valid() :
                      false
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={completeRegistration.isPending}
                className="flex-1"
              >
                {completeRegistration.isPending ? 'Completing...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}