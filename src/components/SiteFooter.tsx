import Link from "next/link";
import { waLink } from "@/lib/format";

type Props = {
  storeName: string;
  slogan: string;
  phone: string;
  city: string;
  governorate: string;
  country: string;
  categories: { id: string; name: string; slug: string }[];
};

export function SiteFooter({
  storeName,
  slogan,
  phone,
  city,
  governorate,
  country,
  categories,
}: Props) {
  return (
    <footer className="mt-14 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-xl font-bold text-brand">{storeName}</p>
          <p className="text-sm leading-7 text-muted">{slogan}</p>
          <p className="text-sm text-muted">
            {city} · {governorate} · {country}
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold">تسوّق</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-brand">العروض</Link>
            </li>
            {categories.slice(0, 5).map((category) => (
              <li key={category.id}>
                <Link href={`/categories/${category.slug}`} className="hover:text-brand">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold">خدمة العملاء</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/account" className="hover:text-brand">حسابي وطلباتي</Link>
            </li>
            <li>
              <a href={`tel:${phone}`} dir="ltr" className="hover:text-brand">
                {phone}
              </a>
            </li>
            <li>
              <a href={waLink(phone)} className="hover:text-brand">
                تواصل واتساب
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold">اطلب بسرعة</p>
          <a
            href={waLink(phone)}
            className="inline-flex items-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-bold text-white"
          >
            اطلب واتساب
          </a>
          <p className="mt-3 text-xs leading-6 text-muted">
            الدفع كاش عند الاستلام، فودافون كاش، أو إنستاباي.
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        {storeName} © {new Date().getFullYear()} · {city}، {governorate}
      </div>
    </footer>
  );
}
