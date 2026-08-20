"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import type { ProductView } from "@/lib/format";

export function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [items, setItems] = useState<ProductView[]>([]);

  useEffect(() => {
    if (!q) return;
    fetch(`/api/v1/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data: { items: ProductView[] }) => setItems(data.items));
  }, [q]);

  return (
    <div className="space-y-4 pt-5">
      <h1 className="font-display text-2xl font-bold">نتائج «{q}»</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted">مفيش نتائج. جرّب كلمة تانية.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
