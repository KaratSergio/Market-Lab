'use client';

import { useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface ImageUploaderProps {
  existingImagesCount: number;
  newImagesCount: number;
  maxImages: number;
  onImageSelect: (files: File[]) => void;
  onImageRemove: (index: number, isNewImage: boolean) => void;
  imagePreviews: string[];
  disabled?: boolean;
}

export function ImageUploader({
  existingImagesCount,
  newImagesCount,
  maxImages,
  onImageSelect,
  onImageRemove,
  imagePreviews,
  disabled = false,
}: ImageUploaderProps) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalImages = existingImagesCount + newImagesCount;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      onImageSelect(Array.from(files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [onImageSelect]
  );

  const handleRemove = useCallback(
    (index: number, isNewImage: boolean) => {
      onImageRemove(index, isNewImage);
    },
    [onImageRemove]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('ProductForm.imagesLabel', { current: totalImages, max: maxImages })}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="product-images"
          ref={fileInputRef}
          disabled={disabled || totalImages >= maxImages}
        />
        <label
          htmlFor="product-images"
          className={`cursor-pointer block ${disabled || totalImages >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <div className="text-gray-400 mb-2 text-4xl">📷</div>
          <p className="text-gray-600">{t('ProductForm.imagesClickToSelect')}</p>
          <p className="text-gray-500 text-sm mt-1">
            {t('ProductForm.imagesSupportedFormats')}
          </p>
          {totalImages >= maxImages && (
            <p className="text-red-500 text-sm mt-1">
              {t('ProductForm.imagesMaxReached')}
            </p>
          )}
        </label>

        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">{t('ProductForm.imagesPreviews')}:</p>
            <div className="grid grid-cols-4 gap-2">
              {imagePreviews.map((preview, index) => {
                const isNewImage = index >= existingImagesCount;
                return (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index, isNewImage)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      disabled={disabled}
                      title={
                        isNewImage
                          ? t('ProductForm.removeNewImage')
                          : t('ProductForm.removeExistingImage')
                      }
                    >
                      ×
                    </button>
                    {isNewImage && (
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-0.5 text-center">
                        {t('ProductForm.newImageBadge')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {existingImagesCount > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {t('ProductForm.imagesSummary', {
                  existing: existingImagesCount,
                  new: newImagesCount,
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}