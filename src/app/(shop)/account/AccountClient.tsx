"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChatBox } from "@/components/ChatBox";
import { BuildingImageField } from "@/components/BuildingImageField";
import { LocationPicker } from "@/components/LocationPicker";
import { deleteAddress, customerLogin, customerLogout, customerRegister, saveAddress, setDefaultAddress } from "./actions";

type Address = {
  id: string;
  label: string;
  area: string;
  street: string;
  building: string;
  buildingImage: string | null;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
};

type Customer = { id: string; name: string; phone: string; walletBalance: number; addresses: Address[] } | null;
type AccountOrder = { id: string; status: string; total: number; createdAtLabel: string };
type WalletTx = { id: string; amount: number; type: string; status: string; note: string; createdAtLabel: string };

const input =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm outline-none transition-colors focus:border-brand";

const statusLabel: Record<string, string> = {
  new: "جديد",
  payment_review: "تأكيد الدفع",
  preparing: "قيد التجهيز",
  delivering: "في الطريق",
  delivered: "تم التسليم",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

const errors: Record<string, string> = {
  login: "بيانات الدخول غير صحيحة. تأكد من الرقم وكلمة المرور.",
  register: "أكمل البيانات صح: الاسم، موبايل صحيح، وكلمة مرور ٤ أحرف على الأقل.",
  exists: "الرقم ده مسجل قبل كده. سجل دخولك بدل ما تعمل حساب جديد.",
};

const tabs = [
  { id: "wallet", label: "محفظتي" },
  { id: "profile", label: "ملفي الشخصي" },
  { id: "orders", label: "طلباتي" },
  { id: "invoices", label: "فواتيري" },
  { id: "support", label: "الدعم والمساعدة" },
  { id: "language", label: "اللغة" },
  { id: "privacy", label: "سياسة الخصوصية" },
] as const;

export function AccountClient({
  customer,
  error,
  activeTab,
  orders,
  walletTransactions,
}: {
  customer: Customer;
  error?: string;
  activeTab: string;
  orders: AccountOrder[];
  walletTransactions: WalletTx[];
}) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const currentTab = useMemo(() => tabs.find((item) => item.id === activeTab)?.id ?? "profile", [activeTab]);

  if (!customer) {
    return (
      <div className="card-shadow mx-auto max-w-md rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 grid grid-cols-2 rounded-full bg-bg p-1 text-sm font-bold">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`h-10 rounded-full transition-colors ${tab === "login" ? "bg-brand text-white" : "text-muted"}`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`h-10 rounded-full transition-colors ${tab === "register" ? "bg-brand text-white" : "text-muted"}`}
          >
            حساب جديد
          </button>
        </div>
        {error && errors[error] ? (
          <p className="mb-4 rounded-xl bg-red/10 px-4 py-2.5 text-center text-sm font-semibold text-red">
            {errors[error]}
          </p>
        ) : null}
        <p className="mb-4 rounded-xl bg-brand-soft px-4 py-2.5 text-center text-sm font-semibold text-brand">
          سجل دخولك لمشاهدة طلباتك وفواتيرك والدعم.
        </p>
        {tab === "login" ? (
          <form action={customerLogin} className="space-y-3">
            <input name="identifier" required placeholder="رقم الموبايل أو الإيميل" className={input} />
            <input name="password" type="password" required placeholder="كلمة المرور" className={input} />
            <button className="h-12 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep">
              دخول
            </button>
          </form>
        ) : (
          <form action={customerRegister} className="space-y-3">
            <input name="name" required placeholder="الاسم بالكامل" className={input} />
            <div className="space-y-1.5">
              <div className="flex items-center overflow-hidden rounded-xl border border-line">
                <span className="grid h-12 min-w-16 place-items-center bg-bg text-sm font-bold text-muted" dir="ltr">+20</span>
                <input name="phone" required placeholder="1XXXXXXXXX" inputMode="tel" dir="ltr" className="h-12 w-full bg-surface px-4 text-right text-sm outline-none" />
              </div>
              <p className="text-[11px] text-muted">برجاء إدخال رقم عليه واتساب لتسهيل التواصل على الطلب.</p>
            </div>
            <input name="email" type="email" placeholder="الإيميل (اختياري)" dir="ltr" className={`${input} text-right`} />
            <input name="password" type="password" required placeholder="كلمة المرور" className={input} />
            <button className="h-12 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep">
              إنشاء الحساب
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[250px_1fr]">
      <aside className="card-shadow rounded-2xl border border-line bg-surface p-3">
        <p className="px-3 py-2 text-sm font-bold">{customer.name}</p>
        <p className="px-3 text-xs text-muted" dir="ltr">{customer.phone}</p>
        <div className="mt-3 space-y-1">
          {tabs.map((item) => (
            <Link
              key={item.id}
              href={`/account?tab=${item.id}`}
              className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                currentTab === item.id ? "bg-brand text-white" : "text-muted hover:bg-brand-soft hover:text-brand"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <form action={customerLogout} className="mt-3">
          <button className="w-full rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-red hover:text-red">
            خروج
          </button>
        </form>
      </aside>

      <section className="space-y-4">
        {currentTab === "profile" ? (
          <div className="space-y-4">
            <div className="card-shadow rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-display text-xl font-bold">ملفي الشخصي</h2>
              <p className="mt-2 text-sm text-muted">الاسم: {customer.name}</p>
              <p className="text-sm text-muted" dir="ltr">الموبايل: {customer.phone}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">عناويني</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-sm font-semibold text-brand"
                >
                  {showAddressForm ? "إلغاء" : "+ عنوان جديد"}
                </button>
              </div>
              {showAddressForm ? (
                <form action={saveAddress} className="card-shadow space-y-3 rounded-2xl border border-line bg-surface p-5">
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select name="label" className={input} defaultValue="المنزل">
                      <option value="المنزل">المنزل</option>
                      <option value="العمل">العمل</option>
                      <option value="الاستراحة">الاستراحة</option>
                      <option value="منزل صديق">منزل صديق</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                    <input name="area" defaultValue="فاقوس" placeholder="المنطقة" className={input} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="street" placeholder="الشارع" className={input} />
                    <input name="building" placeholder="العمارة / الدور" className={input} />
                  </div>
                  <LocationPicker />
                  <BuildingImageField />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isDefault" className="accent-brand" />
                    اجعله العنوان الأساسي
                  </label>
                  <button className="h-12 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep">
                    حفظ العنوان
                  </button>
                </form>
              ) : null}
              {customer.addresses.length === 0 ? (
                <p className="text-sm text-muted">لسه مفيش عنوان محفوظ.</p>
              ) : (
                <ul className="space-y-2">
                  {customer.addresses.map((address) => (
                    <li key={address.id} className="card-shadow flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3">
                      {address.buildingImage ? <img src={address.buildingImage} alt="" className="h-12 w-12 rounded-xl object-cover" /> : null}
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {address.label}{" "}
                          {address.isDefault ? <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">أساسي</span> : null}
                        </p>
                        <p className="text-xs text-muted">{address.area} · {address.street} {address.building}</p>
                      </div>
                      <form action={deleteAddress}>
                        <input type="hidden" name="id" value={address.id} />
                        <button className="text-xs font-semibold text-red">حذف</button>
                      </form>
                      {!address.isDefault ? (
                        <form action={setDefaultAddress}>
                          <input type="hidden" name="customerId" value={customer.id} />
                          <input type="hidden" name="id" value={address.id} />
                          <button className="text-xs font-semibold text-brand">تعيين كأساسي</button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {currentTab === "orders" ? (
          <div className="card-shadow rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-xl font-bold">طلباتي (من الأقدم للأحدث)</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-muted">ما فيش طلبات لسه.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((order) => (
                  <li key={order.id} className="rounded-xl border border-line p-3">
                    <Link href={`/orders/${order.id}`} className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{order.id}</span>
                      <span className="text-xs text-muted">{order.createdAtLabel}</span>
                      <span className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-bold text-brand">
                        {statusLabel[order.status] ?? order.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {currentTab === "wallet" ? (
          <div className="card-shadow rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">محفظتي</h2>
              <span className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-sm font-extrabold text-yellow-900">
                {customer.walletBalance.toFixed(2)} ج
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">الرصيد يتخصم تلقائيًا من صفحة الطلب لو فعّلت زر رصيد المحفظة.</p>
            {walletTransactions.length === 0 ? (
              <p className="mt-4 text-sm text-muted">لا توجد حركات على المحفظة حتى الآن.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {walletTransactions.map((tx) => (
                  <li key={tx.id} className="rounded-xl border border-line bg-bg px-3 py-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{tx.note || tx.type}</span>
                      <span className={tx.amount >= 0 ? "font-bold text-green" : "font-bold text-red"}>
                        {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(2)} ج
                      </span>
                    </div>
                    <p className="mt-1 text-muted">{tx.createdAtLabel} · {tx.status === "pending" ? "قيد التنفيذ" : "مكتمل"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {currentTab === "invoices" ? (
          <div className="card-shadow rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-xl font-bold">فواتيري</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-muted">لا توجد فواتير حتى الآن.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((order) => (
                  <li key={order.id} className="rounded-xl border border-line p-3">
                    <p className="text-sm font-bold">ريست الطلب: {order.id}</p>
                    <p className="mt-1 text-xs text-muted">تاريخ الطلب: {order.createdAtLabel}</p>
                    <p className="text-xs text-muted">الحالة: {statusLabel[order.status] ?? order.status}</p>
                    <p className="text-xs font-semibold text-brand">الإجمالي: {order.total.toFixed(2)} ج</p>
                    <Link
                      href={`/account/invoices/${order.id}`}
                      className="mt-2 inline-flex rounded-full border border-brand px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white"
                    >
                      معاينة
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {currentTab === "support" ? <ChatBox /> : null}

        {currentTab === "language" ? (
          <div className="card-shadow rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-xl font-bold">اللغة</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked readOnly className="accent-brand" />
                العربية
              </label>
              <label className="flex items-center gap-2 text-muted">
                <input type="radio" disabled className="accent-brand" />
                English (قريبًا)
              </label>
            </div>
          </div>
        ) : null}

        {currentTab === "privacy" ? (
          <div className="card-shadow rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-display text-xl font-bold">سياسة الخصوصية</h2>
            <p className="text-sm leading-7 text-muted">
              نحترم خصوصيتك. نستخدم بياناتك فقط لإتمام الطلبات، التوصيل، وخدمة العملاء. لا نشارك بياناتك مع أي طرف خارجي إلا بما يلزم تشغيل الخدمة.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
