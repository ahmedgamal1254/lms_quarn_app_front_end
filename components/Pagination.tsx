'use client';

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
  if (total === 0) return null;

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
      <span className="text-sm text-gray-600">
        الصفحة <span className="font-semibold">{currentPage}</span> من{' '}
        <span className="font-semibold">{lastPage}</span> | إجمالي:{' '}
        <span className="font-semibold">{total}</span>
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          السابق
        </button>

        {/* {[...Array(lastPage).keys()].map((page) => */}
        {[...Array(lastPage).keys()].map((page) => (
          <button
            key={page + 1}
            onClick={() => onPageChange(page + 1)}
            className={`px-3 py-1 border border-gray-300 rounded-lg hover:bg-blue-500 hover:text-white transition-colors ${
              currentPage === page + 1 ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {page + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
