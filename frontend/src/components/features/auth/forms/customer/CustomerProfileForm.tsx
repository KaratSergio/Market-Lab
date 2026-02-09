'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterComplete } from '@/core/hooks/useAuth';
import { createCustomerFormData } from '@/core/utils/api-utils';
import { ProgressBar, NavigationButtons } from '@/components/ui';

import {
  customerRegistrationSchema,
  CustomerRegistrationFormData
} from '@/core/schemas';

import { getCustomerRegistrationDefaultValues } from '@/core/utils/form-defaults';
import { customerStepFieldPaths } from '@/core/types/formTypes';

// step components
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { CustomerAddressStep } from './steps/AddressStep';
import { ContactDetailsStep } from './steps/ContactDetailsStep';
import { CustomerConfirmationStep } from './steps/ConfirmationStep';

const steps = ['Personal Info', 'Contact Details', 'Address', 'Confirmation'];

export function CustomerProfileForm() {
  const completeRegistration = useRegisterComplete();
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    getFieldState,
  } = useForm<CustomerRegistrationFormData>({
    resolver: zodResolver(customerRegistrationSchema),
    mode: 'onChange',
    defaultValues: getCustomerRegistrationDefaultValues(),
  });

  const onSubmit = async (data: CustomerRegistrationFormData) => {
    const formData = createCustomerFormData({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
    });

    completeRegistration.mutate(formData);
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return !getFieldState('firstName').invalid &&
          !getFieldState('lastName').invalid;

      case 1: // Contact Details
        return !getFieldState('phone').invalid;

      case 2: // Address
        return !getFieldState('address.country').invalid &&
          !getFieldState('address.city').invalid &&
          !getFieldState('address.street').invalid &&
          !getFieldState('address.building').invalid;

      case 3: // Confirmation
        return true;

      default:
        return false;
    }
  };

  const handleNext = async () => {
    const fieldPaths = customerStepFieldPaths[currentStep as keyof typeof customerStepFieldPaths];

    if (fieldPaths) {
      const result = await trigger(fieldPaths);
      if (!result) return;
    }

    if (isCurrentStepValid() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const formData = watch();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      case 1:
        return <ContactDetailsStep register={register} errors={errors} />;
      case 2:
        return (
          <CustomerAddressStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      case 3:
        return (
          <CustomerConfirmationStep
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              birthDate: formData.birthDate,
              phone: formData.phone,
              address: formData.address,
            }}
          />
        );
      default:
        return null;
    }
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
          {renderStep()}

          <NavigationButtons
            currentStep={currentStep}
            stepsCount={steps.length}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit(onSubmit)}
            isNextDisabled={!isCurrentStepValid()}
            isSubmitting={completeRegistration.isPending}
          />
        </form>
      </div>
    </div>
  );
}