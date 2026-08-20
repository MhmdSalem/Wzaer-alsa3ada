import { driverLogin } from "../actions";

export default async function DriverLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="17" r="3" />
              <circle cx="18" cy="17" r="3" />
              <path d="M6 17h6V6h4l3 5v6h-1M9 8H4v9h2" />
            </svg>
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand">تطبيق المندوب</h1>
            <p className="mt-1 text-sm text-muted">وزير السعادة · دخول المناديب</p>
          </div>
        </div>
        <form
          action={driverLogin}
          className="card-shadow space-y-4 rounded-2xl border border-line bg-surface p-6"
        >
          {error ? (
            <p className="rounded-xl bg-red/10 px-4 py-2.5 text-center text-sm font-semibold text-red">
              الرقم أو كلمة المرور غير صحيحة.
            </p>
          ) : null}
          <label className="block text-sm font-semibold">
            رقم الموبايل
            <input
              name="phone"
              required
              inputMode="tel"
              dir="ltr"
              placeholder="01xxxxxxxxx"
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-bg px-4 text-right text-sm outline-none transition-colors focus:border-brand"
            />
          </label>
          <label className="block text-sm font-semibold">
            كلمة المرور
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand"
            />
          </label>
          <button className="h-12 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep">
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}
