import { getCustomer } from "@/lib/auth";
import { AccountClient } from "./AccountClient";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "حسابي" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: string }>;
}) {
  const { error, tab } = await searchParams;
  const customer = await getCustomer();
  const activeTab = tab ?? "profile";
  const [orders, wallet] = customer
    ? await Promise.all([
        prisma.order.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "asc" } }),
        prisma.walletTransaction.findMany({
          where: { customerId: customer.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ])
    : [[], []];

  return (
    <div className="space-y-6 pt-5">
      <h1 className="font-display text-2xl font-bold">حسابي</h1>
      <AccountClient
        customer={customer}
        error={error}
        activeTab={activeTab}
        orders={orders.map((order) => ({
          id: order.id,
          status: order.status,
          total: order.total,
          createdAtLabel: order.createdAt.toLocaleString("ar-EG"),
        }))}
        walletTransactions={wallet.map((item) => ({
          id: item.id,
          amount: item.amount,
          type: item.type,
          status: item.status,
          note: item.note,
          createdAtLabel: item.createdAt.toLocaleString("ar-EG"),
        }))}
      />
    </div>
  );
}
