'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterComplete } from '@/core/hooks/useAuth';
import { createSupplierFormData } from '@/core/utils/api-utils';
import { ProgressBar, NavigationButtons } from '@/components/ui';
import { useTranslations, useLocale } from 'next-intl';

import {
  createSupplierSchemas,
  SupplierRegistrationFormData
} from '@/core/schemas/supplier-schemas';

import { getSupplierRegistrationDefaultValues } from '@/core/utils/form-defaults';
import { supplierStepFieldPaths } from '@/core/types/form-types';

// step components
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { AddressStep } from './steps/AddressStep';
import { FarmDetailsStep } from './steps/FarmDetailsStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

const steps = ['Personal Info', 'Address', 'Farm Details', 'Documents', 'Confirmation'];

export function SupplierProfileForm() {
  const locale = useLocale();
  const t = useTranslations('SupplierForm');
  const completeRegistration = useRegisterComplete();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { supplierRegistrationSchema } = createSupplierSchemas(locale);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    getFieldState,
  } = useForm<SupplierRegistrationFormData>({
    resolver: zodResolver(supplierRegistrationSchema),
    mode: 'onChange',
    defaultValues: getSupplierRegistrationDefaultValues(),
  });

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    setValue('documents', files, { shouldValidate: true });
  };

  const onSubmit = async (data: SupplierRegistrationFormData) => {
    const formData = createSupplierFormData(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        companyName: data.companyName,
        description: data.description,
        registrationNumber: data.registrationNumber,
      },
      uploadedFiles
    );

    completeRegistration.mutate(formData);
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return !getFieldState('firstName').invalid &&
          !getFieldState('lastName').invalid &&
          !getFieldState('phone').invalid;

      case 1: // Address
        return !getFieldState('address.country').invalid &&
          !getFieldState('address.city').invalid &&
          !getFieldState('address.street').invalid &&
          !getFieldState('address.building').invalid;

      case 2: // Farm Details
        return !getFieldState('companyName').invalid &&
          !getFieldState('registrationNumber').invalid &&
          !getFieldState('description').invalid;

      case 3: // Documents
        return uploadedFiles.length > 0;

      case 4: // Confirmation
        return true;

      default:
        return false;
    }
  };

  const handleNext = async () => {
    const fieldPaths = supplierStepFieldPaths[currentStep as keyof typeof supplierStepFieldPaths];

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
        return <PersonalInfoStep register={register} errors={errors} />;
      case 1:
        return (
          <AddressStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        );
      case 2:
        return <FarmDetailsStep
          register={register}
          errors={errors}
        />;
      case 3:
        return (
          <DocumentsStep
            errors={errors}
            onFilesChange={handleFileUpload}
          />
        );
      case 4:
        return (
          <ConfirmationStep
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              address: formData.address,
              companyName: formData.companyName,
              description: formData.description,
              registrationNumber: formData.registrationNumber,
            }}
            uploadedFilesCount={uploadedFiles.length}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <ProgressBar
          steps={t.raw('steps')}
          currentStep={currentStep}
        />

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