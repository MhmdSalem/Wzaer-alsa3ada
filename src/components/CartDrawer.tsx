"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/context/store";
import { egp } from "@/lib/format";

function useCountdown(expiresAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  if (!expiresAt) return "";
  const mins = Math.max(0, Math.round((expiresAt - now) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} ساعة${m ? ` و ${m} دقيقة` : ""}` : `${m} دقيقة`;
}

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, cart, setQty, cartTotal, cartExpiresAt } = useStore();
  const remaining = useCountdown(drawerOpen ? cartExpiresAt : null);
  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => setDrawerOpen(false)}
        aria-label="إغلاق"
      />
      <aside className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-surface p-5 md:inset-y-0 md:left-0 md:right-auto md:w-[440px] md:rounded-none">
        <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-xl font-bold">سلة التسوق</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full bg-bg text-muted"
            aria-label="إغلاق"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted">السلة فاضية.</p>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white"
            >
              تصفح العروض
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {cart.map((line) => (
              <li key={line.productId} className="flex gap-3 rounded-2xl border border-line p-2.5">
                <img src={line.image} alt="" className="h-16 w-16 rounded-xl bg-bg object-cover" />
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-muted">{egp(line.price)}</p>
                  <div className="mt-1.5 flex h-8 w-28 items-center justify-between rounded-full border border-line text-sm font-bold">
                    <button type="button" className="h-full w-8 text-brand" onClick={() => setQty(line.productId, line.qty - 1)}>
                      −
                    </button>
                    {line.qty}
                    <button type="button" className="h-full w-8 text-brand" onClick={() => setQty(line.productId, line.qty + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <p className="self-start text-sm font-bold">{egp(line.price * line.qty)}</p>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 ? (
          <div className="mt-5 space-y-3 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">الإجمالي</span>
              <strong className="font-display text-xl">{egp(cartTotal)}</strong>
            </div>
            {remaining ? (
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                السلة هتتفضي تلقائيًا بعد {remaining}
              </p>
            ) : null}
            <Link
              href="/checkout"
              onClick={() => setDrawerOpen(false)}
              className="flex h-12 items-center justify-center rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep"
            >
              إتمام الطلب
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
