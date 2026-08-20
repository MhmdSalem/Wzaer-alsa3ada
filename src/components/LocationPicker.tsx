"use client";

import { useState } from "react";

const FAQUS = { lat: 30.7301, lng: 31.7903 };

export function LocationPicker() {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function detect() {
    if (!navigator.geolocation) {
      setError("المتصفح مش بيدعم تحديد الموقع.");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(false);
      },
      () => {
        setError("متعذر تحديد موقعك. فعّل الـ GPS واسمح بالوصول للموقع.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const center = point ?? FAQUS;

  return (
    <div className="space-y-2">
      <input type="hidden" name="lat" value={point?.lat ?? ""} />
      <input type="hidden" name="lng" value={point?.lng ?? ""} />
      <div className="overflow-hidden rounded-xl border border-line">
        <iframe
          title="خريطة الموقع"
          src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&z=16&output=embed`}
          className="h-56 w-full"
          loading="lazy"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={detect}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            <circle cx="12" cy="12" r="8" />
          </svg>
          {busy ? "بنحدد موقعك..." : point ? "إعادة تحديد موقعي" : "حدد موقعي تلقائيًا"}
        </button>
        {point ? (
          <span className="text-xs font-semibold text-green">تم تحديد الموقع بنجاح</span>
        ) : (
          <span className="text-xs text-muted">حرّك الخريطة وحدد مكان العمارة</span>
        )}
      </div>
      {error ? <p className="text-xs font-semibold text-red">{error}</p> : null}
    </div>
  );
}
