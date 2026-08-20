"use client";

import Link from "next/link";
import { useStore } from "@/context/store";
import { egp } from "@/lib/format";

export function StickyCart() {
  const { cartCount, cartTotal, setDrawerOpen } = useStore();
  if (!cartCount) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] px-4 md:bottom-6">
      <div className="card-shadow pointer-events-auto isolate mx-auto flex max-w-md items-center justify-between rounded-full bg-green px-3 py-2.5 text-white">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-11 flex-1 items-center justify-start rounded-full px-3 text-sm font-bold"
        >
          عرض السلة
        </button>
        <Link href="/checkout" className="flex h-11 items-center gap-2 rounded-full bg-white px-3 text-sm font-extrabold text-green">
          <span className="grid h-7 min-w-7 place-items-center rounded-full border border-green/30 bg-green/10 px-1 text-green">
            {cartCount}
          </span>
          {egp(cartTotal)}
        </Link>
      </div>
    </div>
  );
}
