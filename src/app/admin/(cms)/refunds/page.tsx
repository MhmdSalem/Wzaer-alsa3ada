import { prisma } from "@/lib/prisma";
import { completeBankRefund } from "../../actions";
import { egp } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RefundsPage() {
  const refunds = await prisma.walletTransaction.findMany({
    where: { type: "refund_bank" },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">استرجاع المبالغ</h1>
        <p className="mt-1 text-sm text-muted">طلبات الإرجاع البنكي والمتابعة خلال 72 ساعة.</p>
      </div>
      {refunds.length === 0 ? (
        <div className="card-shadow rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">
          لا توجد طلبات استرجاع حالياً.
        </div>
      ) : (
        <ul className="space-y-3">
          {refunds.map((item) => (
            <li key={item.id} className="card-shadow rounded-2xl border border-line bg-surface p-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">{item.customer.name} · <span dir="ltr">{item.customer.phone}</span></p>
                <span className="font-display text-lg font-extrabold text-brand">{egp(item.amount)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {item.orderId ? `طلب: ${item.orderId}` : "بدون طلب"} · {item.createdAt.toLocaleString("ar-EG")}
              </p>
              <p className="mt-1 text-xs text-muted">{item.note}</p>
              {item.releaseAt ? (
                <p className="mt-1 text-xs font-semibold text-blue-700">
                  موعد الإتاحة: {item.releaseAt.toLocaleString("ar-EG")}
                </p>
              ) : null}
              <div className="mt-3">
                {item.status === "pending" ? (
                  <form action={completeBankRefund}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="rounded-full bg-green px-4 py-2 text-xs font-bold text-white">
                      تم التحويل البنكي
                    </button>
                  </form>
                ) : (
                  <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-bold text-green">مكتمل</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
