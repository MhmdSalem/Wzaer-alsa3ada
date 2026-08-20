export function egp(value: number) {
  const digits = Number.isInteger(value) ? 0 : 1;
  return `${new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  }).format(value)} ج`;
}

export function waLink(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

export type OfferView = {
  id: string;
  productId: string;
  name: string;
  brand: string;
  unit: string;
  image: string;
  priceBefore: number;
  priceAfter: number;
  bundleQty: number | null;
  bundleBefore: number | null;
  bundlePrice: number | null;
  endsAt: string;
};

export type ProductView = {
  id: string;
  name: string;
  brand: string;
  unit: string;
  image: string;
  price: number;
  categoryId: string;
  offer: OfferView | null;
};
