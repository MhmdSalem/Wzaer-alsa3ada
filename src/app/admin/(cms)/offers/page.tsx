import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteOffer } from "../../actions";
import { egp } from "@/lib/format";

export default async function OffersAdmin() {
  const now = new Date();
  const offers = await prisma.offer.findMany({
    include: { product: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">العروض</h1>
          <p className="mt-1 text-sm text-muted">{offers.length} عرض مسجل</p>
        </div>
        <Link
          href="/admin/offers/new"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep"
        >
          + عرض جديد
        </Link>
      </div>
      <div className="card-shadow overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th className="p-4 text-right font-semibold">المنتج</th>
              <th className="p-4 text-right font-semibold">قبل</th>
              <th className="p-4 text-right font-semibold">بعد</th>
              <th className="p-4 text-right font-semibold">الحالة</th>
              <th className="p-4 text-right font-semibold">ينتهي</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const live = offer.published && offer.endsAt > now;
              return (
                <tr key={offer.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-bg/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={offer.image ?? offer.product.image} alt="" className="h-10 w-10 rounded-lg bg-bg object-cover" />
                      <span className="font-semibold">{offer.product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted"><s>{egp(offer.priceBefore)}</s></td>
                  <td className="p-4">
                    <span className="rounded-lg bg-yellow px-2 py-1 text-xs font-extrabold text-bg">
                      {egp(offer.priceAfter)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${live ? "bg-green/10 text-green" : "bg-bg text-muted"}`}>
                      {live ? "شغال" : "متوقف"}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted">
                    {offer.endsAt.toLocaleString("ar-EG")}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/offers/${offer.id}`} className="text-xs font-bold text-brand">
                        تعديل
                      </Link>
                      <form action={deleteOffer}>
                        <input type="hidden" name="id" value={offer.id} />
                        <button className="text-xs font-bold text-red">حذف</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
