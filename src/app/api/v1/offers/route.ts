import { NextResponse } from "next/server";
import { getActiveOffers } from "@/lib/queries";

export async function GET() {
  return NextResponse.json({ offers: await getActiveOffers() });
}
