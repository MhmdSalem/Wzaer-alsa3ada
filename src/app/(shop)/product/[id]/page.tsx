import { notFound } from "next/navigation";
import { AddProduct } from "@/components/AddProduct";
import { Countdown } from "@/components/Countdown";
import { egp } from "@/lib/format";
import { getProduct } from "@/lib/queries";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const price = product.offer?.priceAfter ?? product.price;

  return (
    <div className="grid gap-8 pt-5 md:grid-cols-2">
      <div className="card-shadow relative overflow-hidden rounded-3xl border border-line bg-surface">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />
        {product.offer ? (
          <div className="absolute top-4 right-4">
            <Countdown endsAt={product.offer.endsAt} />
          </div>
        ) : null}
      </div>
      <div className="space-y-4">
        <p className="text-xs font-semibold text-muted">{product.brand}</p>
        <h1 className="font-display text-3xl font-bold">{product.name}</h1>
        <p className="text-sm text-muted">{product.unit}</p>
        <div className="flex items-end gap-3">
          <span className="rounded-xl bg-yellow px-4 py-2 font-display text-3xl font-extrabold text-bg">
            {egp(price)}
          </span>
          {product.offer ? (
            <s className="text-lg text-muted">بدل {egp(product.offer.priceBefore)}</s>
          ) : null}
        </div>
        {product.offer?.bundleQty && product.offer.bundlePrice ? (
          <p className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
            اشتري {product.offer.bundleQty} قطع بـ {egp(product.offer.bundlePrice)}
            {product.offer.bundleBefore
              ? ` بدل ${egp(product.offer.bundleBefore)}`
              : ""}
          </p>
        ) : null}
        <AddProduct product={product} />
        <p className="text-xs leading-6 text-muted">
          توصيل داخل فاقوس خلال ٣٠ دقيقة. الدفع كاش عند الاستلام أو فودافون كاش أو
          إنستاباي.
        </p>
      </div>
    </div>
  );
}
