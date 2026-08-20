import { prisma } from "@/lib/prisma";
import { saveOffer } from "../../../actions";
import { ImageField } from "../../../_components/ImageField";

const input =
  "mt-1.5 h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand";

export default async function NewOfferPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return <OfferForm products={products} />;
}

export function OfferForm({
  products,
  offer,
}: {
  products: { id: string; name: string }[];
  offer?: {
    id: string;
    productId: string;
    image: string | null;
    priceBefore: number;
    priceAfter: number;
    bundleQty: number | null;
    bundleBefore: number | null;
    bundlePrice: number | null;
    published: boolean;
    sortOrder: number;
  };
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{offer ? "تعديل عرض" : "عرض جديد"}</h1>
        <p className="mt-1 text-sm text-muted">
          العرض بينزل على الرئيسية بتايمر وسعر قبل وبعد.
        </p>
      </div>
      <form action={saveOffer} className="card-shadow max-w-2xl space-y-4 rounded-2xl border border-line bg-surface p-6">
        {offer ? <input type="hidden" name="id" value={offer.id} /> : null}
        <label className="block text-sm font-semibold">
          المنتج
          <select name="productId" defaultValue={offer?.productId} className={input} required>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className="mb-1.5 text-sm font-semibold">صورة العرض (صورة المنتج الحقيقية، من غير تصميم إعلان)</p>
          <ImageField name="image" defaultValue={offer?.image ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            السعر قبل
            <input name="priceBefore" type="number" step="0.1" defaultValue={offer?.priceBefore} className={input} required />
          </label>
          <label className="block text-sm font-semibold">
            السعر بعد
            <input name="priceAfter" type="number" step="0.1" defaultValue={offer?.priceAfter} className={input} required />
          </label>
        </div>
        <div className="rounded-2xl bg-bg p-4">
          <p className="mb-3 text-xs font-bold text-muted">عرض الكمية (اختياري)</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold">
              عدد القطع
              <input name="bundleQty" type="number" defaultValue={offer?.bundleQty ?? ""} className={input} />
            </label>
            <label className="block text-sm font-semibold">
              سعر الكمية قبل
              <input name="bundleBefore" type="number" step="0.1" defaultValue={offer?.bundleBefore ?? ""} className={input} />
            </label>
            <label className="block text-sm font-semibold">
              سعر الكمية بعد
              <input name="bundlePrice" type="number" step="0.1" defaultValue={offer?.bundlePrice ?? ""} className={input} />
            </label>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            مدة العرض
            <select name="hours" defaultValue="72" className={input}>
              <option value="24">24 ساعة</option>
              <option value="48">48 ساعة</option>
              <option value="72">72 ساعة</option>
              <option value="168">أسبوع</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            ترتيب الظهور
            <input name="sortOrder" type="number" defaultValue={offer?.sortOrder ?? 0} className={input} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="published" defaultChecked={offer?.published ?? true} className="h-4 w-4 accent-brand" />
          ظاهر على الرئيسية
        </label>
        <button className="h-12 rounded-full bg-brand px-8 font-bold text-white transition-colors hover:bg-brand-deep">
          حفظ العرض
        </button>
      </form>
    </div>
  );
}
