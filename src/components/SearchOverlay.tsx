"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/context/store";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-surface p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!query.trim()) return;
          setSearchOpen(false);
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        className="mx-auto max-w-2xl"
      >
        <div className="flex items-center gap-2 rounded-full border border-line bg-bg px-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="دور على منتج، ماركة، أو قسم..."
            className="h-14 w-full bg-transparent text-lg outline-none"
          />
        </div>
        <div className="mt-3 flex justify-between px-2 text-sm">
          <button type="button" onClick={() => setSearchOpen(false)} className="text-muted">
            إلغاء
          </button>
          <button type="submit" className="font-bold text-brand">
            بحث
          </button>
        </div>
      </form>
    </div>
  );
}
