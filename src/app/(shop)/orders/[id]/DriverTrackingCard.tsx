"use client";

import { useEffect, useState } from "react";

type TrackState = {
  status: string;
  customer: { lat: number | null; lng: number | null };
  driver: { lat: number; lng: number; updatedAt: string } | null;
};

export function DriverTrackingCard({ orderId }: { orderId: string }) {
  const [state, setState] = useState<TrackState | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/v1/orders/${orderId}/track`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as TrackState;
        if (!stop) setState(data);
      } catch {
        // keep previous state
      }
    };
    void load();
    const timer = window.setInterval(load, 7000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [orderId]);

  if (!state || state.status !== "delivering" || !state.driver) return null;

  const maps = `https://maps.google.com/maps?q=${state.driver.lat},${state.driver.lng}&z=16&output=embed`;
  const updatedLabel = new Date(state.driver.updatedAt).toLocaleTimeString("ar-EG");

  return (
    <div className="card-shadow rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="font-display text-lg font-bold text-blue-800">تتبع المندوب مباشر</h3>
      <p className="mt-1 text-xs text-blue-700">آخر تحديث: {updatedLabel}</p>
      <div className="mt-3 overflow-hidden rounded-xl border border-blue-200">
        <iframe title="موقع المندوب" src={maps} className="h-56 w-full" loading="lazy" />
      </div>
      <p className="mt-2 text-xs text-muted" dir="ltr">
        Driver: {state.driver.lat.toFixed(5)}, {state.driver.lng.toFixed(5)}
      </p>
    </div>
  );
}
