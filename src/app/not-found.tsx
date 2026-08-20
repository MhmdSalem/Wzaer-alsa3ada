import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">الصفحة مش موجودة</h1>
      <p className="mt-2 text-sm text-muted">الرابط ده مش شغال أو الصفحة اتنقلت.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep"
      >
        ارجع للعروض
      </Link>
    </div>
  );
}
