'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DocumentsSectionProps {
  documents: string[];
  isUploading: boolean;
  onUpload: (files: File[]) => void;
  onDelete: (documentUrl: string, documentName: string) => void;
}

export function DocumentsSection({
  documents,
  isUploading,
  onUpload,
  onDelete
}: DocumentsSectionProps) {
  const t = useTranslations('SupplierProfile.Documents');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const invalidFiles = files.filter(file =>
      !validTypes.includes(file.type) || file.size > maxSize
    );

    if (invalidFiles.length > 0) {
      setFileError(t('errors.invalidFile'));
      return;
    }

    setFileError('');
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles);
    setSelectedFiles([]);
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-b pb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('title')}</h2>

      {/* File Upload */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6">
          <input
            id="document-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple
          />
          <label htmlFor="document-upload" className="cursor-pointer block">
            <div className="text-center">
              <div className="text-gray-400 text-3xl md:text-4xl mb-2">📄</div>
              <p className="text-sm text-gray-600">
                {t('upload.click')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('upload.formats')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('upload.multiple')}
              </p>
            </div>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center"
              >
                <span className="text-sm truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 text-sm ml-2"
                >
                  {t('remove')}
                </button>
              </div>
            ))}
          </div>
        )}

        {fileError && (
          <div className="mt-2 text-sm text-red-600">
            {fileError}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="mt-4 w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isUploading ? t('upload.uploading') : t('upload.button', { count: selectedFiles.length })}
        </button>
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">{t('uploadedDocuments')}</h3>

        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((docUrl, index) => {
              const fileName = docUrl.split('/').pop() || `${t('document')}-${index + 1}`;

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm md:text-base truncate">{fileName}</p>
                    <p className="text-xs text-gray-500">
                      {t('businessDocument')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs md:text-sm"
                    >
                      {t('view')}
                    </a>
                    <button
                      onClick={() => onDelete(docUrl, fileName)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs md:text-sm"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm md:text-base">{t('noDocuments')}</p>
        )}
      </div>
    </div>
  );
}