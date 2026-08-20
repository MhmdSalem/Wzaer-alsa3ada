import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ items: await searchCatalog(q) });
}
