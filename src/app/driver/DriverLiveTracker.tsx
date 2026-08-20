"use client";

import { useEffect } from "react";

export function DriverLiveTracker({ orderIds }: { orderIds: string[] }) {
  useEffect(() => {
    if (!orderIds.length || !navigator.geolocation) return;
    let stopped = false;

    const pushLocation = (pos: GeolocationPosition) => {
      if (stopped) return;
      void fetch("/api/driver/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? undefined,
          speed: pos.coords.speed ?? undefined,
        }),
      }).catch(() => {});
    };

    navigator.geolocation.getCurrentPosition(pushLocation, () => {}, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
    const watcher = navigator.geolocation.watchPosition(pushLocation, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });

    return () => {
      stopped = true;
      navigator.geolocation.clearWatch(watcher);
    };
  }, [orderIds]);

  return null;
}
