"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/context/store";
import { egp } from "@/lib/format";

const payments = [
  { id: "cash", label: "كاش عند الاستلام" },
  { id: "vodafone", label: "فودافون كاش" },
  { id: "instapay", label: "إنستاباي" },
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useStore();
  const router = useRouter();
  const [me, setMe] = useState<{
    loggedIn: boolean;
    name: string | null;
    phone: string | null;
    walletBalance: number;
    addresses: Array<{
      id: string;
      label: string;
      area: string;
      street: string;
      building: string;
      lat: number | null;
      lng: number | null;
      isDefault: boolean;
    }>;
  } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState("cash");
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [proof, setProof] = useState("");
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationAlert, setLocationAlert] = useState("");
  const [settings, setSettings] = useState({
    vodafoneCash: "",
    instapay: "",
    storeLat: 30.7301,
    storeLng: 31.7903,
    deliveryBaseFee: 15,
    deliveryPerKm: 2.5,
    freeDeliveryAbove: 0,
  });

  useEffect(() => {
    fetch("/api/v1/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        const defaultAddress = (data.addresses as Array<{ id: string; isDefault: boolean }>).find((a) => a.isDefault)?.id
          ?? data.addresses?.[0]?.id
          ?? "";
        setSelectedAddressId(defaultAddress);
      })
      .catch(() => setMe({ loggedIn: false, name: null, phone: null, walletBalance: 0, addresses: [] }));
  }, []);
  useEffect(() => {
    fetch("/api/v1/settings")
      .then((res) => res.json())
      .then((data) => setSettings({
        vodafoneCash: data.vodafoneCash ?? "",
        instapay: data.instapay ?? "",
        storeLat: Number(data.storeLat ?? 30.7301),
        storeLng: Number(data.storeLng ?? 31.7903),
        deliveryBaseFee: Number(data.deliveryBaseFee ?? 15),
        deliveryPerKm: Number(data.deliveryPerKm ?? 2.5),
        freeDeliveryAbove: Number(data.freeDeliveryAbove ?? 0),
      }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!me?.loggedIn || !me.addresses.length || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const near = me.addresses.some((address) => {
          if (!address.lat || !address.lng) return false;
          const dLat = (pos.coords.latitude - address.lat) * 111;
          const dLng = (pos.coords.longitude - address.lng) * 111;
          const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng);
          return distanceKm <= 0.4;
        });
        if (!near) {
          setLocationAlert("واضح إنك في موقع جديد غير محفوظ. ممكن تضيفه من حسابك علشان التوصيل يكون أدق.");
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }, [me]);

  const selectedAddress = me?.addresses.find((a) => a.id === selectedAddressId) ?? null;
  const deliveryFee = (() => {
    if (fulfillment === "pickup") return 0;
    if (settings.freeDeliveryAbove > 0 && cartTotal >= settings.freeDeliveryAbove) return 0;
    if (!selectedAddress?.lat || !selectedAddress?.lng) return settings.deliveryBaseFee;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(selectedAddress.lat - settings.storeLat);
    const dLng = toRad(selectedAddress.lng - settings.storeLng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(settings.storeLat)) * Math.cos(toRad(selectedAddress.lat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = 6371 * c;
    return Math.max(0, Math.round((settings.deliveryBaseFee + km * settings.deliveryPerKm) * 100) / 100);
  })();
  const grandTotal = cartTotal + deliveryFee;
  const walletDeduction = useWalletBalance ? Math.min(me?.walletBalance ?? 0, grandTotal) : 0;
  const payableTotal = Math.max(0, Math.round((grandTotal - walletDeduction) * 100) / 100);
  const walletPayment = (payment === "vodafone" || payment === "instapay") && payableTotal > 0;
  const walletOnly = payableTotal === 0;
  const walletNumber = payment === "vodafone" ? settings.vodafoneCash : settings.instapay;

  async function onProof(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/v1/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string };
      if (data.url) setProof(data.url);
      else setError("متعذر رفع الصورة. جرّب تاني.");
    } catch {
      setError("متعذر رفع الصورة. جرّب تاني.");
    }
    setUploading(false);
  }

  async function submit() {
    if (!cart.length) return;
    if (!me?.loggedIn) {
      setError("سجل دخولك الأول علشان تقدر تكمل الطلب.");
      return;
    }
    if (fulfillment === "delivery" && !selectedAddressId) {
      setError("اختار عنوان توصيل محفوظ من حسابك.");
      return;
    }
    if (walletPayment && !proof) {
      setError("ارفع صورة التحويل الأول عشان نقدر نأكد الدفع.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: fulfillment === "delivery" ? selectedAddressId : undefined,
          note: note.trim() || undefined,
          payment,
          fulfillment,
          paymentProof: proof || undefined,
          walletUsed: walletDeduction,
          subtotal: cartTotal,
          deliveryFee,
          total: payableTotal,
          items: cart.map((line) => ({
            productId: line.productId,
            name: line.name,
            price: line.price,
            qty: line.qty,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch {
      setError("حصلت مشكلة. جرّب تاني.");
      setLoading(false);
    }
  }

  if (!cart.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">السلة فاضية.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white"
        >
          تصفح العروض
        </button>
      </div>
    );
  }

  const input =
    "h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none transition-colors focus:border-brand";

  if (!me) {
    return (
      <div className="mx-auto max-w-xl pt-10 text-center text-sm text-muted">
        جاري تجهيز صفحة الطلب...
      </div>
    );
  }

  if (me && !me.loggedIn) {
    return (
      <div className="mx-auto max-w-xl space-y-4 pt-8">
        <div className="card-shadow rounded-2xl border border-line bg-surface p-6 text-center">
          <h1 className="font-display text-2xl font-bold">قبل إتمام الطلب</h1>
          <p className="mt-2 text-sm text-muted">
            لازم تسجل دخول وتضيف عنوانك عشان نقدر نوصلك الطلب بشكل صحيح.
          </p>
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="mt-5 h-12 rounded-full bg-brand px-8 font-bold text-white transition-colors hover:bg-brand-deep"
          >
            دخول / إنشاء حساب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-5">
      <h1 className="font-display text-2xl font-bold">تأكيد الطلب</h1>

      <div className="card-shadow space-y-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold">طريقة الاستلام</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFulfillment("delivery")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-semibold transition-colors ${
              fulfillment === "delivery"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-muted hover:border-brand"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="17" r="3" />
              <circle cx="18" cy="17" r="3" />
              <path d="M6 17h6V6h4l3 5v6h-1M9 8H4v9h2" />
            </svg>
            توصيل للبيت
          </button>
          <button
            type="button"
            onClick={() => setFulfillment("pickup")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-semibold transition-colors ${
              fulfillment === "pickup"
                ? "border-brand bg-brand-soft text-brand"
                : "border-line text-muted hover:border-brand"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9l1.5-5h13L20 9M4 9h16v11H4V9Zm5 4h6" />
            </svg>
            استلام من الماركت
          </button>
        </div>
        {fulfillment === "pickup" ? (
          <p className="rounded-xl bg-bg px-4 py-3 text-xs leading-6 text-muted">
            هنجهز طلبك وتستلمه من الفرع: فاقوس، الشرقية. هيجيلك تحديث أول ما يكون جاهز.
          </p>
        ) : null}
      </div>

      <div className="card-shadow space-y-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold">{fulfillment === "delivery" ? "بيانات التوصيل" : "بياناتك"}</h2>
        <div className="rounded-xl bg-bg px-4 py-3 text-sm">
          <p className="font-semibold">{me?.name}</p>
          <p className="text-muted" dir="ltr">{me?.phone}</p>
        </div>
        {fulfillment === "delivery" ? (
          <>
            <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)} className={input}>
              <option value="">اختر عنوان التوصيل</option>
              {me?.addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label} · {address.area} · {address.street} {address.building}
                </option>
              ))}
            </select>
            {!me?.addresses.length ? (
              <div className="rounded-xl border border-dashed border-red/40 bg-red/5 px-4 py-3 text-xs text-red">
                لازم تضيف عنوان واحد على الأقل من صفحة الحساب قبل إتمام الطلب.
                <button type="button" onClick={() => router.push("/account?tab=profile")} className="mr-2 font-bold underline">
                  إضافة عنوان الآن
                </button>
              </div>
            ) : null}
            {locationAlert ? (
              <div className="rounded-xl border border-dashed border-yellow-300 bg-yellow/10 px-4 py-3 text-xs text-yellow-900">
                {locationAlert}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="card-shadow space-y-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold">الدفع</h2>
        <label className="flex items-center justify-between rounded-xl border border-line bg-bg px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
              <path d="M16 12h5" />
              <circle cx="16" cy="12" r="1" />
            </svg>
            رصيد المحفظة
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">{egp(me?.walletBalance ?? 0)}</span>
            <button
              type="button"
              onClick={() => setUseWalletBalance((prev) => !prev)}
              className={`relative h-7 w-12 rounded-full transition-colors ${useWalletBalance ? "bg-brand" : "bg-line"}`}
              aria-pressed={useWalletBalance}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                  useWalletBalance ? "right-0.5" : "right-[1.45rem]"
                }`}
              />
            </button>
          </div>
        </label>
        {useWalletBalance ? (
          <p className="text-xs font-semibold text-green">
            خصم من المحفظة: {egp(walletDeduction)} {walletOnly ? "(تم تغطية الطلب بالكامل)" : ""}
          </p>
        ) : null}
        {!walletOnly ? <h3 className="text-xs font-bold text-muted">اختار طريقة دفع الباقي</h3> : null}
        {!walletOnly ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {payments.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setPayment(method.id)}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                payment === method.id
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line text-muted hover:border-brand"
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
        ) : (
          <div className="rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-xs font-bold text-green">
            مفيش مبلغ متبقي للدفع، الطلب هيتأكد مباشرة من رصيد المحفظة.
          </div>
        )}

        {walletPayment ? (
          <div className="space-y-3 rounded-xl border border-dashed border-brand/40 bg-brand-soft/50 p-4">
            <p className="text-xs font-bold text-brand">
              حوّل {egp(payableTotal)} على {payment === "vodafone" ? "رقم فودافون كاش" : "حساب إنستاباي"} ده:
            </p>
            <p className="rounded-xl bg-surface px-4 py-3 text-center font-display text-xl font-extrabold tracking-wider" dir="ltr">
              {walletNumber || "—"}
            </p>
            <p className="text-[11px] leading-5 text-muted">
              بعد التحويل ارفع صورة إثبات التحويل. طلبك هيتأكد بعد مراجعة التحويل من الإدارة.
            </p>
            <div className="flex items-center gap-3">
              {proof ? (
                <img src={proof} alt="إثبات التحويل" className="h-20 w-20 rounded-xl border border-line object-cover" />
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" />
                </svg>
                {uploading ? "بيرفع..." : proof ? "تغيير الصورة" : "رفع صورة التحويل"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void onProof(file);
                  }}
                />
              </label>
              {proof ? <span className="text-xs font-semibold text-green">اترفعت</span> : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="card-shadow space-y-3 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold">ملخص السلة</h2>
        <ul className="space-y-2 text-sm">
          {cart.map((line) => (
            <li key={line.productId} className="flex justify-between gap-3">
              <span className="text-muted">
                {line.name} <span className="text-xs">× {line.qty}</span>
              </span>
              <span className="font-semibold">{egp(line.price * line.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm text-muted">إجمالي المنتجات</span>
          <strong>{egp(cartTotal)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">رسوم التوصيل</span>
          <strong>{deliveryFee ? egp(deliveryFee) : "مجاني"}</strong>
        </div>
        {useWalletBalance ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">خصم المحفظة</span>
            <strong className="text-green">- {egp(walletDeduction)}</strong>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm text-muted">الإجمالي المطلوب</span>
          <strong className="font-display text-xl">{egp(payableTotal)}</strong>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ملاحظات للطلب (اختياري)"
          rows={2}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
        />
        {error ? <p className="text-xs font-semibold text-red">{error}</p> : null}
        <button
          type="button"
          onClick={submit}
          disabled={loading || uploading}
          className="h-12 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
        >
          {loading ? "جاري إرسال الطلب..." : `تأكيد الطلب · ${egp(payableTotal)}`}
        </button>
        {walletPayment ? (
          <p className="text-center text-[11px] text-muted">
            الطلب هيوصل للإدارة بحالة "تأكيد الدفع" لحد ما نراجع التحويل.
          </p>
        ) : null}
      </div>
    </div>
  );
}
