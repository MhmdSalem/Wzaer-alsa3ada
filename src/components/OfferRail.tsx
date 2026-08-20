"use client";

import { useEffect, useRef } from "react";
import { OfferCard } from "./OfferCard";
import type { OfferView } from "@/lib/format";

export function OfferRail({ offers }: { offers: OfferView[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft <= -max + 10 || el.scrollLeft >= max - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -240, behavior: "smooth" });
      }
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      ref={ref}
      className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
    >
      {offers.map((offer) => (
        <div key={offer.id} className="w-[180px] shrink-0 md:w-[230px]">
          <OfferCard offer={offer} />
        </div>
      ))}
    </div>
  );
}
