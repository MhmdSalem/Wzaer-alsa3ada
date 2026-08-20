"use client";

import Link from "next/link";
import { useStore } from "@/context/store";
import { egp } from "@/lib/format";
import type { OfferView } from "@/lib/format";
import { Countdown } from "./Countdown";

export function OfferCard({ offer }: { offer: OfferView }) {
  const { cart, add, setQty } = useStore();
  const line = cart.find((item) => item.productId === offer.productId);
  const price = offer.bundlePrice ?? offer.priceAfter;
  const discount = Math.round(
    ((offer.priceBefore - offer.priceAfter) / offer.priceBefore) * 100,
  );

  return (
    <article className="card-shadow group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg">
      <Link href={`/product/${offer.productId}`} className="relative block bg-bg">
        <img
          src={offer.image}
          alt={offer.name}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-2.5 right-2.5">
          <Countdown endsAt={offer.endsAt} />
        </div>
        {discount > 0 ? (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-red px-2 py-0.5 text-[11px] font-bold text-white">
            خصم {discount}%
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-yellow px-2.5 py-1 text-base font-extrabold text-bg">
            {egp(offer.priceAfter)}
          </span>
          <s className="text-xs text-muted">بدل {egp(offer.priceBefore)}</s>
        </div>
        {offer.bundleQty && offer.bundlePrice ? (
          <p className="rounded-lg bg-brand-soft px-2.5 py-1.5 text-[11px] font-semibold text-brand">
            {offer.bundleQty} قطع بـ {egp(offer.bundlePrice)}
            {offer.bundleBefore ? ` بدل ${egp(offer.bundleBefore)}` : ""}
          </p>
        ) : null}
        <Link
          href={`/product/${offer.productId}`}
          className="line-clamp-2 text-sm font-medium leading-6"
        >
          {offer.name}
        </Link>
        <p className="text-[11px] text-muted">
          {offer.brand} · {offer.unit}
        </p>
        <div className="mt-auto pt-1">
          {line ? (
            <div className="flex h-10 items-center justify-between rounded-full bg-green text-white">
              <button
                type="button"
                className="h-full w-11 text-lg"
                onClick={() => setQty(offer.productId, line.qty - 1)}
                aria-label="إنقاص"
              >
                −
              </button>
              <span className="text-sm font-bold">{line.qty}</span>
              <button
                type="button"
                className="h-full w-11 text-lg"
                onClick={() => setQty(offer.productId, line.qty + 1)}
                aria-label="زيادة"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                add({
                  productId: offer.productId,
                  name: offer.name,
                  image: offer.image,
                  unit: offer.unit,
                  price,
                })
              }
              className="grid h-10 w-full place-items-center rounded-full bg-brand text-sm font-bold text-white transition-colors hover:bg-brand-deep"
            >
              أضف للسلة
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
