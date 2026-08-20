"use client";

import { StoreProvider } from "@/context/store";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "./CartDrawer";
import { MobileNav } from "./MobileNav";
import { StickyCart } from "./StickyCart";
import { Toast } from "./Toast";

type Settings = {
  logoUrl: string;
  storeName: string;
  slogan: string;
  phone: string;
  city: string;
  governorate: string;
  country: string;
  deliveryMinutes: number;
};

type NavCategory = { id: string; name: string; slug: string };

export function ShopShell({
  settings,
  categories,
  children,
}: {
  settings: Settings;
  categories: NavCategory[];
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <SiteHeader
        logoUrl={settings.logoUrl}
        storeName={settings.storeName}
        slogan={settings.slogan}
        phone={settings.phone}
        city={settings.city}
        governorate={settings.governorate}
        minutes={settings.deliveryMinutes}
        categories={categories}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 md:pb-12">
        {children}
      </main>
      <SiteFooter
        storeName={settings.storeName}
        slogan={settings.slogan}
        phone={settings.phone}
        city={settings.city}
        governorate={settings.governorate}
        country={settings.country}
        categories={categories}
      />
      <SearchOverlay />
      <CartDrawer />
      <StickyCart />
      <MobileNav />
      <Toast />
    </StoreProvider>
  );
}
