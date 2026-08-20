import { prisma } from "@/lib/prisma";
import { MediaUpload } from "./MediaUpload";

export default async function MediaAdmin() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">مكتبة الصور</h1>
          <p className="mt-1 text-sm text-muted">{media.length} صورة مرفوعة</p>
        </div>
        <MediaUpload />
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-6">
        {media.map((item) => (
          <figure key={item.id} className="card-shadow overflow-hidden rounded-2xl border border-line bg-surface">
            <img src={item.url} alt={item.name} className="aspect-square w-full bg-bg object-cover" />
            <figcaption className="truncate p-2 text-[11px] text-muted" dir="ltr">
              {item.url}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
