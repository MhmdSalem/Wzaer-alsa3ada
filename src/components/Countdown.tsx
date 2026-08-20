"use client";

import { useEffect, useState } from "react";

export function Countdown({ endsAt }: { endsAt: string }) {
  const [label, setLabel] = useState("—");

  useEffect(() => {
    function tick() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("انتهى");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      const pad = (n: number) => n.toString().padStart(2, "0");
      setLabel(
        h >= 24
          ? `${Math.floor(h / 24)}ي ${pad(h % 24)}:${pad(m)}:${pad(s)}`
          : `${pad(h)}:${pad(m)}:${pad(s)}`,
      );
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg/90 px-2.5 py-1 text-[11px] font-bold text-brand shadow-sm ring-1 ring-line backdrop-blur">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6" />
      </svg>
      {label}
    </span>
  );
}
