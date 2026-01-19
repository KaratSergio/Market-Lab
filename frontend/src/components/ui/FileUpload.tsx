'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  error?: string;
}

export function FileUpload({
  onFilesChange,
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  error,
}: FileUploadProps) {
  const t = useTranslations('FileUpload');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Checking the number of files
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(t('errors.maxFiles', { maxFiles }));
        break;
      }

      // Checking file size
      if (file.size > maxSize) {
        errors.push(t('errors.fileTooLarge', {
          fileName: file.name,
          maxSizeMB: maxSize / 1024 / 1024
        }));
        continue;
      }

      // Checking file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const acceptedExtensions = acceptedTypes.split(',').map(ext => ext.trim());

      if (!acceptedExtensions.includes(fileExtension)) {
        errors.push(t('errors.unsupportedType', { fileName: file.name }));
        continue;
      }

      newFiles.push(file);
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return t('fileSize.bytes', { bytes });
    else if (bytes < 1024 * 1024) return t('fileSize.kb', { kb: (bytes / 1024).toFixed(1) });
    else return t('fileSize.mb', { mb: (bytes / 1024 / 1024).toFixed(1) });
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="mt-2 text-sm font-medium text-gray-900">
          {t('dragDrop')}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {t('clickToBrowse')}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {t('fileRequirements', {
            acceptedTypes,
            maxSizeMB: maxSize / 1024 / 1024
          })}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {t('selectedFiles', { current: files.length, max: maxFiles })}
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label={t('removeFile')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}