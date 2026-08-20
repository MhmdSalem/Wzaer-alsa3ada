import { prisma } from "@/lib/prisma";
import { egp } from "@/lib/format";
import { requireDriver } from "@/lib/auth";
import { confirmDelivery, driverLogout } from "./actions";
import { LiveRefresh } from "@/components/LiveRefresh";
import { DriverLiveTracker } from "./DriverLiveTracker";

export const dynamic = "force-dynamic";

type OrderItem = { productId: string; name: string; price: number; qty: number };

export default async function DriverHome({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; done?: string }>;
}) {
  const driver = await requireDriver();
  const { error, done } = await searchParams;
  const [orders, history, ratingAgg] = await Promise.all([
    prisma.order.findMany({
      where: { driverId: driver.id, status: "delivering" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { driverId: driver.id, status: "delivered" },
      orderBy: { deliveredAt: "desc" },
      take: 20,
    }),
    prisma.order.aggregate({
      where: { driverId: driver.id, driverRating: { not: null } },
      _avg: { driverRating: true },
      _count: { driverRating: true },
    }),
  ]);
  const avgRating = ratingAgg._avg.driverRating;
  const ratingCount = ratingAgg._count.driverRating;

  return (
    <div className="min-h-screen bg-bg">
      <LiveRefresh
        endpoint="/api/driver/orders/poll"
        fingerprint={`${orders.length}:${orders.map((o) => o.id).join(",")}`}
        sound
        toastMessage="عندك طلب جديد"
      />
      <DriverLiveTracker orderIds={orders.map((order) => order.id)} />
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-brand">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="17" r="3" />
                <circle cx="18" cy="17" r="3" />
                <path d="M6 17h6V6h4l3 5v6h-1M9 8H4v9h2" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold">{driver.name}</p>
              <p className="text-[11px] text-muted">مندوب توصيل · وزير السعادة</p>
            </div>
          </div>
          <form action={driverLogout}>
            <button className="rounded-full border border-line px-4 py-2 text-xs font-bold text-muted transition-colors hover:border-red hover:text-red">
              خروج
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <section className="card-shadow grid grid-cols-3 divide-x divide-x-reverse divide-line rounded-2xl border border-line bg-surface p-4 text-center">
          <div>
            <p className="font-display text-2xl font-extrabold text-brand">{history.length}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-muted">طلب مسلّم</p>
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-yellow-600" dir="ltr">
              {avgRating ? avgRating.toFixed(1) : "—"}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-muted">
              تقييمك{ratingCount ? ` (${ratingCount} تقييم)` : ""}
            </p>
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-blue-700">{orders.length}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-muted">في الطريق دلوقتي</p>
          </div>
        </section>

        {done ? (
          <p className="rounded-2xl bg-green/10 px-4 py-3 text-center text-sm font-bold text-green">
            تم تأكيد التسليم بنجاح. الطلب اتقفل.
          </p>
        ) : null}
        {error === "code" ? (
          <p className="rounded-2xl bg-red/10 px-4 py-3 text-center text-sm font-bold text-red">
            كود التسليم غير صحيح. تأكد من الكود مع العميل.
          </p>
        ) : null}

        <h1 className="font-display text-xl font-bold">
          الطلبات المعينة لك ({orders.length})
        </h1>

        {orders.length === 0 ? (
          <div className="card-shadow rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-sm text-muted">مفيش طلبات معاك دلوقتي.</p>
          </div>
        ) : (
          orders.map((order) => {
            const items = JSON.parse(order.items) as OrderItem[];
            const mapsUrl = order.lat && order.lng
              ? `https://maps.google.com/maps?q=${order.lat},${order.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;
            return (
              <article key={order.id} className="card-shadow space-y-4 rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center justify-between">
                  <strong className="font-display text-lg">{order.id}</strong>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                    في الطريق
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{order.customerName}</p>
                  <a href={`tel:${order.phone}`} dir="ltr" className="block font-bold text-brand">
                    {order.phone}
                  </a>
                  <p className="text-muted">{order.address}</p>
                  {order.note ? <p className="text-xs text-muted">ملاحظة: {order.note}</p> : null}
                </div>

                {order.lat && order.lng ? (
                  <div className="overflow-hidden rounded-xl border border-line">
                    <iframe
                      title="موقع العميل"
                      src={`https://maps.google.com/maps?q=${order.lat},${order.lng}&z=16&output=embed`}
                      className="h-48 w-full"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  افتح الموقع في خرائط جوجل
                </a>

                <ul className="space-y-1 rounded-xl bg-bg p-3 text-xs">
                  {items.map((item) => (
                    <li key={item.productId} className="flex justify-between">
                      <span>{item.name} × {item.qty}</span>
                      <span className="font-semibold">{egp(item.price * item.qty)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t border-line pt-1.5 text-sm font-bold">
                    <span>الإجمالي ({order.payment})</span>
                    <span>{egp(order.total)}</span>
                  </li>
                </ul>

                <form action={confirmDelivery} className="space-y-2 rounded-xl border border-dashed border-brand/40 bg-brand-soft/50 p-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <p className="text-xs font-bold text-brand">
                    كود التسليم — اطلبه من العميل بعد ما يستلم طلبه
                  </p>
                  <div className="flex gap-2">
                    <input
                      name="code"
                      required
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="٤ أرقام"
                      dir="ltr"
                      className="h-12 flex-1 rounded-xl border border-line bg-surface px-4 text-center font-display text-lg font-bold tracking-[0.5em] outline-none focus:border-brand"
                    />
                    <button className="rounded-full bg-green px-6 font-bold text-white transition-colors hover:opacity-90">
                      تأكيد التسليم
                    </button>
                  </div>
                </form>
              </article>
            );
          })
        )}

        {history.length ? (
          <section className="space-y-3 pt-2">
            <h2 className="font-display text-lg font-bold">سجل التسليمات</h2>
            <ul className="space-y-2">
              {history.map((order) => (
                <li key={order.id} className="card-shadow flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green/10 text-green">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{order.id} · {order.customerName}</p>
                    <p className="text-[11px] text-muted">
                      {order.deliveredAt ? order.deliveredAt.toLocaleString("ar-EG") : ""} · {egp(order.total)}
                    </p>
                  </div>
                  {order.driverRating ? (
                    <span className="rounded-full bg-yellow/20 px-2.5 py-1 text-[11px] font-bold text-yellow-800" dir="ltr">
                      ★ {order.driverRating}/5
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted">بدون تقييم</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
