import { prisma } from "@/lib/prisma";
import { OfferForm } from "../new/page";
import { notFound } from "next/navigation";

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [offer, products] = await Promise.all([
    prisma.offer.findUnique({ where: { id } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!offer) notFound();
  return <OfferForm products={products} offer={offer} />;
}
