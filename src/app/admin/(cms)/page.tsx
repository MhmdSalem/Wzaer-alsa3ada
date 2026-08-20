import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { egp } from "@/lib/format";

const statusLabel: Record<string, string> = {
  new: "جديد",
  preparing: "قيد التجهيز",
  delivering: "في الطريق",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const statusStyle: Record<string, string> = {
  new: "bg-yellow/20 text-yellow-800",
  preparing: "bg-brand-soft text-brand",
  delivering: "bg-blue-50 text-blue-700",
  delivered: "bg-green/10 text-green",
  cancelled: "bg-red/10 text-red",
};

export default async function AdminDashboard() {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 3_600_000);
  const [offers, products, orders, customers, revenue, recentOrders, expiring] =
    await Promise.all([
      prisma.offer.count({ where: { published: true, endsAt: { gt: now } } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.offer.findMany({
        where: { published: true, endsAt: { gt: now, lt: soon } },
        include: { product: true },
        orderBy: { endsAt: "asc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">لوحة القيادة</h1>
        <p className="mt-1 text-sm text-muted">نظرة سريعة على أداء المتجر.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard href="/admin/offers" label="عروض شغالة" value={String(offers)} tone="brand" />
        <StatCard href="/admin/products" label="منتجات" value={String(products)} tone="blue" />
        <StatCard href="/admin/orders" label="طلبات" value={String(orders)} tone="yellow" />
        <StatCard href="/admin/customers" label="عملاء" value={String(customers)} tone="green" />
        <div className="card-shadow rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold text-muted">إجمالي المبيعات</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-brand">
            {egp(revenue._sum.total ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-shadow overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold">أحدث الطلبات</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-brand">
              عرض الكل
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">لا توجد طلبات بعد.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold">{order.customerName}</p>
                    <p className="text-xs text-muted" dir="ltr">{order.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status] ?? "bg-bg text-muted"}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <span className="text-sm font-bold">{egp(order.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-shadow overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold">عروض تنتهي خلال ٢٤ ساعة</h2>
            <Link href="/admin/offers" className="text-xs font-bold text-brand">
              عرض الكل
            </Link>
          </div>
          {expiring.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">لا توجد عروض قاربت على الانتهاء.</p>
          ) : (
            <ul className="divide-y divide-line">
              {expiring.map((offer) => (
                <li key={offer.id} className="flex items-center gap-3 px-5 py-3.5">
                  <img src={offer.image ?? offer.product.image} alt="" className="h-11 w-11 rounded-xl bg-bg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{offer.product.name}</p>
                    <p className="text-xs text-muted">
                      ينتهي {offer.endsAt.toLocaleString("ar-EG", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="rounded-lg bg-yellow px-2 py-1 text-xs font-extrabold text-bg">
                    {egp(offer.priceAfter)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  href,
  label,
  value,
  tone,
}: {
  href: string;
  label: string;
  value: string;
  tone: "brand" | "blue" | "yellow" | "green";
}) {
  const tones = {
    brand: "bg-brand-soft text-brand",
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow/20 text-yellow-800",
    green: "bg-green/10 text-green",
  };
  return (
    <Link
      href={href}
      className="card-shadow rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-lg"
    >
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-2 inline-block rounded-lg px-2 py-0.5 font-display text-3xl font-extrabold ${tones[tone]}`}>
        {value}
      </p>
    </Link>
  );
}
