"use client";

import Link from "next/link";
import { useStore } from "@/context/store";
import { egp } from "@/lib/format";
import type { ProductView } from "@/lib/format";
import { Countdown } from "./Countdown";

export function ProductCard({ product }: { product: ProductView }) {
  const { hydrated, cart, add, setQty } = useStore();
  const line = hydrated ? cart.find((item) => item.productId === product.id) : undefined;
  const price = product.offer?.priceAfter ?? product.price;

  return (
    <article className="card-shadow group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg">
      <div className="relative bg-bg">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
        {product.offer ? (
          <div className="absolute top-2 right-2">
            <Countdown endsAt={product.offer.endsAt} />
          </div>
        ) : null}
        <div className="absolute bottom-2 left-2">
          {line ? (
            <div className="flex h-8 items-center rounded-full bg-green text-xs font-bold text-white shadow">
              <button
                type="button"
                className="h-full w-8"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setQty(product.id, line.qty - 1);
                }}
                aria-label="إنقاص"
              >
                −
              </button>
              <span className="min-w-5 text-center">{line.qty}</span>
              <button
                type="button"
                className="h-full w-8"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setQty(product.id, line.qty + 1);
                }}
                aria-label="زيادة"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                add({
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  unit: product.unit,
                  price,
                });
              }}
              className="grid h-8 w-8 place-items-center rounded-full bg-brand text-lg font-bold text-white shadow transition-colors hover:bg-brand-deep"
              aria-label="أضف للسلة"
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <strong className={`text-sm font-extrabold ${product.offer ? "text-red" : "text-text"}`}>
            {egp(price)}
          </strong>
          {product.offer ? (
            <s className="text-[10px] text-muted">{egp(product.offer.priceBefore)}</s>
          ) : null}
        </div>
        <Link href={`/product/${product.id}`} className="line-clamp-2 text-[12px] leading-5">
          {product.name}
        </Link>
        <p className="text-[10px] text-muted">{product.unit}</p>
      </div>
    </article>
  );
}
