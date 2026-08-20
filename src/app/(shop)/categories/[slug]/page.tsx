import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryTree, getParentCategories, getProducts } from "@/lib/queries";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryTree(slug);
  if (!category) notFound();

  const parents = await getParentCategories();
  const products = await getProducts(category.id);
  const pills = category.children.length
    ? category.children
    : category.parent
      ? (await getCategoryTree(category.parent.slug))?.children ?? []
      : [];

  return (
    <div className="space-y-5 pt-5">
      <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
        {parents.map((item) => (
          <Link
            key={item.id}
            href={`/categories/${item.slug}`}
            className={`shrink-0 pb-3 text-sm font-semibold transition-colors ${
              item.id === (category.parentId ?? category.id)
                ? "border-b-2 border-brand text-brand"
                : "text-muted hover:text-text"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      {pills.length ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {pills.map((pill) => (
            <Link
              key={pill.id}
              href={`/categories/${pill.slug}`}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                pill.id === category.id
                  ? "bg-brand text-white"
                  : "border border-line bg-surface text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {pill.name}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="flex items-end justify-between">
        <h1 className="font-display text-2xl font-bold">{category.name}</h1>
        <p className="text-xs text-muted">{products.length} منتج</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
