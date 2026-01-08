'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import {
  useMySupplierProfile,
  useUpdateSupplierProfile,
  useSupplierDocuments,
  useUploadSupplierDocument,
  useDeleteSupplierDocument
} from '@/core/hooks/useSupplier';
import { useSupplierStore } from '@/core/store/supplierStore';
import { formatSupplierAddress } from '@/core/utils/supplier-utils';
import { Spinner } from '@/components/ui/Spinner';

export function SupplierProfile() {
  const { user } = useAuthStore();

  console.log('user', {
    userEmail: user?.email,
    userRole: user?.roles
  });

  const {
    data: supplierData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useMySupplierProfile();

  console.log('Profile', {
    supplierData,
    profileLoading,
    profileError,
    hasData: !!supplierData
  });


  const { mutate: updateProfile, isPending: isUpdating } = useUpdateSupplierProfile();
  const { mutate: uploadDocument, isPending: isUploading } = useUploadSupplierDocument();
  const { mutate: deleteDocument } = useDeleteSupplierDocument();

  const currentSupplier = useSupplierStore(state => state.currentSupplier);
  const supplierProfile = useSupplierStore(state => state.supplierProfile);
  const documents = useSupplierStore(state => state.documents);


  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    address: {
      country: '',
      city: '',
      street: '',
      state: '',
      zipCode: '',
    }
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  // add data to form
  useEffect(() => {
    if (currentSupplier) {
      setFormData({
        companyName: currentSupplier.companyName || '',
        firstName: currentSupplier.firstName || '',
        lastName: currentSupplier.lastName || '',
        phone: currentSupplier.phone || '',
        email: currentSupplier.email || user?.email || '',
        website: currentSupplier.website || '',
        description: currentSupplier.description || '',
        address: {
          country: currentSupplier.address?.country || '',
          city: currentSupplier.address?.city || '',
          street: currentSupplier.address?.street || '',
          state: currentSupplier.address?.state || '',
          zipCode: currentSupplier.address?.zipCode || '',
        }
      });
    }
  }, [currentSupplier, user?.email]);

  useSupplierDocuments(currentSupplier?.id || '');

  const handleSave = () => {
    if (!currentSupplier) return;

    updateProfile({
      companyName: formData.companyName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      website: formData.website || undefined,
      description: formData.description || undefined,
      address: {
        ...formData.address
      }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        refetchProfile();
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // for address
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Only PDF, JPEG, WEBP, and PNG files are allowed');
      return;
    }

    // Check size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must be less than 5MB');
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (!selectedFile || !currentSupplier) return;

    uploadDocument(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        const fileInput = document.getElementById('document-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    });
  };

  const handleDeleteDocument = (documentKey: string, documentName: string) => {
    if (window.confirm(`Delete document "${documentName}"?`)) {
      deleteDocument(documentKey);
    }
  };

  if (profileLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        <Spinner className="h-8 w-64" />
        <Spinner className="h-32 w-full" />
        <Spinner className="h-64 w-full" />
      </div>
    );
  }

  // for statistics
  const stats = supplierProfile?.stats;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalProducts || 0}</div>
            <div className="text-sm text-blue-800">Total Products</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.activeOrders || 0}</div>
            <div className="text-sm text-green-800">Active Orders</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ${stats.totalRevenue?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-purple-800">Total Revenue</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.rating?.toFixed(1) || 0}/5
            </div>
            <div className="text-sm text-yellow-800">Rating</div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Account Information */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded capitalize">
                {currentSupplier?.status || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Company Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">
                  {formData.companyName || 'Not specified'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Registration Number</label>
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {currentSupplier?.registrationNumber || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Contact Person</label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                  />
                </div>
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">
                  {formData.firstName || formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`.trim()
                    : 'Not specified'
                  }
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">
                  {formData.phone || 'Not specified'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">
                  {formData.email || 'Not specified'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Website</label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">
                  {formData.website || 'Not specified'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Business Address
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country"
                  />
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street"
                  />
                </div>
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">
                  {currentSupplier ? formatSupplierAddress(currentSupplier) : 'Not specified'}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Company Description
            </label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your company..."
              />
            ) : (
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {formData.description || 'No description provided'}
              </p>
            )}
          </div>
        </div>

        {/* Documents Section */}
        {currentSupplier && (
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Business Documents</h2>

            {/* File Upload */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  id="document-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                />
                <label htmlFor="document-upload" className="cursor-pointer block">
                  <div className="text-center">
                    <div className="text-gray-400 text-4xl mb-2">📄</div>
                    <p className="text-sm text-gray-600">
                      Click to upload business documents
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG, WEBP up to 5MB
                    </p>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                  <span className="text-sm">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}

              {fileError && (
                <div className="mt-2 text-sm text-red-600">
                  {fileError}
                </div>
              )}

              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>

            {/* Documents List */}
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Uploaded Documents</h3>

              {supplierData?.documents && supplierData.documents.length > 0 ? (
                <div className="space-y-3">
                  {supplierData.documents.map((docUrl, index) => {
                    const fileName = docUrl.split('/').pop() || `document-${index + 1}`;
                    const docKey = docUrl.split('/').pop();

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div>
                          <p className="font-medium">{fileName}</p>
                          <p className="text-sm text-gray-500">
                            Business document
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                          >
                            View
                          </a>
                          <button
                            onClick={() => { if (currentSupplier && docKey) handleDeleteDocument(docKey, fileName) }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
              )}
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Account Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Change Password
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Notification Settings
            </button>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}