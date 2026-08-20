import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, name: true },
  });
  return NextResponse.json(media);
}
