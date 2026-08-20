"use client";

import { useStore } from "@/context/store";

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="card-shadow fixed top-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-brand">
      {toast}
    </div>
  );
}
