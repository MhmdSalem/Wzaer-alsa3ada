import { prisma } from "@/lib/prisma";
import { egp } from "@/lib/format";

export default async function CustomersAdmin() {
  const customers = await prisma.customer.findMany({
    include: { addresses: true, orders: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">العملاء</h1>
        <p className="mt-1 text-sm text-muted">{customers.length} عميل مسجل</p>
      </div>
      <div className="card-shadow overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th className="p-4 text-right font-semibold">العميل</th>
              <th className="p-4 text-right font-semibold">الموبايل</th>
              <th className="p-4 text-right font-semibold">العنوان</th>
              <th className="p-4 text-right font-semibold">الطلبات</th>
              <th className="p-4 text-right font-semibold">إجمالي المشتريات</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const total = customer.orders.reduce((sum, order) => sum + order.total, 0);
              return (
                <tr key={customer.id} className="border-b border-line/60 last:border-0 hover:bg-bg/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                        {customer.name.slice(0, 1)}
                      </span>
                      <span className="font-semibold">{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted" dir="ltr">{customer.phone}</td>
                  <td className="p-4 text-xs text-muted">
                    {customer.addresses[0]
                      ? `${customer.addresses[0].area} · ${customer.addresses[0].street}`
                      : "—"}
                  </td>
                  <td className="p-4">{customer.orders.length}</td>
                  <td className="p-4 font-bold">{egp(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
