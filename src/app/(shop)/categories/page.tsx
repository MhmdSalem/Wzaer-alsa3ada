import Link from "next/link";
import { getParentCategories } from "@/lib/queries";

export const metadata = { title: "الأقسام" };

export default async function CategoriesIndex() {
  const categories = await getParentCategories();
  return (
    <div className="space-y-5 pt-5">
      <h1 className="font-display text-2xl font-bold">تسوّق حسب القسم</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="card-shadow group overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg"
          >
            <div className="overflow-hidden bg-bg">
              <img
                src={category.image}
                alt=""
                className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </div>
            <p className="p-3.5 text-sm font-bold">{category.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
