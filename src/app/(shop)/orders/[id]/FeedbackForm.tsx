"use client";

import { useState } from "react";
import { submitFeedback } from "./actions";

function Stars({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1" dir="ltr">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} نجوم`}
          className="p-1 transition-transform hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-8 w-8 ${n <= value ? "fill-yellow text-yellow" : "fill-line text-line"}`}
          >
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function FeedbackForm({ orderId, hasDriver }: { orderId: string; hasDriver: boolean }) {
  const [orderRating, setOrderRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);

  return (
    <form action={submitFeedback} className="card-shadow space-y-4 rounded-2xl border border-line bg-surface p-6">
      <input type="hidden" name="orderId" value={orderId} />
      <h2 className="text-center font-display text-lg font-bold">قيّم تجربتك</h2>
      <div>
        <p className="mb-1 text-center text-sm font-semibold text-muted">الطلب والمنتجات</p>
        <Stars name="orderRating" value={orderRating} onChange={setOrderRating} />
      </div>
      {hasDriver ? (
        <div>
          <p className="mb-1 text-center text-sm font-semibold text-muted">المندوب والتوصيل</p>
          <Stars name="driverRating" value={driverRating} onChange={setDriverRating} />
        </div>
      ) : null}
      <textarea
        name="feedback"
        rows={2}
        placeholder="عندك ملاحظة؟ قولنا (اختياري)"
        className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
      />
      <button
        disabled={orderRating < 1}
        className="h-12 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-40"
      >
        إرسال التقييم
      </button>
    </form>
  );
}
