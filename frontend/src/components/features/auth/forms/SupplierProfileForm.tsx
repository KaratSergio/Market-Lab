'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierProfileSchema, SupplierProfileFormData } from '@/core/utils/zod-schemas';
import { useRegisterComplete } from '@/core/hooks/useAuth';
import { createSupplierFormData } from '@/core/utils/api-utils';
import { FileUpload, ProgressBar, Button, Input, Textarea } from '@/components/ui';

const steps = ['Personal Info', 'Farm Details', 'Documents', 'Confirmation'];

export function SupplierProfileForm() {
  const completeRegistration = useRegisterComplete();

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    getFieldState,
  } = useForm<SupplierProfileFormData>({
    resolver: zodResolver(supplierProfileSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      companyName: '',
      description: '',
      registrationNumber: '',
      documents: [],
    },
  });

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    setValue('documents', files, { shouldValidate: true });
  };

  const onSubmit = async (data: SupplierProfileFormData) => {
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

  // Checking the validity of the current step
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0:
        const firstNameValid = !getFieldState('firstName').invalid;
        const lastNameValid = !getFieldState('lastName').invalid;
        const phoneValid = !getFieldState('phone').invalid;
        const addressValid = !getFieldState('address').invalid;
        return firstNameValid && lastNameValid && phoneValid && addressValid;

      case 1:
        const companyNameValid = !getFieldState('companyName').invalid;
        const registrationNumberValid = !getFieldState('registrationNumber').invalid;
        const descriptionValid = !getFieldState('description').invalid;
        return companyNameValid && registrationNumberValid && descriptionValid;

      case 2:
        return uploadedFiles.length > 0;

      case 3:
        return true;

      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Validate steps
    let fieldsToValidate: (keyof SupplierProfileFormData)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['firstName', 'lastName', 'phone', 'address'];
        break;
      case 1:
        fieldsToValidate = ['companyName', 'registrationNumber', 'description'];
        break;
      case 2:
        //! Для файлів окрема логіка
        break;
    }

    if (currentStep !== 2) {
      await trigger(fieldsToValidate);
    }

    if (isCurrentStepValid() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Complete Farmer Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Provide details about your farm and upload required documents
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
                    First Name *
                  </label>
                  <Input
                    {...register('firstName')}
                    placeholder="John"
                    error={errors.firstName?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
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
                  Phone Number *
                </label>
                <Input
                  {...register('phone')}
                  placeholder="+380 XX XXX XXXX"
                  error={errors.phone?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <Input
                  {...register('address')}
                  placeholder="Farm location"
                  error={errors.address?.message}
                />
              </div>
            </div>
          )}

          {/* Step 2: Farm Details */}
          {currentStep === 1 && (
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
          )}

          {/* Step 3: Documents */}
          {currentStep === 2 && (
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
                onFilesChange={handleFileUpload}
                acceptedTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                maxSize={10 * 1024 * 1024}
                maxFiles={10}
                error={errors.documents?.message}
              />

              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  Supported formats: PDF, JPG, PNG, DOC. Max file size: 10MB
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-900">Review Your Information</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{watch('firstName')} {watch('lastName')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{watch('phone')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Farm Name</p>
                    <p className="font-medium">{watch('companyName')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Registration Number</p>
                    <p className="font-medium">{watch('registrationNumber')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">{watch('address')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Description</p>
                    <p className="font-medium">{watch('description')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Documents</p>
                    <p className="font-medium">{uploadedFiles.length} files uploaded</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Your documents will be verified within 1-2 business days.
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
                disabled={!isCurrentStepValid()}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={completeRegistration.isPending}
                className="flex-1"
              >
                {completeRegistration.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}