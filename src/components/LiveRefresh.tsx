"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function playDing() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1174].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {
    // audio not available
  }
}

export function LiveRefresh({
  endpoint,
  fingerprint,
  interval = 5000,
  sound = false,
  toastMessage,
}: {
  endpoint: string;
  fingerprint?: string;
  interval?: number;
  sound?: boolean;
  toastMessage?: string;
}) {
  const router = useRouter();
  const last = useRef<string | null>(fingerprint ?? null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (fingerprint !== undefined) last.current = fingerprint;
  }, [fingerprint]);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { fingerprint?: string };
        if (stop || !data.fingerprint) return;
        if (last.current === null) {
          last.current = data.fingerprint;
          return;
        }
        if (data.fingerprint !== last.current) {
          last.current = data.fingerprint;
          if (sound) playDing();
          if (toastMessage) {
            setToast(toastMessage);
            setTimeout(() => setToast(""), 4000);
          }
          router.refresh();
        }
      } catch {
        // network hiccup, retry next tick
      }
    };
    const timer = setInterval(tick, interval);
    void tick();
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [endpoint, interval, router, sound, toastMessage]);

  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-1/2 z-50 translate-x-1/2 rounded-full bg-text px-5 py-2.5 text-sm font-bold text-white shadow-lg">
      {toast}
    </div>
  );
}
