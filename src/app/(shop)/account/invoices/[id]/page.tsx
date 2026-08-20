import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoicePdfButton } from "./InvoicePdfButton";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

const statusLabel: Record<string, string> = {
  new: "جديد",
  payment_review: "تأكيد الدفع",
  preparing: "قيد التجهيز",
  delivering: "في الطريق",
  delivered: "تم التسليم",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

const paymentLabel: Record<string, string> = {
  cash: "كاش عند الاستلام",
  wallet: "محفظة العميل",
  vodafone: "فودافون كاش",
  instapay: "إنستاباي",
};

export default async function InvoicePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const customer = await getCustomer();
  if (!customer) redirect("/account");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, customerId: customer.id },
  });
  if (!order) notFound();

  const items = JSON.parse(order.items) as OrderItem[];

  return (
    <div className="mx-auto max-w-3xl space-y-4 pt-5">
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">معاينة الفاتورة</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/account?tab=invoices"
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-brand hover:text-brand"
          >
            رجوع للفواتير
          </Link>
          <InvoicePdfButton orderId={order.id} />
        </div>
      </div>

      <div id="invoice-print" className="card-shadow relative overflow-hidden rounded-2xl border border-line bg-white p-6 text-text">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div className="grid h-full place-items-center">
            <img src="/brand/logo-cart.png" alt="" className="h-64 w-64 object-contain" />
          </div>
        </div>
        <div className="relative mb-5 flex items-start justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-cart.png" alt="وزير السعادة" className="h-14 w-14 rounded-2xl border border-line bg-surface p-1 object-contain" />
            <div>
              <p className="font-display text-xl font-bold text-brand">وزير السعادة</p>
              <p className="text-xs text-muted">فاقوس - الشرقية - مصر</p>
              <p className="text-xs text-muted" dir="ltr">+201025701015</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-brand">فاتورة ضريبية مبسطة</p>
            <p className="text-xs text-muted">رقم الفاتورة: INV-{order.id}</p>
            <p className="text-xs text-muted">رقم الطلب: {order.id}</p>
            <p className="text-xs text-muted">التاريخ: {order.createdAt.toLocaleString("ar-EG")}</p>
            <p className="text-xs text-muted">سجل ضريبي: 000-000-000</p>
          </div>
        </div>

        <div className="relative mb-4 grid gap-2 rounded-xl bg-bg p-3 text-sm">
          <p><span className="font-semibold">العميل:</span> {order.customerName}</p>
          <p dir="ltr"><span className="font-semibold">الموبايل:</span> {order.phone}</p>
          <p><span className="font-semibold">العنوان:</span> {order.address}</p>
          <p><span className="font-semibold">الحالة:</span> {statusLabel[order.status] ?? order.status}</p>
          <p><span className="font-semibold">طريقة الدفع:</span> {paymentLabel[order.payment] ?? order.payment}</p>
          <div className="absolute left-2 top-2 rounded-full border-2 border-brand/40 px-3 py-1 text-[10px] font-bold text-brand/80">
            ختم المتجر · معتمد
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-2 py-2 text-right font-semibold">الصنف</th>
              <th className="px-2 py-2 text-center font-semibold">الكمية</th>
              <th className="px-2 py-2 text-center font-semibold">السعر</th>
              <th className="px-2 py-2 text-center font-semibold">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId} className="border-b border-line/70">
                <td className="px-2 py-2">{item.name}</td>
                <td className="px-2 py-2 text-center">{item.qty}</td>
                <td className="px-2 py-2 text-center">{item.price.toFixed(2)} ج</td>
                <td className="px-2 py-2 text-center">{(item.price * item.qty).toFixed(2)} ج</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 border-t border-line pt-4 text-left">
          <p className="font-display text-xl font-extrabold text-brand">الإجمالي: {order.total.toFixed(2)} ج</p>
          <p className="mt-1 text-xs text-muted">الدفع: {paymentLabel[order.payment] ?? order.payment}</p>
          <p className="mt-1 text-[11px] text-muted">هذه الفاتورة صالحة للعرض والحفظ بصيغة PDF.</p>
        </div>
      </div>
    </div>
  );
}
