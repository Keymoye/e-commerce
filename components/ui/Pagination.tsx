// components/ui/Pagination.tsx
"use client";

import React from "react";
import clsx from "clsx";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pagesToShow = 5;
  const start = Math.max(1, page - Math.floor(pagesToShow / 2));
  const end = Math.min(totalPages, start + pagesToShow - 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center gap-2"
      role="navigation"
    >
      <button
        aria-label="Previous page"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={clsx(
          "px-3 py-1 rounded border",
          page === 1 && "opacity-50 cursor-not-allowed"
        )}
      >
        ←
      </button>

      {start > 1 && (
        <>
          <button
            className="px-3 py-1 rounded border"
            onClick={() => onChange(1)}
          >
            1
          </button>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
          className={clsx(
            "px-3 py-1 rounded border",
            p === page ? "bg-accent text-background" : ""
          )}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2">…</span>}
          <button
            className="px-3 py-1 rounded border"
            onClick={() => onChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        aria-label="Next page"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={clsx(
          "px-3 py-1 rounded border",
          page === totalPages && "opacity-50 cursor-not-allowed"
        )}
      >
        →
      </button>
    </nav>
  );
}
