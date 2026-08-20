"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/store";

type Props = {
  logoUrl: string;
  storeName: string;
  slogan: string;
  phone: string;
  city: string;
  governorate: string;
  minutes: number;
  categories: { id: string; name: string; slug: string }[];
};

export function SiteHeader({
  logoUrl,
  storeName,
  slogan,
  phone,
  city,
  governorate,
  minutes,
  categories,
}: Props) {
  const { hydrated, setSearchOpen, cartCount, setDrawerOpen, userName } = useStore();
  const safeCartCount = hydrated ? cartCount : 0;
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [selectedAddressText, setSelectedAddressText] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          name: string | null;
          walletBalance?: number;
          addresses?: Array<{ label: string; area: string; street: string; isDefault: boolean }>;
        };
        if (!stop) setSessionName(data.name);
        if (!stop) setWalletBalance(Number(data.walletBalance ?? 0));
        if (!stop && data.addresses?.length) {
          const address = data.addresses.find((item) => item.isDefault) ?? data.addresses[0];
          setSelectedAddressText(`${address.label} · ${address.area} · ${address.street}`);
        }
      } catch {
        // keep fallback
      }
    };
    void load();
    return () => {
      stop = true;
    };
  }, []);
  const safeUserName = sessionName ?? (hydrated ? userName : null);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-[12px]">
          <p>{selectedAddressText ? `التوصيل إلى ${selectedAddressText}` : `توصيل إلى ${city}، ${governorate} خلال ${minutes} دقيقة`}</p>
          <a href={`tel:${phone}`} dir="ltr" className="font-semibold">
            {phone}
          </a>
        </div>
      </div>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <img
              src={logoUrl}
              alt={storeName}
              className="h-12 w-12 rounded-2xl bg-brand-soft object-contain p-1"
            />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-brand">
                {storeName}
              </span>
              <span className="block text-[11px] text-muted">{slogan}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-12 flex-1 items-center gap-2 rounded-full border border-line bg-bg px-5 text-sm text-muted transition-colors hover:border-brand md:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            دور على منتج، ماركة، أو قسم...
          </button>
          <div className="ms-auto flex items-center gap-2 md:ms-0">
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand md:flex"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
              </svg>
              {safeUserName ?? "دخول"}
            </Link>
            {safeUserName ? (
              <Link
                href="/account?tab=wallet"
                className="hidden items-center gap-2 rounded-full border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm font-bold text-yellow-900 transition-colors hover:border-yellow-500 md:flex"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
                  <path d="M16 12h5" />
                  <circle cx="16" cy="12" r="1" />
                </svg>
                {walletBalance.toFixed(2)} ج
              </Link>
            ) : null}
            <Link
              href="/account?tab=orders"
              className="hidden items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand md:flex"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h8.4a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="10" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
              </svg>
              طلباتي
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h8.4a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="10" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
              </svg>
              السلة
              {safeCartCount > 0 ? (
                <span className="absolute -top-1.5 -left-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-yellow px-1 text-[11px] font-bold text-bg ring-2 ring-surface">
                  {safeCartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-full items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm text-muted"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            دور على منتج...
          </button>
        </div>
        <nav className="border-t border-line/60">
          <div className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
            <Link
              href="/"
              className="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-brand"
            >
              العروض
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm text-muted transition-colors hover:border-brand hover:text-brand"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
