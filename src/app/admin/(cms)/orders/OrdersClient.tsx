"use client";

import { useMemo, useState } from "react";
import { egp } from "@/lib/format";
import {
  addWalletBalance,
  approvePayment,
  assignDriver,
  refundOrderItem,
  rejectOrder,
  updateOrderStatus,
} from "../../actions";
import { LiveRefresh } from "@/components/LiveRefresh";

const statusLabel: Record<string, string> = {
  new: "جديد",
  payment_review: "تأكيد الدفع",
  preparing: "قيد التجهيز",
  delivering: "في الطريق",
  delivered: "تم التسليم",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

const statusStyle: Record<string, string> = {
  new: "bg-yellow/20 text-yellow-800",
  payment_review: "bg-orange-100 text-orange-700",
  preparing: "bg-brand-soft text-brand",
  delivering: "bg-blue-50 text-blue-700",
  delivered: "bg-green/10 text-green",
  rejected: "bg-red/10 text-red",
  cancelled: "bg-red/10 text-red",
};

const paymentLabel: Record<string, string> = {
  cash: "كاش",
  wallet: "محفظة",
  vodafone: "فودافون كاش",
  instapay: "إنستاباي",
};

type Driver = { id: string; name: string };
type OrderRow = {
  id: string;
  createdAt: string;
  createdAtLabel: string;
  customerName: string;
  customerId: string | null;
  walletBalance: number | null;
  phone: string;
  address: string;
  payment: string;
  fulfillment: string;
  paymentProof: string | null;
  rejectReason: string | null;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  itemsCount: number;
  deliveryCode: string;
  driverId: string | null;
  driverName: string | null;
  orderRating: number | null;
  driverRating: number | null;
  refundAmount: number | null;
  refundMethod: string | null;
  refundStatus: string | null;
};

const input =
  "h-11 rounded-xl border border-line bg-bg px-3.5 text-sm outline-none transition-colors focus:border-brand";

export function OrdersClient({
  orders,
  drivers,
  fingerprint,
}: {
  orders: OrderRow[];
  drivers: Driver[];
  fingerprint: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [driverId, setDriverId] = useState("");
  const [date, setDate] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [reason, setReason] = useState("");
  const [walletTopupId, setWalletTopupId] = useState("");
  const [refundingId, setRefundingId] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status && order.status !== status) return false;
      if (driverId && order.driverId !== driverId) return false;
      if (date && !order.createdAt.startsWith(date)) return false;
      if (q) {
        const haystack = `${order.id} ${order.customerName} ${order.phone} ${order.driverName ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [orders, query, status, driverId, date]);

  return (
    <div className="space-y-5">
      <LiveRefresh
        endpoint="/api/admin/orders/poll"
        fingerprint={fingerprint}
        sound
        toastMessage="طلب جديد وصل!"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">الطلبات</h1>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} من {orders.length} طلب
          </p>
        </div>
      </div>

      <div className="card-shadow flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث برقم الطلب، اسم العميل، الموبايل، أو المندوب..."
          className={`${input} min-w-56 flex-1`}
        />
        <select value={driverId} onChange={(event) => setDriverId(event.target.value)} className={input}>
          <option value="">كل المناديب</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={input}
        />
        {(query || status || driverId || date) ? (
          <button
            type="button"
            onClick={() => { setQuery(""); setStatus(""); setDriverId(""); setDate(""); }}
            className="h-11 rounded-full border border-line px-4 text-xs font-bold text-muted transition-colors hover:border-red hover:text-red"
          >
            مسح الفلاتر
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["", "new", "payment_review", "preparing", "delivering", "delivered", "rejected", "cancelled"].map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              status === value ? "bg-brand text-white" : "bg-surface text-muted border border-line hover:text-brand"
            }`}
          >
            {value ? statusLabel[value] : "الكل"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-shadow rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="text-sm text-muted">مفيش طلبات مطابقة للفلاتر.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <li key={order.id} className="card-shadow rounded-2xl border border-line bg-surface p-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-display">{order.id}</strong>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status] ?? "bg-bg text-muted"}`}>
                    {statusLabel[order.status] ?? order.status}
                  </span>
                  <span className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-bold text-muted">
                    {order.fulfillment === "pickup" ? "استلام من الماركت" : "توصيل"}
                  </span>
                  <span className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-bold text-muted">
                    {paymentLabel[order.payment] ?? order.payment}
                  </span>
                  {order.deliveryCode ? (
                    <span className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-bold text-muted">
                      كود: <span dir="ltr" className="text-text">{order.deliveryCode}</span>
                    </span>
                  ) : null}
                  {order.orderRating ? (
                    <span className="rounded-full bg-yellow/20 px-2.5 py-1 text-[11px] font-bold text-yellow-800">
                      ★ {order.orderRating}/5{order.driverRating ? ` · مندوب ${order.driverRating}/5` : ""}
                    </span>
                  ) : null}
                </div>
                <span className="font-display text-lg font-extrabold text-brand">{egp(order.total)}</span>
              </div>
              <div className="mt-3 grid gap-1 text-muted md:grid-cols-2">
                <p>{order.customerName} · <span dir="ltr">{order.phone}</span></p>
                <p className="text-xs">{order.address}</p>
              </div>
              <p className="mt-1 text-xs text-muted">
                {order.itemsCount} صنف · {order.createdAtLabel} · منتجات {egp(order.subtotal)} + توصيل {egp(order.deliveryFee)}
              </p>
              {order.customerId ? (
                <p className="mt-1 text-xs font-semibold text-brand">
                  رصيد المحفظة الحالي: {egp(order.walletBalance ?? 0)}
                </p>
              ) : null}
              {order.rejectReason && order.status === "rejected" ? (
                <p className="mt-2 rounded-xl bg-red/10 px-3 py-2 text-xs font-semibold text-red">
                  سبب الرفض: {order.rejectReason}
                </p>
              ) : null}
              {order.refundStatus ? (
                <p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  حالة الاسترجاع: {order.refundStatus === "pending" ? "تحويل بنكي تحت التنفيذ (72 ساعة)" : "تم الاسترجاع"}
                  {order.refundAmount ? ` · ${egp(order.refundAmount)}` : ""}
                  {order.refundMethod === "wallet" ? " · للمحفظة" : order.refundMethod === "bank" ? " · للحساب البنكي" : ""}
                </p>
              ) : null}

              {order.status === "payment_review" ? (
                <div className="mt-4 space-y-3 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-4">
                  <p className="text-xs font-bold text-orange-700">
                    العميل حوّل بـ {paymentLabel[order.payment] ?? order.payment} — راجع إثبات التحويل:
                  </p>
                  {order.paymentProof ? (
                    <a href={order.paymentProof} target="_blank" rel="noreferrer">
                      <img
                        src={order.paymentProof}
                        alt="إثبات التحويل"
                        className="h-32 w-32 rounded-xl border border-line object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  ) : (
                    <p className="text-xs text-red font-semibold">العميل ما رفعش صورة تحويل!</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={approvePayment}>
                      <input type="hidden" name="id" value={order.id} />
                      <button className="rounded-full bg-green px-5 py-2.5 text-xs font-bold text-white transition-colors hover:opacity-90">
                        تأكيد الدفع وقبول الطلب
                      </button>
                    </form>
                    {rejectingId === order.id ? (
                      <form action={rejectOrder} className="flex flex-1 items-center gap-2">
                        <input type="hidden" name="id" value={order.id} />
                        <input
                          name="reason"
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          placeholder="سبب الرفض (مثال: التحويل ما وصلش)"
                          required
                          className="h-10 min-w-40 flex-1 rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-red"
                        />
                        <button className="rounded-full bg-red px-4 py-2.5 text-xs font-bold text-white">
                          تأكيد الرفض
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId("")}
                          className="text-xs font-bold text-muted"
                        >
                          إلغاء
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setRejectingId(order.id); setReason(""); }}
                        className="rounded-full border border-red px-5 py-2.5 text-xs font-bold text-red transition-colors hover:bg-red hover:text-white"
                      >
                        رفض الطلب
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {order.customerId ? (
                  <>
                    {walletTopupId === order.id ? (
                      <form action={addWalletBalance} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bg p-2">
                        <input type="hidden" name="customerId" value={order.customerId} />
                        <input name="amount" type="number" min="1" step="0.01" required placeholder="مبلغ الشحن" className="h-10 w-28 rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-brand" />
                        <input name="note" placeholder="سبب الشحن (اختياري)" className="h-10 w-40 rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-brand" />
                        <button className="rounded-full bg-green px-4 py-2 text-xs font-bold text-white">تأكيد الشحن</button>
                        <button type="button" onClick={() => setWalletTopupId("")} className="text-xs font-bold text-muted">إلغاء</button>
                      </form>
                    ) : (
                      <button type="button" onClick={() => setWalletTopupId(order.id)} className="rounded-full border border-green px-4 py-2 text-xs font-bold text-green transition-colors hover:bg-green hover:text-white">
                        شحن محفظة العميل
                      </button>
                    )}
                  </>
                ) : null}

                {order.customerId && order.status !== "cancelled" && order.status !== "rejected" ? (
                  <>
                    {refundingId === order.id ? (
                      <form action={refundOrderItem} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bg p-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input name="amount" type="number" min="1" step="0.01" required placeholder="مبلغ الاسترجاع" className="h-10 w-28 rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-brand" />
                        <select name="method" className="h-10 rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-brand">
                          <option value="wallet">إرجاع للمحفظة (فوري)</option>
                          <option value="bank">إرجاع للحساب (خلال 72 ساعة)</option>
                        </select>
                        <input name="reason" placeholder="سبب (مثال: صنف غير متوفر)" className="h-10 w-44 rounded-xl border border-line bg-surface px-3 text-xs outline-none focus:border-brand" />
                        <button className="rounded-full bg-blue-700 px-4 py-2 text-xs font-bold text-white">تنفيذ الاسترجاع</button>
                        <button type="button" onClick={() => setRefundingId("")} className="text-xs font-bold text-muted">إلغاء</button>
                      </form>
                    ) : (
                      <button type="button" onClick={() => setRefundingId(order.id)} className="rounded-full border border-blue-700 px-4 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-700 hover:text-white">
                        استرجاع مبلغ
                      </button>
                    )}
                  </>
                ) : null}

                {order.status !== "payment_review" && order.status !== "rejected" ? (
                  <>
                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="h-10 rounded-xl border border-line bg-bg px-3 text-xs outline-none focus:border-brand"
                      >
                        <option value="new">جديد</option>
                        <option value="preparing">قيد التجهيز</option>
                        <option value="delivering">في الطريق</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <button className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-deep">
                        تحديث الحالة
                      </button>
                    </form>
                    {order.fulfillment !== "pickup" ? (
                      <form action={assignDriver} className="flex items-center gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <select
                          name="driverId"
                          defaultValue={order.driverId ?? ""}
                          className="h-10 rounded-xl border border-line bg-bg px-3 text-xs outline-none focus:border-brand"
                        >
                          <option value="">بدون مندوب</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                        <button className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700">
                          {order.driverName ? `المندوب: ${order.driverName}` : "تعيين مندوب"}
                        </button>
                      </form>
                    ) : null}
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
