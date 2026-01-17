'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations('Common');
  const { locale } = useParams();
  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
      {/* Info */}
      <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
        {t('page')} <span className="font-semibold">{currentPage.toLocaleString(locale as string)}</span> {t('pageOf')}{' '}
        <span className="font-semibold">{lastPage?.toLocaleString(locale as string)}</span> | {t('totalCount')}:{' '}
        <span className="font-semibold">{total?.toLocaleString(locale as string)}</span>
      </span>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          {t('previous')}
        </button>

        {[...Array(lastPage).keys()].map((page) => (
          <button
            key={page + 1}
            onClick={() => onPageChange(page + 1)}
            className={`px-3 py-1 border border-gray-300 rounded-lg hover:bg-blue-500 hover:text-white ${
              currentPage === page + 1
                ? 'bg-blue-500 text-white'
                : ''
            }`}
          >
            {(page + 1).toLocaleString(locale as string)}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          {t('next')}
        </button>
      </div>

      {/* Mobile Pagination */}
      <div className="flex sm:hidden justify-center gap-2 items-center">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
        >
          {t('previous')}
        </button>

        <span className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg">
          {currentPage.toLocaleString(locale as string)}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}
