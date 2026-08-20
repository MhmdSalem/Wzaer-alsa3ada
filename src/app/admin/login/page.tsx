import { loginAction } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/brand/logo-cart.png" alt="" className="h-16 w-16 rounded-2xl bg-brand-soft object-contain p-2" />
          <div>
            <h1 className="font-display text-2xl font-bold text-brand">وزير السعادة</h1>
            <p className="mt-1 text-sm text-muted">لوحة التحكم · دخول المشرفين</p>
          </div>
        </div>
        <form
          action={loginAction}
          className="card-shadow space-y-4 rounded-2xl border border-line bg-surface p-6"
        >
          {error ? (
            <p className="rounded-xl bg-red/10 px-4 py-2.5 text-center text-sm font-semibold text-red">
              البيانات غير صحيحة. حاول مرة أخرى.
            </p>
          ) : null}
          <label className="block text-sm font-semibold">
            البريد الإلكتروني
            <input
              name="email"
              type="email"
              required
              dir="ltr"
              placeholder="admin@wazir.local"
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand"
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
