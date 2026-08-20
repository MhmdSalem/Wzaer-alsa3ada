import { getAdminUser, requireAdmin } from "@/lib/auth";
import { AdminShell } from "../_components/AdminShell";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const admin = await getAdminUser();
  return (
    <AdminShell adminName={admin?.name ?? "مشرف"} adminRole={admin?.role ?? ""}>
      {children}
    </AdminShell>
  );
}
