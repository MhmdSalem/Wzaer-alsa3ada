"use client";

import { useStore } from "@/context/store";
import type { ProductView } from "@/lib/format";

export function AddProduct({ product }: { product: ProductView }) {
  const { cart, add, setQty } = useStore();
  const line = cart.find((item) => item.productId === product.id);
  const price = product.offer?.priceAfter ?? product.price;

  if (line) {
    return (
      <div className="flex h-13 items-center justify-between rounded-full bg-green py-1 text-white">
        <button
          type="button"
          className="h-full w-14 text-2xl"
          onClick={() => setQty(product.id, line.qty - 1)}
          aria-label="إنقاص"
        >
          −
        </button>
        <span className="text-lg font-bold">{line.qty}</span>
        <button
          type="button"
          className="h-full w-14 text-2xl"
          onClick={() => setQty(product.id, line.qty + 1)}
          aria-label="زيادة"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        add({
          productId: product.id,
          name: product.name,
          image: product.image,
          unit: product.unit,
          price,
        })
      }
      className="h-13 w-full rounded-full bg-brand py-3.5 font-bold text-white transition-colors hover:bg-brand-deep"
    >
      أضف للسلة
    </button>
  );
}
