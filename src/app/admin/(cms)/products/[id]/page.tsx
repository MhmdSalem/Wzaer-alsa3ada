import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../new/page";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();
  return <ProductForm categories={categories} product={product} />;
}
