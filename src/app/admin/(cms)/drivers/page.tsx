import { prisma } from "@/lib/prisma";
import { deleteDriver, saveDriver } from "../../actions";

const input =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand";

export default async function DriversAdmin() {
  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      orders: {
        where: { status: "delivering" },
      },
    },
  });
  const ratings = await prisma.order.groupBy({
    by: ["driverId"],
    where: { driverRating: { not: null } },
    _avg: { driverRating: true },
    _count: { driverRating: true },
  });
  const ratingMap = new Map(ratings.map((r) => [r.driverId, r]));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">المناديب</h1>
        <p className="mt-1 text-sm text-muted">
          حسابات مناديب التوصيل — بيدخلوا من صفحة /driver برقم الموبايل وكلمة المرور.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form action={saveDriver} className="card-shadow h-fit space-y-3 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold">إضافة مندوب جديد</h2>
          <input name="name" placeholder="اسم المندوب" required className={input} />
          <input name="phone" placeholder="رقم الموبايل" required inputMode="tel" dir="ltr" className={`${input} text-right`} />
          <input name="password" placeholder="كلمة المرور" required className={input} />
          <button className="h-11 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep">
            حفظ المندوب
          </button>
        </form>
        <ul className="card-shadow divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {drivers.length === 0 ? (
            <li className="p-6 text-center text-sm text-muted">لا يوجد مناديب بعد.</li>
          ) : null}
          {drivers.map((driver) => {
            const rating = ratingMap.get(driver.id);
            return (
            <li key={driver.id} className="flex items-center gap-4 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-brand">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="17" r="3" />
                  <circle cx="18" cy="17" r="3" />
                  <path d="M6 17h6V6h4l3 5v6h-1M9 8H4v9h2" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{driver.name}</p>
                <p className="text-xs text-muted" dir="ltr">{driver.phone}</p>
              </div>
              {rating ? (
                <span className="rounded-full bg-yellow/20 px-3 py-1 text-[11px] font-bold text-yellow-800">
                  ★ {rating._avg.driverRating?.toFixed(1)} ({rating._count.driverRating} تقييم)
                </span>
              ) : null}
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                {driver.orders.length} طلب في الطريق
              </span>
              <form action={deleteDriver}>
                <input type="hidden" name="id" value={driver.id} />
                <button className="text-xs font-bold text-red">حذف</button>
              </form>
            </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
