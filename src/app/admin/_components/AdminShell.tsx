"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../actions";
import { LiveRefresh } from "@/components/LiveRefresh";

const groups = [
  {
    title: "الرئيسية",
    links: [{ href: "/admin", label: "لوحة القيادة", icon: "dashboard" }],
  },
  {
    title: "المحتوى",
    links: [
      { href: "/admin/offers", label: "العروض", icon: "tag" },
      { href: "/admin/products", label: "المنتجات", icon: "box" },
      { href: "/admin/categories", label: "الأقسام", icon: "grid" },
      { href: "/admin/media", label: "مكتبة الصور", icon: "image" },
    ],
  },
  {
    title: "المبيعات",
    links: [
      { href: "/admin/orders", label: "الطلبات", icon: "cart" },
      { href: "/admin/refunds", label: "استرجاع المبالغ", icon: "wallet" },
      { href: "/admin/chats", label: "المحادثات", icon: "chat" },
      { href: "/admin/customers", label: "العملاء", icon: "users" },
      { href: "/admin/drivers", label: "المناديب", icon: "bike" },
    ],
  },
  {
    title: "النظام",
    links: [
      { href: "/admin/users", label: "المشرفون", icon: "shield" },
      { href: "/admin/settings", label: "إعدادات المحل", icon: "gear" },
    ],
  },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="8" height="10" rx="2" />
        <rect x="13" y="3" width="8" height="6" rx="2" />
        <rect x="13" y="11" width="8" height="10" rx="2" />
        <rect x="3" y="15" width="8" height="6" rx="2" />
      </>
    ),
    tag: <path d="M12 3l9 9-8 8-9-9V3h8Zm-3.5 5.5h.01" />,
    box: (
      <>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m21 16-4.5-4.5L9 19" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h8.4a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="10" cy="21" r="1" />
        <circle cx="18" cy="21" r="1" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c1.2-3.5 3.8-5 6.5-5s5.3 1.5 6.5 5" />
        <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 15.5c1.6.7 2.6 2.1 3 4.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    bike: (
      <>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M6 17h6V6h4l3 5v6h-1M9 8H4v9h2" />
      </>
    ),
    chat: (
      <>
        <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2Z" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
        <path d="M16 12h5" />
        <circle cx="16" cy="12" r="1" />
        <path d="M3 9h14" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export function AdminShell({
  adminName,
  adminRole,
  children,
}: {
  adminName: string;
  adminRole: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-bg text-text">
      <LiveRefresh endpoint="/api/admin/chat/poll" sound toastMessage="رسالة جديدة من عميل" />
      <div className="grid min-h-screen lg:grid-cols-[250px_1fr]">
        <aside className="flex flex-col border-b border-line bg-surface lg:border-b-0 lg:border-l">
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <img src="/brand/logo-cart.png" alt="" className="h-10 w-10 rounded-xl bg-brand-soft object-contain p-1" />
            <div>
              <p className="font-display text-base font-bold text-brand">وزير السعادة</p>
              <p className="text-[11px] text-muted">لوحة التحكم</p>
            </div>
          </div>
          <nav className="flex-1 space-y-5 overflow-y-auto p-4">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 px-3 text-[10px] font-bold tracking-wide text-muted">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.links.map((link) => {
                    const active =
                      link.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                          active
                            ? "bg-brand text-white"
                            : "text-muted hover:bg-brand-soft hover:text-brand"
                        }`}
                      >
                        <Icon name={link.icon} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="space-y-2 border-t border-line p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-brand-soft hover:text-brand"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" />
              </svg>
              فتح المتجر
            </Link>
            <form action={logoutAction}>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-red/10 hover:text-red">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                تسجيل الخروج
              </button>
            </form>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-surface/90 px-5 py-3.5 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {adminName.slice(0, 1)}
              </span>
              <div>
                <p className="text-sm font-bold">{adminName}</p>
                <p className="text-[11px] text-muted">{adminRole}</p>
              </div>
            </div>
                  <p className="text-xs text-muted" suppressHydrationWarning>
                    {new Date().toLocaleDateString("ar-EG", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
          </header>
          <main className="flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
