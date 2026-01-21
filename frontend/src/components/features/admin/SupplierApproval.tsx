'use client';

import { useState } from 'react';
import { useAdminSuppliers, useUpdateSupplierStatus } from '@/core/hooks/useSupplier';
import { Button } from '@/components/ui/button/Button';
import { SupplierStatus } from '@/core/types/supplierTypes';
import { formatDate, getStatusColor } from '@/core/utils';
import { useTranslations } from 'next-intl';

export function SupplierApproval() {
  const [filters, setFilters] = useState({
    status: 'pending' as SupplierStatus | undefined,
    companyName: undefined as string | undefined,
    page: 1,
    limit: 20,
  });

  const { data: suppliersData, isLoading } = useAdminSuppliers(filters);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSupplierStatus();

  const t = useTranslations('SupplierApproval');
  const tCommon = useTranslations('Common');

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusFilter = (status: SupplierStatus | 'all') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
      page: 1,
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      companyName: query || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleApprove = (supplierId: string) => {
    if (confirm(t('approveConfirm'))) {
      updateStatus({
        id: supplierId,
        status: 'approved' as SupplierStatus,
        reason: 'Supplier approved by administrator'
      });
    }
  };

  const handleReject = (supplierId: string) => {
    const reason = prompt(t('rejectConfirm'));
    if (reason) {
      updateStatus({
        id: supplierId,
        status: 'rejected' as SupplierStatus,
        reason: reason
      });
    }
  };

  const handleSuspend = (supplierId: string) => {
    const reason = prompt(t('suspendConfirm'));
    if (reason) {
      updateStatus({
        id: supplierId,
        status: 'suspended' as SupplierStatus,
        reason: reason
      });
    }
  };

  const suppliers = suppliersData?.suppliers || [];
  const pagination = suppliersData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t('loadingSuppliers')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        <div className="text-sm text-gray-500">
          {t('totalSuppliers', { count: pagination.total })}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3 py-1 rounded text-sm ${filters.status === (status === 'all' ? undefined : status)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t(`status.${status}`)}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {suppliers.length === 0 ? (
            <div className="p-6 rounded-lg border bg-white text-center text-gray-500">
              {t('noSuppliers')}
            </div>
          ) : (
            suppliers.map((supplier) => (
              <div key={supplier.id} className="p-6 rounded-lg border bg-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(supplier.status)}`}>
                        {t(`status.${supplier.status}`)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{t('contact')}: {supplier.firstName} {supplier.lastName}</div>
                      <div>{t('email')}: {supplier.email}</div>
                      <div>{t('phone')}: {supplier.phone}</div>
                      <div>{t('registration')}: {supplier.registrationNumber}</div>
                      <div>{t('applied')}: {formatDate(supplier.createdAt)}</div>
                    </div>

                    {supplier.documents?.length > 0 && (
                      <div className="pt-2">
                        <h4 className="font-medium text-sm mb-2">{t('documents')}:</h4>
                        <div className="flex flex-wrap gap-2">
                          {supplier.documents.map((doc: string, index: number) => (
                            <a
                              key={index}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-sm rounded border bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {supplier.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(supplier.id)}
                          disabled={isUpdating}
                        >
                          {tCommon('approve')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(supplier.id)}
                          disabled={isUpdating}
                        >
                          {tCommon('reject')}
                        </Button>
                      </>
                    )}

                    {supplier.status === 'approved' && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleSuspend(supplier.id)}
                        disabled={isUpdating}
                      >
                        {tCommon('suspend')}
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedSupplier(
                        selectedSupplier?.id === supplier.id ? null : supplier
                      )}
                    >
                      {selectedSupplier?.id === supplier.id ? tCommon('hideDetails') : tCommon('viewDetails')}
                    </Button>
                  </div>
                </div>

                {selectedSupplier?.id === supplier.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">{t('companyInfo')}</h4>
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">{t('onDescription')}:</span> {supplier.description || t('noDescription')}</div>
                          <div><span className="font-medium">{t('documents')}:</span> {t('documentsCount', { count: supplier.documents?.length || 0 })}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">{t('verificationChecklist')}</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center">
                            <input type="checkbox" className="mr-2" checked={supplier.documents?.length > 0} readOnly />
                            {t('checklist.documentsUploaded')}
                          </li>
                          <li className="flex items-center">
                            <input type="checkbox" className="mr-2" checked={!!supplier.registrationNumber} readOnly />
                            {t('checklist.registrationVerified')}
                          </li>
                          <li className="flex items-center">
                            <input type="checkbox" className="mr-2" checked={!!supplier.email} readOnly />
                            {t('checklist.emailVerified')}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 rounded-lg border bg-white sticky top-6">
            <h3 className="font-semibold text-lg mb-4">{t('statistics')}</h3>

            <div className="space-y-3">
              {['pending', 'approved', 'rejected', 'suspended'].map((status) => {
                const count = suppliers.filter(s => s.status === status).length;
                return (
                  <div key={status} className="flex justify-between items-center">
                    <span>{t(`status.${status}`)}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-2">{t('approvalGuidelines')}</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">
                {t.raw('guidelines').map((guideline: string, index: number) => (
                  <li key={index}>{guideline}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={filters.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            onClick={() => handlePageChange(filters.page - 1)}
          >
            {tCommon('previous')}
          </button>
          <span className="text-sm">
            {tCommon('page')} {filters.page} {tCommon('of')} {pagination.totalPages}
          </span>
          <button
            disabled={filters.page >= pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            onClick={() => handlePageChange(filters.page + 1)}
          >
            {tCommon('next')}
          </button>
        </div>
      )}
    </div>
  );
}