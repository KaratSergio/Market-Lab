import { useTranslations } from 'next-intl';

interface ProfileHeaderProps {
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileHeader({
  isEditing,
  isUpdating,
  onEdit,
  onCancel,
  onSave
}: ProfileHeaderProps) {
  const t = useTranslations('SupplierProfile.ProfileHeader');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        {isEditing ? (
          <>
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm md:text-base disabled:opacity-50"
              disabled={isUpdating}
            >
              {t('cancel')}
            </button>
            <button
              onClick={onSave}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base disabled:opacity-50"
              disabled={isUpdating}
            >
              {isUpdating ? t('saving') : t('save')}
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            {t('edit')}
          </button>
        )}
      </div>
    </div>
  );
}