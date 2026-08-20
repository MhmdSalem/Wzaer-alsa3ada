import { prisma } from "@/lib/prisma";
import { saveProduct } from "../../../actions";
import { ImageField } from "../../../_components/ImageField";

const input =
  "mt-1.5 h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return <ProductForm categories={categories} />;
}

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    brand: string;
    unit: string;
    image: string;
    price: number;
    categoryId: string;
    featured: boolean;
    active: boolean;
  };
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">{product ? "تعديل منتج" : "منتج جديد"}</h1>
        <p className="mt-1 text-sm text-muted">بيانات المنتج الظاهرة في المتجر.</p>
      </div>
      <form action={saveProduct} className="card-shadow max-w-2xl space-y-4 rounded-2xl border border-line bg-surface p-6">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <label className="block text-sm font-semibold">
          اسم المنتج
          <input name="name" defaultValue={product?.name} required className={input} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            الماركة
            <input name="brand" defaultValue={product?.brand} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            الوحدة
            <input name="unit" defaultValue={product?.unit} required placeholder="مثال: ١ لتر" className={input} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            السعر الأساسي
            <input name="price" type="number" step="0.1" defaultValue={product?.price} required className={input} />
          </label>
          <label className="block text-sm font-semibold">
            القسم
            <select name="categoryId" defaultValue={product?.categoryId} className={input}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold">صورة المنتج</p>
          <ImageField name="image" defaultValue={product?.image} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-4 w-4 accent-brand" />
          ظاهر في المتجر
        </label>
        <button className="h-12 rounded-full bg-brand px-8 font-bold text-white transition-colors hover:bg-brand-deep">
          حفظ المنتج
        </button>
      </form>
    </div>
  );
}
