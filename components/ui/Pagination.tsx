import { cn } from "@/lib/utils/helpers";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={!canPrevious}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md border",
          canPrevious
            ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        )}
        aria-label="Previous page"
      >
        Previous
      </button>
      
      <span className="px-3 py-2 text-sm text-gray-700">
        Page {page} of {totalPages}
      </span>
      
      <button
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-md border",
          canNext
            ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        )}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
