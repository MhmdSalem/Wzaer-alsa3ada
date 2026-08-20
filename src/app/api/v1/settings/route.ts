import { NextResponse } from "next/server";
import { getSettings } from "@/lib/queries";

export async function GET() {
  return NextResponse.json(await getSettings());
}
