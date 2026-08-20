import { prisma } from "@/lib/prisma";
import { deleteAdminUser, saveAdminUser } from "../../actions";

const roleLabel: Record<string, string> = {
  owner: "مالك",
  manager: "مدير",
  editor: "محرر",
};

const input =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none transition-colors focus:border-brand";

export default async function UsersAdmin() {
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">المشرفون</h1>
        <p className="mt-1 text-sm text-muted">إدارة حسابات لوحة التحكم وصلاحياتها.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form action={saveAdminUser} className="card-shadow h-fit space-y-3 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold">إضافة مشرف جديد</h2>
          <input name="name" placeholder="الاسم" required className={input} />
          <input name="email" type="email" placeholder="الإيميل" required className={input} dir="ltr" />
          <input name="password" placeholder="كلمة المرور" required className={input} />
          <select name="role" className={input}>
            <option value="editor">محرر</option>
            <option value="manager">مدير</option>
            <option value="owner">مالك</option>
          </select>
          <button className="h-11 w-full rounded-full bg-brand font-bold text-white transition-colors hover:bg-brand-deep">
            حفظ المشرف
          </button>
        </form>
        <ul className="card-shadow divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {users.map((user) => (
            <li key={user.id} className="flex items-center gap-4 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {user.name.slice(0, 1)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted" dir="ltr">{user.email}</p>
              </div>
              <span className="rounded-full bg-bg px-3 py-1 text-[11px] font-bold text-muted">
                {roleLabel[user.role] ?? user.role}
              </span>
              <form action={deleteAdminUser}>
                <input type="hidden" name="id" value={user.id} />
                <button className="text-xs font-bold text-red">حذف</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
