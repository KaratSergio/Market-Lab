import { useState } from 'react';

interface DocumentsSectionProps {
  supplierId: string;
  documents: string[];
  isUploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (documentKey: string, documentName: string) => void;
}

export function DocumentsSection({
  supplierId,
  documents,
  isUploading,
  onUpload,
  onDelete
}: DocumentsSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Only PDF, JPEG, WEBP, and PNG files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must be less than 5MB');
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    onUpload(selectedFile);
    setSelectedFile(null);
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="border-b pb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Business Documents</h2>

      {/* File Upload */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6">
          <input
            id="document-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.webp"
          />
          <label htmlFor="document-upload" className="cursor-pointer block">
            <div className="text-center">
              <div className="text-gray-400 text-3xl md:text-4xl mb-2">📄</div>
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
            <span className="text-sm truncate">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-600 hover:text-red-800 text-sm ml-2"
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
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="mt-4 w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Uploaded Documents</h3>

        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((docUrl, index) => {
              const fileName = docUrl.split('/').pop() || `document-${index + 1}`;
              const docKey = docUrl.split('/').pop();

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm md:text-base truncate">{fileName}</p>
                    <p className="text-xs text-gray-500">
                      Business document
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs md:text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => { if (supplierId && docKey) onDelete(docKey, fileName) }}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs md:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm md:text-base">No documents uploaded yet</p>
        )}
      </div>
    </div>
  );
}