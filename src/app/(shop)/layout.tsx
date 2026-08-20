import { ShopShell } from "@/components/Providers";
import { getParentCategories, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getParentCategories(),
  ]);
  return (
    <ShopShell settings={settings} categories={categories}>
      {children}
    </ShopShell>
  );
}
