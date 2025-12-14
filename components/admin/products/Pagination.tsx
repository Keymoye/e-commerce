"use client";

import { useRouter } from "next/navigation";

interface Props {
  current: number;
  total: number;
}

export default function Pagination({ current, total }: Props) {
  const router = useRouter();

  if (total <= 1) return null;

  return (
    <nav
      className="flex justify-center gap-2"
      aria-label="Pagination Navigation"
    >
      <button
        disabled={current === 1}
        onClick={() => router.push(`?page=${current - 1}`)}
      >
        Prev
      </button>

      <span className="px-2">
        Page {current} of {total}
      </span>

      <button
        disabled={current === total}
        onClick={() => router.push(`?page=${current + 1}`)}
      >
        Next
      </button>
    </nav>
  );
}
