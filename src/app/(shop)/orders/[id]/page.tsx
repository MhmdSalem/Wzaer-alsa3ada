import { notFound } from "next/navigation";
import { egp } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { LiveRefresh } from "@/components/LiveRefresh";
import { FeedbackForm } from "./FeedbackForm";
import { DriverTrackingCard } from "./DriverTrackingCard";
import { getCustomer } from "@/lib/auth";

type OrderItem = { productId: string; name: string; price: number; qty: number };

const paymentLabel: Record<string, string> = {
  cash: "كاش عند الاستلام",
  wallet: "محفظة العميل",
  vodafone: "فودافون كاش",
  instapay: "إنستاباي",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rated?: string }>;
}) {
  const { id } = await params;
  const { rated } = await searchParams;
  const customer = await getCustomer();
  if (!customer) notFound();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { driver: true },
  });
  if (!order || order.customerId !== customer.id) notFound();

  const driverAgg = order.driverId
    ? await prisma.order.aggregate({
        where: { driverId: order.driverId, driverRating: { not: null } },
        _avg: { driverRating: true },
        _count: { driverRating: true },
      })
    : null;

  const items = JSON.parse(order.items) as OrderItem[];
  const isPickup = order.fulfillment === "pickup";
  const steps = isPickup
    ? ["استلمنا الطلب", "بنجهز الطلب", "جاهز للاستلام", "اتسلم"]
    : ["استلمنا الطلب", "بنجهز الطلب", "خرج للتوصيل", "اتسلم"];
  const stepIndex =
    order.status === "new" || order.status === "payment_review"
      ? 0
      : order.status === "preparing"
        ? 1
        : order.status === "delivering" || order.status === "riding"
          ? 2
          : order.status === "delivered"
            ? 3
            : 0;
  const outForDelivery = order.status === "delivering" || order.status === "riding";
  const delivered = order.status === "delivered";
  const rejected = order.status === "rejected";
  const paymentReview = order.status === "payment_review";
  const deliveryMinutes =
    delivered && order.deliveredAt
      ? Math.max(1, Math.round((order.deliveredAt.getTime() - order.createdAt.getTime()) / 60000))
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-5">
      <LiveRefresh
        endpoint={`/api/v1/orders/${order.id}`}
        fingerprint={`${order.status}:${order.orderRating ?? ""}`}
        toastMessage="حالة الطلب اتحدثت"
      />
      <div className="card-shadow rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="text-sm text-muted">رقم الطلب</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-brand">
          {order.id}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {order.customerName} · <span dir="ltr">{order.phone}</span>
        </p>
        <p className="mt-1 text-xs font-semibold text-muted">
          {isPickup ? "استلام من الماركت" : "توصيل للبيت"} · {paymentLabel[order.payment] ?? order.payment}
        </p>
      </div>

      {paymentReview ? (
        <div className="card-shadow rounded-2xl border border-orange-300 bg-orange-50 p-6 text-center">
          <h2 className="font-display text-xl font-bold text-orange-700">بنراجع التحويل</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            استلمنا إثبات التحويل وبنراجعه دلوقتي. أول ما الدفع يتأكد، طلبك هيدخل في التجهيز على طول — وهيوصلك إشعار هنا.
          </p>
        </div>
      ) : null}

      {rejected ? (
        <div className="card-shadow rounded-2xl border border-red/30 bg-red/10 p-6 text-center">
          <h2 className="font-display text-xl font-bold text-red">اتأسفنا، الطلب اترفض</h2>
          <p className="mt-2 text-sm font-semibold text-text">
            {order.rejectReason ?? "حصلت مشكلة في تأكيد الطلب"}
          </p>
          <p className="mt-2 text-xs leading-6 text-muted">
            لو عندك استفسار كلمنا على <span dir="ltr">+201025701015</span> أو ابعتلنا من صفحة حسابك.
          </p>
        </div>
      ) : null}

      {delivered ? (
        <div className="card-shadow rounded-2xl border border-green/30 bg-green/10 p-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green text-white">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-green">
            {isPickup ? "استلمت طلبك!" : "وصلنا طلبك!"}
          </h2>
          {deliveryMinutes ? (
            <p className="mt-1 text-sm font-semibold text-text">
              {isPickup ? "اتجهز" : "وصلك"} في {deliveryMinutes} دقيقة من وقت الطلب
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted">بالهنا والشفا — نورت وزير السعادة</p>
        </div>
      ) : null}

      {order.deliveryCode && order.status !== "cancelled" && !delivered && !rejected && !paymentReview ? (
        <div
          className={`card-shadow rounded-2xl border p-6 text-center ${
            outForDelivery
              ? "border-yellow bg-yellow/10"
              : "border-line bg-surface"
          }`}
        >
          <p className="text-sm font-bold">{isPickup ? "كود الاستلام" : "كود التسليم"}</p>
          <p className="mt-2 font-display text-4xl font-extrabold tracking-[0.4em] text-brand" dir="ltr">
            {order.deliveryCode}
          </p>
          <p className="mt-3 text-xs leading-6 text-muted">
            {isPickup
              ? "ورّي الكود ده للكاشير عند الاستلام من الفرع."
              : outForDelivery
                ? "المندوب في الطريق إليك. متديهاش الكود غير لما تستلم طلبك كامل."
                : "ده كود التسليم بتاعك. المندوب هيطلبه منك عند الاستلام — متشاركوش مع حد تاني."}
          </p>
          {outForDelivery && order.driver ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-text">
              <span>المندوب: {order.driver.name}</span>
              {driverAgg && driverAgg._count.driverRating > 0 ? (
                <span className="rounded-full bg-yellow/20 px-2 py-0.5 font-bold text-yellow-800" dir="ltr">
                  ★ {driverAgg._avg.driverRating?.toFixed(1)} ({driverAgg._count.driverRating})
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {outForDelivery ? <DriverTrackingCard orderId={order.id} /> : null}

      {!rejected && !paymentReview ? (
        <div className="card-shadow rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-1 flex-col items-center gap-2">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
                    index <= stepIndex ? "bg-green text-white" : "bg-bg text-muted"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-center text-[10px] font-semibold ${
                    index <= stepIndex ? "text-green" : "text-muted"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card-shadow space-y-3 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-sm font-bold">تفاصيل الطلب</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span className="text-muted">
                {item.name} <span className="text-xs">× {item.qty}</span>
              </span>
              <span className="font-semibold">{egp(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm text-muted">الإجمالي</span>
          <strong className="font-display text-xl">{egp(order.total)}</strong>
        </div>
        <p className="text-xs text-muted">
          {isPickup ? "الاستلام من الفرع: فاقوس، الشرقية" : `العنوان: ${order.address}`} · الدفع: {paymentLabel[order.payment] ?? order.payment}
        </p>
      </div>

      {delivered && !order.orderRating ? (
        <FeedbackForm orderId={order.id} hasDriver={Boolean(order.driverId)} />
      ) : null}

      {rated && order.orderRating ? (
        <div className="card-shadow rounded-2xl border border-line bg-surface p-6 text-center">
          <p className="font-bold text-green">شكرًا! وصلنا تقييمك</p>
          <p className="mt-1 text-sm text-muted">
            قيّمت الطلب {order.orderRating}/5
            {order.driverRating ? ` والمندوب ${order.driverRating}/5` : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
