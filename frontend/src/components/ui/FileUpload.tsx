'use client';

import { useState, useRef } from 'react';

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
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }

      // Checking file size
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
        continue;
      }

      // Checking file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const acceptedExtensions = acceptedTypes.split(',').map(ext => ext.trim());

      if (!acceptedExtensions.includes(fileExtension)) {
        errors.push(`${file.name} has unsupported file type`);
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
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1024 / 1024).toFixed(1) + ' MB';
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
          Drag & drop files here
        </p>
        <p className="mt-1 text-xs text-gray-500">
          or click to browse files
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {acceptedTypes} • Max {maxSize / 1024 / 1024}MB per file
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
            Selected Files ({files.length}/{maxFiles})
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
                >
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}