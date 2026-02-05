'use client';

import { useTranslations } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations();

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Add first page with ellipsis
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page with ellipsis
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          onClick={() => onPageChange(page as number)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${currentPage === page
            ? 'bg-linear-to-r from-green-200 to-amber-100 text-gray-700 shadow-lg scale-105'
            : 'bg-white/80 backdrop-blur-sm border border-green-200 text-gray-700 hover:bg-linear-to-r hover:from-green-50 hover:to-amber-50 hover:shadow-md hover:-translate-y-0.5'
            }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="mt-12 flex justify-center">
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-green-100 p-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-green-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-linear-to-r hover:from-green-50 hover:to-amber-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">{t('Common.previous')}</span>
        </button>

        <div className="flex items-center gap-2 mx-2">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-green-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-linear-to-r hover:from-green-50 hover:to-amber-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="font-medium">{t('Common.next')}</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Page info */}
      <div className="ml-6 flex items-center">
        <div className="bg-linear-to-r from-green-50 to-amber-50 rounded-xl p-3 border border-green-200">
          <span className="text-sm text-gray-600">{t('Common.page')} </span>
          <span className="font-bold text-green-600">{currentPage}</span>
          <span className="text-gray-500"> / </span>
          <span className="font-medium text-amber-600">{totalPages}</span>
        </div>
      </div>
    </div>
  );
}