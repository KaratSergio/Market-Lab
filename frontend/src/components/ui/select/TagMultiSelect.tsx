'use client';

import { useMemo } from 'react';
import Select, { StylesConfig, MultiValue } from 'react-select';

export interface TagOption {
  value: string;
  label: string;
}

interface TagMultiSelectProps {
  categoryId: string | null;
  isLoading: boolean;
  options: TagOption[];
  value: TagOption[];
  onChange: (newValue: TagOption[]) => void;
  disabled?: boolean;
  placeholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  selectCategoryFirstMessage?: string;
  noTagsMessage?: string;
}

export function TagMultiSelect({
  categoryId,
  isLoading,
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select tags...',
  noOptionsMessage = 'No tags available',
  loadingMessage = 'Loading tags...',
  selectCategoryFirstMessage = 'Please select a category first',
  noTagsMessage = 'No tags for this category',
}: TagMultiSelectProps) {
  const selectStyles: StylesConfig<TagOption, true> = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(59,130,246,0.1)' : 'none',
        '&:hover': { borderColor: '#3b82f6' },
        minHeight: '42px',
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#3b82f6'
          : state.isFocused
            ? '#e5e7eb'
            : 'white',
        color: state.isSelected ? 'white' : 'black',
        cursor: 'pointer',
        '&:active': {
          backgroundColor: state.isSelected ? '#2563eb' : '#d1d5db',
        },
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: '#e5e7eb',
        borderRadius: '0.375rem',
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: '#374151',
        fontSize: '0.875rem',
        padding: '0.25rem 0.5rem',
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: '#6b7280',
        borderRadius: '0 0.375rem 0.375rem 0',
        '&:hover': {
          backgroundColor: '#ef4444',
          color: 'white',
        },
      }),
      placeholder: (base) => ({ ...base, color: '#9ca3af' }),
      menu: (base) => ({
        ...base,
        zIndex: 60,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }),
      menuPortal: (base) => ({ ...base, zIndex: 60 }),
    }),
    []
  );

  const handleChange = (newValue: MultiValue<TagOption>) => {
    onChange(newValue as TagOption[]);
  };

  if (!categoryId) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
        {selectCategoryFirstMessage}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        {loadingMessage}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
        {noTagsMessage}
      </div>
    );
  }

  return (
    <>
      <Select
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={disabled}
        isLoading={isLoading}
        styles={selectStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        maxMenuHeight={200}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        noOptionsMessage={() => noOptionsMessage}
        loadingMessage={() => loadingMessage}
      />
      {value.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {`Selected tags: ${value.length}`}
        </div>
      )}
    </>
  );
}