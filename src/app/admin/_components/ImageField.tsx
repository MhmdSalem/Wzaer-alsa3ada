"use client";

import { useState } from "react";

type MediaItem = { id: string; url: string; name: string };

export function ImageField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string };
    if (data.url) setUrl(data.url);
    setBusy(false);
  }

  async function openPicker() {
    setPickerOpen(true);
    setLoadingLib(true);
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" });
      setLibrary((await res.json()) as MediaItem[]);
    } catch {
      setLibrary([]);
    }
    setLoadingLib(false);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        {url ? (
          <img src={url} alt="" className="h-28 w-28 rounded-xl border border-line bg-bg object-cover" />
        ) : (
          <div className="grid h-28 w-28 place-items-center rounded-xl border border-dashed border-line bg-bg text-xs text-muted">
            لا توجد صورة
          </div>
        )}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" />
              </svg>
              {busy ? "بيرفع..." : "رفع صورة"}
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
            <button
              type="button"
              onClick={openPicker}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              اختيار من المكتبة
            </button>
          </div>
          <p className="text-[11px] text-muted">PNG أو JPG — صورة المنتج الحقيقية.</p>
        </div>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">اختار صورة من المكتبة</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-bg text-muted"
                aria-label="إغلاق"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {loadingLib ? (
              <p className="py-10 text-center text-sm text-muted">بنحمّل المكتبة...</p>
            ) : library.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">المكتبة فاضية. ارفع صور من صفحة مكتبة الصور الأول.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {library.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setUrl(item.url);
                      setPickerOpen(false);
                    }}
                    className={`overflow-hidden rounded-xl border-2 transition-colors ${
                      url === item.url ? "border-brand" : "border-transparent hover:border-brand/50"
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="aspect-square w-full bg-bg object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
