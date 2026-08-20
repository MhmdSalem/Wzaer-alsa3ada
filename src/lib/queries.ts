import { prisma } from "./prisma";
import type { OfferView, ProductView } from "./format";

export async function getSettings() {
  const row = await prisma.setting.findUnique({ where: { id: "main" } });
  return (
    row ?? {
      id: "main",
      storeName: "وزير السعادة",
      slogan: "حلاوته زيادة",
      phone: "+201025701015",
      whatsapp: "201025701015",
      city: "فاقوس",
      governorate: "الشرقية",
      country: "مصر",
      deliveryMinutes: 30,
      logoUrl: "/brand/logo-cart.png",
      vodafoneCash: "",
      instapay: "",
      chatAutoReply: "أهلا بيك! فتحنا تذكرة لدعمك وهنتابع معاك لحد ما المشكلة تتحل.",
      storeLat: 30.7301,
      storeLng: 31.7903,
      deliveryBaseFee: 15,
      deliveryPerKm: 2.5,
      freeDeliveryAbove: 0,
    }
  );
}

export function toOfferView(offer: {
  id: string;
  productId: string;
  image: string | null;
  priceBefore: number;
  priceAfter: number;
  bundleQty: number | null;
  bundleBefore: number | null;
  bundlePrice: number | null;
  endsAt: Date;
  product: { name: string; brand: string; unit: string; image: string };
}): OfferView {
  return {
    id: offer.id,
    productId: offer.productId,
    name: offer.product.name,
    brand: offer.product.brand,
    unit: offer.product.unit,
    image: offer.image || offer.product.image,
    priceBefore: offer.priceBefore,
    priceAfter: offer.priceAfter,
    bundleQty: offer.bundleQty,
    bundleBefore: offer.bundleBefore,
    bundlePrice: offer.bundlePrice,
    endsAt: offer.endsAt.toISOString(),
  };
}

export async function getActiveOffers(): Promise<OfferView[]> {
  const now = new Date();
  const rows = await prisma.offer.findMany({
    where: {
      published: true,
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    include: { product: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toOfferView);
}

export async function getParentCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryTree(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: { orderBy: { sortOrder: "asc" } }, parent: true },
  });
  return category;
}

export async function getProducts(categoryId?: string): Promise<ProductView[]> {
  const now = new Date();
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(categoryId
        ? {
            OR: [
              { categoryId },
              { category: { parentId: categoryId } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      offers: {
        where: { published: true, startsAt: { lte: now }, endsAt: { gt: now } },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    unit: row.unit,
    image: row.image,
    price: row.price,
    categoryId: row.categoryId,
    offer: row.offers[0]
      ? toOfferView({ ...row.offers[0], product: row })
      : null,
  }));
}

export async function getProduct(id: string): Promise<ProductView | null> {
  const rows = await getProducts();
  return rows.find((item) => item.id === id) ?? null;
}

export async function searchCatalog(q: string): Promise<ProductView[]> {
  const all = await getProducts();
  const query = q.trim();
  if (!query) return [];
  return all.filter(
    (item) =>
      item.name.includes(query) ||
      item.brand.includes(query) ||
      item.unit.includes(query),
  );
}
