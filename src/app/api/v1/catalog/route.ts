import { NextResponse } from "next/server";
import { getActiveOffers, getParentCategories, getProducts, getSettings } from "@/lib/queries";

export async function GET() {
  const [settings, offers, categories, products] = await Promise.all([
    getSettings(),
    getActiveOffers(),
    getParentCategories(),
    getProducts(),
  ]);
  return NextResponse.json({ settings, offers, categories, products });
}
