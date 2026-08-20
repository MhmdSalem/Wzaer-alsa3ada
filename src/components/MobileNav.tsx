"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "العروض",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l2.5 5.3 5.5.7-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.5-.7L12 3Z" />
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "الأقسام",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "بحث",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    href: "/account?tab=orders",
    label: "طلباتي",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h8.4a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="10" cy="21" r="1" />
        <circle cx="18" cy="21" r="1" />
      </svg>
    ),
  },
  {
    href: "/account",
    label: "حسابي",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("?")[0]);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${
                active ? "text-brand" : "text-muted"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
