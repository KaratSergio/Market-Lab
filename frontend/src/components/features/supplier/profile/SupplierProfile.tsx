'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/core/store/authStore';
import { useSupplierStore } from '@/core/store/supplierStore';
import { Spinner } from '@/components/ui';

import {
  useMySupplierProfile,
  useUpdateSupplierProfile,
  useSupplierDocuments,
  useUploadSupplierDocuments,
  useDeleteSupplierDocument
} from '@/core/hooks/useSupplier';

import {
  supplierProfileSchema,
  SupplierProfileFormData
} from '@/core/schemas/supplier-schemas';

// sub components
import { ProfileHeader } from './ProfileHeader';
import { AccountInfo } from './AccountInfo';
import { CompanyInfo } from './CompanyInfo';
import { AddressInfo } from './AddressInfo';
import { StatisticsCard } from './StatisticsCard';
import { DocumentsSection } from './DocumentsSection';

export function SupplierProfile() {
  const { user } = useAuthStore();

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateSupplierProfile();
  const { mutate: uploadDocument, isPending: isUploading } = useUploadSupplierDocuments();
  const { mutate: deleteDocument } = useDeleteSupplierDocument();

  const currentSupplier = useSupplierStore(state => state.currentSupplier);
  const documents = useSupplierStore(state => state.documents);

  const {
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useMySupplierProfile();

  const {
    isLoading: documentsLoading,
    refetch: refetchDocuments
  } = useSupplierDocuments(currentSupplier?.id || '');

  const [isEditing, setIsEditing] = useState(false);

  // React Hook Form
  const form = useForm<SupplierProfileFormData>({
    resolver: zodResolver(supplierProfileSchema),
    defaultValues: {
      companyName: '',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      description: '',
      address: {
        country: '',
        city: '',
        street: '',
        state: '',
        building: '',
        postalCode: '',
      }
    }
  });

  // Load data into form
  useEffect(() => {
    if (currentSupplier && !isEditing) {
      form.reset({
        companyName: currentSupplier.companyName || '',
        firstName: currentSupplier.firstName || '',
        lastName: currentSupplier.lastName || '',
        phone: currentSupplier.phone || '',
        email: currentSupplier.email || user?.email || '',
        description: currentSupplier.description || '',
        address: {
          country: currentSupplier.primaryAddress?.country || '',
          city: currentSupplier.primaryAddress?.city || '',
          street: currentSupplier.primaryAddress?.street || '',
          state: currentSupplier.primaryAddress?.state || '',
          building: currentSupplier.primaryAddress?.building || '',
          postalCode: currentSupplier.primaryAddress?.postalCode || '',
        }
      });
    }
  }, [currentSupplier, user?.email, isEditing, form]);

  const handleSave = form.handleSubmit((data) => {
    if (!currentSupplier) return;

    updateProfile({
      companyName: data.companyName,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      description: data.description || undefined,
      address: {
        country: data.address.country,
        city: data.address.city,
        street: data.address.street,
        state: data.address.state,
        building: data.address.building,
        postalCode: data.address.postalCode,
      }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        refetchProfile();
      }
    });
  });

  const handleUpload = (files: File[]) => {
    if (!currentSupplier) return;
    uploadDocument(files, {
      onSuccess: () => {
        refetchDocuments();
        refetchProfile();
      }
    });
  };

  const handleDeleteDocument = (documentUrl: string, documentName: string) => {
    if (window.confirm(`Delete document "${documentName}"?`)) {
      deleteDocument(documentUrl, {
        onSuccess: () => {
          refetchDocuments();
          refetchProfile();
        }
      });
    }
  };

  if (profileLoading || documentsLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
            <Spinner className="h-8 w-64" />
            <Spinner className="h-32 w-full" />
            <Spinner className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-red-500 text-lg">Error loading profile</div>
            <p className="text-gray-600 mt-2">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // const stats = supplierData?.stats || {};

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:p-8">
          {/* Header */}
          <ProfileHeader
            isEditing={isEditing}
            isUpdating={isUpdating}
            onEdit={() => setIsEditing(true)}
            onCancel={() => {
              setIsEditing(false);
              form.reset();
            }}
            onSave={handleSave}
          />

          {/* Statistics */}
          {/* {Object.keys(stats).length > 0 && (
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatisticsCard
                title="Total Products"
                value={stats.totalProducts || 0}
                color="blue"
              />
              <StatisticsCard
                title="Active Orders"
                value={stats.activeOrders || 0}
                color="green"
              />
              <StatisticsCard
                title="Total Revenue"
                value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
                color="purple"
              />
              <StatisticsCard
                title="Rating"
                value={`${(stats.rating || 0).toFixed(1)}/5`}
                color="yellow"
              />
            </div>
          )} */}

          <div className="space-y-6 md:space-y-8">
            {/* Account Information */}
            <AccountInfo
              user={user}
              currentSupplier={currentSupplier}
              isEditing={isEditing}
              form={form}
            />

            {/* Company Information */}
            <CompanyInfo
              currentSupplier={currentSupplier}
              isEditing={isEditing}
              form={form}
            />

            {/* Address Information */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Addresses
              </h2>
              <AddressInfo
                currentSupplier={currentSupplier}
                isEditing={isEditing}
                form={form}
              />
            </div>

            {/* Documents Section */}
            {currentSupplier && (
              <DocumentsSection
                supplierId={currentSupplier.id}
                documents={documents}
                isUploading={isUploading}
                onUpload={handleUpload}
                onDelete={handleDeleteDocument}
              />
            )}

            {/* Account Actions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Actions</h2>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base flex-1 sm:flex-none">
                  Change Password
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm md:text-base flex-1 sm:flex-none">
                  Notifications
                </button>
                <button className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm md:text-base flex-1 sm:flex-none">
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}