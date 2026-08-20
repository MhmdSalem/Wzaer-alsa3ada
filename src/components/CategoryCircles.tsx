import Link from "next/link";

type Category = { id: string; name: string; slug: string; image: string };

export function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-9 md:overflow-visible md:px-0">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group flex w-[84px] shrink-0 flex-col items-center gap-2 md:w-auto"
        >
          <span className="card-shadow h-[84px] w-[84px] overflow-hidden rounded-full border border-line bg-surface transition-transform group-hover:-translate-y-0.5">
            <img src={category.image} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="line-clamp-2 text-center text-[11px] font-medium leading-4">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
