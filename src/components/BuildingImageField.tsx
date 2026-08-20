"use client";

import { useState } from "react";

export function BuildingImageField() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/v1/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string };
    if (data.url) setUrl(data.url);
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="buildingImage" value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          <img src={url} alt="صورة العمارة" className="h-20 w-20 rounded-xl border border-line object-cover" />
        ) : null}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-line bg-bg px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-brand hover:text-brand">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="14" rx="3" />
            <circle cx="12" cy="13" r="3.5" />
            <path d="M9 6l1.2-2h3.6L15 6" />
          </svg>
          {busy ? "بيرفع..." : url ? "تغيير صورة العمارة" : "صورة العمارة (اختياري)"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
        </label>
      </div>
      <p className="text-[11px] text-muted">بتساعد المندوب يوصل لعمارتك بسرعة.</p>
    </div>
  );
}
