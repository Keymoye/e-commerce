"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Props {
  current: number;
  total: number;
}

export default function Pagination({ current, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (total <= 1) return null;

  return (
    <nav
      className="flex justify-center items-center gap-2"
      aria-label="Pagination Navigation"
    >
      <button
        disabled={current === 1}
        onClick={() => goTo(current - 1)}
        className="px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        Previous
      </button>

      <span className="px-3 py-2 text-sm text-muted-foreground">
        Page {current} of {total}
      </span>

      <button
        disabled={current === total}
        onClick={() => goTo(current + 1)}
        className="px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
