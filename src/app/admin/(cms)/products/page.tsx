import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "../../actions";
import { egp } from "@/lib/format";

export default async function ProductsAdmin() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">المنتجات</h1>
          <p className="mt-1 text-sm text-muted">{products.length} منتج</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-deep"
        >
          + منتج جديد
        </Link>
      </div>
      <ul className="card-shadow divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-bg/60">
            <img src={product.image} alt="" className="h-12 w-12 rounded-xl bg-bg object-cover" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{product.name}</p>
              <p className="text-xs text-muted">
                {product.category.name} · {egp(product.price)}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${product.active ? "bg-green/10 text-green" : "bg-bg text-muted"}`}>
              {product.active ? "ظاهر" : "مخفي"}
            </span>
            <Link href={`/admin/products/${product.id}`} className="text-xs font-bold text-brand">
              تعديل
            </Link>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <button className="text-xs font-bold text-red">حذف</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
