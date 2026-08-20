import { prisma } from "@/lib/prisma";
import { deleteCategory, saveCategory } from "../../actions";
import { ImageField } from "../../_components/ImageField";

const input =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand";

export default async function CategoriesAdmin() {
  const categories = await prisma.category.findMany({
    include: { parent: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">الأقسام</h1>
        <p className="mt-1 text-sm text-muted">تنظيم أقسام المتجر الرئيسية والفرعية.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form action={saveCategory} className="card-shadow h-fit space-y-3 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold">قسم جديد</h2>
          <input name="name" placeholder="اسم القسم" required className={input} />
          <input name="slug" placeholder="slug بالإنجليزي" required className={input} dir="ltr" />
          <select name="parentId" className={input}>
            <option value="">قسم رئيسي</option>
            {categories
              .filter((c) => !c.parentId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          <input name="sortOrder" type="number" defaultValue={0} placeholder="الترتيب" className={input} />
          <ImageField name="image" />
          <button className="h-11 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep">
            حفظ القسم
          </button>
        </form>
        <ul className="card-shadow divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-4 p-4">
              <img src={category.image} alt="" className="h-11 w-11 rounded-xl bg-bg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{category.name}</p>
                {category.parent ? (
                  <p className="text-xs text-muted">تحت {category.parent.name}</p>
                ) : (
                  <p className="text-xs text-muted">قسم رئيسي</p>
                )}
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <button className="text-xs font-bold text-red">حذف</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
