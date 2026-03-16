"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Props {
  current: number;
  total: number;
}

export default function Pagination({ current, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const showEllipsisStart = current > 3;
  const showEllipsisEnd = current < total - 2;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => updatePage(Math.max(1, current - 1))}
        disabled={current === 1}
        className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      {showEllipsisStart && (
        <>
          <button
            onClick={() => updatePage(1)}
            className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            1
          </button>
          <span className="px-2 text-sm text-gray-400">...</span>
        </>
      )}

      {pages
        .slice(
          Math.max(0, current - 3),
          Math.min(total, current + 2)
        )
        .map((page) => (
          <button
            key={page}
            onClick={() => updatePage(page)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              page === current
                ? 'text-white bg-gray-900 border border-gray-900'
                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

      {showEllipsisEnd && (
        <>
          <span className="px-2 text-sm text-gray-400">...</span>
          <button
            onClick={() => updatePage(total)}
            className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {total}
          </button>
        </>
      )}

      <button
        onClick={() => updatePage(Math.min(total, current + 1))}
        disabled={current === total}
        className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
